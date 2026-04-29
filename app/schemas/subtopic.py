from pydantic import BaseModel, ConfigDict

# Subtopic Response Schema
class SubtopicResponse(BaseModel):
    id: str
    title: str
    order: int
    keywords: list[str] | None = None

    model_config = ConfigDict(from_attributes=True)