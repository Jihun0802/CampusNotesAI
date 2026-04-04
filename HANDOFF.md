# CampusNotesAI Handoff

## 프로젝트 개요
- 프로젝트명: `CampusNotesAI`
- 목적: 대학생 대상 AI 기반 노트 앱 캡스톤 MVP
- 현재 스택: `Vite + React`
- 백엔드: 없음
- AI 연동: 없음
- 현재는 프론트엔드 데모 중심의 목업 상태

## 현재 구현 상태
- 3패널 구조 기반 UI 구현
- 가운데 메인 영역에 PDF 뷰어, 페이지 문맥 카드, 노트 영역 배치
- 왼쪽 과목 목록 사이드바 구현
- 오른쪽 AI Assistant 사이드바 구현
- 좌우 사이드바는 각각 독립적으로 접기/펼치기 가능
- 좌우 사이드바는 드래그로 너비 조절 가능
- 이미지 업로드 가능
- PDF 업로드 가능
- 기본 PDF 파일 연결 완료
- 현재 기본 PDF: `public/4_Maximum likelihood learning.pdf`
- AI 답변은 실제 API 호출이 아닌 mock 응답

## 현재 파일 구조 핵심
- `src/App.jsx`
  메인 화면 구조, 상태, 사이드바 토글, 리사이즈, PDF/이미지 업로드, mock AI 로직
- `src/main.jsx`
  React 진입점
- `src/styles.css`
  전체 레이아웃 및 UI 스타일
- `public/4_Maximum likelihood learning.pdf`
  현재 데모용 기본 PDF
- `index.html`
  앱 HTML 진입점
- `package.json`
  실행/빌드 스크립트 및 의존성

## 실행 방법
```powershell
npm.cmd install
npm.cmd run dev
```

## 빌드 방법
```powershell
npm.cmd run build
```

## Git 관련 메모
- `node_modules`와 `dist`는 `.gitignore`에 포함됨
- PDF 원본은 `public` 폴더 안 파일을 사용함
- `dist` 안 PDF는 build 결과물 복사본이므로 직접 수정 대상이 아님

## 주의사항
- `src`를 수정해야 실제 원본 코드가 바뀜
- `dist`는 빌드 결과물이므로 직접 수정하지 않는 것이 맞음
- 한글 문자열이 깨지는 문제가 이전에 있었기 때문에, 다른 환경에서 작업할 때 파일 인코딩은 `UTF-8`로 유지하는 것이 중요함

## 다음 작업 추천
- 실제 PDF 페이지 텍스트 추출과 현재 페이지 연동
- mock AI 응답을 더 발표용 시나리오에 맞게 개선
- 이미지 업로드 결과를 노트 문맥과 더 자연스럽게 결합
- UI 디테일 polish
- README 정리

## 새 컴퓨터에서 Codex에게 바로 넘길 프롬프트 예시
```text
프로젝트 루트의 HANDOFF.md를 먼저 읽고, 현재 상태를 이해한 뒤 그 기준으로 이어서 작업해줘.
이 프로젝트는 대학생용 AI 노트앱 캡스톤 MVP이고, 현재는 React 프론트엔드 데모만 구현된 상태야.
```
