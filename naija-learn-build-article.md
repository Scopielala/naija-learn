# I'm Building a Learning Platform for Nigerian Students — Here's What I've Done So Far

*A backend engineer's first-person account of building Naija Learn from scratch.*

---

Every great project starts with a conversation. Mine started with a simple thought:

*Nigerian students deserve better.*

Not better in a vague, motivational-poster kind of way. Better in a concrete, practical,
"why do I have to buy five different textbooks just to prepare for one WAEC exam" kind of
way. I had been thinking about the School Management System I was planning to build, but
somewhere in the middle of that thought a different idea quietly walked in, sat down, and
refused to leave.

What if there was one place — a single, well-organized platform — where a student in SS2
could open their laptop, pick Economics, and immediately see every topic and subtopic they
needed to cover for WAEC? Not scattered YouTube videos. Not photocopied handouts from a
lesson teacher. Not a 400-page textbook with chapters that don't match the syllabus. Just
clean, structured, AI-powered content organized exactly the way the Nigerian curriculum
is organized.

I called it **Naija Learn.**

And then I started building it.

---

## The Foundation — Setting Up the Project

The first thing I did was resist the urge to jump straight into writing code. I've learned
that lesson the hard way before. Instead I sat down and thought through the entire system
— what it needed to do, how the data would flow, what the database should look like, how
the AI would fit in.

I wrote a Project Scope document and a detailed todo list broken into ten phases. Seeing
the full plan on paper before writing a single line of code is something I now consider
non-negotiable. It is the difference between building with a blueprint and building by
guessing.

Then I set up the project. I used `uv` — a modern Python package manager that I had been
wanting to work with more seriously. One thing I discovered almost immediately was that
`uv add` requires a `pyproject.toml` to exist first. Running `uv init` before `uv add`
is the step most tutorials skip. It cost me five minutes. Now I will never forget it.

The project folder came together cleanly:

```
naija-learn/
├── app/
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   └── prompts/
├── scripts/
├── data/
└── alembic/
```

I set up environment variables using `pydantic-settings` — separating the database
credentials into individual parts (`DATABASE_HOSTNAME`, `DATABASE_PORT`, etc.) and
assembling the full connection URL dynamically using a `@property`. This approach meant
passwords with special characters would never cause parsing issues. At least that is what
I thought. More on that later.

---

## The Data Layer — Six Models and a Lesson in Relationships

With the project skeleton in place I moved to the database models. Six tables. Each one
representing a real concept in the system:

```
ExamBody → Subject → Topic → Subtopic → ContentCache
```

`ExamBody` is WAEC, JAMB, NECO — the bodies that set the syllabuses. `Subject` is
Economics, Mathematics, Biology. The `ExamBodySubject` table links them — because WAEC
has Economics and JAMB also has Economics, but they are not identical syllabuses.
`Topic` and `Subtopic` are the actual curriculum content. And `ContentCache` is where
AI-generated responses get stored so we never call the API twice for the same content.

Writing the models taught me something I had read about but never fully internalized until
I had to debug it myself — the `back_populates` rule.

The rule is deceptively simple:

```
If the other side holds a LIST   → the name is PLURAL
If the other side holds ONE item → the name is SINGULAR
```

One `ExamBodySubject` can have many `topics` — plural. One `Topic` belongs to a single
`exam_body_subject` — singular. Getting this wrong does not always throw an immediate
error. Sometimes it fails silently in ways that are genuinely confusing. I caught several
of these while reviewing the models line by line.

I also learned to use `TYPE_CHECKING` to handle forward references between models without
creating circular imports. The pattern looks like this:

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.topic import Topic
```

The import only happens during static type checking — never at runtime. This satisfies
Pylance without causing Python to get stuck in an infinite import loop. Clean, correct,
and now permanently in my toolkit.

---

## The Migration Battle — When Success Lies

Then came Alembic.

I initialized it, configured `env.py`, pointed it at my models, and ran:

```bash
uv run alembic revision --autogenerate -m "create initial tables"
```

The first time I ran this the generated migration file was empty. Both `upgrade()` and
`downgrade()` contained nothing but `pass`. Alembic had looked at my models and seen
nothing.

The culprit was a single misplaced line. The entry point code — the `if context.is_offline_mode()` block that Alembic calls when you run `upgrade head` — was accidentally indented inside the `run_migrations_online()` function instead of sitting at the module level. It was buried so deep it never executed. Alembic ran, found no entry point, shrugged, and generated an empty file.

I fixed the indentation. The migration generated correctly. All six `CREATE TABLE`
statements were there, clean and proper.

Then I ran:

```bash
uv run alembic upgrade head
```

And the terminal reported success:

```
INFO  [alembic.runtime.migration] Running upgrade -> 4debd5afbfe6, create initial tables
```

But when I opened psql to verify:

```
Did not find any tables.
```

I stared at that line for longer than I would like to admit.

The migration had reported success. No errors. No warnings. Just clean output — and a
completely empty database. It felt like watching someone confidently shake your hand while
their other hand was emptying your pockets.

After careful investigation I found the root cause. `asyncpg` — the async PostgreSQL
driver — wraps every database operation inside a transaction by default. It holds that
transaction open and waits for an explicit commit. Alembic has its own transaction
management. When the two systems sat on top of each other, the DDL statements executed
correctly but the transaction was never committed. When the connection closed asyncpg
rolled everything back silently.

The fix was one line:

```python
await connection.execution_options(isolation_level="AUTOCOMMIT")
```

Under `AUTOCOMMIT`, each DDL statement commits immediately without waiting for an
explicit transaction commit. The conflict between asyncpg and Alembic disappears. The
tables were created. The lesson was learned.

I even wrote a full article about it — because this is exactly the kind of silent,
confusing bug that deserves to be documented for the next developer who walks into it.

---

## The Seed — Bringing the Syllabus to Life

With the tables created the database was still empty. Structurally perfect, completely
hollow.

This is where the WAEC Economics syllabus came in. I had already extracted all 25 topics
and 97 subtopics from the official syllabus PDF into a structured JSON file — each topic
with its subtopics, each subtopic with its keywords. Those keywords are what the AI will
use later to generate focused, syllabus-accurate explanations.

I wrote a seed script that reads the JSON and populates the database in four steps:

```
Step 1 — Create ExamBody (WAEC)
Step 2 — Create Subject (Economics)
Step 3 — Link them in ExamBodySubject
Step 4 — Loop through 25 topics and 97 subtopics and insert them all
```

The script uses a `get_or_create` pattern — if a record already exists it skips it
instead of inserting a duplicate. This means the seed script is safe to run multiple
times without corrupting the data.

One thing I had to fix during this phase was a subtle async mistake. I had marked
`load_seed_data()` as an `async` function even though reading a JSON file from disk is
a perfectly synchronous operation. There was no `await` anywhere inside it — the `async`
keyword was doing absolutely nothing except adding confusion. I removed it, made it a
regular function, and removed the unnecessary `await` from the call site.

When I finally ran the script the output was satisfying in the way that only a terminal
full of green checkmarks can be:

```
============================================================
Starting seed script...
============================================================

Loaded seed file: WAEC — Economics

Step 1: Creating ExamBody...
  Created ExamBody: WAEC

Step 2: Creating Subject...
  Created Subject: Economics

Step 3: Creating ExamBodySubject link...
  Created ExamBodySubject link.

Step 4: Seeding 25 topics and their subtopics...
    Created Topic 1: Definition and Scope of Economics
      Created Subtopic: Scarcity and Choice
      Created Subtopic: Economic Activities
      ...

============================================================
Seed completed successfully!
============================================================
```

I verified the data directly in PostgreSQL:

```sql
SELECT t.title AS topic, COUNT(s.id) AS subtopic_count
FROM topics t
JOIN subtopics s ON s.topic_id = t.id
GROUP BY t.title, t.order
ORDER BY t.order;
```

25 topics. 97 subtopics. Every single one accounted for.

---

## Where Things Stand

Three phases complete. The foundation is solid.

The database exists, the schema is correct, the syllabus data is seeded, and every piece
of infrastructure needed to start building the intelligent layer is in place. The next
phases will bring the AI in — Pydantic schemas to shape the data, a prompt builder to
construct intelligent queries, a Gemini API service to generate content, and finally the
FastAPI routes that will tie everything together.

The student who opens Naija Learn and clicks "Elasticity of Demand" does not know or care
about any of this. They just want a clear explanation in plain English with a Nigerian
market example.

That is the goal. Everything I have built so far exists to make that moment possible.

And we are getting close.
