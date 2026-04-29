from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Content Schema Response
class ContentResponse(BaseModel):
    id: str
    subtopic_id: str
    content_type: str
    content: str
    generated_at: datetime
    is_approved: bool

    model_config = ConfigDict(from_attributes=True)