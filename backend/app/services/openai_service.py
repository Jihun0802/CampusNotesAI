import re

from openai import APIConnectionError, APIError, AuthenticationError, OpenAI, RateLimitError

from app.core.config import settings
from app.schemas.chat import ChatRequest


def find_requested_page(question: str) -> int | None:
    match = re.search(r"(\d+)\s*페이지", question)
    if not match:
        return None
    return int(match.group(1))


def maybe_answer_page_question(payload: ChatRequest) -> str | None:
    question = payload.question.strip()
    lowered = question.lower()
    requested_page = find_requested_page(question)

    asks_current_page = (
        "몇 페이지" in question
        or "현재 페이지" in question
        or "지금 페이지" in question
        or "어느 페이지" in question
    )

    asks_summary = any(keyword in question for keyword in ["요약", "정리", "설명", "내용"])

    if asks_current_page and requested_page is None:
        return f"지금 보고 있는 페이지는 {payload.current_page_index}페이지입니다. 전체는 {payload.total_page_count}페이지입니다."

    if requested_page is not None:
        if requested_page == payload.current_page_index and asks_summary:
            if payload.current_page_text.strip():
                return None
            return (
                f"지금 보고 있는 페이지는 {payload.current_page_index}페이지가 맞습니다. "
                "다만 이 페이지는 텍스트가 아니라 이미지처럼 인식되어 텍스트 추출이 되지 않아, "
                "현재 문맥만으로는 내용을 정확히 요약하기 어렵습니다."
            )

        if requested_page != payload.current_page_index:
            return (
                f"현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다. "
                f"질문에 언급한 {requested_page}페이지와는 다릅니다."
            )

        if requested_page == payload.current_page_index and not asks_summary:
            return f"네, 현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다."

    if "what page" in lowered or "current page" in lowered:
        return f"현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다. 전체는 {payload.total_page_count}페이지입니다."

    return None


def build_chat_prompt(payload: ChatRequest) -> str:
    nearby_page_lines = (
        "\n".join(
            f"- {page.page_index}페이지: {page.text or '없음'}"
            for page in payload.nearby_pages
        )
        if payload.nearby_pages
        else "없음"
    )
    capture_text = payload.capture_analysis or "없음"

    return f"""
너는 대학생용 AI 노트 앱의 학습 도우미다.
기본 답변 언어는 한국어다.

답변 규칙:
1. 사용자의 질문이 현재 문서/페이지/메모와 관련 있으면, 제공된 문맥을 우선 사용해서 답해라.
2. 질문이 단순 계산, 일반 상식, 짧은 개념 질문처럼 문맥 없이도 답할 수 있는 내용이면 자연스럽게 바로 답해라.
3. 문맥 질문인데 제공된 정보가 부족하면, 부족한 점을 짧게 밝히고 가능한 범위까지만 설명해라.
4. 문맥에 없는 내용이라는 이유만으로, 답할 수 있는 일반 질문까지 거부하지 마라.
5. 사용자가 특정 페이지 번호를 말하면 아래 페이지 번호 정보를 기준으로 판단해라.
6. 현재 보고 있는 페이지는 {payload.current_page_index}페이지이고, 전체 문서는 {payload.total_page_count}페이지다.
7. 장황하지 않게, 사용자가 바로 이해할 수 있는 답을 우선해라.

[사용자 질문]
{payload.question}

[현재 페이지 번호]
{payload.current_page_index}

[현재 페이지 텍스트]
{payload.current_page_text or "없음"}

[주변 페이지 정보]
{nearby_page_lines}

[사용자 메모]
{payload.user_note or "없음"}

[캡처/이미지 설명]
{capture_text}
""".strip()


def create_chat_completion(payload: ChatRequest) -> str:
    page_answer = maybe_answer_page_question(payload)
    if page_answer:
        return page_answer

    if not settings.openai_api_key:
        return "OPENAI_API_KEY가 설정되지 않아 mock 응답을 반환합니다."

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = build_chat_prompt(payload)

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        return response.choices[0].message.content or ""
    except AuthenticationError as exc:
        raise RuntimeError(f"OpenAI 인증 실패: API 키 또는 프로젝트 설정을 확인하세요. ({exc})") from exc
    except RateLimitError as exc:
        raise RuntimeError(f"OpenAI 요청 한도 초과 또는 사용량 제한: {exc}") from exc
    except APIConnectionError as exc:
        raise RuntimeError(f"OpenAI 서버 연결 실패: 네트워크 상태를 확인하세요. ({exc})") from exc
    except APIError as exc:
        raise RuntimeError(f"OpenAI API 오류: {exc}") from exc
