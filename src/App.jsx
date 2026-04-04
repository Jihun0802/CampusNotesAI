import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PDF_PATH = "/4_Maximum%20likelihood%20learning.pdf";
const COLLAPSED_RAIL = 26;
const HANDLE_WIDTH = 8;
const LEFT_MIN = 220;
const LEFT_MAX = 300;
const RIGHT_MIN = 320;

const SUBJECTS = [
  {
    id: "hci",
    name: "HCI 설계",
    code: "HCI301",
    instructor: "김교수",
    accent: "accent-coral",
    pages: [
      {
        title: "사용자 중심 설계",
        text:
          "사용자 중심 설계는 사용자의 목표, 불편함, 실제 학습 맥락을 이해하는 것에서 시작합니다. 설계 과정은 조사, 프로토타이핑, 테스트, 수정의 순환 구조를 가집니다.",
        bullets: [
          "기능보다 먼저 학생의 실제 학습 흐름을 파악해야 합니다.",
          "초기 단계에서 간단한 프로토타입으로 빠르게 피드백을 받아야 합니다.",
          "반복 개선은 사용성 문제를 줄여 줍니다.",
        ],
      },
      {
        title: "휴리스틱 평가",
        text:
          "휴리스틱 평가는 시스템 상태 가시성, 일관성, 사용자 제어, 오류 예방과 같은 원칙을 기준으로 인터페이스를 점검하는 방법입니다.",
        bullets: [
          "가시성은 사용자가 현재 상태를 이해하게 돕습니다.",
          "일관성은 인지 부담을 줄입니다.",
          "오류 복구보다 오류 예방이 우선입니다.",
        ],
      },
      {
        title: "생각 말하기 테스트",
        text:
          "생각 말하기 테스트는 사용자가 과업을 수행하면서 자신의 생각을 말하도록 유도하는 방식입니다. 이를 통해 혼란, 숨은 가정, 탐색 문제를 발견할 수 있습니다.",
        bullets: [
          "학생에게 익숙한 실제 과업으로 테스트해야 합니다.",
          "멈칫하는 지점을 집중해서 관찰해야 합니다.",
          "관찰 결과를 구체적인 UI 개선으로 연결해야 합니다.",
        ],
      },
    ],
  },
  {
    id: "ml",
    name: "기계학습 개론",
    code: "CSE340",
    instructor: "이교수",
    accent: "accent-blue",
    pages: [
      {
        title: "최대우도 추정",
        text:
          "최대우도 추정은 관측된 데이터가 주어졌을 때, 그 데이터를 가장 그럴듯하게 생성할 수 있는 파라미터를 찾는 방법입니다.",
        bullets: [
          "우도는 파라미터가 주어졌을 때 데이터가 관측될 가능성을 의미합니다.",
          "로그 우도를 사용하면 계산이 단순해집니다.",
          "학습 목표는 우도를 최대화하는 파라미터를 찾는 것입니다.",
        ],
      },
      {
        title: "손실 함수와 최적화",
        text:
          "최대우도 기반 학습은 종종 손실 함수를 최소화하는 문제로 바뀝니다. 대표적으로 음의 로그우도를 최소화하는 방식이 사용됩니다.",
        bullets: [
          "손실 함수는 모델이 얼마나 잘못 예측하는지 수치화합니다.",
          "경사하강법은 손실을 줄이는 방향으로 파라미터를 갱신합니다.",
          "학습률은 최적화 안정성에 큰 영향을 줍니다.",
        ],
      },
      {
        title: "확률적 해석",
        text:
          "확률 모델은 예측값뿐 아니라 불확실성까지 다룰 수 있습니다. 이는 실제 데이터가 잡음을 포함할 때 특히 유용합니다.",
        bullets: [
          "확률 분포 가정은 모델 해석의 기반이 됩니다.",
          "데이터 특성에 맞는 분포 선택이 중요합니다.",
          "불확실성 정보는 의사결정에 도움을 줍니다.",
        ],
      },
    ],
  },
  {
    id: "db",
    name: "데이터베이스",
    code: "CSE220",
    instructor: "박교수",
    accent: "accent-green",
    pages: [
      {
        title: "관계형 모델",
        text:
          "관계형 모델은 데이터를 행과 열로 이루어진 테이블로 표현합니다. 키는 개체를 식별하고, 테이블 간 관계는 구조를 유지하는 역할을 합니다.",
        bullets: [
          "기본 키는 각 행을 고유하게 식별합니다.",
          "외래 키는 테이블 간 관계를 연결합니다.",
          "스키마는 허용되는 구조를 정의합니다.",
        ],
      },
      {
        title: "정규화",
        text:
          "정규화는 중복과 갱신 이상을 줄이기 위해 테이블을 더 잘 구조화된 관계로 분해하는 과정입니다. 핵심 목적은 데이터 무결성과 유지보수성 확보입니다.",
        bullets: [
          "제1정규형은 반복 그룹을 제거합니다.",
          "상위 정규형은 함수 종속 문제를 줄입니다.",
          "조회 성능과의 절충이 필요할 수 있습니다.",
        ],
      },
      {
        title: "트랜잭션과 ACID",
        text:
          "트랜잭션은 여러 데이터베이스 연산을 하나의 신뢰 가능한 작업 단위로 묶습니다. ACID는 원자성, 일관성, 고립성, 지속성을 의미합니다.",
        bullets: [
          "원자성은 모두 실행되거나 모두 취소됨을 뜻합니다.",
          "고립성은 트랜잭션 간 간섭을 막아 줍니다.",
          "지속성은 커밋된 결과가 보존됨을 의미합니다.",
        ],
      },
    ],
  },
];

const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    role: "assistant",
    text:
      "안녕하세요. 현재 보고 있는 PDF 페이지를 기준으로 질문하면 현재 페이지, 주변 페이지, 메모, 이미지 내용을 조합해서 답변합니다.",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildMockAnswer(question, currentPage, nearbyPages, noteText, latestImage) {
  const nearbySummary = nearbyPages.map((page) => page.title).join(", ");
  const noteSummary = noteText.trim()
    ? `사용자 메모 요약: ${noteText.trim().slice(0, 120)}.`
    : "아직 작성된 메모가 없어 PDF 내용 중심으로 답변했습니다.";
  const imageSummary = latestImage
    ? `첨부 이미지 분석 결과는 "${latestImage.analysis}" 입니다.`
    : "현재 페이지에는 첨부된 판서 이미지가 없습니다.";

  return [
    `질문 "${question}"에 대해 현재 페이지의 핵심은 다음과 같습니다. ${currentPage.text}`,
    `주변 페이지 문맥으로는 ${nearbySummary} 내용이 함께 참고됩니다.`,
    noteSummary,
    imageSummary,
    `발표용 요약 한 줄: ${currentPage.bullets[0]}`,
  ].join(" ");
}

function makeImageAnalysis(fileName, currentPage) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  return `${currentPage.title}와 연결된 판서 이미지로 보이며, ${stem} 키워드가 강조된 자료입니다.`;
}

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("ml");
  const [pageBySubject, setPageBySubject] = useState(
    SUBJECTS.reduce((acc, subject) => {
      acc[subject.id] = 0;
      return acc;
    }, {}),
  );
  const [notesByPage, setNotesByPage] = useState({});
  const [chatBySubject, setChatBySubject] = useState(
    SUBJECTS.reduce((acc, subject) => {
      acc[subject.id] = INITIAL_MESSAGES;
      return acc;
    }, {}),
  );
  const [uploadsByPage, setUploadsByPage] = useState({});
  const [pdfBySubject, setPdfBySubject] = useState({
    ml: {
      name: "4_Maximum likelihood learning.pdf",
      previewUrl: DEFAULT_PDF_PATH,
      isBundled: true,
    },
  });
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(360);
  const [dragging, setDragging] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const uploadUrlsRef = useRef([]);

  const selectedSubject = SUBJECTS.find((subject) => subject.id === selectedSubjectId);
  const currentPageIndex = pageBySubject[selectedSubjectId];
  const currentPage = selectedSubject.pages[currentPageIndex];
  const pageKey = `${selectedSubjectId}:${currentPageIndex}`;
  const currentNote = notesByPage[pageKey] ?? "";
  const currentUploads = uploadsByPage[pageKey] ?? [];
  const currentPdf = pdfBySubject[selectedSubjectId] ?? null;
  const messages = chatBySubject[selectedSubjectId] ?? INITIAL_MESSAGES;

  const nearbyPages = useMemo(() => {
    return selectedSubject.pages.filter((_, index) => Math.abs(index - currentPageIndex) <= 1);
  }, [currentPageIndex, selectedSubject.pages]);

  useEffect(() => {
    return () => {
      uploadUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      if (dragging === "left") {
        setLeftWidth(clamp(event.clientX - 18, LEFT_MIN, LEFT_MAX));
        return;
      }

      const maxRight = Math.max(RIGHT_MIN, Math.floor(window.innerWidth * 0.6));
      setRightWidth(clamp(window.innerWidth - event.clientX - 18, RIGHT_MIN, maxRight));
    };

    const handleMouseUp = () => {
      setDragging(null);
      document.body.classList.remove("is-resizing");
    };

    document.body.classList.add("is-resizing");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handlePageChange = (direction) => {
    setPageBySubject((current) => {
      const nextPageIndex = current[selectedSubjectId] + direction;
      if (nextPageIndex < 0 || nextPageIndex >= selectedSubject.pages.length) {
        return current;
      }

      return {
        ...current,
        [selectedSubjectId]: nextPageIndex,
      };
    });
  };

  const handleNoteChange = (event) => {
    const value = event.target.value;
    setNotesByPage((current) => ({
      ...current,
      [pageKey]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    uploadUrlsRef.current.push(previewUrl);
    const upload = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      previewUrl,
      analysis: makeImageAnalysis(file.name, currentPage),
    };

    setUploadsByPage((current) => ({
      ...current,
      [pageKey]: [...(current[pageKey] ?? []), upload],
    }));

    event.target.value = "";
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    uploadUrlsRef.current.push(previewUrl);

    setPdfBySubject((current) => ({
      ...current,
      [selectedSubjectId]: {
        name: file.name,
        previewUrl,
        isBundled: false,
      },
    }));

    event.target.value = "";
  };

  const handleAsk = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isThinking) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedQuestion,
    };

    setChatBySubject((current) => ({
      ...current,
      [selectedSubjectId]: [...(current[selectedSubjectId] ?? []), userMessage],
    }));
    setQuestion("");
    setIsThinking(true);

    window.setTimeout(() => {
      const latestImage = currentUploads[currentUploads.length - 1];
      const answer = buildMockAnswer(
        trimmedQuestion,
        currentPage,
        nearbyPages,
        currentNote,
        latestImage,
      );

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: answer,
      };

      setChatBySubject((current) => ({
        ...current,
        [selectedSubjectId]: [...(current[selectedSubjectId] ?? []), assistantMessage],
      }));
      setIsThinking(false);
    }, 700);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  };

  const gridTemplateColumns = [
    leftOpen ? `${leftWidth}px` : `${COLLAPSED_RAIL}px`,
    leftOpen ? `${HANDLE_WIDTH}px` : "0px",
    "minmax(0, 1fr)",
    rightOpen ? `${HANDLE_WIDTH}px` : "0px",
    rightOpen ? `${rightWidth}px` : `${COLLAPSED_RAIL}px`,
  ].join(" ");

  return (
    <main className="app-shell" style={{ gridTemplateColumns }}>
      <aside className={`sidebar-shell ${leftOpen ? "" : "is-collapsed"}`}>
        {leftOpen ? (
          <div className="panel sidebar">
            <div className="panel-header panel-header-row">
              <div>
                <p className="eyebrow">Campus Notes AI</p>
                <h1>과목 목록</h1>
                <p className="panel-copy">
                  과목별로 현재 페이지, 메모, 첨부 이미지, 채팅 기록이 분리되어 관리됩니다.
                </p>
              </div>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setLeftOpen(false)}
                aria-label="왼쪽 사이드바 접기"
              >
                ◀
              </button>
            </div>

            <div className="subject-list">
              {SUBJECTS.map((subject) => {
                const active = subject.id === selectedSubjectId;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    className={`subject-card ${active ? "is-active" : ""}`}
                    onClick={() => setSelectedSubjectId(subject.id)}
                  >
                    <span className={`subject-badge ${subject.accent}`}>{subject.code}</span>
                    <strong>{subject.name}</strong>
                    <span>{subject.instructor}</span>
                  </button>
                );
              })}
            </div>

            <div className="smart-context-card">
              <h2>스마트 컨텍스트</h2>
              <ul>
                <li>기본 문맥: 현재 PDF 페이지</li>
                <li>보조 문맥: 앞뒤 페이지</li>
                <li>추가 문맥: 사용자 메모</li>
                <li>추가 문맥: 판서 이미지 분석</li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="collapsed-toggle"
            onClick={() => setLeftOpen(true)}
            aria-label="왼쪽 사이드바 열기"
          >
            과목
          </button>
        )}
      </aside>

      <div
        className={`resize-handle ${leftOpen ? "" : "is-hidden"}`}
        onMouseDown={() => leftOpen && setDragging("left")}
        role="separator"
        aria-orientation="vertical"
        aria-label="왼쪽 사이드바 크기 조절"
      />

      <section className="panel workspace">
        <div className="workspace-topbar">
          <div>
            <p className="eyebrow">학습 워크스페이스</p>
            <h2>{selectedSubject.name}</h2>
          </div>

          <div className="page-controls">
            <button type="button" onClick={() => handlePageChange(-1)}>
              이전
            </button>
            <span>
              페이지 {currentPageIndex + 1} / {selectedSubject.pages.length}
            </span>
            <button type="button" onClick={() => handlePageChange(1)}>
              다음
            </button>
          </div>
        </div>

        <div className="pdf-viewer">
          <div className="pdf-toolbar">
            <div className="pdf-toolbar-copy">
              <span className="toolbar-title">PDF 뷰어</span>
              <span className="muted">
                프로젝트 폴더에 있는 PDF를 기본으로 연결했고, 다른 PDF도 직접 업로드할 수 있습니다.
              </span>
            </div>
            <div className="upload-actions">
              <button type="button" onClick={() => pdfInputRef.current?.click()}>
                PDF 업로드
              </button>
              <input
                ref={pdfInputRef}
                className="hidden-input"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
              />
            </div>
          </div>

          {currentPdf ? (
            <div className="pdf-preview-wrap">
              <div className="pdf-file-meta">
                <strong>{currentPdf.name}</strong>
                <span>
                  {currentPdf.isBundled
                    ? "프로젝트에 포함된 기본 PDF"
                    : `${selectedSubject.name} 과목에 업로드된 PDF`}
                </span>
              </div>
              <iframe className="pdf-frame" src={currentPdf.previewUrl} title={currentPdf.name} />
            </div>
          ) : (
            <div className="pdf-empty">
              <strong>아직 PDF가 연결되지 않았습니다.</strong>
              <p>같은 프로젝트 폴더에 PDF를 두거나, 위의 PDF 업로드 버튼으로 바로 연결할 수 있습니다.</p>
            </div>
          )}

          <div className="pdf-sheet">
            <div className="pdf-meta">현재 페이지 기반 AI 문맥</div>
            <h3>{currentPage.title}</h3>
            <p>{currentPage.text}</p>
            <ul>
              {currentPage.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <div className="context-strip">
            {nearbyPages.map((page, index) => (
              <div key={`${page.title}-${index}`} className="context-pill">
                <strong>{page.title}</strong>
                <span>{page.text.slice(0, 72)}...</span>
              </div>
            ))}
          </div>
        </div>

        <div className="notes-panel">
          <div className="notes-header">
            <div>
              <h3>노트 영역</h3>
              <p>요약 메모를 작성하고 판서 사진을 첨부하면 AI 답변 문맥이 풍부해집니다.</p>
            </div>
            <div className="upload-actions">
              <button type="button" onClick={() => galleryInputRef.current?.click()}>
                이미지 업로드
              </button>
              <button type="button" onClick={() => cameraInputRef.current?.click()}>
                카메라 열기
              </button>
              <input
                ref={galleryInputRef}
                className="hidden-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <input
                ref={cameraInputRef}
                className="hidden-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <textarea
            className="note-editor"
            value={currentNote}
            onChange={handleNoteChange}
            placeholder="현재 페이지에 대한 핵심 내용을 메모해보세요..."
          />

          <div className="upload-grid">
            {currentUploads.length === 0 ? (
              <div className="upload-empty">
                아직 첨부된 판서 이미지가 없습니다. 업로드하면 우측 AI 답변에 반영됩니다.
              </div>
            ) : (
              currentUploads.map((upload) => (
                <article key={upload.id} className="upload-card">
                  <img src={upload.previewUrl} alt={upload.name} />
                  <div>
                    <strong>{upload.name}</strong>
                    <p>{upload.analysis}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <div
        className={`resize-handle ${rightOpen ? "" : "is-hidden"}`}
        onMouseDown={() => rightOpen && setDragging("right")}
        role="separator"
        aria-orientation="vertical"
        aria-label="오른쪽 사이드바 크기 조절"
      />

      <aside className={`sidebar-shell ${rightOpen ? "" : "is-collapsed"}`}>
        {rightOpen ? (
          <div className="panel chat-panel">
            <div className="panel-header panel-header-row">
              <div>
                <p className="eyebrow">AI Assistant</p>
                <h2>페이지 기반 질의응답</h2>
                <p className="panel-copy">
                  현재 페이지, 인접 페이지, 메모, 이미지 정보를 조합해 임시 응답을 생성합니다.
                </p>
              </div>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setRightOpen(false)}
                aria-label="오른쪽 사이드바 접기"
              >
                ▶
              </button>
            </div>

            <div className="chat-meta">
              <span>{selectedSubject.code}</span>
              <span>{currentPage.title}</span>
            </div>

            <div className="chat-thread">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
                >
                  <span className="bubble-role">{message.role === "assistant" ? "AI" : "나"}</span>
                  <p>{message.text}</p>
                </div>
              ))}

              {isThinking ? (
                <div className="chat-bubble assistant">
                  <span className="bubble-role">AI</span>
                  <p>현재 페이지와 메모, 이미지 문맥을 바탕으로 답변을 정리하는 중입니다...</p>
                </div>
              ) : null}
            </div>

            <div className="chat-composer">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="현재 페이지 내용에 대해 질문해보세요..."
              />
              <button type="button" onClick={handleAsk}>
                질문하기
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="collapsed-toggle"
            onClick={() => setRightOpen(true)}
            aria-label="오른쪽 사이드바 열기"
          >
            AI
          </button>
        )}
      </aside>
    </main>
  );
}
