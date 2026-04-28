import uuid
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, ARRAY, Text
from app.database import Base

if TYPE_CHECKING:
    from app.models.topic import Topic
    from app.models.content_cache import ContentCache

class Subtopic(Base):
    __tablename__ = "subtopics"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    topic_id: Mapped[str] = mapped_column(
        String, ForeignKey("topics.id"), nullable=False
    )
    title: Mapped[str] =mapped_column(String(255), nullable=False)
    keywords: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    topic: Mapped["Topic"] = relationship(back_populates="subtopics")
    content_caches: Mapped[list["ContentCache"]] = relationship(back_populates="subtopic")