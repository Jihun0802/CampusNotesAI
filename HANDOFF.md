# CampusNotesAI Handoff

## 프로젝트 개요
- 프로젝트명: `CampusNotesAI`
- 목적: 대학생 대상 AI 기반 노트 앱 프로토타입
- 현재 프론트 스택: `Vite + React + pdfjs-dist`
- 현재 백엔드 스택: `FastAPI + OpenAI SDK + SQLAlchemy + PostgreSQL`
- 현재 상태: 프론트는 고도화된 데모 수준, 백엔드는 로컬 PostgreSQL 연결 및 기본 CRUD API까지 연결 완료

## 현재 폴더 구조
- 프론트 루트: 프로젝트 루트 자체
  - `src/`
  - `public/`
  - `index.html`
  - `package.json`
- 백엔드:
  - `backend/`
- 문서:
  - `README.md`
  - `HANDOFF.md`

## 현재 구현 상태 요약

### 1. 메인 홈 화면
- 메인 화면과 노트 상세 화면이 분리되어 있음
- 홈 화면은 삼성 노트 느낌의 카드/폴더 구조
- 좌측 사이드바 메뉴
  - `모든 노트`
  - `즐겨찾기`
  - `휴지통`
  - `폴더`
- 우측 메인 패널 구조
  - `메인 헤더`: 선택된 메뉴명 또는 선택된 폴더명 표시
  - `홈 액션 영역`: `노트 작성`, `폴더 생성`, 검색창
  - `폴더 카드 영역`: 폴더 카드 목록 또는 특정 폴더 진입 시 breadcrumb 표시
  - `정렬 바`: `만든 날짜순` 버튼
  - `노트 그리드`: 노트 미리보기 카드 목록
- `폴더`가 기본 메인 화면
- 폴더 카드와 노트 카드가 보이고, 폴더 없는 노트도 별도 표시
- 폴더/노트 데이터는 이제 백엔드 PostgreSQL API에서 불러오도록 1차 연결됨
- 다만 `src/App.jsx` 내부에 초기 mock 상수와 fallback 로직이 일부 남아 있음
- 우측 메인 화면은 `모든 노트` / `즐겨찾기` / `휴지통` / `폴더` 모두 같은 기본 구조를 공유함
  - 상단 기능명, `노트 작성`, `폴더 생성`, 검색 영역
  - 폴더 카드 영역
  - `만든 날짜순`
  - 노트 카드 그리드
- `모든 노트` / `즐겨찾기`는 폴더 카드 영역을 렌더링하지 않고 노트만 표시함
- `휴지통`은 삭제된 폴더만 폴더 카드 영역에 표시함
- 폴더명은 2줄까지 표시하고, 긴 영문/숫자 문자열도 줄바꿈 후 넘치면 말줄임 처리됨
- 노트 미리보기 카드는 기존보다 작게 조정됨
- 좌측 사이드바는 접힘/펼침 상태를 모두 지원함
  - 펼친 상태: 아이콘 + 메뉴명 + 카운트 표시
  - 접힌 상태: `모든 노트` 문서 아이콘, `즐겨찾기` 별 아이콘, `휴지통` 휴지통 아이콘, `폴더` 폴더 아이콘 표시
  - 접힘/펼침 상태의 아이콘 위치/버튼 크기는 아직 완전 동일하지 않아 추후 polish 필요
- 노트 카드는 폴더 카드로 드래그해서 해당 폴더로 이동 가능함
  - 이동 시 프론트 상태를 먼저 갱신하고 `PATCH /api/notes/{id}`로 DB에 저장
  - 폴더를 폴더에 드롭하는 동작은 현재 DB에 `folders.parent_id`가 없어 안내만 표시
- 특정 폴더 진입 시 우측 메인 패널 제목이 해당 폴더명으로 바뀜
  - 폴더 카드 목록 대신 `폴더 아이콘 > 폴더명` breadcrumb 표시
  - 작은 폴더 아이콘 클릭 시 기본 폴더 목록 화면으로 이동
  - 같은 폴더를 다시 눌러도 폴더 선택이 해제되지 않고 현재 폴더 화면 유지
- 노트 카드 하단 날짜는 ISO 문자열 대신 `4월 25일` 같은 월/일 형식으로 프론트에서 표시함

### 2. 메인 화면 기능
- `노트 작성`
- `폴더 생성`
- 노트 우클릭 메뉴
  - `삭제`
  - `즐겨찾기 추가/해제`
  - `공유`
- 폴더 우클릭 메뉴
  - `이름변경`
  - `삭제`
- 노트 삭제 시 휴지통 이동
- 폴더 삭제 시 폴더와 내부 노트 함께 휴지통 이동
- 삭제 전 확인 다이얼로그 표시

### 3. 노트 상세 화면 구조
- 전체 구조는 `상단 전체 툴바 + 아래 AI / 학습자료 2단`
- 상단 툴바는 화면 전체 폭을 사용
- 툴바 아래에서 `좌측 AI Assistant / 우측 PDF·필기 영역` 구조가 시작됨
- AI 패널은 접기/펼치기 가능
- AI 패널은 드래그로 너비 조절 가능
- AI 리사이즈 핸들은 거의 안 보이게 처리, 실제 hit area는 유지
- 접으면 AI 패널은 완전히 사라지고 학습자료가 전체 폭 사용

### 4. 상세 화면 디자인 상태
- `B-Snap` 스타일을 참고해 카드형 화이트/블루 톤으로 리디자인
- 전체 배경, 패널, 툴바, 문서 카드, AI 패널이 같은 계열로 정리됨
- 상단 툴바 버튼은 전부 아이콘 버튼 스타일
- 홈 버튼과 AI 버튼도 다른 도구 버튼과 같은 계열 스타일
- AI 버튼은 `Sparkles` 계열 아이콘 사용
- AI 패널 상단 메타 텍스트는 제거됨
- AI 내용이 길어져도 패널 전체가 아래로 늘어나지 않고 내부 스크롤만 생김

### 5. PDF 뷰어 / 문서 영역
- `pdfjs-dist`로 실제 PDF 페이지 렌더링
- 페이지는 세로로 쌓이고 스크롤로 이동
- `Ctrl + 스크롤` 시 PDF 영역만 확대/축소
- 확대/축소는 CSS scale 기반
- 기본 데모 PDF: `public/4_Maximum likelihood learning.pdf`
- 실제 PDF 페이지 렌더링과 함께 페이지별 텍스트도 추출하도록 연결 시작
- AI 요청 시 `current_page_text`, `nearby_pages_text`는 이제 실제 PDF 추출 텍스트를 우선 사용
- 추출 텍스트가 없을 때만 기존 mock 페이지 텍스트로 fallback
- 다만 현재 사용 중인 일부 자료는 텍스트형 PDF가 아니라 이미지형으로 보이며, 이 경우 텍스트 추출 품질이 낮거나 거의 비어 있을 수 있음
- 예전에 좌측 페이지 썸네일 / 현재 페이지 표시 / 페이지 점프 / 저장 상태 UI를 넣었었음
- 현재는 상세 화면에서 이 UI를 전부 제거/숨김 처리함
- 관련 상태/함수 일부는 아직 코드에 남아 있을 수 있음

### 6. 타이핑 기능
- 타이핑은 텍스트 박스 여러 개 방식이 아님
- 각 페이지마다 큰 `textarea` 하나를 쓰되, 줄 단위로 커서 이동 규칙을 강하게 커스텀함
- 클릭한 `x` 좌표는 무시
- 클릭한 `y` 좌표만 줄 높이 기준으로 계산
- 클릭 위치가 `5.5번째 줄`이면 `5번째 줄`로 스냅
- 커서는 항상 해당 줄 시작점(0열)으로 이동

### 7. Enter / Backspace 페이지 이동 규칙
- `Enter`
  - 마지막 줄이 아니면 같은 페이지 줄바꿈
  - 마지막 줄에서만 다음 페이지 첫 줄로 이동
- `Backspace`
  - 첫 줄이 아니면 같은 페이지에서 한 줄 위
  - 첫 줄에서만 이전 페이지로 이동
  - 이전 페이지로 이동할 때는 기존 입력 상태와 무관하게 항상 마지막 줄 시작점으로 이동
- 이 규칙은 사용자가 원하는 흐름 기준으로 여러 번 보정한 상태

### 8. 손글씨 / 지우개 / 필기 도구
- 손글씨 모드 지원
- 타이핑 모드 지원
- 지우개 모드 지원
- 영역 캡처 모드 지원
- 손글씨는 PDF 위 오버레이 방식
- 펜 도구
  - 색상 선택
  - 굵기 슬라이더 `1-100`
- 지우개 도구
  - `부분지우개`
  - `선택지우개`
- 형광펜은 아직 미구현
- 펜/지우개 옵션 바는 상단 툴바 아래에 뜨는 플로팅 오버레이 카드 형태
- 옵션 바가 열려도 아래 PDF/AI 레이아웃을 밀어내지 않음

### 9. 영역 캡처 / 선택 모드
- `영역 캡처` 모드에서 자유형/사각형 캡처 방식을 선택할 수 있음
- 영역 캡처 버튼도 펜/지우개처럼 상단 툴바 아래 플로팅 옵션 카드가 뜸
- `자유형`은 기존 자유선택 경로 방식, `사각형`은 드래그 시작점/끝점 기준 직사각형 영역 방식
- 선택한 영역을 이미지로 생성
- 생성된 캡처는 더 이상 페이지 아래에 썸네일 목록으로 쌓이지 않음
- 현재 동작
  - 캡처 후 AI 채팅 입력박스 내부 상단에 전송 대기 첨부 이미지처럼 붙음
  - 사용자가 텍스트를 같이 적어서 질문과 함께 보낼 수 있음
  - 텍스트 없이 이미지 단독 전송도 가능
  - 첨부 이미지 우측 상단의 작은 `×` 버튼으로 첨부 취소 가능
  - 첨부 이미지 설명 텍스트(`n페이지 캡처`)는 UI에서 표시하지 않음
  - 같은 캡처 영역 안의 손글씨 stroke는 자동 선택됨
  - 선택된 stroke는 강조 표시와 선택 박스로 보임
  - 선택된 stroke 영역에서 우클릭하면 컨텍스트 메뉴 표시
    - `복사`
    - `삭제`
    - `이동`
    - `스타일 변경`
- 현재 제약
  - `스타일 변경`은 아직 prompt 기반 입력
  - `이동`은 메뉴 클릭 후 같은 페이지에서 목적 위치를 한 번 클릭해 이동

### 10. AI Assistant
- 현재 프론트 `handleAsk`는 실제 FastAPI `POST /api/chat` 호출로 연결됨
- 질문 입력 가능
- 채팅 말풍선 UI 구현됨
- 캡처 이미지를 채팅 첨부처럼 붙여서 보낼 수 있음
- 채팅 메시지가 추가되거나 AI 응답 대기/완료 상태가 바뀌면 채팅 내역이 자동으로 최신 메시지까지 아래로 스크롤됨
- 초기 안내 메시지는 AI 패널 진입 시 보이지만, 사용자가 첫 질문을 보내면 대화 내역에서 제거됨
- 입력부는 AI 패널 하단에 고정된 형태이며, 전송 버튼은 입력박스 내부 우측 하단의 파란 `↑` 아이콘 버튼
- 입력박스 크기 수동 조절 핸들은 제거됨
- AI 답변은 별도 배경 없이 패널 배경에 자연스럽게 표시되고, 사용자 질문은 흰색 말풍선으로 표시됨
- 채팅 내 `AI` / `나` 라벨은 표시하지 않음
- 전송 전/전송 후 캡처 이미지 미리보기는 작은 썸네일 크기로 표시됨
- OpenAI API 키가 없으면 백엔드에서 mock 응답 반환
- API 키가 있으면 실제 OpenAI 호출
- 현재 AI 입력 구조
  - `question`
  - `current_page_index`
  - `total_page_count`
  - `current_page_text`
  - `nearby_pages_text`
  - `nearby_pages`
  - `user_note`
  - `capture_analysis`
- 주의
  - `capture_analysis`는 아직 실제 이미지 자체가 아니라 이미지 설명 문자열
  - 따라서 캡처 기반 질문 품질은 아직 제한적
- 프롬프트 위치
  - `backend/app/services/openai_service.py`
- 프롬프트 상태
  - 문맥 질문과 일반 질문을 모두 받도록 한 번 완화했음
  - 페이지 질문은 백엔드에서 일부 규칙 기반으로 먼저 처리하도록 보강했음
  - 하지만 아직 답변 톤/형식/정확도 면에서 추가 개선 필요
  - 특히 프롬프트는 다음 작업에서 더 손봐야 함

### 11. 현재 페이지 인식 상태
- AI가 몇 페이지를 보고 있는지 잘못 이해하던 문제를 추적함
- 원인 중 하나는 프론트가 질문 시점에 mock 페이지 수(`selectedNote.pages.length`) 기준으로 페이지 번호를 잘라 보내던 버그였음
- 이 버그를 수정해, 질문 시점에는 실제 렌더링된 PDF 페이지 수(`renderedPageCount`) 기준으로 현재 페이지 번호를 계산해 전송하도록 변경
- 또한 질문 버튼을 누르는 순간 DOM 기준으로 실제 보이는 페이지를 다시 계산해 AI 요청에 사용하도록 보강
- 현재 체감상 페이지 번호 인식은 이전보다 좋아졌고, 사용자는 “몇 페이지 보고 있냐”를 꽤 정확히 맞는다고 느낀 상태
- 다만 페이지 내용 요약 품질은 여전히 PDF가 이미지형인지 텍스트형인지에 크게 영향받음

### 12. 저장 / 복원
- 현재 저장 구조는 혼합 상태
- PostgreSQL에 저장되는 것
  - 폴더
  - 노트
  - 페이지별 타이핑 메모
  - 페이지별 손글씨 데이터(JSON 문자열)
  - AI 채팅 세션
  - AI 채팅 메시지
- 아직 `localStorage`에 남아 있는 것
  - redo stroke 상태
  - 노트별 현재 페이지 인덱스
- 페이지별 업로드 이미지는 현재 메타데이터 일부만 저장됨
  - 브라우저 `blob:` URL 기반 파일 자체 업로드/복원은 아직 미구현
- 노트/폴더/채팅은 새로고침 후에도 DB에서 다시 불러오도록 1차 연결됨

## 현재 프론트 의존성
- `react`
- `react-dom`
- `pdfjs-dist`
- `lucide-react`

## 백엔드 상태
- `backend/` 디렉터리 생성 완료
- 현재 백엔드 스택
  - `FastAPI`
  - `OpenAI Python SDK`
  - `SQLAlchemy`
  - `psycopg`
  - `python-dotenv`
  - `pydantic-settings`
- 주요 파일
  - `backend/app/main.py`
  - `backend/app/routes/chat.py`
  - `backend/app/routes/storage.py`
  - `backend/app/services/openai_service.py`
  - `backend/app/core/config.py`
  - `backend/app/db/database.py`
  - `backend/app/db/models.py`
  - `backend/app/schemas/storage.py`
  - `backend/requirements.txt`
  - `backend/.env.example`
  - `backend/README.md`
- 현재 API
  - `GET /health`
  - `GET /health/db`
  - `POST /api/chat`
  - `GET/POST/PATCH/DELETE /api/folders`
  - `GET/POST/PATCH/DELETE /api/notes`
  - `GET/POST/PUT/DELETE /api/notes/{note_id}/pages...`
  - `GET/POST/PATCH/DELETE /api/notes/{note_id}/chat-sessions...`
  - `GET/POST /api/chat-sessions/{session_id}/messages`
- 상태
  - 파이썬 문법 검증 완료
  - 프론트 `handleAsk`는 백엔드 `/api/chat`로 연결 완료
  - `openai` / `httpx` 호환성 이슈 수정 완료
  - 백엔드 에러 로그 개선 완료
  - 페이지 번호 관련 질문은 백엔드에서 일부 규칙 기반 처리 추가
  - 로컬 PostgreSQL 연결 완료
  - 앱 시작 시 DB ping 및 기본 테이블 초기화 가능
  - `Folder`, `Note`, `NotePage`, `ChatSession`, `ChatMessage` 모델 추가 완료
  - 기존 로컬 테이블을 새 구조에 맞추기 위한 최소 schema sync 로직 추가됨
  - Alembic 같은 정식 마이그레이션은 아직 없음

## 현재 핵심 파일
- `src/App.jsx`
  - 전체 앱 구조
  - 홈 화면 / 노트 상세 화면 분기
  - PDF 렌더링
  - 손글씨/타이핑/지우개/영역 캡처
  - Enter/Backspace 줄/페이지 이동 규칙
  - 메인 화면 우클릭 메뉴/삭제 로직
  - AI Assistant UI / 드래그 너비 조절
  - 채팅 첨부 이미지 흐름
- `src/styles.css`
  - 전체 레이아웃
  - 홈 화면 UI
  - 노트 상세 화면 UI
  - `note-study-shell`, 내부 AI/툴바/PDF 배치
  - 플로팅 도구 옵션 바
- `backend/app/main.py`
  - FastAPI 앱 시작점
- `backend/app/routes/chat.py`
  - AI 채팅 API 엔드포인트
- `backend/app/routes/storage.py`
  - 폴더/노트/페이지/채팅 CRUD API
- `backend/app/services/openai_service.py`
  - OpenAI 호출 서비스
- `backend/app/schemas/storage.py`
  - 저장용 API request/response 스키마
- `backend/app/db/models.py`
  - `Folder`, `Note`, `NotePage`, `ChatSession`, `ChatMessage` SQLAlchemy 모델
- `public/4_Maximum likelihood learning.pdf`
  - 기본 데모 PDF

## 실행 방법
### 프론트
```powershell
npm.cmd install
npm.cmd run dev
```

### 백엔드
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

## 빌드 / 검증 상태
- 프론트 `npm.cmd run build` 정상 통과
- `pdfjs-dist` 때문에 번들 크기 경고는 있으나 실패 아님
- 백엔드 파이썬 파일 문법 체크 통과
- 백엔드 `POST /api/chat`는 API 키 없을 때 200 + mock 응답 확인
- API 키 있을 때 실제 OpenAI 호출 가능 상태까지 연결
- API 키 있을 때 `openai` / `httpx` 충돌(`proxies`)과 `responses` API 문제는 수정함
- 현재는 `chat.completions.create(...)` 방식 사용
- 로컬 PostgreSQL 연결 확인 완료
- `GET /health/db` 정상 응답 확인 완료
- 폴더/노트/페이지/채팅 세션/메시지 CRUD 생성 흐름 검증 완료
- 프론트 `npm.cmd run build` 다시 정상 통과

## 지금 상태에서 특히 중요한 메모
- 노트 상세 화면의 PDF/AI 패널 높이와 하단 여백은 일부 조정했지만, 사용자가 아직 100% 만족하지는 않아 추후 더 손보고 싶어함
- 타이핑 줄 스냅 / Enter / Backspace 동작은 사용자가 원하는 규칙으로 꽤 세밀하게 맞춘 상태라 건드릴 때 주의
- 노트 상세 화면은 현재 `상단 전체 툴바 + 아래 AI/학습자료` 구조
- 페이지 이동 관련 상세 UI는 현재 숨겨 둔 상태
  - 기능 자체를 완전히 지운 것은 아님
  - 관련 상태/함수 일부가 남아 있을 수 있음
- 선택 stroke 편집은 들어갔지만 `스타일 변경` UI는 아직 prompt 기반이라 추후 개선 필요
- 프론트는 여전히 `App.jsx`에 로직이 많이 몰려 있음
- AI 답변 품질을 더 올리려면 두 축이 중요
  - 실제 PDF 추출 텍스트 품질 개선
  - `backend/app/services/openai_service.py` 프롬프트 추가 개선
- 사용자가 보던 자료가 이미지형 PDF일 가능성이 높아서, AI 품질 한계가 텍스트 추출 부족에서 올 수 있음
- 현재 프론트는 DB API에 1차 연결됐지만, 상태/저장 로직이 여전히 `App.jsx` 한 파일에 많이 몰려 있음
- 손글씨 데이터는 현재 페이지 단위 JSON 문자열로 저장
- 업로드 이미지 저장은 아직 파일 업로드 API가 없어 완전한 복원까지는 안 됨
  - 현재는 일부 메타데이터만 저장
- PDF 파일 자체 업로드/영속 저장 구조는 아직 없음
- 오늘 결론:
  - 로컬 PostgreSQL 연결 및 기본 CRUD/API 배선은 완료됨
  - 프론트에서 폴더/노트/페이지/채팅 저장이 DB로 1차 연결됨
  - 메인 홈 화면 우측 패널 구조 통일, 사이드바 아이콘화, 노트→폴더 드래그 이동, 폴더 내부 breadcrumb 표시까지 프론트 1차 구현 완료
  - 하지만 이미지/PDF 파일 영속 저장, 폴더 중첩 DB 구조, 프론트 구조 정리는 아직 남아 있음

## 다음 작업 우선순위

### 우선순위 높음
- 실제 PDF 추출 텍스트 품질 점검 및 정제
- `backend/app/services/openai_service.py` 프롬프트 개선
- 캡처 이미지를 실제 이미지 입력으로 보낼지 구조 결정
- 업로드 이미지/PDF 파일 저장 구조 설계
- 프론트의 DB 저장 흐름 안정화 및 리팩터링

### 우선순위 중간
- 우측 메인화면 노트 미리보기 기능 추가
  - 현재 노트 카드는 정적인 미리보기 스타일만 표시
  - 추후 실제 노트/PDF 첫 페이지, 최근 작성 내용, 썸네일 등을 반영하는 미리보기 필요
- 폴더 중첩 지원을 위한 백엔드/DB 구조 확장
  - `folders.parent_id` 같은 자기참조 컬럼 추가 필요
  - `Folder` 모델, `FolderCreate`, `FolderUpdate`, `FolderRead` 스키마에 `parent_id` 반영 필요
  - 폴더를 폴더에 드롭할 때 `PATCH /api/folders/{id}`로 `parent_id` 저장하는 API 흐름 필요
  - 자기 자신 안에 넣기, 자식 폴더 안에 부모 폴더 넣기 같은 순환 구조 방지 로직 필요
  - 현재 프론트는 폴더를 폴더에 드롭하면 안내만 띄우고 실제 저장은 하지 않음
- Alembic 마이그레이션 도입 여부 결정
- 선택 stroke 컨텍스트 메뉴 UX 개선
  - 특히 `스타일 변경`을 prompt에서 패널/툴바 UI로 교체
- AI Assistant mock 흐름을 실제 응답 흐름에 맞게 보정
- 프론트 로직 파일 분리 리팩터링

### 우선순위 낮음
- 좌측 사이드바 접힘/펼침 상태의 아이콘 위치 및 버튼 크기 polish
  - 현재 접힌 상태에서는 아이콘 레일이 보이고, 펼친 상태에서는 아이콘+텍스트 메뉴가 보임
  - 다만 접힘/펼침 전환 시 아이콘의 x/y 위치와 버튼 여백이 완전히 같지는 않아 추후 미세 조정 필요
- 번들 크기 최적화
- README 정리
- 추가 문서 정리

## 주의사항
- 파일 인코딩은 `UTF-8` 유지
- 실제 수정은 프론트는 `src`, 백엔드는 `backend/app` 기준
- `dist`는 빌드 결과물이라 직접 수정 대상 아님
- `backend/.env` 는 절대 커밋/노출 금지
- 현재 저장은 `localStorage` + PostgreSQL 혼합 상태
- 기존 로컬 DB에 대해선 `create_all()`만으로 컬럼 변경이 완전 관리되지 않으므로, 지금은 `database.py`의 최소 schema sync 에 의존 중
