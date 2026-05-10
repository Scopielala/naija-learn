from collections.abc import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Subject

async def get_all_subjects(session: AsyncSession) -> Sequence[Subject]:
    """
    Fetches all subjects from the database.
    Called when a student opens the app and sees the subject list.
    """
    db_query = (select(Subject).order_by(Subject.name))
    result = await session.execute(db_query)
    return result.scalars().all()



async def get_subject_by_id(
        session: AsyncSession, subject_id: str
) -> Subject | None:
    """
    Fetches a single subject by its ID.
    Returns None if the subjects does not exist.
    """
    db_query = (select(Subject).where(Subject.id == subject_id))
    result = await session.execute(db_query)

    return result.scalar_one_or_none()