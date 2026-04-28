import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool

from alembic import context

from app.config import settings
from app.database import Base

# Models to be used by Alembic:

from app.models import (
    ExamBody,
    Subject,
    ExamBodySubject,
    Topic,
    Subtopic,
    ContentCache
)

# Alembic config object.
config = context.config

# config file interpreter for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Base.metadata pointer
target_metadata = Base.metadata

# Override the sqlalchemy.url with our settings value


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    This means Alembic generates the SQL statements but does not actually connect 
    to the database. Useful for reviewing SQL before applying it.
    """

    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    This is the mode Alembic normally use to connect to the database and applies
    directly.
    """

    # Create an async engine using our database URL
    # NullPool means no connection pooling during migrations
    # This is the recommended setting for Alembic with async

    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )

    # connect to the database aynchronously
    async with connectable.connect() as connection:
        await connection.execution_options(isolation_level="AUTOCOMMIT")
        await connection.run_sync(do_run_migrations)
        

        # Run the migrations inside a transaction
        # if anything fails the whole migrations roll back
        await connection.run_sync(
            lambda sync_conn: context.run_migrations()
        )

        # Dispose the engine after migrations are done
    await connectable.dispose()

        # Entry point, Alembic calls this when you run 
        # "alembic upgrade head" or "alembic downgrade"

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())