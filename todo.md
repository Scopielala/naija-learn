# Naija Learn — Deployment Todo

## Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 1 — Project Setup

- [x] **1.1** Create the project folder and initialize a Git repository
- [x] **1.2** Create and activate a Python virtual environment using `uv`
- [x] **1.3** Install core dependencies
- [x] **1.4** Set up the project folder structure
- [x] **1.5** Create `.env` file with database URL, Groq API key, and app settings
- [x] **1.6** Set up `config.py` using pydantic-settings to load environment variables
- [x] **1.7** Push initial project structure to GitHub

---

## Phase 2 — Database Models

- [x] **2.1** Set up `database.py` — async SQLAlchemy engine, session factory, Base class
- [x] **2.2** Write the `ExamBody` model (`exam_bodies` table)
- [x] **2.3** Write the `Subject` model (`subjects` table)
- [x] **2.4** Write the `ExamBodySubject` model (`exam_body_subjects` junction table)
- [x] **2.5** Write the `Topic` model (`topics` table) with FK to `exam_body_subjects`
- [x] **2.6** Write the `Subtopic` model (`subtopics` table) with FK to `topics`
- [x] **2.7** Write the `ContentCache` model (`content_cache` table) with FK to `subtopics`
- [x] **2.8** Initialize Alembic and configure it to use the async engine
- [x] **2.9** Generate and run the first migration to create all tables
- [x] **2.10** Verify all tables are created correctly in PostgreSQL

---

## Phase 3 — Database Seeding

- [x] **3.1** Place `waec_economics_seed.json` inside the `data/` folder
- [x] **3.2** Write `scripts/seed.py`
- [x] **3.3** Run the seed script and verify data in the database
- [x] **3.4** Confirm all 25 topics and 97 subtopics are correctly stored

---

## Phase 4 — Pydantic Schemas

- [x] **4.1** Write response schema for `ExamBody`
- [x] **4.2** Write response schema for `Subject`
- [x] **4.3** Write response schema for `Topic` (with subtopic count)
- [x] **4.4** Write response schema for `Subtopic` (with keywords)
- [x] **4.5** Write response schema for `ContentCache` (notes, questions, summary)
- [x] **4.6** Write a shared `APIResponse` wrapper schema for consistent API responses

---

## Phase 5 — AI Prompt Builder

- [x] **5.1** Create `app/prompts/builder.py`
- [x] **5.2** Write `build_notes_prompt()` function
- [x] **5.3** Write `build_questions_prompt()` function
- [x] **5.4** Write `build_summary_prompt()` function
- [x] **5.5** Test all three prompt builders manually with sample data

---

## Phase 6 — Groq AI Service

- [x] **6.1** Create `app/services/ai_service.py`
- [x] **6.2** Write `generate_content()` function using httpx async client
- [x] **6.3** Test `generate_content()` with a sample prompt

---

## Phase 7 — Core Service Layer

- [x] **7.1** Create `app/services/subject_service.py`
- [x] **7.2** Create `app/services/topic_service.py`
- [x] **7.3** Create `app/services/subtopic_service.py`
- [x] **7.4** Create `app/services/cache_service.py`
- [x] **7.5** Create `app/services/content_service.py` — the orchestrator

---

## Phase 8 — API Routes

- [x] **8.1** Create `app/routes/subjects.py` — `GET /api/v1/subjects`
- [x] **8.2** Create `app/routes/topics.py` — `GET /api/v1/subjects/{subject_id}/topics`
- [x] **8.3** Create `app/routes/subtopics.py` — `GET /api/v1/topics/{topic_id}/subtopics`
- [x] **8.4** Create `app/routes/content.py`
- [x] **8.5** Register all routers in `app/main.py` with `/api/v1` prefix
- [x] **8.6** Test all endpoints using FastAPI `/docs` Swagger UI

---

## Phase 9 — Frontend

- [x] **9.1** Create `frontend/` folder structure
- [x] **9.2** Write `frontend/js/config.js`
- [x] **9.3** Write `frontend/js/state.js`
- [x] **9.4** Write `frontend/js/router.js`
- [x] **9.5** Write `frontend/js/api.js`
- [x] **9.6** Write `frontend/js/components.js`
- [x] **9.7** Write `frontend/js/screens.js`
- [x] **9.8** Write `frontend/js/events.js`
- [x] **9.9** Write `frontend/js/app.js`
- [x] **9.10** Write `frontend/index.html`
- [x] **9.11** Write `frontend/css/base.css`
- [x] **9.12** Write `frontend/css/components.css`
- [x] **9.13** Write `frontend/css/screens.css`
- [x] **9.14** Test full student flow end to end locally
- [x] **9.15** Test on mobile browser

---

## Phase 10 — Testing and Cleanup

- [x] **10.1** Test the full student flow end to end
- [x] **10.2** Verify content caching works
- [x] **10.3** Test all three content types (notes, summary, questions)
- [x] **10.4** Test on mobile browser
- [x] **10.5** Set `DEBUG=False` for production
- [x] **10.6** Remove debug console logs
- [x] **10.7** Update Groq model to `openai/gpt-oss-120b`
- [ ] **10.8** Refactor session management — move from automatic commits
      in `get_db()` to explicit commits in service layer
      when write operations are introduced

---

## Phase 11 — Docker Setup

- [ ] **11.1** Write `Dockerfile`
  - Use Python 3.12-slim as base
  - Install uv via official installer script
  - Copy and install dependencies
  - Copy application code
  - Set start command with `$PORT`
- [ ] **11.2** Write `.dockerignore`
  - Exclude `.venv`, `.git`, `.env`, `frontend/`
  - Exclude test files, cache, and documentation
- [ ] **11.3** Build the image locally
  ```bash
  docker build -t naija-learn .
  ```
- [ ] **11.4** Test the image locally
  ```bash
  docker run -p 8000:8000 --env-file .env naija-learn
  ```

  - Verifmy server starts without errors
  - Visit `http://localhost:8000/docs`
- [ ] **11.5** Fix any build or runtime errors before moving on

---

## Phase 12 — GitHub Container Registry (GHCR)

- [ ] **12.1** Enable packages on your GitHub account
- [ ] **12.2** Create a GitHub Personal Access Token (PAT)
  - Select `write:packages` and `read:packages` permissions
  - Save the token securely
- [ ] **12.3** Login to GHCR from terminal
  ```bash
  docker login ghcr.io -u Scopielala
  ```
- [ ] **12.4** Tag the local image for GHCR
  ```bash
  docker tag naija-learn ghcr.io/scopielala/naija-learn:latest
  ```
- [ ] **12.5** Push the image to GHCR manually
  ```bash
  docker push ghcr.io/scopielala/naija-learn:latest
  ```
- [ ] **12.6** Verify the image appears on GitHub packages page
- [ ] **12.7** Make the package public

---

## Phase 13 — GitHub Actions CI/CD

- [ ] **13.1** Create `.github/workflows/` directory
- [ ] **13.2** Write `.github/workflows/deploy.yml`
  - Trigger on push to `main`
  - Login to GHCR using `GITHUB_TOKEN`
  - Build Docker image
  - Tag with `latest` and commit SHA
  - Push to GHCR
- [ ] **13.3** Add required secrets to GitHub repo
  - `GROQ_API_KEY`
  - `GHCR_TOKEN`
- [ ] **13.4** Push the workflow file to main
- [ ] **13.5** Verify the workflow runs successfully in Actions tab
- [ ] **13.6** Fix any workflow errors before proceeding

---

## Phase 14 — Railway Configuration

- [ ] **14.1** Remove the current Railway deployment (keep PostgreSQL)
- [ ] **14.2** Create a new Railway service from Docker image
  - Enter: `ghcr.io/scopielala/naija-learn:latest`
- [ ] **14.3** Configure all environment variables on Railway
  ```
  DATABASE_HOSTNAME  → PGHOST from PostgreSQL service
  DATABASE_PORT      → PGPORT from PostgreSQL service
  DATABASE_USERNAME  → PGUSER from PostgreSQL service
  DATABASE_PASSWORD  → PGPASSWORD from PostgreSQL service
  DATABASE_NAME      → PGDATABASE from PostgreSQL service
  GROQ_API_KEY       → your Groq API key
  GROQ_MODEL         → openai/gpt-oss-120b
  APP_NAME           → Naija Learn
  APP_VERSION        → 0.1.0
  DEBUG              → False
  PORT               → 8000
  ```
- [ ] **14.4** Set the start command on Railway
  ```
  uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- [ ] **14.5** Generate a Railway domain
  - Settings → Networking → Generate Domain
- [ ] **14.6** Verify deployment is successful
  - Visit `your-railway-domain/docs`

---

## Phase 15 — Database Setup on Railway

- [ ] **15.1** Open Railway Shell on the backend service
- [ ] **15.2** Run database migrations
  ```bash
  uv run alembic upgrade head
  ```
- [ ] **15.3** Run the seed script
  ```bash
  uv run python scripts/seed.py
  ```
- [ ] **15.4** Test the live API
  - Visit `your-railway-domain/api/v1/subjects`
- [ ] **15.5** Test content generation on production

---

## Phase 16 — Frontend Deployment to Vercel

- [ ] **16.1** Update `API_BASE_URL` in `frontend/js/config.js`
  ```javascript
  API_BASE_URL: "https://your-railway-domain/api/v1";
  ```
- [ ] **16.2** Commit and push the config change
- [ ] **16.3** Create a Vercel account at `vercel.com` with GitHub
- [ ] **16.4** Create a new Vercel project
  - Import `naija-learn` repo
  - Set Root Directory to: `frontend`
  - Click Deploy
- [ ] **16.5** Get the Vercel domain
- [ ] **16.6** Test the full student flow on the live Vercel URL
  - Test on both desktop and mobile

---

## Phase 17 — Post Deployment

- [ ] **17.1** Update `README.md` with live URLs
- [ ] **17.2** Update `CONTRIBUTING.md` with Docker setup instructions
- [ ] **17.3** Share the live URL publicly
  - Twitter — tag `@AltSchoolAfrica`
  - LinkedIn
  - WhatsApp and AltSchool Slack
  - Link from Hashnode articles
- [ ] **17.4** Write a deployment article for Hashnode
- [ ] **17.5** Create a GitHub release tag for MVP
  ```bash
  git tag -a v1.0.0 -m "Naija Learn MVP — WAEC Economics"
  git push origin v1.0.0
  ```

---

## Current Status

**Phase 11 — Docker Setup** is next.
