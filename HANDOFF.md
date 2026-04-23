# CampusNotesAI Handoff

## 프로젝트 개요
- 프로젝트명: `CampusNotesAI`
- 목적: 대학생 대상 AI 기반 노트 앱 프로토타입
- 현재 프론트 스택: `Vite + React + pdfjs-dist`
- 현재 백엔드 스택: `FastAPI + OpenAI SDK + SQLAlchemy + PostgreSQL 준비`
- 현재 상태: 프론트는 고도화된 데모 수준, 백엔드는 스캐폴드 생성 완료

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
- `폴더`가 기본 메인 화면
- 폴더 카드와 노트 카드가 보이고, 폴더 없는 노트도 별도 표시
- 폴더/노트 데이터는 아직 mock 데이터 기반

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
- `영역 캡처` 모드에서 자유선택 경로를 그릴 수 있음
- 선택한 영역을 이미지로 생성
- 생성된 캡처는 더 이상 페이지 아래에 썸네일 목록으로 쌓이지 않음
- 현재 동작
  - 캡처 후 AI 채팅 입력창 위에 `전송 대기 첨부 이미지`처럼 붙음
  - 사용자가 텍스트를 같이 적어서 질문과 함께 보낼 수 있음
  - 텍스트 없이 이미지 단독 전송도 가능
  - `제거` 버튼으로 첨부 취소 가능
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
- 현재 프론트에서는 mock 응답 사용
- 질문 입력 가능
- 채팅 말풍선 UI 구현됨
- 캡처 이미지를 채팅 첨부처럼 붙여서 보낼 수 있음
- `질문하기` 시 현재 페이지, 주변 페이지, 메모, 첨부 이미지 설명을 조합한 mock 답변 생성

### 11. 저장 / 복원
- 일부 편집 상태는 `localStorage` 저장
- 현재 저장/복원 대상
  - 타이핑 메모
  - 손글씨 stroke
  - redo stroke 상태
  - 노트별 현재 페이지 인덱스
- 노트/폴더 mock 데이터 자체는 아직 코드 상수 기반

## 현재 프론트 의존성
- `react`
- `react-dom`
- `pdfjs-dist`
- `lucide-react`

## 백엔드 스캐폴드 상태
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
  - `backend/app/services/openai_service.py`
  - `backend/app/core/config.py`
  - `backend/app/db/database.py`
  - `backend/app/db/models.py`
  - `backend/requirements.txt`
  - `backend/.env.example`
  - `backend/README.md`
- 현재 API
  - `GET /health`
  - `POST /api/chat`
- 상태
  - 파이썬 문법 검증 완료
  - 프론트 `handleAsk`는 아직 백엔드 `/api/chat`로 연결하지 않음
  - PostgreSQL 베이스/모델만 초안으로 만들었고, 실제 마이그레이션/테이블 생성은 아직 없음

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
- `backend/app/services/openai_service.py`
  - OpenAI 호출 서비스
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

## 지금 상태에서 특히 중요한 메모
- 타이핑 줄 스냅 / Enter / Backspace 동작은 사용자가 원하는 규칙으로 꽤 세밀하게 맞춘 상태라 건드릴 때 주의
- 노트 상세 화면은 현재 `상단 전체 툴바 + 아래 AI/학습자료` 구조
- 페이지 이동 관련 상세 UI는 현재 숨겨 둔 상태
  - 기능 자체를 완전히 지운 것은 아님
  - 관련 상태/함수 일부가 남아 있을 수 있음
- 선택 stroke 편집은 들어갔지만 `스타일 변경` UI는 아직 prompt 기반이라 추후 개선 필요
- 프론트는 여전히 `App.jsx`에 로직이 많이 몰려 있음

## 다음 작업 우선순위

### 우선순위 높음
- 프론트 `handleAsk`를 실제 FastAPI `/api/chat` 호출로 교체
- 백엔드 `.env`에 OpenAI 키 넣고 실제 응답 테스트
- PostgreSQL 실제 연결
- 노트/폴더/페이지 저장 구조 설계

### 우선순위 중간
- 선택 stroke 컨텍스트 메뉴 UX 개선
  - 특히 `스타일 변경`을 prompt에서 패널/툴바 UI로 교체
- AI Assistant mock 흐름을 실제 응답 흐름에 맞게 보정
- 프론트 로직 파일 분리 리팩터링

### 우선순위 낮음
- 번들 크기 최적화
- README 정리
- 추가 문서 정리

## 주의사항
- 파일 인코딩은 `UTF-8` 유지
- 실제 수정은 프론트는 `src`, 백엔드는 `backend/app` 기준
- `dist`는 빌드 결과물이라 직접 수정 대상 아님
- 현재 저장은 `localStorage` 기반이라 이 브라우저 / 이 기기에서만 유지
