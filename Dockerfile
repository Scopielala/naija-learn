# =============================================================
# Naija Learn — Dockerfile
# =============================================================
# Builds the FastAPI backend into a portable container image.
#
# Build:   docker build -t naija-learn .
# Run:     docker run -p 8000:8000 --env-file .env naija-learn
# =============================================================


# -------------------------------------------------------------
# STAGE 1 — BASE IMAGE
# -------------------------------------------------------------
FROM python:3.12-slim


# -------------------------------------------------------------
# ENVIRONMENT VARIABLES
# -------------------------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# -------------------------------------------------------------
# SYSTEM DEPENDENCIES
# -------------------------------------------------------------
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# -------------------------------------------------------------
# WORKING DIRECTORY
WORKDIR /app


# -------------------------------------------------------------
# DEPENDENCY FILES — COPY FIRST
COPY pyproject.toml uv.lock ./


# -------------------------------------------------------------
# INSTALL PYTHON DEPENDENCIES
# -------------------------------------------------------------
RUN uv sync --frozen --no-dev --no-cache


# -------------------------------------------------------------
# APPLICATION CODE — COPY LAST
# -------------------------------------------------------------
COPY . .


# -------------------------------------------------------------
# PORT DOCUMENTATION
EXPOSE 8000


# -------------------------------------------------------------
# STARTUP COMMAND
# -------------------------------------------------------------
# The command that runs when the container starts.
# -------------------------------------------------------------
# so $PORT gets properly resolved at runtime
CMD uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}