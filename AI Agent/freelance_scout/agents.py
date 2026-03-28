import os
from crewai import Agent, LLM
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()

# Use Llama 3.3 70B - Reliable and currently stable on Groq
groq_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    max_retries=10,
    timeout=120,
)

def create_job_scraper_agent() -> Agent:
    return Agent(
        role="Freelance Platforms Scraper",
        goal="Find specific freelance projects on Upwork, Fiverr, or Freelancer.com for {topic}.",
        backstory="An expert freelancer. You use search tools to find current project URLs. Use simple queries.",
        tools=[search_tool, scrape_tool],
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )

def create_data_extractor_agent() -> Agent:
    return Agent(
        role="Project Data Extractor",
        goal="Extract project details: ID, name, bid, URL, and platform.",
        backstory="A detail-oriented data entry specialist.",
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )

def create_skill_matcher_agent() -> Agent:
    return Agent(
        role="Skill Filter & JSON Formatter",
        goal="Filter projects for {skills} and output valid JSON.",
        backstory="A technical recruiter specializing in React and Python.",
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )
