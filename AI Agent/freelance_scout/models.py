from pydantic import BaseModel, Field
from typing import List

class FreelanceProject(BaseModel):
    project_id: str = Field(description="A unique ID extracted from the post or generated if missing.")
    name: str = Field(description="The title or core name of the freelance project/job.")
    bid: str = Field(description="The budget, estimated price, or bid amount specified.")
    project_url: str = Field(description="The URL link to the project.")
    platform: str = Field(description="The freelancing platform name (e.g., Upwork, Fiverr, Freelancer).")

class ProjectList(BaseModel):
    projects: List[FreelanceProject] = Field(description="A list of the best matching freelance projects.")
