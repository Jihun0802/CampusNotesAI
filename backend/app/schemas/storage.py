from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class FolderUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    deleted: bool | None = None


class FolderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    deleted: bool
    created_at: datetime
    updated_at: datetime


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    code: str | None = Field(default=None, max_length=64)
    folder_id: int | None = None
    favorite: bool = False


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, max_length=64)
    folder_id: int | None = None
    favorite: bool | None = None
    deleted: bool | None = None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    code: str | None
    folder_id: int | None
    favorite: bool
    deleted: bool
    created_at: datetime
    updated_at: datetime


class NotePageCreate(BaseModel):
    page_index: int = Field(ge=1)
    typed_text: str = ""
    handwriting_data: str = ""
    image_data: str = ""


class NotePageUpdate(BaseModel):
    typed_text: str | None = None
    handwriting_data: str | None = None
    image_data: str | None = None


class NotePageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    note_id: int
    page_index: int
    typed_text: str
    handwriting_data: str
    image_data: str
    created_at: datetime
    updated_at: datetime


class ChatSessionCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class ChatSessionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)


class ChatSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    note_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    role: str = Field(min_length=1, max_length=32)
    content: str = Field(min_length=1)
    capture_analysis: str = ""


class ChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    role: str
    content: str
    capture_analysis: str
    created_at: datetime


class NoteDetailRead(NoteRead):
    pages: list[NotePageRead]
    chat_sessions: list[ChatSessionRead]


class ChatSessionDetailRead(ChatSessionRead):
    messages: list[ChatMessageRead]
