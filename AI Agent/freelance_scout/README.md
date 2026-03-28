# Freelance Opportunity & Earnings Scout

A FastAPI and CrewAI-powered Multi-Agent system that finds freelance jobs, matches them against a user profile, and calculates estimated monthly earnings.

## Project Structure
```text
freelance_scout/
├── agents.py           # CrewAI Agent definitions (Scraper, Matcher, Analyst)
├── tasks.py            # CrewAI Task definitions 
├── models.py           # Pydantic structured output models
├── main.py             # FastAPI entry point
├── requirements.txt    # Python dependencies
└── README.md           # Documentation & rate-limiting guide
```

## Setup & Running
1. Install dependencies: `pip install -r requirements.txt`
2. Set API keys in your environment variables (`.env` file):
   - `OPENAI_API_KEY` (For CrewAI language models)
   - `SERPER_API_KEY` (For Google search via crewai_tools)
   - `FIRECRAWL_API_KEY` (Optional: If explicitly using Firecrawl for scrape tool)
3. Start the server: `python main.py` or run `uvicorn main:app --reload`
4. Access via Postman or Swagger UI at `http://localhost:8000/docs`. To run the agents, send a `POST` request to `/scout`.

## Handling Rate-Limiting on Job Sites

When building Scraper tools using standard requests or BeautifulSoup for environments like LinkedIn and Upwork, you run into stringent rate limiting quickly. Here are core approaches to abstract those issues away from your AI Agents:

1. **Use Firecrawl or APIs like Proxycrawl/ScraperAPI:** 
   These APIs automatically provide proxies, handle browser rendering (dealing with single-page application setups), and retry logic. In python, the `crewai_tools` integration allows directly passing URLs to tools powered by scraping API configs. 

2. **Rotating Residential Proxies:** 
   If scraping directly, cycle through proxy IP addresses dynamically for each HTTP request (using proxy pools like BrightData or Smartproxy) to stop IPs from hitting threshold limits.

3. **Randomized Requests and Throttling:** 
   Injected random backoff delays, e.g., `time.sleep(random.uniform(2, 6))`, into custom Tool execution so it mirrors human interaction rhythms rather than constant script pings.

4. **Spoof Headers and Cookies:** 
   Rotate your `User-Agent` values effectively. A missing or hardcoded standard library user-agent string immediately flags the request as a bot. Utilize valid `Accept`, `Referer`, and other standard browser headers. Add login session cookies cautiously to mitigate immediate rejection.

5. **Headless Browsers & Stealth Plugins:**
   For complex JS heavy sites, Selenium or Playwright are necessary. Use wrappers like `undetected-chromedriver` and `playwright-stealth` inside custom tools, otherwise, rate-limits scale to flat-out blocks based on browser fingerprinting.
