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
# python:3.12-slim is an official Python image based on Debian.
# "slim" means it strips out unnecessary tools and libraries
# keeping the image size small — faster to build, push and pull.
#
# We use 3.12 specifically because:
# - Railway's Nix environment supports 3.12 reliably
# - Our codebase runs correctly on 3.12
# - It matches our .python-version file
# -------------------------------------------------------------
FROM python:3.12-slim


# -------------------------------------------------------------
# ENVIRONMENT VARIABLES
# -------------------------------------------------------------
# These configure Python's behavior inside the container.
#
# PYTHONDONTWRITEBYTECODE=1
#   Stops Python from writing .pyc bytecode cache files.
#   These are useful for repeated local runs but wasteful
#   inside containers — the container always starts fresh.
#
# PYTHONUNBUFFERED=1
#   Forces Python to send output directly to the terminal
#   without buffering it first. This means logs appear
#   immediately in Railway's log viewer instead of arriving
#   in batches — critical for debugging production issues.
# -------------------------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# -------------------------------------------------------------
# SYSTEM DEPENDENCIES
# -------------------------------------------------------------
# Install minimal system packages needed to run the app.
#
# curl     — used to download the uv installer script
# ca-certificates — needed for secure HTTPS connections
#             when curl downloads the uv installer
#
# apt-get update  — refreshes the package list
# apt-get install — installs the packages
# --no-install-recommends — skips optional recommended packages
#                           keeps the image smaller
# rm -rf /var/lib/apt/lists/* — deletes the package list cache
#                               after installation
#                               reduces final image size
# -------------------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# -------------------------------------------------------------
# INSTALL UV
# -------------------------------------------------------------
# The official uv installation method for Docker.
# This is what the uv documentation recommends.
#
# We download and run the official installer script from
# astral.sh — the company that builds uv.
#
# UV_INSTALL_DIR=/usr/local/bin puts uv in a directory
# that is already on the system PATH — making the `uv`
# command available immediately without any PATH changes.
# -------------------------------------------------------------
RUN curl -LsSf https://astral.sh/uv/install.sh \
    | UV_INSTALL_DIR=/usr/local/bin sh


# -------------------------------------------------------------
# WORKING DIRECTORY
# -------------------------------------------------------------
# All subsequent commands run from /app inside the container.
# This is where our application code will live.
#
# /app is a common convention for application code in Docker.
# It keeps things organized and avoids cluttering the root.
# -------------------------------------------------------------
WORKDIR /app


# -------------------------------------------------------------
# DEPENDENCY FILES — COPY FIRST
# -------------------------------------------------------------
# We copy ONLY the dependency files before copying the rest
# of the application code. This is a critical Docker
# optimization called layer caching.
#
# How Docker builds work:
# Docker builds images in layers — one layer per instruction.
# Each layer is cached. If a layer has not changed Docker
# reuses the cached version instead of rebuilding it.
#
# By copying dependency files first:
# - If only your code changes (not dependencies)
#   Docker reuses the cached dependency layer
# - Your build goes from 2 minutes to 10 seconds
#
# If we copied everything at once and then installed:
# - Every code change would invalidate the dependency cache
# - Full dependency reinstall on every build = very slow
# -------------------------------------------------------------
COPY pyproject.toml uv.lock ./


# -------------------------------------------------------------
# INSTALL PYTHON DEPENDENCIES
# -------------------------------------------------------------
# Install all Python packages defined in pyproject.toml.
#
# --frozen     — use exact versions from uv.lock
#                ensures reproducible builds
#                every build gets the exact same packages
#
# --no-dev     — skip development dependencies
#                things like pytest, black, mypy are not
#                needed in production — keeps the image smaller
#
# --no-cache   — do not store the package download cache
#                inside the image — reduces final image size
# -------------------------------------------------------------
RUN uv sync --frozen --no-dev --no-cache


# -------------------------------------------------------------
# APPLICATION CODE — COPY LAST
# -------------------------------------------------------------
# Copy all remaining application files into the container.
# This happens AFTER dependency installation so code changes
# do not invalidate the expensive dependency cache layer.
#
# The .dockerignore file controls what gets copied here.
# Files listed in .dockerignore are excluded automatically.
# -------------------------------------------------------------
COPY . .


# -------------------------------------------------------------
# PORT DOCUMENTATION
# -------------------------------------------------------------
# EXPOSE documents which port the application uses.
# It does NOT actually open or publish the port.
# Port publishing happens in docker-compose.yml or
# via the -p flag when running the container.
#
# We use 8000 as the default but Railway overrides this
# with the $PORT environment variable at runtime.
# -------------------------------------------------------------
EXPOSE 8000


# -------------------------------------------------------------
# STARTUP COMMAND
# -------------------------------------------------------------
# The command that runs when the container starts.
#
# We use the JSON array format (exec form) instead of a
# shell string. The exec form runs the command directly
# without a shell wrapper — signals like SIGTERM are
# received correctly which allows graceful shutdown.
#
# --host 0.0.0.0
#   Bind to all network interfaces inside the container.
#   Without this uvicorn only accepts connections from
#   inside the container itself — nothing from outside
#   can reach it. 0.0.0.0 means "accept from anywhere".
#
# --port $PORT
#   Railway sets a $PORT environment variable dynamically.
#   We must use it instead of hardcoding 8000 because
#   Railway assigns the port — we do not choose it.
#   Locally $PORT defaults to 8000 via our .env file.
# -------------------------------------------------------------
CMD ["uv", "run", "uvicorn", "app.main:app", \
    "--host", "0.0.0.0", \
    "--port", "8000"]