import asyncio
import json
from main import run_scouting, ScoutRequest
from dotenv import load_dotenv

load_dotenv()

async def execute_test():
    print("Starting AI Agents to fetch freelance projects...")
    req = ScoutRequest()
    
    try:
        result = await run_scouting(req)
        print("\n=== SYSTEM SUCCESS ===")
        # Handle both Pydantic model and plain dict output
        if hasattr(result, 'model_dump_json'):
            print(result.model_dump_json(indent=2))
        else:
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\n=== SYSTEM ERROR ===")
        print(f"Debug Info: {str(e)}")

if __name__ == "__main__":
    asyncio.run(execute_test())
