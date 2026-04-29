from pydantic import BaseModel, ConfigDict

class SubjectResponse(BaseModel):
    id: str
    name: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)