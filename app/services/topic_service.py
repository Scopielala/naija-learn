from collections.abc import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.engine import Row
from app.models import Topic, ExamBodySubject, Subtopic

async def get_topics_by_subject(
        session: AsyncSession, subject_id: str
) -> Sequence[Row]:
    """
    Fetches all topics for a given subject along with
    their subtopic count. Returns a list of tuples:
    (Topic, subtopic_count). Called when a student clicks a subject
    and sees the full topic list.
    """
    db_query = (
        select(Topic, func.count(Subtopic.id).label("subtopic_count")).join(
            ExamBodySubject, Topic.exam_body_subject_id == ExamBodySubject.id
        ).join(
            Subtopic, Subtopic.topic_id == Topic.id, isouter=True
        ).where(
            ExamBodySubject.subject_id == subject_id
        ).group_by(Topic.id).order_by(Topic.order)
    )
    result = await session.execute(db_query)
    return result.all()


async def get_topic_by_id(
        session: AsyncSession, topic_id: str
) -> Topic | None:
    """
    Fetches a single topic by its ID.
    Returns None if the topic does not exist
    """
    db_query = (select(Topic).where(Topic.id == topic_id))
    result = await session.execute(db_query)

    return result.scalar_one_or_none()