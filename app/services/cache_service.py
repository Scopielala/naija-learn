from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ContentCache

async def get_cached_content(
        session: AsyncSession,
        subtopic_id: str,
        content_type: str
) -> ContentCache | None:
    """
    Checks if AI-generated content already exists in the cache
    for a given subtopic and content type.
    Returns the cached content if found, None if not.
    This is called BEFORE the AI API to avoid unnecessary and costly API calls.
    """
    db_query = (
        select(ContentCache).where(
            ContentCache.subtopic_id == subtopic_id,
            ContentCache.content_type == content_type
        )
    )

    result = await session.execute(db_query)
    return result.scalar_one_or_none()

async def save_to_cache(
        session: AsyncSession,
        subtopic_id: str,
        content_type: str,
        content: str
) -> ContentCache:
    """
    Saves newly generated AI content to the cache.

    Called After the AI API returns a response so the same content can be served
    instantly to future students without calling the AI again.
    """
    cached = ContentCache(
        subtopic_id=subtopic_id,
        content_type=content_type,
        content=content,
        is_approved=False
    )
    session.add(cached)
    await session.flush()
    return cached