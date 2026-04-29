from pydantic import BaseModel, ConfigDict

# Topic Response Schema
class TopicResponse(BaseModel):
    id: str
    title: str
    order: int
    subtopic_count: int | None = None

    model_config = ConfigDict(from_attributes=True)