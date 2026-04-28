import uuid
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from app.database import Base

if TYPE_CHECKING:
    from app.models.exam_body import ExamBody
    from app.models.subject import Subject
    from app.models.topic import Topic

class ExamBodySubject(Base):
    __tablename__ = "exam_body_subjects"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    exam_body_id: Mapped[str] = mapped_column(
        String, ForeignKey("exam_bodies.id"), nullable=False
    )

    subject_id: Mapped[str] = mapped_column(
        String, ForeignKey("subjects.id"), nullable=False
    )

    class_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    exam_body: Mapped["ExamBody"] = relationship(
        back_populates="exam_body_subjects"
    )

    subject: Mapped["Subject"] = relationship(
        back_populates="exam_body_subjects"
    )

    topics: Mapped[list["Topic"]] = relationship(
        back_populates="exam_body_subject"
    )

