# Project Scope — Nigerian Curriculum Learning Library (MVP)

## Overview

A web-based learning platform that organizes educational content using the Nigerian
examination syllabus (starting with WAEC) as its backbone. Students can browse topics
and subtopics from the official syllabus and receive AI-generated explanations, examples,
and practice questions tailored to their level and exam body.

The MVP tests the core idea with a single subject — **WAEC Economics** — before expanding
to other subjects and exam bodies.

---

## Problem Being Solved

Nigerian students preparing for WAEC, JAMB, and NECO have no single structured resource
that:

- Organizes content exactly the way the official syllabus is organized
- Generates clear, exam-focused explanations in plain English
- Uses Nigerian examples students can relate to
- Is freely accessible without buying textbooks or paying for tutors

---

## MVP Goal

Validate that the core loop works:

> Student picks a subtopic → AI generates a clear, syllabus-accurate explanation → Student learns

---

## Scope

### In Scope (MVP)

**1. Syllabus Structure**

- One exam body: WAEC
- One subject: Economics
- All 25 topics and 94 subtopics from the official WAEC Economics syllabus
- Syllabus data seeded into the database from the structured JSON seed file

**2. Content Generation**

- AI-generated notes per subtopic (explanation, definition, examples, key points)
- AI-generated practice questions per subtopic
- AI-generated summary per subtopic
- Content caching — AI is only called once per subtopic; responses are saved and reused

**3. Student-Facing Features**

- Browse all Economics topics
- Click into a topic to see its subtopics
- Click a subtopic to read AI-generated notes
- Request practice questions for any subtopic
- Request a quick summary for any subtopic

**4. Backend**

- FastAPI backend with async support
- PostgreSQL database
- Async SQLAlchemy with asyncpg
- Alembic for database migrations
- Gemini API integration for content generation
- Content cache layer to avoid repeated AI calls
- Clean three-layer architecture: routes → service → database

**5. Frontend**

- Vanilla HTML, CSS, and JavaScript
- Simple, clean, mobile-friendly UI
- No login or authentication required for MVP

---

### Out of Scope (MVP)

The following are acknowledged but deliberately excluded from V1:

- User authentication and accounts
- Student progress tracking
- Multiple subjects beyond Economics
- Multiple exam bodies beyond WAEC (JAMB, NECO deferred)
- Search functionality
- Bookmarks or saved notes
- Admin dashboard for content management
- Ratings or feedback on AI content
- Offline access
- Mobile app

---

## Data Model Summary

```
ExamBody → Subject → Topic → Subtopic → ContentCache
```

- **exam_bodies** — stores WAEC (and future: JAMB, NECO)
- **subjects** — stores Economics (and future subjects)
- **exam_body_subjects** — links exam body to subject with class level
- **topics** — 25 Economics topics ordered by syllabus
- **subtopics** — 94 subtopics with keywords used to build AI prompts
- **content_cache** — stores generated notes, questions, and summaries per subtopic

---

## API Endpoints (MVP)

| Method | Endpoint                             | Description                          |
| ------ | ------------------------------------ | ------------------------------------ |
| GET    | `/subjects`                          | List all available subjects          |
| GET    | `/subjects/{subject_id}/topics`      | Get all topics for a subject         |
| GET    | `/topics/{topic_id}/subtopics`       | Get all subtopics under a topic      |
| GET    | `/subtopics/{subtopic_id}/notes`     | Get or generate notes for a subtopic |
| GET    | `/subtopics/{subtopic_id}/questions` | Get or generate practice questions   |
| GET    | `/subtopics/{subtopic_id}/summary`   | Get or generate a summary            |

---

## Success Criteria

The MVP is considered successful if:

1. A student can open the app and browse the full WAEC Economics syllabus
2. Clicking any subtopic returns a clear, well-structured AI-generated explanation
3. The same subtopic requested twice returns a cached response (no repeated AI call)
4. Practice questions are generated and returned correctly
5. The app works on mobile browsers without issues

---

## Tech Stack

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| Backend Framework | FastAPI                       |
| Database          | PostgreSQL                    |
| ORM               | SQLAlchemy (async)            |
| DB Driver         | asyncpg                       |
| Migrations        | Alembic                       |
| AI Integration    | Claude API (claude-sonnet)    |
| Config Management | pydantic-settings             |
| Frontend          | HTML, CSS, Vanilla JavaScript |
| Version Control   | Git + GitHub                  |
