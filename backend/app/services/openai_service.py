import re

from openai import APIConnectionError, APIError, AuthenticationError, OpenAI, RateLimitError

from app.core.config import settings
from app.schemas.chat import ChatRequest, NearbyPage


PAGE_PATTERN = re.compile(r"(\d+)\s*(?:페이지|page)", re.IGNORECASE)
CURRENT_PAGE_KEYWORDS = [
    "몇 페이지",
    "현재 페이지",
    "지금 페이지",
    "보고 있는 페이지",
    "what page",
    "current page",
]
SUMMARY_KEYWORDS = [
    "요약",
    "정리",
    "설명",
    "해석",
    "무슨 내용",
    "무슨 말",
    "summarize",
    "summary",
    "explain",
]
CONTEXTUAL_KEYWORDS = [
    "이 페이지",
    "현재 페이지",
    "지금 페이지",
    "이 문서",
    "이 자료",
    "이 부분",
    "위 내용",
    "아래 내용",
    "캡처",
    "필기",
    "노트",
    "슬라이드",
    "pdf",
]


def normalize_text(value: str | None) -> str:
    return (value or "").strip()


def has_meaningful_text(value: str | None, minimum_length: int = 20) -> bool:
    text = normalize_text(value)
    return len(text) >= minimum_length


def find_requested_page(question: str) -> int | None:
    match = PAGE_PATTERN.search(question)
    if not match:
        return None
    return int(match.group(1))


def get_page_from_context(payload: ChatRequest, page_index: int) -> NearbyPage | None:
    if page_index == payload.current_page_index:
        return NearbyPage(page_index=page_index, text=payload.current_page_text)

    for page in payload.nearby_pages:
        if page.page_index == page_index:
            return page

    return None


def format_page_text(value: str | None) -> str:
    text = normalize_text(value)
    return text if text else "없음"


def is_current_page_question(question: str) -> bool:
    lowered = question.lower()
    return any(keyword in question or keyword in lowered for keyword in CURRENT_PAGE_KEYWORDS)


def asks_for_summary(question: str) -> bool:
    lowered = question.lower()
    return any(keyword in question or keyword in lowered for keyword in SUMMARY_KEYWORDS)


def is_contextual_question(question: str) -> bool:
    lowered = question.lower()
    return any(keyword in question or keyword in lowered for keyword in CONTEXTUAL_KEYWORDS)


def build_context_status(payload: ChatRequest) -> str:
    current_page_ok = has_meaningful_text(payload.current_page_text)
    nearby_page_ok = any(has_meaningful_text(page.text) for page in payload.nearby_pages)
    note_ok = has_meaningful_text(payload.user_note, minimum_length=10)
    capture_ok = has_meaningful_text(payload.capture_analysis, minimum_length=10)

    lines = [
        f"- 현재 페이지 텍스트 품질: {'충분함' if current_page_ok else '부족함'}",
        f"- 주변 페이지 텍스트 품질: {'충분함' if nearby_page_ok else '부족함'}",
        f"- 사용자 메모 존재: {'예' if note_ok else '아니오'}",
        f"- 캡처 설명 존재: {'예' if capture_ok else '아니오'}",
    ]

    if not any([current_page_ok, nearby_page_ok, note_ok, capture_ok]):
        lines.append("- 주의: 현재는 텍스트 기반 문맥이 거의 없어 문서 내용 단정이 어렵다.")

    return "\n".join(lines)


def maybe_answer_page_question(payload: ChatRequest) -> str | None:
    question = normalize_text(payload.question)
    requested_page = find_requested_page(question)

    if is_current_page_question(question) and requested_page is None:
        return (
            f"지금 보고 있는 페이지는 {payload.current_page_index}페이지입니다. "
            f"전체 문서는 {payload.total_page_count}페이지입니다."
        )

    if requested_page is None:
        return None

    target_page = get_page_from_context(payload, requested_page)
    summary_requested = asks_for_summary(question)

    if not summary_requested and requested_page == payload.current_page_index:
        return (
            f"네, 현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다. "
            f"전체 문서는 {payload.total_page_count}페이지입니다."
        )

    if not summary_requested and requested_page != payload.current_page_index:
        return (
            f"현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다. "
            f"질문에 언급한 {requested_page}페이지와는 다릅니다."
        )

    if summary_requested and target_page and has_meaningful_text(target_page.text):
        return None

    if summary_requested and requested_page == payload.current_page_index:
        return (
            f"현재 보고 있는 페이지는 {payload.current_page_index}페이지가 맞습니다. "
            "다만 이 페이지에서 추출된 텍스트가 부족해서 내용을 정확히 요약하기는 어렵습니다. "
            "이미지형 PDF이거나 텍스트 추출 품질이 낮을 가능성이 큽니다."
        )

    if summary_requested and requested_page != payload.current_page_index:
        return (
            f"{requested_page}페이지 요약을 요청했지만, 지금 요청에 포함된 문맥만으로는 "
            f"{requested_page}페이지 내용을 충분히 확인할 수 없습니다. "
            f"현재 보고 있는 페이지는 {payload.current_page_index}페이지입니다."
        )

    return None


def build_messages(payload: ChatRequest) -> list[dict[str, str]]:
    nearby_page_lines = (
        "\n".join(
            f"- {page.page_index}페이지: {format_page_text(page.text)}"
            for page in payload.nearby_pages
        )
        if payload.nearby_pages
        else "- 없음"
    )
    capture_text = format_page_text(payload.capture_analysis)
    user_note = format_page_text(payload.user_note)
    requested_page = find_requested_page(payload.question)
    requested_page_context = get_page_from_context(payload, requested_page) if requested_page else None

    question_type = "문맥 질문 가능성이 높음" if is_contextual_question(payload.question) else "일반 질문 가능성이 있음"
    requested_page_block = (
        f"\n[질문에서 언급한 페이지]\n- {requested_page_context.page_index}페이지: "
        f"{format_page_text(requested_page_context.text)}"
        if requested_page_context
        else "\n[질문에서 언급한 페이지]\n- 없음"
    )

    system_prompt = """
너는 대학생용 AI 노트 앱의 백엔드 학습 도우미다.
기본 응답 언어는 한국어다.

반드시 아래 원칙을 따른다.
1. 질문이 현재 문서, 페이지, 메모, 캡처와 관련 있으면 제공된 문맥을 최우선으로 사용한다.
2. 질문이 일반 상식, 개념 설명, 계산, 번역처럼 문맥 없이도 답할 수 있으면 문맥과 무관하게 자연스럽게 답한다.
3. 문맥 질문인데 근거가 부족하면 부족한 점을 짧고 분명하게 밝히고, 확인 가능한 범위까지만 답한다.
4. 자료에 없는 내용을 본 것처럼 추측하지 않는다.
5. 페이지 번호는 반드시 제공된 번호를 기준으로 해석한다.
6. 답변은 과하게 장황하지 않게, 바로 이해할 수 있게 작성한다.
7. 가능하면 핵심부터 답하고, 문맥 부족 시에는 왜 부족한지도 한 문장 안에 같이 설명한다.
""".strip()

    user_prompt = f"""
[사용자 질문]
{payload.question}

[질문 성격 추정]
{question_type}

[문서 상태]
- 현재 보고 있는 페이지: {payload.current_page_index}
- 전체 페이지 수: {payload.total_page_count}

[문맥 품질 점검]
{build_context_status(payload)}

[현재 페이지 텍스트]
{format_page_text(payload.current_page_text)}

[주변 페이지 정보]
{nearby_page_lines}
{requested_page_block}

[사용자 메모]
{user_note}

[캡처 설명]
{capture_text}
""".strip()

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def create_chat_completion(payload: ChatRequest) -> str:
    page_answer = maybe_answer_page_question(payload)
    if page_answer:
        return page_answer

    if not settings.openai_api_key:
        return "OPENAI_API_KEY가 설정되지 않아 mock 응답을 반환합니다."

    client = OpenAI(api_key=settings.openai_api_key)

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=build_messages(payload),
        )
        return response.choices[0].message.content or ""
    except AuthenticationError as exc:
        raise RuntimeError(f"OpenAI 인증 실패: API 키 또는 프로젝트 설정을 확인해주세요. ({exc})") from exc
    except RateLimitError as exc:
        raise RuntimeError(f"OpenAI 요청 한도 초과 또는 사용량 제한: {exc}") from exc
    except APIConnectionError as exc:
        raise RuntimeError(f"OpenAI 서버 연결 실패: 네트워크 상태를 확인해주세요. ({exc})") from exc
    except APIError as exc:
        raise RuntimeError(f"OpenAI API 오류: {exc}") from exc
