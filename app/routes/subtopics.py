from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.subtopic_service import get_subtopics_by_topic
from app.schemas import SubtopicResponse, APIResponse

router = APIRouter(
    prefix="/topics",
    tags=["Subtopics"]
)

@router.get("/{topic_id}/subtopics", response_model=APIResponse[list[SubtopicResponse]])
async def fetch_subtopics_by_topic( # type: ignore
    topic_id: str,
    session: AsyncSession = Depends(get_db)
):
    subtopics = await get_subtopics_by_topic(session, topic_id)

    if not subtopics:
        raise HTTPException(
            status_code=404,
            detail="No subtopics found for this topic"
        )
    
    return APIResponse(
        success=True,
        message="Subtopics retrieved successfully",
        data=[
            SubtopicResponse.model_validate(subtopic)
            for subtopic in subtopics
        ]
    )