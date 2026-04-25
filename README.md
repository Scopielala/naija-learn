# Naija Learn

A Nigerian curriculum-based learning platform that organizes content using
the official WAEC syllabus as its backbone. Students can browse topics and
subtopics and receive AI-generated explanations and practice questions.

## MVP Subject

- WAEC Economics

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy (async)
- Alembic
- Gemini API
- Vanilla HTML/CSS/JS

## Setup

1. Clone the repo
2. Run `uv sync` to install dependencies
3. Create a `.env` file using `.env.example` as a guide
4. Run `uv run alembic upgrade head` to set up the database
5. Run `uv run python scripts/seed.py` to seed the syllabus data
6. Run `uv run uvicorn app.main:app --reload` to start the server
