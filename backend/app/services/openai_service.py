from openai import OpenAI

from app.core.config import settings
from app.schemas.chat import ChatRequest


def build_chat_prompt(payload: ChatRequest) -> str:
    nearby_text = "\n\n".join(payload.nearby_pages_text) if payload.nearby_pages_text else "없음"
    capture_text = payload.capture_analysis or "없음"

    return f"""
너는 대학생용 AI 노트 앱의 학습 도우미다.
답변은 한국어로 하고, 현재 페이지를 우선으로 설명하되 필요할 때만 주변 문맥을 사용해라.
근거 없이 단정하지 말고, 현재 제공된 문맥 안에서만 설명해라.

[사용자 질문]
{payload.question}

[현재 페이지]
{payload.current_page_text or "없음"}

[주변 페이지]
{nearby_text}

[사용자 메모]
{payload.user_note or "없음"}

[캡처/이미지 설명]
{capture_text}
""".strip()


def create_chat_completion(payload: ChatRequest) -> str:
    if not settings.openai_api_key:
        return "OPENAI_API_KEY가 설정되지 않아 mock 응답을 반환합니다."

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = build_chat_prompt(payload)
    response = client.responses.create(
        model=settings.openai_model,
        input=prompt,
    )
    return response.output_text
