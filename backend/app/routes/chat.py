import logging

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.openai_service import create_chat_completion


logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        answer = create_chat_completion(payload)
        return ChatResponse(answer=answer, model=settings.openai_model)
    except Exception as exc:  # pragma: no cover - scaffold-level fallback
        logger.exception("Failed to create AI response")
        raise HTTPException(status_code=500, detail=f"AI 응답 생성 실패: {exc}") from exc
