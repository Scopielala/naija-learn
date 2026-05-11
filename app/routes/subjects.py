from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.subject_service import get_all_subjects, get_subject_by_id
from app.schemas import SubjectResponse, APIResponse

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)

@router.get("", response_model=APIResponse[list[SubjectResponse]])
async def fetch_all_subjects(session: AsyncSession = Depends(get_db)):
    subjects = await get_all_subjects(session)

    if not subjects:
        raise HTTPException(status_code=404, detail="No subjects found")
    
    return APIResponse(
        success=True,
        message="Subjects retrieved successfully",
        data=[SubjectResponse.model_validate(subject) for subject in subjects]
    )

@router.get("/{subject_id}", response_model=APIResponse[SubjectResponse])
async def fetch_subject_by_id(
    subject_id: str,
    session: AsyncSession = Depends(get_db)
):
    subject = await get_subject_by_id(session, subject_id)

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return APIResponse(
        success=True,
        message="Subject retrieved successfully",
        data=SubjectResponse.model_validate(subject)
    )