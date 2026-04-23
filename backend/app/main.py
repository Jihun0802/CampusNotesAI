from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.chat import router as chat_router


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


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(chat_router, prefix="/api")
