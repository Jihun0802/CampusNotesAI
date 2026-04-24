from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db, ping_database
from app.routes.chat import router as chat_router
from app.routes.storage import router as storage_router


app = FastAPI(
    title="CampusNotesAI Backend",
    version="0.1.0",
    description="FastAPI backend for CampusNotesAI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check() -> dict[str, str]:
    ping_database()
    return {"status": "ok", "database": "connected"}


app.include_router(chat_router, prefix="/api")
app.include_router(storage_router, prefix="/api")
