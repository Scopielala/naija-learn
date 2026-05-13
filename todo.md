# Todo — Nigerian Curriculum Learning Library (Implementation Plan)

## Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 1 — Project Setup

- [ ] **1.1** Create the project folder and initialize a Git repository
- [ ] **1.2** Create and activate a Python virtual environment using `uv`
- [ ] **1.3** Install core dependencies:
  - `fastapi`, `uvicorn`, `sqlalchemy[asyncio]`, `asyncpg`
  - `alembic`, `pydantic-settings`, `python-dotenv`, `httpx`
- [ ] **1.4** Set up the project folder structure:
  ```
  naija-learn/
  ├── app/
  │   ├── main.py
  │   ├── config.py
  │   ├── database.py
  │   ├── models/
  │   ├── schemas/
  │   ├── routes/
  │   ├── services/
  │   └── prompts/
  ├── alembic/
  ├── scripts/
  │   └── seed.py
  ├── data/
  │   └── waec_economics_seed.json
  ├── .env
  ├── .gitignore
  └── requirements.txt
  ```
- [ ] **1.5** Create `.env` file with database URL, Claude API key, and app settings
- [ ] **1.6** Set up `config.py` using pydantic-settings to load environment variables
- [ ] **1.7** Push initial project structure to GitHub

---

## Phase 2 — Database Models

- [ ] **2.1** Set up `database.py` — async SQLAlchemy engine, session factory, Base class
- [ ] **2.2** Write the `ExamBody` model (`exam_bodies` table)
- [ ] **2.3** Write the `Subject` model (`subjects` table)
- [ ] **2.4** Write the `ExamBodySubject` model (`exam_body_subjects` junction table)
- [ ] **2.5** Write the `Topic` model (`topics` table) with FK to `exam_body_subjects`
- [ ] **2.6** Write the `Subtopic` model (`subtopics` table) with FK to `topics`
- [ ] **2.7** Write the `ContentCache` model (`content_cache` table) with FK to `subtopics`
- [ ] **2.8** Initialize Alembic and configure it to use the async engine
- [ ] **2.9** Generate and run the first migration to create all tables
- [ ] **2.10** Verify all tables are created correctly in PostgreSQL

---

## Phase 3 — Database Seeding

- [ ] **3.1** Place `waec_economics_seed.json` inside the `data/` folder
- [ ] **3.2** Write `scripts/seed.py` that:
  - Reads the JSON seed file
  - Inserts the ExamBody (WAEC) into the database
  - Inserts the Subject (Economics) into the database
  - Creates the ExamBodySubject link
  - Loops through all 25 topics and inserts them
  - Loops through all subtopics per topic and inserts them with keywords
  - Handles duplicates gracefully (does not insert twice if run again)
- [ ] **3.3** Run the seed script and verify data in the database
- [ ] **3.4** Confirm all 25 topics and 94 subtopics are correctly stored

---

## Phase 4 — Pydantic Schemas

- [ ] **4.1** Write response schema for `ExamBody`
- [ ] **4.2** Write response schema for `Subject`
- [ ] **4.3** Write response schema for `Topic` (with subtopic count)
- [ ] **4.4** Write response schema for `Subtopic` (with keywords)
- [ ] **4.5** Write response schema for `ContentCache` (notes, questions, summary)
- [ ] **4.6** Write a shared `APIResponse` wrapper schema for consistent API responses

---

## Phase 5 — AI Prompt Builder

- [ ] **5.1** Create `app/prompts/builder.py`
- [ ] **5.2** Write `build_notes_prompt()` function that takes subtopic data and returns a formatted prompt string for generating notes
- [ ] **5.3** Write `build_questions_prompt()` function for generating practice questions
- [ ] **5.4** Write `build_summary_prompt()` function for generating a quick summary
- [ ] **5.5** Test all three prompt builders manually with sample data

---

## Phase 6 — Groq API Service

- [ ] **6.1** Create `app/services/ai_service.py`
- [ ] **6.2** Write `generate_content()` function that:
  - Accepts a prompt string and content type
  - Makes an async HTTP call to the Gemini API using `httpx`
  - Returns the generated text
  - Handles API errors gracefully
- [ ] **6.3** Test `generate_content()` with a sample prompt and confirm it returns a valid response

---

## Phase 7 — Core Service Layer

- [ ] **7.1** Create `app/services/subject_service.py` — fetches all subjects from DB
- [ ] **7.2** Create `app/services/topic_service.py` — fetches topics by subject
- [ ] **7.3** Create `app/services/subtopic_service.py` — fetches subtopics by topic
- [ ] **7.4** Create `app/services/content_service.py` that:
  - Accepts a subtopic ID and content type (notes, questions, summary)
  - Checks the `content_cache` table first
  - If cache hit → returns cached content immediately
  - If cache miss → calls prompt builder → calls AI service → saves to cache → returns content

---

## Phase 8 — API Routes

- [ ] **8.1** Create `app/routes/subjects.py` — `GET /subjects`
- [ ] **8.2** Create `app/routes/topics.py` — `GET /subjects/{subject_id}/topics`
- [ ] **8.3** Create `app/routes/subtopics.py` — `GET /topics/{topic_id}/subtopics`
- [ ] **8.4** Create `app/routes/content.py`:
  - `GET /subtopics/{subtopic_id}/notes`
  - `GET /subtopics/{subtopic_id}/questions`
  - `GET /subtopics/{subtopic_id}/summary`
- [ ] **8.5** Register all routers in `app/main.py`
- [ ] **8.6** Test all endpoints using FastAPI's auto-generated `/docs` (Swagger UI)

---

## Phase 9 — Frontend

- [ ] **9.1** Create the `frontend/` folder with `index.html`, `style.css`, `app.js`
- [ ] **9.2** Build the Subject Selection screen — displays available subjects
- [ ] **9.3** Build the Topic List screen — displays all 25 Economics topics
- [ ] **9.4** Build the Subtopic List screen — displays subtopics for a clicked topic
- [ ] **9.5** Build the Content screen — displays AI-generated notes with a loading state
- [ ] **9.6** Add buttons for Notes, Practice Questions, and Summary on the content screen
- [ ] **9.7** Make the UI mobile-friendly with basic responsive CSS
- [ ] **9.8** Connect all screens to the live FastAPI backend via `fetch()` calls

---

## Phase 10 — Testing and Cleanup

- [ ] **10.1** Test the full student flow end to end:
  - Open app → Pick Economics → Pick a topic → Pick a subtopic → Read notes
- [ ] **10.2** Verify content caching works — make the same request twice and confirm no second AI call
- [ ] **10.3** Test practice questions and summary endpoints
- [ ] **10.4** Test on mobile browser
- [ ] **10.5** Clean up code — remove debug logs, add docstrings to key functions
- [ ] **10.6** Update `README.md` with setup instructions and how to run the project
- [ ] **10.7** Refactor session management — move from automatic session commits in get_db() to explicit
  - commits in service layer when write operations are introduced.

---

## Current Status

**Phase 1 — Project Setup** is next.
