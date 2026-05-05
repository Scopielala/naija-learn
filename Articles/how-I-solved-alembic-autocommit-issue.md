# Why My PostgreSQL Tables Weren't Being Created — And How AUTOCOMMIT Fixed It

*A debugging story every async FastAPI developer will eventually face.*

---

## The Setup

I was building a FastAPI backend with async SQLAlchemy, asyncpg, and Alembic for
database migrations. The stack was clean — PostgreSQL as the database, pydantic-settings
for environment management, and a properly configured async engine.

I wrote all my models, set up Alembic, generated my first migration, and ran:

```bash
uv run alembic upgrade head
```

The output looked perfect:

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 4debd5afbfe6, create initial tables
```

No errors. No warnings. Just clean, confident output.

So I opened psql to verify my tables existed:

```bash
psql -U postgres -d naija_learn -c "\dt"
```

And got this:

```
Did not find any tables.
```

---

## The Investigation

My first instinct was to check if Alembic had even tracked the migration:

```sql
SELECT * FROM alembic_version;
```

The response was brutal:

```
ERROR: relation "alembic_version" does not exist
```

Not only were my tables missing — the `alembic_version` table that Alembic
creates to track migration history was also missing. It was as if the migration
had never run at all, despite the terminal saying it had.

I checked three things in order:

**1. Was the database URL correct?**

```python
from app.config import settings
print(settings.DATABASE_URL)
# postgresql+asyncpg://postgres:password@localhost:5432/naija_learn ✅
```

Correct database, correct port, correct name.

**2. Were the models registered with Base.metadata?**

```python
from app.models import ExamBody, Subject, Topic, Subtopic, ContentCache
from app.database import Base
print(Base.metadata.tables.keys())
# dict_keys(['exam_bodies', 'subjects', 'topics', 'subtopics', 'content_cache']) ✅
```

All tables registered correctly.

**3. Was the migration file itself valid?**

I opened the generated migration file and saw all six `CREATE TABLE` statements
correctly written. Nothing wrong with the migration itself.

Everything looked correct. Yet nothing was being saved to the database.

---

## The Root Cause

The problem was hidden in how **asyncpg handles transactions** combined with how
**Alembic manages its own transaction lifecycle.**

Here is what was actually happening:

asyncpg, by default, wraps every database operation inside a transaction. It holds
that transaction open and waits for an explicit `COMMIT` before persisting anything
to disk. This is the correct and safe behavior for application code — you want
atomicity, you want the ability to roll back.

But Alembic has its own internal transaction management. It expects to control
the transaction lifecycle itself. When asyncpg's automatic transaction wrapping
sits on top of Alembic's transaction management, the two systems conflict.

The result is a silent failure — the SQL executes correctly inside the transaction,
Alembic reports success, but when the connection closes asyncpg rolls back the
uncommitted transaction. The database is left completely unchanged.

The insidious part is that **no error is raised.** The terminal output looks
identical whether the tables were created or not.

---

## The Fix — AUTOCOMMIT

The solution is to set `isolation_level="AUTOCOMMIT"` on the connection before
running migrations:

```python
def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # This is the fix — force AUTOCOMMIT on the connection
        await connection.execution_options(isolation_level="AUTOCOMMIT")
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()
```

Under `AUTOCOMMIT`, each DDL statement (`CREATE TABLE`, `ALTER TABLE`, etc.)
commits to the database immediately as it executes, without waiting for an
explicit transaction commit. This removes the conflict between asyncpg's
transaction wrapping and Alembic's internal transaction management.

After this fix, running `alembic upgrade head` produced the same clean output —
but this time the tables actually existed:

```
Schema |        Name        | Type  |  Owner
-------+--------------------+-------+----------
public | alembic_version    | table | postgres
public | content_cache      | table | postgres
public | exam_bodies        | table | postgres
public | exam_body_subjects | table | postgres
public | subjects           | table | postgres
public | subtopics          | table | postgres
public | topics             | table | postgres
(7 rows)
```

---

## When to Use AUTOCOMMIT (and When Not To)

This is an important distinction to understand clearly.

**Use AUTOCOMMIT for Alembic migrations** — migrations are one-time administrative
operations that change the database structure. Each DDL statement should commit
immediately. AUTOCOMMIT is the correct and recommended setting for async Alembic
with asyncpg.

**Never use AUTOCOMMIT for application code** — when your app handles user
requests it performs multiple related operations that must all succeed or all fail
together. That requires proper transactions with explicit commit and rollback:

```python
# Application code — always use explicit transactions
async with AsyncSessionLocal() as session:
    try:
        session.add(new_record)
        await session.commit()
    except Exception:
        await session.rollback()
        raise
```

If you used AUTOCOMMIT in your application code and an error occurred halfway
through a multi-step operation, some changes would be permanently saved while
others weren't — leaving your database in a corrupted, inconsistent state.

---

## The Rule of Thumb

```
Alembic migrations  → AUTOCOMMIT ✅
Application code    → explicit transactions with commit/rollback ✅
```

---

## Key Takeaway

Silent failures are the hardest bugs to debug because there is no error to guide
you. When Alembic reports success but your tables do not exist, the problem is
almost always a transaction conflict between asyncpg and Alembic's internal
lifecycle management. Setting `isolation_level="AUTOCOMMIT"` on the migration
connection resolves this by letting each DDL statement commit immediately,
bypassing the conflict entirely.

If you are building a FastAPI project with async SQLAlchemy, asyncpg, and Alembic —
add this to your `env.py` from day one and save yourself the debugging session.
