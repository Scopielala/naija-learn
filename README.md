# Naija Learn

An AI-powered learning platform organized around the official
Nigerian WAEC curriculum. Students browse topics and subtopics
from the official syllabus and receive AI-generated explanations,
practice questions, and summaries tailored for Nigerian students.

---

## MVP Subject

WAEC Economics — 25 topics, 97 subtopics

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Backend    | FastAPI                       |
| Database   | PostgreSQL                    |
| ORM        | SQLAlchemy (async)            |
| Migrations | Alembic                       |
| AI         | Groq API — LLaMA 3.3 70B      |
| Frontend   | HTML, CSS, Vanilla JavaScript |

---

## Project Status

| Phase | Description        | Status         |
| ----- | ------------------ | -------------- |
| 1     | Project Setup      | ✅ Complete    |
| 2     | Database Models    | ✅ Complete    |
| 3     | Database Seeding   | ✅ Complete    |
| 4     | Pydantic Schemas   | ✅ Complete    |
| 5     | AI Prompt Builder  | ✅ Complete    |
| 6     | Groq AI Service    | ✅ Complete    |
| 7     | Core Service Layer | 🔄 In Progress |
| 8     | API Routes         | ⏳ Pending     |
| 9     | Frontend           | ⏳ Pending     |
| 10    | Testing & Cleanup  | ⏳ Pending     |

---

## Local Setup

1. Clone the repo

```bash
git clone https://github.com/Scopielala/naija-learn.git
cd naija-learn
```

2. Install dependencies

```bash
uv sync
```

3. Create `.env` file — use `.env.example` as a guide

4. Set up the database

```bash
uv run alembic upgrade head
```

5. Seed the syllabus data

```bash
uv run python scripts/seed.py
```

6. Start the server

```bash
uv run uvicorn app.main:app --reload
```

7. Visit `http://localhost:8000/docs` to explore the API

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before writing any code.

## License

MIT
