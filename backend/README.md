# Backend

FastAPI 기반 백엔드 스캐폴드입니다.

## 역할
- OpenAI API 호출 대행
- PostgreSQL 연결 기반 준비
- 추후 노트/폴더/PDF/캡처 저장 API 확장

## 실행
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

기본 주소:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 현재 포함된 API
- `GET /health`
- `POST /api/chat`

## 다음 단계
- 프론트 `handleAsk`를 `POST /api/chat` 호출로 교체
- PostgreSQL 모델 추가
- 노트/폴더/PDF 저장 API 추가
