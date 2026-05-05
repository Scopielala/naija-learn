# Contributing to Naija Learn

Welcome to Naija Learn. This document explains everything
you need to know to contribute effectively.

---

## Project Structure

naija-learn/
├── app/ ← Backend (FastAPI)
│ ├── models/ ← Database models
│ ├── schemas/ ← Pydantic response schemas
│ ├── routes/ ← API endpoints
│ ├── services/ ← Business logic
│ └── prompts/ ← AI prompt builder
├── frontend/ ← Frontend (HTML/CSS/JS)
├── alembic/ ← Database migrations
├── scripts/ ← Seed scripts
└── data/ ← Seed data files

---

## Branch Structure

main → stable, production-ready code only
dev → integration branch — all features merge here first
feature → individual work branches — created from dev

---

## Workflow — Step by Step

### Starting New Work

Always start from dev:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

feature/topic-list-screen ← new features
fix/content-loading-bug ← bug fixes
docs/update-api-documentation ← documentation
refactor/clean-up-ai-service ← code refactoring

### Committing Work

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "feat: add topic list endpoint"
git commit -m "fix: correct subtopic query filter"
git commit -m "docs: update API contract documentation"

# Bad commit messages
git commit -m "update"
git commit -m "fix stuff"
git commit -m "changes"
```

### Opening a Pull Request

1. Push your feature branch:

```bash
git push origin feature/your-feature-name
```

2. Go to GitHub and open a PR
3. Set base branch to **dev** — never main
4. Fill out the PR template completely
5. Request a review from the lead

### After Your PR is Approved

The lead merges your PR into dev. Delete your feature branch after merging.

---

## API Contract

The backend exposes these endpoints. The frontend must
call them exactly as documented:

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/subjects`                 | List all subjects         |
| GET    | `/subjects/{id}/topics`     | Get topics for a subject  |
| GET    | `/topics/{id}/subtopics`    | Get subtopics for a topic |
| GET    | `/subtopics/{id}/notes`     | Get or generate notes     |
| GET    | `/subtopics/{id}/questions` | Get or generate questions |
| GET    | `/subtopics/{id}/summary`   | Get or generate summary   |

Full API documentation available at `/docs` when the
server is running.

---

## Communication

- All technical discussions happen in GitHub issues and PR comments
- Weekly sync every [set your day] to discuss progress and blockers
- Any change to the API contract must be discussed and agreed
  before implementation

---

## Questions?

Open a GitHub issue with the label `question` or reach out
directly to @Scopielala.
