# CampusNotesAI

대학생 대상 AI 노트 앱 캡스톤 MVP입니다.  
현재는 `React + Vite + pdfjs-dist` 기반의 프론트엔드 데모이며, 백엔드와 실제 AI API 없이 UI와 학습 흐름을 중심으로 구현되어 있습니다.

## 주요 기능
- 메인 홈 화면
  - 폴더 / 노트 목록
  - 노트 작성
  - 폴더 생성
  - 노트 / 폴더 우클릭 메뉴
- 노트 상세 화면
  - PDF 렌더링
  - 손글씨 필기
  - 타이핑 메모
  - 지우개
  - 영역 캡처
  - AI Assistant 패널
- 문서 UX
  - 페이지 썸네일 레일
  - 현재 페이지 / 총 페이지 표시
  - 페이지 점프
  - 자동 저장 상태 표시

## 현재 데모 범위
- 백엔드 없음
- 실제 AI 응답 없음
- 일부 상태는 브라우저 `localStorage`에 저장
- 기본 PDF는 `public/4_Maximum likelihood learning.pdf`

## 기술 스택
- React
- Vite
- pdfjs-dist

## 실행 방법
```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 보통 아래 주소로 접속합니다.

```text
http://localhost:5173
```

## 빌드
```powershell
npm.cmd run build
```

## 프로젝트 구조
```text
src/
  App.jsx        # 메인 앱 구조와 기능 로직
  styles.css     # 전체 UI 스타일
  main.jsx       # React 진입점
public/
  4_Maximum likelihood learning.pdf   # 기본 데모 PDF
HANDOFF.md       # 현재 작업 상태 / 인수인계 문서
package.json     # 의존성 / 스크립트
```

## 저장 방식
- 현재는 일부 상태를 `localStorage`에 저장합니다.
- 이 저장은 같은 브라우저 / 같은 기기에서만 유지됩니다.
- 실제 서비스용 저장은 나중에 DB 연동이 필요합니다.

## 참고
- 현재 프로젝트의 세부 구현 상태와 다음 작업 계획은 [HANDOFF.md](/C:/Users/키다리아저씨/Desktop/C_Workspace/Capstone/HANDOFF.md)에 정리되어 있습니다.
