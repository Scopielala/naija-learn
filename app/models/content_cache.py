import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from app.database import Base


if TYPE_CHECKING:
    from app.models.subtopic import Subtopic

class ContentCache(Base):
    __tablename__ = "content_cache"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    subtopic_id: Mapped[str] = mapped_column(
        String, ForeignKey("subtopics.id"), nullable=False
    )
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    subtopic: Mapped["Subtopic"] = relationship(back_populates="content_caches")