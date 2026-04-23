from pydantic import BaseModel, Field


class NearbyPage(BaseModel):
    page_index: int = Field(default=1)
    text: str = Field(default="")


class ChatRequest(BaseModel):
    question: str = Field(default="")
    current_page_index: int = Field(default=1)
    total_page_count: int = Field(default=1)
    current_page_text: str = Field(default="")
    nearby_pages_text: list[str] = Field(default_factory=list)
    nearby_pages: list[NearbyPage] = Field(default_factory=list)
    user_note: str = Field(default="")
    capture_analysis: str = Field(default="")


class ChatResponse(BaseModel):
    answer: str
    model: str
