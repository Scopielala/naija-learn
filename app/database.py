from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase 
from app.config import settings

# core connection to the database
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG
)

# session factory to create database sessions
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class that all models will inherit from
class Base(DeclarativeBase):
    pass

# Dependency used in routes to get a DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise