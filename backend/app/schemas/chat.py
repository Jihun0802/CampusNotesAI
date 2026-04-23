from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(default="")
    current_page_text: str = Field(default="")
    nearby_pages_text: list[str] = Field(default_factory=list)
    user_note: str = Field(default="")
    capture_analysis: str = Field(default="")


class ChatResponse(BaseModel):
    answer: str
    model: str
