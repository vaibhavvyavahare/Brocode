import os
import json
import time
import litellm
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from crewai import Crew, Process
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Auto-retry on 429 rate limit: wait the seconds the API suggests then retry
def on_rate_limit(kwargs, completion_response, start_time, end_time):
    pass  # litellm handles retry internally with max_retries

litellm.num_retries = 5
litellm.retry_after = 35  # wait 35s between retries on 429

from agents import (
    create_job_scraper_agent,
    create_data_extractor_agent,
    create_skill_matcher_agent
)
from tasks import (
    create_scrape_task,
    create_extract_task,
    create_match_task
)
from models import ProjectList

load_dotenv()

app = FastAPI(
    title="Freelance Opportunity Scout API",
    description="A multi-agent system to fetch freelance specific projects.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/widget")
def serve_widget():
    return FileResponse(os.path.join(BASE_DIR, "widget.html"), media_type="text/html")

@app.get("/game")
def serve_game():
    return FileResponse(os.path.join(BASE_DIR, "game.html"), media_type="text/html")

class ScoutRequest(BaseModel):
    topic: str = "Freelance projects for Web Dev and AI"
    skills: str = "Software/Web development (React, Python), AI automation"

@app.post("/scout", response_model=ProjectList)
async def run_scouting(request: ScoutRequest):
    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set. Get a free key at https://console.groq.com")
    if not os.environ.get("SERPER_API_KEY"):
        raise HTTPException(status_code=500, detail="SERPER_API_KEY is not set.")
    
    try:
        # Initialize Agents
        scraper_agent = create_job_scraper_agent()
        extractor_agent = create_data_extractor_agent()
        matcher_agent = create_skill_matcher_agent()

        # Create Tasks
        scrape_task = create_scrape_task(scraper_agent, request.topic)
        extract_task = create_extract_task(extractor_agent, [scrape_task])
        match_task = create_match_task(matcher_agent, request.skills, [extract_task])

        # Form Crew
        scout_crew = Crew(
            agents=[scraper_agent, extractor_agent, matcher_agent],
            tasks=[scrape_task, extract_task, match_task],
            process=Process.sequential,
            verbose=True
        )

        result = scout_crew.kickoff()

        if hasattr(result, 'pydantic') and result.pydantic:
            return result.pydantic
        elif hasattr(result, 'json_dict') and result.json_dict:
            return result.json_dict
        else:
            return json.loads(result.raw)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
