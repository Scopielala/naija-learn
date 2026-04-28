import uuid
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey
from app.database import Base

if TYPE_CHECKING:
    from app.models.exam_body_subject import ExamBodySubject
    from app.models.subtopic import Subtopic

class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    exam_body_subject_id: Mapped[str] = mapped_column(
        String, ForeignKey("exam_body_subjects.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    exam_body_subject: Mapped["ExamBodySubject"] = relationship(
        back_populates="topics"
    )

    subtopics: Mapped[list["Subtopic"]] = relationship(
        back_populates="topic"
    )