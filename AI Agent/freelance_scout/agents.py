import os
from crewai import Agent, LLM
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()

# Groq free tier: 30 RPM, 14,400 req/day — far more generous than Gemini free tier
# Sign up at https://console.groq.com to get your free key
groq_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    max_retries=5,
    timeout=120,  # 2 min timeout — allows retry after 429 backoff
)

def create_job_scraper_agent() -> Agent:
    return Agent(
        role="Freelance Platforms Scraper",
        goal="Search strictly on freelance sites (Upwork, Fiverr, Freelancer, Toptal, etc.) for projects matching {topic}. NEVER search LinkedIn or traditional corporate job boards.",
        backstory="An expert web scraper who specializes in finding real, immediate freelance projects. You systematically bypass corporate job boards like LinkedIn and focus entirely on marketplace platforms where freelancers bid on gigs.",
        tools=[search_tool, scrape_tool],
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )

def create_data_extractor_agent() -> Agent:
    return Agent(
        role="Project Data Extractor",
        goal="Extract precise details: project ID, name, bid/budget, URL, and platform from the raw scraped freelance postings.",
        backstory="A meticulous data entry expert. You read raw job descriptions and perfectly format the core parameters into clean structured fields. You never hallucinate data; if an ID is missing, you generate a placeholder like 'UPWK-1234'.",
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )

def create_skill_matcher_agent() -> Agent:
    return Agent(
        role="Skill Filter & JSON Formatter",
        goal="Filter the projects to ensure they require {skills}. Format the final authorized list as strict JSON.",
        backstory="A tech-savvy freelance QA manager who ensures all fetched prospects stringently match software development (React, Python) and AI Automation skills.",
        llm=groq_llm,
        verbose=True,
        allow_delegation=False
    )
