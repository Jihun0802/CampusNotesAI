from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


engine = create_engine(settings.database_url, future=True, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ping_database() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True


def init_db() -> None:
    from app.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    sync_schema()


def sync_schema() -> None:
    statements = [
        "ALTER TABLE folders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()",
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE NOT NULL",
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()",
        "ALTER TABLE note_pages ADD COLUMN IF NOT EXISTS handwriting_data TEXT DEFAULT '' NOT NULL",
        "ALTER TABLE note_pages ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT '' NOT NULL",
        "ALTER TABLE note_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
