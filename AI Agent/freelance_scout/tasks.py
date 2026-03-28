from crewai import Task
from models import ProjectList

def create_scrape_task(agent, topic):
    return Task(
        description=f"Search exclusively on freelance marketplaces (Upwork, Fiverr, Freelancer.com, Guru, etc.) for '{topic}'.\n"
                    f"DO NOT include LinkedIn jobs or full-time salaried employee boards. Look ONLY for short-term freelance contracts or project bids.\n"
                    f"Gather the raw text and URLs for at least 3 distinct projects.",
        expected_output="Raw text containing multiple freelance projects from platforms like Upwork and Fiverr.",
        agent=agent
    )

def create_extract_task(agent, context_tasks):
    return Task(
        description=f"Review the raw scraped freelance projects.\n"
                    f"For each project, identify:\n"
                    f"- Project ID (generate a random 6-character alphanumeric string like 'UPWK-XXXX' if not present)\n"
                    f"- Name / Title\n"
                    f"- Bid / Budget amount (e.g., '$500', 'Hourly $20-$40')\n"
                    f"- Project URL\n"
                    f"- Platform (e.g., Upwork, Fiverr, Freelancer)",
        expected_output="A neat list of projects with clearly identified IDs, Names, Bids, URLs, and Platforms.",
        agent=agent,
        context=context_tasks
    )

def create_match_task(agent, skills, context_tasks):
    return Task(
        description=f"Filter the extracted list of projects. Keep ONLY the ones that actually align with the user's specific skills: '{skills}'.\n"
                    f"Discard any projects that are irrelevant.\n"
                    f"Format the surviving projects exactly to the target Pydantic schema structure.",
        expected_output="A strict JSON output matching the ProjectList schema array exactly.",
        agent=agent,
        context=context_tasks,
        output_json=ProjectList # Enforces the exact list structure
    )
