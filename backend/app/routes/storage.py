from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.database import get_db
from app.db.models import ChatMessage, ChatRole, ChatSession, Folder, Note, NotePage
from app.schemas.storage import (
    ChatMessageCreate,
    ChatMessageRead,
    ChatSessionCreate,
    ChatSessionDetailRead,
    ChatSessionRead,
    ChatSessionUpdate,
    FolderCreate,
    FolderRead,
    FolderUpdate,
    NoteCreate,
    NoteDetailRead,
    NotePageCreate,
    NotePageRead,
    NotePageUpdate,
    NoteRead,
    NoteUpdate,
)


router = APIRouter(tags=["storage"])


def get_folder_or_404(db: Session, folder_id: int) -> Folder:
    folder = db.get(Folder, folder_id)
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")
    return folder


def get_note_or_404(db: Session, note_id: int) -> Note:
    statement = (
        select(Note)
        .where(Note.id == note_id)
        .options(selectinload(Note.pages), selectinload(Note.chat_sessions))
    )
    note = db.execute(statement).scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    return note


def get_page_or_404(db: Session, note_id: int, page_index: int) -> NotePage:
    statement = select(NotePage).where(NotePage.note_id == note_id, NotePage.page_index == page_index)
    page = db.execute(statement).scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note page not found.")
    return page


def get_chat_session_or_404(db: Session, session_id: int) -> ChatSession:
    statement = (
        select(ChatSession)
        .where(ChatSession.id == session_id)
        .options(selectinload(ChatSession.messages))
    )
    session = db.execute(statement).scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    return session


@router.get("/folders", response_model=list[FolderRead])
def list_folders(db: Session = Depends(get_db)) -> list[Folder]:
    statement = select(Folder).order_by(Folder.created_at.desc(), Folder.id.desc())
    return list(db.execute(statement).scalars().all())


@router.post("/folders", response_model=FolderRead, status_code=status.HTTP_201_CREATED)
def create_folder(payload: FolderCreate, db: Session = Depends(get_db)) -> Folder:
    folder = Folder(name=payload.name.strip())
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.patch("/folders/{folder_id}", response_model=FolderRead)
def update_folder(folder_id: int, payload: FolderUpdate, db: Session = Depends(get_db)) -> Folder:
    folder = get_folder_or_404(db, folder_id)

    if payload.name is not None:
        folder.name = payload.name.strip()
    if payload.deleted is not None:
        folder.deleted = payload.deleted

    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(folder_id: int, db: Session = Depends(get_db)) -> None:
    folder = get_folder_or_404(db, folder_id)
    db.delete(folder)
    db.commit()


@router.get("/notes", response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[Note]:
    statement = select(Note).order_by(Note.created_at.desc(), Note.id.desc())
    return list(db.execute(statement).scalars().all())


@router.post("/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> Note:
    if payload.folder_id is not None:
        get_folder_or_404(db, payload.folder_id)

    note = Note(
        title=payload.title.strip(),
        code=payload.code.strip() if payload.code else None,
        folder_id=payload.folder_id,
        favorite=payload.favorite,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/notes/{note_id}", response_model=NoteDetailRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> Note:
    return get_note_or_404(db, note_id)


@router.patch("/notes/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> Note:
    note = get_note_or_404(db, note_id)

    if "folder_id" in payload.model_fields_set and payload.folder_id is not None:
        get_folder_or_404(db, payload.folder_id)
    if payload.title is not None:
        note.title = payload.title.strip()
    if "code" in payload.model_fields_set:
        note.code = payload.code.strip() or None
    if "folder_id" in payload.model_fields_set:
        note.folder_id = payload.folder_id
    if payload.favorite is not None:
        note.favorite = payload.favorite
    if payload.deleted is not None:
        note.deleted = payload.deleted

    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> None:
    note = get_note_or_404(db, note_id)
    db.delete(note)
    db.commit()


@router.get("/notes/{note_id}/pages", response_model=list[NotePageRead])
def list_note_pages(note_id: int, db: Session = Depends(get_db)) -> list[NotePage]:
    get_note_or_404(db, note_id)
    statement = select(NotePage).where(NotePage.note_id == note_id).order_by(NotePage.page_index.asc())
    return list(db.execute(statement).scalars().all())


@router.put("/notes/{note_id}/pages/{page_index}", response_model=NotePageRead)
def upsert_note_page(
    note_id: int,
    page_index: int,
    payload: NotePageUpdate,
    db: Session = Depends(get_db),
) -> NotePage:
    get_note_or_404(db, note_id)
    page = db.execute(
        select(NotePage).where(NotePage.note_id == note_id, NotePage.page_index == page_index)
    ).scalar_one_or_none()

    if page is None:
        page = NotePage(
            note_id=note_id,
            page_index=page_index,
            typed_text=payload.typed_text or "",
            handwriting_data=payload.handwriting_data or "",
            image_data=payload.image_data or "",
        )
        db.add(page)
    else:
        if payload.typed_text is not None:
            page.typed_text = payload.typed_text
        if payload.handwriting_data is not None:
            page.handwriting_data = payload.handwriting_data
        if payload.image_data is not None:
            page.image_data = payload.image_data

    db.commit()
    db.refresh(page)
    return page


@router.post("/notes/{note_id}/pages", response_model=NotePageRead, status_code=status.HTTP_201_CREATED)
def create_note_page(note_id: int, payload: NotePageCreate, db: Session = Depends(get_db)) -> NotePage:
    get_note_or_404(db, note_id)
    existing_page = db.execute(
        select(NotePage).where(NotePage.note_id == note_id, NotePage.page_index == payload.page_index)
    ).scalar_one_or_none()
    if existing_page is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Page already exists.")

    page = NotePage(
        note_id=note_id,
        page_index=payload.page_index,
        typed_text=payload.typed_text,
        handwriting_data=payload.handwriting_data,
        image_data=payload.image_data,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.get("/notes/{note_id}/pages/{page_index}", response_model=NotePageRead)
def get_note_page(note_id: int, page_index: int, db: Session = Depends(get_db)) -> NotePage:
    return get_page_or_404(db, note_id, page_index)


@router.delete("/notes/{note_id}/pages/{page_index}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note_page(note_id: int, page_index: int, db: Session = Depends(get_db)) -> None:
    page = get_page_or_404(db, note_id, page_index)
    db.delete(page)
    db.commit()


@router.get("/notes/{note_id}/chat-sessions", response_model=list[ChatSessionRead])
def list_chat_sessions(note_id: int, db: Session = Depends(get_db)) -> list[ChatSession]:
    get_note_or_404(db, note_id)
    statement = select(ChatSession).where(ChatSession.note_id == note_id).order_by(ChatSession.created_at.asc())
    return list(db.execute(statement).scalars().all())


@router.post("/notes/{note_id}/chat-sessions", response_model=ChatSessionRead, status_code=status.HTTP_201_CREATED)
def create_chat_session(note_id: int, payload: ChatSessionCreate, db: Session = Depends(get_db)) -> ChatSession:
    get_note_or_404(db, note_id)
    session = ChatSession(
        note_id=note_id,
        title=payload.title.strip() if payload.title else "새 AI 대화",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/chat-sessions/{session_id}", response_model=ChatSessionDetailRead)
def get_chat_session(session_id: int, db: Session = Depends(get_db)) -> ChatSession:
    return get_chat_session_or_404(db, session_id)


@router.patch("/chat-sessions/{session_id}", response_model=ChatSessionRead)
def update_chat_session(
    session_id: int,
    payload: ChatSessionUpdate,
    db: Session = Depends(get_db),
) -> ChatSession:
    session = get_chat_session_or_404(db, session_id)
    if payload.title is not None:
        session.title = payload.title.strip()

    db.commit()
    db.refresh(session)
    return session


@router.delete("/chat-sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(session_id: int, db: Session = Depends(get_db)) -> None:
    session = get_chat_session_or_404(db, session_id)
    db.delete(session)
    db.commit()


@router.get("/chat-sessions/{session_id}/messages", response_model=list[ChatMessageRead])
def list_chat_messages(session_id: int, db: Session = Depends(get_db)) -> list[ChatMessage]:
    get_chat_session_or_404(db, session_id)
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    return list(db.execute(statement).scalars().all())


@router.post(
    "/chat-sessions/{session_id}/messages",
    response_model=ChatMessageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_chat_message(
    session_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
) -> ChatMessage:
    session = get_chat_session_or_404(db, session_id)

    if payload.role not in {ChatRole.USER.value, ChatRole.ASSISTANT.value, ChatRole.SYSTEM.value}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid chat role.")

    message = ChatMessage(
        session_id=session_id,
        role=payload.role,
        content=payload.content,
        capture_analysis=payload.capture_analysis,
    )
    db.add(message)

    if payload.role == ChatRole.USER.value and session.title == "새 AI 대화":
        session.title = payload.content.strip()[:40] or session.title

    db.commit()
    db.refresh(message)
    return message
