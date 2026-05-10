from collections.abc import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.models import Subtopic, Topic, ExamBodySubject, Subject, ExamBody

async def get_subtopics_by_topic(
        session: AsyncSession, topic_id: str
) -> Sequence[Subtopic]:
    """
    Fetches all subtopics under a given topic.
    Called when a student clicks a topic and sees
    the subtopic list.
    """
    db_query = (select(Subtopic).where(Subtopic.topic_id == topic_id).order_by(Subtopic.order))
    result = await session.execute(db_query)

    return result.scalars().all()

async def get_subtopic_with_context(
        session: AsyncSession, subtopic_id: str
) -> Subtopic | None:
    """
    Fetches a single subtopic with all its related data loaded
    topic, exam_body_subject, subject, and exam_body.

    This is used specifically when building the AI prompt
    because the prompt builder needs:
    - subtopic title and keywords
    - topic title
    - subject name
    - exam body name

    joinload tells SQLAlchemy to fetch all related
    data in one query instead of separate queries.
    """
    db_query = (
        select(Subtopic).options(
            joinedload(Subtopic.topic)
            .joinedload(Topic.exam_body_subject)
            .options(
                joinedload(ExamBodySubject.subject),
                joinedload(ExamBodySubject.exam_body)
            )
        ).where(Subtopic.id == subtopic_id)
    )

    result = await session.execute(db_query)

    return  result.scalar()