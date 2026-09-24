"""
SoilHelp - Database Configuration
SQLAlchemy engine, session factory, and table initialiser.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Store the SQLite database file next to main.py in the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'soilhelp.db')}"

# connect_args required for SQLite only (allows multi-thread access from FastAPI)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # set True to log SQL queries for debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Create all tables if they don't exist yet. Called once at server startup."""
    # Import models so SQLAlchemy registers them against Base.metadata
    import models  # noqa: F401  # pylint: disable=import-outside-toplevel
    Base.metadata.create_all(bind=engine)
    print("[DB] SQLite database ready:", DATABASE_URL)


def get_db():
    """FastAPI dependency — yields a database session, always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
