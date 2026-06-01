"""Engine and session factory.

A single Engine (connection pool) is created per process. `SessionLocal` hands
out short-lived sessions; the request lifecycle (see app/api/deps.py) is what
opens and closes them.

Design note: we use the synchronous SQLAlchemy 2.0 API rather than async. For a
CRUD workload like this it is simpler, Alembic support is first-class, and
FastAPI still serves it concurrently by running sync dependencies in a thread
pool. The async engine would add complexity without a real throughput win here.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQL_ECHO,
    pool_pre_ping=True,  # transparently recycle stale connections (Render idle drops)
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,  # keep attributes usable after commit for response shaping
    future=True,
)
