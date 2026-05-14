from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import subjects, topics, subtopics, content

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered learning platform built around the Nigerian Waec syllabus",
    redirect_slashes=False
)

# CORS middleware: allows the frontend to make requests to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(subjects.router, prefix="/api/v1")
app.include_router(topics.router, prefix="/api/v1")
app.include_router(subtopics.router, prefix="/api/v1")
app.include_router(content.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }