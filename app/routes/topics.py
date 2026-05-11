from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.topic_service import get_topics_by_subject, get_topic_by_id
from app.schemas import TopicResponse, APIResponse

router = APIRouter(
    prefix="/subjects",
    tags=["/Topics"]
)

@router.get("/{subject_id}/topics", response_model=APIResponse[list[TopicResponse]])
async def fetch_topics_by_subject(
    subject_id: str,
    session: AsyncSession = Depends(get_db)
):
    rows = await get_topics_by_subject(session, subject_id)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No topics for this subject"
        )
    
    topics = [
        TopicResponse(
        id=row.Topic.id,
        title=row.Topic.title,
        order=row.Topic.order,
        subtopic_count=row.subtopic_count
    )
    for row in rows
    ]

    return APIResponse(
        success=True,
        message="Topics retrieved successfully",
        data=topics
    )