from sqlalchemy.ext.asyncio import AsyncSession
from app.services.subtopic_service import get_subtopic_with_context
from app.services.cache_service import get_cached_content, save_to_cache
from app.services.ai_service import generate_content
from app.prompts.builder import build_prompt
from app.models import ContentCache

VALID_CONTENT_TYPES = ["notes", "summary", "questions"]

async def get_or_generate_content(
        session: AsyncSession,
        subtopic_id: str,
        content_type: str
) -> ContentCache:
    """
    The main orchestrator function. This is the only function
    the routes need to call for content delivery.

    Flow:
    1. Validate the content type
    2. Fetch subtopic with all related context from DB
    3. Check the cache - return immediately if found
    4. Build the AI prompt using subtopic data
    5. Call the AI API to generate content
    6. Save the generated content to cache
    7. Return the content

    Args:
        session: The database session
        subtopic_id: The ID of the subtopic to get content for
        content_type: One of "notes", "summary" "questions"
    
    Returns:
        ContentCache object containing the generated content

    Raises:
        ValueError: If content_type is invalid or subtopic not found
    """

    # Validate content type immediately, No point doing any work if the content type is wrong
    if content_type not in VALID_CONTENT_TYPES:
        raise ValueError(
            f"Invalid content type '{content_type}'. "
            f"Must be one of: {VALID_CONTENT_TYPES}"
        )
    
    # Fetch subtopic with all related data
    subtopic = await get_subtopic_with_context(session, subtopic_id)
    if not subtopic:
        raise ValueError(
            f"Subtopic with ID '{subtopic_id}' not found."
        )
    
    # check the cache first
    # if content already exists return it immediately
    # No AI call needed
    cached = await get_cached_content(session, subtopic_id, content_type)
    if cached:
        return cached
    
    # Cache miss - build the AI prompt
    # Extract all the context the prompt builder needs
    subject_name = subtopic.topic.exam_body_subject.subject.name
    exam_body_name = subtopic.topic.exam_body_subject.exam_body.name
    topic_title = subtopic.topic.title

    prompt = build_prompt(
        content_type=content_type,
        subject=subject_name,
        topic=topic_title,
        subtopic=subtopic.title,
        exam_body=exam_body_name,
        keywords=subtopic.keywords or []
    )

    # Call the AI API with the assembled prompt
    generated_text = await generate_content(prompt)

    # Save the generated content to cache
    # Future requests for the same subtopic get this instantly
    cached_content = await save_to_cache(
        session=session,
        subtopic_id=subtopic_id,
        content_type=content_type,
        content=generated_text
    )

    return cached_content

    