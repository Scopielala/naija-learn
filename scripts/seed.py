import asyncio
import json
import sys
from pathlib import Path

# This adds the project root to Python's path so we can import from app/
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import ExamBody, Subject, ExamBodySubject, Topic, Subtopic


def load_seed_data() -> dict:
    """
    Reads and returns the JSON seed file from the data/ folder.
    Path is resolved relative to this script's location so it works
    regardless of which directory you run the script from.
    Regular synchronous function — file reading does not need async.
    """
    seed_file = Path(__file__).resolve().parent.parent / "data" / "waec_economics_seed.json"

    with open(seed_file, "r", encoding="utf-8") as f:
        return json.load(f)


async def get_or_create_exam_body(
    session, name: str, description: str | None = None
) -> ExamBody:
    """
    Fetches an ExamBody by name if it exists, otherwise creates it.
    This prevents duplicate entries if the seed script is run more than once.
    """
    result = await session.execute(
        select(ExamBody).where(ExamBody.name == name)
    )
    exam_body = result.scalar()

    if exam_body:
        print(f"  ExamBody '{name}' already exists — skipping.")
        return exam_body

    exam_body = ExamBody(name=name, description=description)
    session.add(exam_body)
    await session.flush()
    print(f"  Created ExamBody: {name}")
    return exam_body


async def get_or_create_subject(
    session, name: str, description: str | None = None
) -> Subject:
    """
    Fetches a Subject by name if it exists, otherwise creates it.
    """
    result = await session.execute(
        select(Subject).where(Subject.name == name)
    )
    subject = result.scalar()

    if subject:
        print(f"  Subject '{name}' already exists — skipping.")
        return subject

    subject = Subject(name=name, description=description)
    session.add(subject)
    await session.flush()
    print(f"  Created Subject: {name}")
    return subject


async def get_or_create_exam_body_subject(
    session, exam_body_id: str, subject_id: str, class_level: str | None = None
) -> ExamBodySubject:
    """
    Fetches an ExamBodySubject link if it exists, otherwise creates it.
    """
    result = await session.execute(
        select(ExamBodySubject).where(
            ExamBodySubject.exam_body_id == exam_body_id,
            ExamBodySubject.subject_id == subject_id,
        )
    )
    exam_body_subject = result.scalar()

    if exam_body_subject:
        print(f"  ExamBodySubject link already exists — skipping.")
        return exam_body_subject

    exam_body_subject = ExamBodySubject(
        exam_body_id=exam_body_id,
        subject_id=subject_id,
        class_level=class_level,
    )
    session.add(exam_body_subject)
    await session.flush()
    print(f"  Created ExamBodySubject link.")
    return exam_body_subject


async def seed_topics(session, exam_body_subject_id: str, topics: list) -> None:
    """
    Loops through all topics in the seed data and inserts them along with
    their subtopics. Skips topics that already exist by title.
    """
    for topic_data in topics:
        result = await session.execute(
            select(Topic).where(
                Topic.title == topic_data["title"],
                Topic.exam_body_subject_id == exam_body_subject_id,
            )
        )
        topic = result.scalar()

        if topic:
            print(f"    Topic '{topic_data['title']}' already exists — skipping.")
            continue

        topic = Topic(
            exam_body_subject_id=exam_body_subject_id,
            title=topic_data["title"],
            order=topic_data["order"],
        )
        session.add(topic)
        await session.flush()
        print(f"    Created Topic {topic_data['order']}: {topic_data['title']}")

        await seed_subtopics(session, topic.id, topic_data["subtopics"])


async def seed_subtopics(session, topic_id: str, subtopics: list) -> None:
    """
    Loops through all subtopics under a topic and inserts them.
    Skips subtopics that already exist by title under the same topic.
    """
    for subtopic_data in subtopics:
        result = await session.execute(
            select(Subtopic).where(
                Subtopic.title == subtopic_data["title"],
                Subtopic.topic_id == topic_id,
            )
        )
        subtopic = result.scalar()

        if subtopic:
            print(f"Subtopic '{subtopic_data['title']}' already exists — skipping.")
            continue

        subtopic = Subtopic(
            topic_id=topic_id,
            title=subtopic_data["title"],
            keywords=subtopic_data.get("keywords", []),
            order=subtopic_data["order"],
        )
        session.add(subtopic)
        print(f"      Created Subtopic: {subtopic_data['title']}")


async def main():
    print("=" * 60)
    print("Starting seed script...")
    print("=" * 60)

    # Load JSON seed file — synchronous, no await needed
    data = load_seed_data()
    print(f"\nLoaded seed file: {data['exam_body']} — {data['subject']}\n")

    async with AsyncSessionLocal() as session:
        try:
            # Step 1 — Create ExamBody
            print("Step 1: Creating ExamBody...")
            exam_body = await get_or_create_exam_body(
                session,
                name=data["exam_body"],
                description=None
            )

            # Step 2 — Create Subject
            print("\nStep 2: Creating Subject...")
            subject = await get_or_create_subject(
                session,
                name=data["subject"],
                description=None
            )

            # Step 3 — Link ExamBody and Subject
            print("\nStep 3: Creating ExamBodySubject link...")
            exam_body_subject = await get_or_create_exam_body_subject(
                session,
                exam_body_id=exam_body.id,
                subject_id=subject.id,
                class_level=data.get("level"),
            )

            # Step 4 — Seed Topics and Subtopics
            print(f"\nStep 4: Seeding {len(data['topics'])} topics and their subtopics...")
            await seed_topics(session, exam_body_subject.id, data["topics"])

            # Commit everything at once
            await session.commit()

            print("\n" + "=" * 60)
            print("Seed completed successfully!")
            print("=" * 60)

        except Exception as e:
            await session.rollback()
            print(f"\nSeed failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())