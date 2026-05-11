from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.content_service import get_or_generate_content
from app.schemas import ContentResponse, APIResponse

router = APIRouter(
    prefix="/subtopics",
    tags=["Content"]
)

@router.get(
    "/{subtopic_id}/notes",
    response_model=APIResponse[ContentResponse]
)
async def fetch_notes(
    subtopic_id: str,
    session: AsyncSession = Depends(get_db)
):
    try:
        content = await get_or_generate_content(
            session=session,
            subtopic_id=subtopic_id,
            content_type="notes"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    return APIResponse(
        success=True,
        message="Notes retrieved successfully",
        data=ContentResponse.model_validate(content)
    )

@router.get("/{subtopic_id}/summary", response_model=APIResponse[ContentResponse])
async def fetch_summary(
    subtopic_id: str,
    session: AsyncSession = Depends(get_db)
):
    try:
        content = await get_or_generate_content(
            session=session,
            subtopic_id=subtopic_id,
            content_type="summary"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    return APIResponse(
        success=True,
        message="Summary retrieved successfully",
        data=ContentResponse.model_validate(content)
    )

@router.get("/{subtopic_id}/questions", response_model=APIResponse[ContentResponse])
async def fetch_questions(
    subtopic_id: str,
    session: AsyncSession = Depends(get_db)
):
    try:
        content = await get_or_generate_content(
            session=session,
            subtopic_id=subtopic_id,
            content_type="questions"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    return APIResponse(
        success=True,
        message="Questions retrieved successfully",
        data=ContentResponse.model_validate(content)
    )