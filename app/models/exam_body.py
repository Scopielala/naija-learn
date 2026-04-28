import uuid
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text
from app.database import Base

if TYPE_CHECKING:
    from app.models.exam_body_subject import ExamBodySubject

class ExamBody(Base):
    __tablename__ = "exam_bodies"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships

    exam_body_subjects: Mapped[list["ExamBodySubject"]] = relationship(
        back_populates="exam_body"
    )