import React, { useEffect, useMemo, useRef, useState } from "react";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DEFAULT_PDF_PATH = "/4_Maximum%20likelihood%20learning.pdf";
const COLLAPSED_RAIL = 30;
const HANDLE_WIDTH = 8;
const RIGHT_MIN = 320;
const NOTE_AI_MIN = 260;
const NOTE_AI_COLLAPSE_THRESHOLD = 240;
const TEXT_LAYER_PADDING = {
  top: 56,
  right: 64,
  bottom: 80,
  left: 64,
};
const DEFAULT_TEXT_BOX_WIDTH_RATIO = 0.72;
const MIN_TEXT_BOX_WIDTH_RATIO = 0.18;
const MIN_TEXT_BOX_HEIGHT_RATIO = 0.05;

const INITIAL_FOLDERS = [
  { id: "freshman-1", name: "1학년 1학기" },
  { id: "freshman-2", name: "1학년 2학기" },
  { id: "toeic", name: "토익 공부" },
];

const INITIAL_NOTES = [
  {
    id: "hci",
    name: "HCI 설계",
    code: "HCI301",
    instructor: "김교수",
    accent: "accent-coral",
    folderId: "freshman-1",
    favorite: true,
    deleted: false,
    updatedAt: "오늘 수정됨",
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
    folderId: "freshman-2",
    favorite: true,
    deleted: false,
    updatedAt: "3시간 전 수정됨",
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
    folderId: null,
    favorite: false,
    deleted: false,
    updatedAt: "어제 수정됨",
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
  {
    id: "toeic-reading",
    name: "토익 리딩",
    code: "TOEIC",
    instructor: "자율 학습",
    accent: "accent-gold",
    folderId: "toeic",
    favorite: false,
    deleted: false,
    updatedAt: "2일 전 수정됨",
    pages: [
      {
        title: "문법 포인트 정리",
        text:
          "토익 리딩에서는 품사 구분, 시제 일치, 전치사 사용 같은 빈출 문법 포인트를 빠르게 식별하는 능력이 중요합니다.",
        bullets: [
          "선택지의 품사를 먼저 확인하면 오답을 빠르게 줄일 수 있습니다.",
          "문장 구조를 보고 필요한 역할을 판단해야 합니다.",
          "자주 틀리는 표현은 오답 노트와 함께 반복 학습이 효과적입니다.",
        ],
      },
      {
        title: "지문 독해 전략",
        text:
          "긴 지문은 문단별 핵심 문장을 먼저 파악하고, 문제에서 묻는 범위를 좁혀가며 읽는 방식이 시간 관리에 도움이 됩니다.",
        bullets: [
          "문제 유형에 따라 세부 정보와 추론 질문을 구분해야 합니다.",
          "고유명사와 숫자는 빠르게 표시해두면 찾기 쉽습니다.",
          "시간 배분을 위해 모르는 문제는 체크 후 넘어가는 습관이 필요합니다.",
        ],
      },
    ],
  },
  {
    id: "old-report",
    name: "캡스톤 초안 메모",
    code: "ARCHIVE",
    instructor: "보관용",
    accent: "accent-neutral",
    folderId: null,
    favorite: false,
    deleted: true,
    updatedAt: "지난주 삭제됨",
    pages: [
      {
        title: "초기 기능 스케치",
        text:
          "초기 버전에서는 PDF 요약, 수업 사진 업로드, 발표용 질문 응답 기능을 가장 먼저 넣는 방향으로 스케치를 진행했습니다.",
        bullets: [
          "핵심 사용자 흐름은 노트 진입 후 바로 AI 질문으로 이어지는 구조였습니다.",
          "폴더 분류는 후순위 기능으로 간주했습니다.",
          "현재 버전에서는 메인 홈 구조를 더 먼저 정리할 필요가 있습니다.",
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

const NAV_ITEMS = [
  { id: "all", label: "모든 노트" },
  { id: "favorites", label: "즐겨찾기" },
  { id: "trash", label: "휴지통" },
  { id: "folders", label: "폴더" },
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
    ? `첨부 이미지 분석 결과는 \"${latestImage.analysis}\" 입니다.`
    : "현재 페이지에는 첨부된 판서 이미지가 없습니다.";

  return [
    `질문 \"${question}\"에 대해 현재 페이지의 핵심은 다음과 같습니다. ${currentPage.text}`,
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

function getPreviewVariant(note) {
  if (note.code === "TOEIC") {
    return "preview-handwriting";
  }
  if (note.code === "ARCHIVE") {
    return "preview-document";
  }
  if (note.accent === "accent-blue") {
    return "preview-slide";
  }
  return "preview-cover";
}

function formatPreviewTitle(note) {
  return note.pages[0]?.title ?? note.name;
}

function buildStrokePath(points, width, height) {
  if (points.length === 0) {
    return "";
  }

  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x * width} ${point.y * height}`,
    )
    .join(" ");
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = clamp(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy),
    0,
    1,
  );
  const projectionX = start.x + t * dx;
  const projectionY = start.y + t * dy;
  return Math.hypot(point.x - projectionX, point.y - projectionY);
}

function strokeTouchesPoint(stroke, point, threshold = 0.018) {
  if (stroke.points.length < 2) {
    return false;
  }

  for (let index = 1; index < stroke.points.length; index += 1) {
    if (distanceToSegment(point, stroke.points[index - 1], stroke.points[index]) <= threshold) {
      return true;
    }
  }

  return false;
}

function interpolatePoints(start, end, maxStep = 0.008) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= maxStep) {
    return [end];
  }

  const steps = Math.ceil(distance / maxStep);
  return Array.from({ length: steps }, (_, index) => {
    const ratio = (index + 1) / steps;
    return {
      x: start.x + dx * ratio,
      y: start.y + dy * ratio,
    };
  });
}

function buildSelectionPath(points, width, height) {
  if (points.length === 0) {
    return "";
  }

  const commands = points.map((point, index) => {
    const x = point.x * width;
    const y = point.y * height;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });

  return `${commands.join(" ")} Z`;
}

function cloneTextBoxes(textBoxes = []) {
  return textBoxes.map((textBox) => ({ ...textBox }));
}

function sortTextBoxes(textBoxes = []) {
  return [...textBoxes].sort((left, right) => {
    if (left.y === right.y) {
      return left.x - right.x;
    }
    return left.y - right.y;
  });
}

function buildNoteTextFromTextBoxes(textBoxes = []) {
  return sortTextBoxes(textBoxes)
    .map((textBox) => textBox.text.trim())
    .filter(Boolean)
    .join("\n");
}

function migrateNotesToTextBoxes(savedNotes = {}) {
  return Object.fromEntries(
    Object.entries(savedNotes)
      .filter(([, text]) => typeof text === "string" && text.trim())
      .map(([pageKey, text]) => [
        pageKey,
        [
          {
            id: `migrated-${pageKey}`,
            x: 0.084,
            y: 0.057,
            width: DEFAULT_TEXT_BOX_WIDTH_RATIO,
            text,
          },
        ],
      ]),
  );
}

function buildNotesFromTextBoxes(textBoxesByPage = {}) {
  return Object.fromEntries(
    Object.entries(textBoxesByPage)
      .map(([pageKey, textBoxes]) => [pageKey, buildNoteTextFromTextBoxes(textBoxes)])
      .filter(([, text]) => text),
  );
}

function measureTextBoxHeight(textarea, nextValue, maxHeight) {
  const computedStyle = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const mirroredProperties = [
    "boxSizing",
    "width",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "textTransform",
    "textAlign",
    "whiteSpace",
    "wordBreak",
    "overflowWrap",
  ];

  mirroredProperties.forEach((property) => {
    mirror.style[property] = computedStyle[property];
  });

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.left = "-9999px";
  mirror.style.top = "0";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.height = "auto";
  mirror.style.minHeight = "0";
  mirror.style.maxHeight = "none";
  mirror.style.overflow = "visible";

  mirror.textContent = nextValue || ".";
  document.body.appendChild(mirror);
  const measuredHeight = Math.min(mirror.scrollHeight, maxHeight);

  document.body.removeChild(mirror);
  return measuredHeight;
}

function wouldTextBoxOverflow(textarea, nextValue, maxHeight) {
  const computedStyle = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const mirroredProperties = [
    "boxSizing",
    "width",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "textTransform",
    "textAlign",
    "whiteSpace",
    "wordBreak",
    "overflowWrap",
  ];

  mirroredProperties.forEach((property) => {
    mirror.style[property] = computedStyle[property];
  });

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.left = "-9999px";
  mirror.style.top = "0";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.height = "auto";
  mirror.style.minHeight = "0";
  mirror.style.maxHeight = "none";
  mirror.style.overflow = "visible";

  mirror.textContent = nextValue || ".";
  document.body.appendChild(mirror);
  const wouldOverflow = mirror.scrollHeight > maxHeight;
  document.body.removeChild(mirror);
  return wouldOverflow;
}

function getTextareaMetrics(textarea) {
  const computedStyle = window.getComputedStyle(textarea);
  const lineHeight =
    Number.parseFloat(computedStyle.lineHeight) || Number.parseFloat(computedStyle.fontSize) * 1.4;
  const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;
  const availableHeight = Math.max(textarea.clientHeight - paddingTop - paddingBottom, lineHeight);
  const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));

  return {
    lineHeight,
    paddingTop,
    maxLines,
  };
}

function getLineIndexFromCaret(value, caretIndex) {
  return value.slice(0, caretIndex).split("\n").length - 1;
}

function getLineStartIndex(value, lineIndex) {
  if (lineIndex <= 0) {
    return 0;
  }

  let currentLine = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\n") {
      currentLine += 1;
      if (currentLine === lineIndex) {
        return index + 1;
      }
    }
  }

  return value.length;
}

function ensureLineExists(value, lineIndex) {
  const currentLineCount = value === "" ? 1 : value.split("\n").length;
  if (lineIndex < currentLineCount) {
    return value;
  }

  return `${value}${"\n".repeat(lineIndex - currentLineCount + 1)}`;
}

export default function App() {
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [screen, setScreen] = useState("home");
  const [selectedNav, setSelectedNav] = useState("folders");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState("ml");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageByNote, setPageByNote] = useState(
    INITIAL_NOTES.reduce((acc, note) => {
      acc[note.id] = 0;
      return acc;
    }, {}),
  );
  const [notesByPage, setNotesByPage] = useState({});
  const [textBoxesByPage, setTextBoxesByPage] = useState({});
  const [chatByNote, setChatByNote] = useState(
    INITIAL_NOTES.reduce((acc, note) => {
      acc[note.id] = INITIAL_MESSAGES;
      return acc;
    }, {}),
  );
  const [uploadsByPage, setUploadsByPage] = useState({});
  const [strokesByPage, setStrokesByPage] = useState({});
  const [redoStrokesByPage, setRedoStrokesByPage] = useState({});
  const [capturesByPage, setCapturesByPage] = useState({});
  const [pdfByNote, setPdfByNote] = useState({
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
  const [rightWidth, setRightWidth] = useState(320);
  const [annotationMode, setAnnotationMode] = useState("draw");
  const [captureSelection, setCaptureSelection] = useState(null);
  const [pageZoom, setPageZoom] = useState(1);
  const [dragging, setDragging] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const typingTextareaRefs = useRef({});
  const textBoxRefs = useRef({});
  const uploadUrlsRef = useRef([]);
  const annotationStageRef = useRef(null);
  const annotationScrollRef = useRef(null);
  const pdfCanvasRefs = useRef({});
  const pageSurfaceRefs = useRef({});
  const pendingTextFocusRef = useRef(null);
  const activeStrokeIdRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isCapturingRef = useRef(false);
  const liveStrokePointsRef = useRef([]);
  const drawSyncFrameRef = useRef(null);
  const notesByPageRef = useRef({});
  const textBoxesByPageRef = useRef({});
  const strokesByPageRef = useRef({});
  const undoHistoryRef = useRef([]);
  const redoHistoryRef = useRef([]);
  const isApplyingHistoryRef = useRef(false);
  const [pdfPageSizes, setPdfPageSizes] = useState([]);
  const [pdfRenderError, setPdfRenderError] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [activeTextBox, setActiveTextBox] = useState(null);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? INITIAL_NOTES[0];
  const currentPageIndex = pageByNote[selectedNote.id] ?? 0;
  const safeContentPageIndex = Math.min(currentPageIndex, selectedNote.pages.length - 1);
  const currentPage = selectedNote.pages[safeContentPageIndex];
  const pageKey = `${selectedNote.id}:${currentPageIndex}`;
  const currentNote = notesByPage[pageKey] ?? "";
  const currentCaptures = capturesByPage[pageKey] ?? [];
  const currentUploads = uploadsByPage[pageKey] ?? [];
  const currentPdf = pdfByNote[selectedNote.id] ?? null;
  const messages = chatByNote[selectedNote.id] ?? INITIAL_MESSAGES;
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null;
  const renderedPageCount = pdfPageCount || selectedNote.pages.length;

  const nearbyPages = useMemo(() => {
    return selectedNote.pages.filter((_, index) => Math.abs(index - safeContentPageIndex) <= 1);
  }, [safeContentPageIndex, selectedNote.pages]);

  const noteCounts = useMemo(
    () => ({
      all: notes.filter((note) => !note.deleted).length,
      favorites: notes.filter((note) => note.favorite && !note.deleted).length,
      trash: notes.filter((note) => note.deleted).length,
      folders: folders.filter((folder) => !folder.deleted).length,
    }),
    [folders, notes],
  );

  const notesInFolders = useMemo(() => notes.filter((note) => !note.deleted && note.folderId), [notes]);
  const ungroupedNotes = useMemo(() => notes.filter((note) => !note.deleted && !note.folderId), [notes]);
  const deletedFolders = useMemo(() => folders.filter((folder) => folder.deleted), [folders]);

  const filteredNotes = useMemo(() => {
    if (selectedNav === "all") {
      return notes.filter((note) => !note.deleted);
    }
    if (selectedNav === "favorites") {
      return notes.filter((note) => note.favorite && !note.deleted);
    }
    if (selectedNav === "trash") {
      return notes.filter((note) => note.deleted);
    }
    if (selectedFolderId) {
      return notes.filter((note) => note.folderId === selectedFolderId && !note.deleted);
    }
    return [];
  }, [notes, selectedFolderId, selectedNav]);

  const visibleHomeNotes = useMemo(() => {
    const baseNotes = selectedNav === "folders"
      ? selectedFolder
        ? notes.filter((note) => note.folderId === selectedFolder.id && !note.deleted)
        : ungroupedNotes
      : filteredNotes;

    if (!searchQuery.trim()) {
      return baseNotes;
    }

    const query = searchQuery.trim().toLowerCase();
    return baseNotes.filter((note) => {
      const folderName = folders.find((folder) => folder.id === note.folderId)?.name ?? "";
      return [note.name, note.code, note.instructor, folderName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [filteredNotes, folders, notes, searchQuery, selectedFolder, selectedNav, ungroupedNotes]);

  useEffect(() => {
    return () => {
      uploadUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      if (drawSyncFrameRef.current) {
        window.cancelAnimationFrame(drawSyncFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPdfPageCount(selectedNote.pages.length);
    setPdfPageSizes([]);
  }, [selectedNote.id, selectedNote.pages.length]);

  useEffect(() => {
    if (!notes.some((note) => note.id === selectedNoteId)) {
      const fallbackNote = notes.find((note) => !note.deleted) ?? notes[0];
      if (fallbackNote) {
        setSelectedNoteId(fallbackNote.id);
      }
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (selectedFolderId && !folders.some((folder) => folder.id === selectedFolderId && !folder.deleted)) {
      setSelectedFolderId(null);
    }
  }, [folders, selectedFolderId]);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("campus-notes-text");
      const savedStrokes = localStorage.getItem("campus-notes-strokes");
      const savedPages = localStorage.getItem("campus-notes-page-index");

      if (savedNotes) {
        setNotesByPage(JSON.parse(savedNotes));
      }
      if (savedStrokes) {
        setStrokesByPage(JSON.parse(savedStrokes));
      }
      const savedRedoStrokes = localStorage.getItem("campus-notes-redo-strokes");
      if (savedRedoStrokes) {
        setRedoStrokesByPage(JSON.parse(savedRedoStrokes));
      }
      if (savedPages) {
        setPageByNote((current) => ({
          ...current,
          ...JSON.parse(savedPages),
        }));
      }
    } catch {
      // Ignore malformed saved data and continue with defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("campus-notes-text", JSON.stringify(notesByPage));
    notesByPageRef.current = notesByPage;
  }, [notesByPage]);

  useEffect(() => {
    textBoxesByPageRef.current = textBoxesByPage;
  }, [textBoxesByPage]);

  useEffect(() => {
    localStorage.setItem("campus-notes-strokes", JSON.stringify(strokesByPage));
    strokesByPageRef.current = strokesByPage;
  }, [strokesByPage]);

  useEffect(() => {
    localStorage.setItem("campus-notes-redo-strokes", JSON.stringify(redoStrokesByPage));
  }, [redoStrokesByPage]);

  useEffect(() => {
    localStorage.setItem("campus-notes-page-index", JSON.stringify(pageByNote));
  }, [pageByNote]);

  useEffect(() => {
    if (screen !== "note" || !currentPdf || !annotationStageRef.current) {
      return undefined;
    }

    let cancelled = false;
    let renderTasks = [];
    let pdfDocument = null;

    const renderPdfPage = async () => {
      try {
        setPdfRenderError("");
        setPdfPageSizes([]);
        const loadingTask = getDocument(currentPdf.previewUrl);
        pdfDocument = await loadingTask.promise;
        const totalPages = pdfDocument.numPages;
        setPdfPageCount(totalPages);
        const containerWidth = Math.min(annotationStageRef.current.clientWidth - 80, 860);
        const nextSizes = [];

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const canvas = pdfCanvasRefs.current[pageNumber - 1];

          nextSizes[pageNumber - 1] = {
            width: viewport.width,
            height: viewport.height,
          };

          if (!canvas) {
            continue;
          }

          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          const renderTask = page.render({
            canvasContext: context,
            viewport,
          });
          renderTasks.push(renderTask);
          await renderTask.promise;
        }

        if (!cancelled) {
          setPdfPageSizes(nextSizes);
        }
      } catch (error) {
        if (cancelled || error?.name === "RenderingCancelledException") {
          return;
        }
        setPdfRenderError("PDF 페이지를 렌더링하지 못했습니다.");
      }
    };

    renderPdfPage();

    const handleResize = () => {
      renderPdfPage();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      renderTasks.forEach((task) => task?.cancel?.());
      pdfDocument?.destroy?.();
      window.removeEventListener("resize", handleResize);
    };
  }, [currentPdf, screen]);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      if (dragging !== "note-ai") {
        return;
      }

      const maxRight = Math.max(NOTE_AI_MIN, Math.floor(window.innerWidth * 0.5));
      const nextWidth = clamp(event.clientX - 12, 180, maxRight);
      if (nextWidth < NOTE_AI_COLLAPSE_THRESHOLD) {
        setRightOpen(false);
        setRightWidth(NOTE_AI_MIN);
        return;
      }
      if (!rightOpen) {
        setRightOpen(true);
      }
      setRightWidth(nextWidth);
    };

    const handleMouseUp = () => {
      if (dragging === "note-ai") {
        setRightWidth((current) => {
          const maxRight = Math.max(NOTE_AI_MIN, Math.floor(window.innerWidth * 0.5));
          return clamp(current, NOTE_AI_MIN, maxRight);
        });
      }
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
  }, [dragging, rightOpen]);

  useEffect(() => {
    if (screen !== "note" || annotationMode !== "text" || !pendingTextFocusRef.current) {
      return;
    }

    const { pageIndex, caret, clearBlank } = pendingTextFocusRef.current;
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const currentTextarea = typingTextareaRefs.current[pageIndex];
    let nextValue = notesByPageRef.current[targetPageKey] ?? currentTextarea?.value ?? "";

    if (clearBlank && nextValue.trim().length === 0 && nextValue !== "") {
      nextValue = "";
    }

    if (caret === "last-line" && currentTextarea) {
      const { maxLines } = getTextareaMetrics(currentTextarea);
      nextValue = ensureLineExists(nextValue, maxLines - 1);
    }

    if (nextValue !== (notesByPageRef.current[targetPageKey] ?? "")) {
      notesByPageRef.current = {
        ...notesByPageRef.current,
        [targetPageKey]: nextValue,
      };
      setNotesByPage(notesByPageRef.current);
    }

    pendingTextFocusRef.current = null;
    window.requestAnimationFrame(() => {
      const textarea = typingTextareaRefs.current[pageIndex];
      if (!textarea) {
        return;
      }

      // Keep the DOM value aligned before placing the caret on a line near the bottom.
      if (textarea.value !== nextValue) {
        textarea.value = nextValue;
      }

      textarea.focus();
      let position = 0;
      if (caret === "start") {
        position = 0;
      } else if (caret === "end") {
        position = nextValue.length;
      } else if (caret === "last-line") {
        const { maxLines } = getTextareaMetrics(textarea);
        position = getLineStartIndex(nextValue, maxLines - 1);
      } else {
        position = clamp(caret, 0, nextValue.length);
      }
      textarea.setSelectionRange(position, position);
    });
  }, [annotationMode, currentPageIndex, notesByPage, screen, selectedNote.id]);

  useEffect(() => {
    if (screen !== "note") {
      setActiveTextBox(null);
      return;
    }

    if (annotationMode !== "text") {
      setActiveTextBox(null);
    }
  }, [annotationMode, screen, selectedNote.id]);

  useEffect(() => {
    if (screen !== "note") {
      return;
    }

    Object.entries(textBoxesByPage).forEach(([pageKeyForBoxes, textBoxes]) => {
      const pageIndex = Number(pageKeyForBoxes.split(":")[1] ?? 0);
      textBoxes.forEach((textBox) => {
        resizeTextBoxElement(textBoxRefs.current[textBox.id], pageIndex, textBox);
      });
    });
  }, [pageZoom, pdfPageSizes, screen, textBoxesByPage]);

  useEffect(() => {
    if (!contextMenu) {
      return undefined;
    }

    const handleClose = () => {
      setContextMenu(null);
    };

    window.addEventListener("mousedown", handleClose);
    return () => {
      window.removeEventListener("mousedown", handleClose);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (screen !== "note" || !annotationScrollRef.current) {
      return undefined;
    }

    const element = annotationScrollRef.current;
    const handleScroll = () => {
      if (isDrawingRef.current) {
        return;
      }

      const containerRect = element.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height * 0.5;
      const pageEntries = Object.entries(pageSurfaceRefs.current)
        .map(([index, node]) => {
          const rect = node.getBoundingClientRect();
          return {
          index: Number(index),
          node,
            rect,
            distance: Math.abs(rect.top + rect.height * 0.5 - containerCenter),
          };
        })
        .filter((entry) => Number.isFinite(entry.distance));

      if (pageEntries.length === 0) {
        return;
      }

      const containingEntry = pageEntries.find(
        (entry) => entry.rect.top <= containerCenter && entry.rect.bottom >= containerCenter,
      );
      const nearest = pageEntries.reduce((best, entry) =>
        entry.distance < best.distance ? entry : best,
      );
      const nextPageIndex = containingEntry?.index ?? nearest.index;

      setPageByNote((current) =>
        current[selectedNote.id] === nextPageIndex
          ? current
          : { ...current, [selectedNote.id]: nextPageIndex },
      );
    };

    const handleWheelZoom = (event) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      const zoomDelta = event.deltaY < 0 ? 0.08 : -0.08;
      setPageZoom((current) => clamp(Number((current + zoomDelta).toFixed(2)), 0.6, 2));
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    element.addEventListener("wheel", handleWheelZoom, { passive: false });
    handleScroll();

    return () => {
      element.removeEventListener("scroll", handleScroll);
      element.removeEventListener("wheel", handleWheelZoom);
    };
  }, [screen, selectedNote.id]);

  useEffect(() => {
    if (screen !== "note" || !annotationScrollRef.current) {
      return;
    }

    const targetPage = pageSurfaceRefs.current[currentPageIndex];
    if (!targetPage) {
      return;
    }

    annotationScrollRef.current.scrollTo({
      top: Math.max(targetPage.offsetTop - 20, 0),
      behavior: "auto",
    });
  }, [screen, selectedNote.id]);

  useEffect(() => {
    if (screen !== "note") {
      return undefined;
    }

    const handleUndoRedo = (event) => {
      const key = event.key.toLowerCase();
      const isUndo = (event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z";
      const isRedo =
        (event.ctrlKey || event.metaKey) &&
        ((event.shiftKey && key === "z") || key === "y");

      if (!isUndo && !isRedo) {
        return;
      }

      event.preventDefault();
      if (isUndo) {
        const entry = undoHistoryRef.current[undoHistoryRef.current.length - 1];
        if (!entry) {
          return;
        }

        undoHistoryRef.current = undoHistoryRef.current.slice(0, -1);
        redoHistoryRef.current = [...redoHistoryRef.current, entry];
        applyHistoryEntry(entry, "undo");
        return;
      }

      const entry = redoHistoryRef.current[redoHistoryRef.current.length - 1];
      if (!entry) {
        return;
      }

      redoHistoryRef.current = redoHistoryRef.current.slice(0, -1);
      undoHistoryRef.current = [...undoHistoryRef.current, entry];
      applyHistoryEntry(entry, "redo");
    };

    window.addEventListener("keydown", handleUndoRedo);
    return () => {
      window.removeEventListener("keydown", handleUndoRedo);
    };
  }, [screen]);

  const openHome = (navId) => {
    setScreen("home");
    setSelectedNav(navId);
    setQuestion("");
    setSearchQuery("");
    if (navId !== "folders") {
      setSelectedFolderId(null);
    }
  };

  const openNote = (noteId) => {
    setSelectedNoteId(noteId);
    setScreen("note");
    setRightOpen(true);
  };

  const scrollToPage = (pageIndex, behavior = "smooth") => {
    const targetPage = pageSurfaceRefs.current[pageIndex];
    if (!targetPage) {
      return;
    }

    annotationScrollRef.current?.scrollTo({
      top: Math.max(targetPage.offsetTop - 20, 0),
      behavior,
    });
  };

  const commitTextBoxesForPage = (targetPageKey, nextTextBoxes) => {
    const nextState = { ...textBoxesByPageRef.current };
    if (nextTextBoxes.length === 0) {
      delete nextState[targetPageKey];
    } else {
      nextState[targetPageKey] = nextTextBoxes;
    }
    textBoxesByPageRef.current = nextState;
    setTextBoxesByPage(nextState);
  };

  const getPageTextBoxes = (pageIndex) => textBoxesByPageRef.current[`${selectedNote.id}:${pageIndex}`] ?? [];

  const getTextBoxMaxHeight = (pageSize, textBox) =>
    Math.max(56, pageSize.height * (1 - textBox.y) - TEXT_LAYER_PADDING.bottom);

  const resizeTextBoxElement = (element, pageIndex, textBox) => {
    if (!element || !textBox) {
      return;
    }

    const pageSize = pdfPageSizes[pageIndex] ?? { width: 760, height: 980 };
    const maxHeight = getTextBoxMaxHeight(pageSize, textBox);
    element.style.height = "0px";
    element.style.height = `${measureTextBoxHeight(element, element.value, maxHeight)}px`;
  };

  const queueTextBoxFocus = (pageIndex, boxId, caret = "end") => {
    pendingTextFocusRef.current = { pageIndex, boxId, caret };
    setActiveTextBox({ pageIndex, boxId });
    setPageByNote((current) => ({
      ...current,
      [selectedNote.id]: pageIndex,
    }));
  };

  const createTextBoxOnPage = (pageIndex, point = null) => {
    const pageSize = pdfPageSizes[pageIndex] ?? { width: 760, height: 980 };
    const leftBoundary = TEXT_LAYER_PADDING.left / pageSize.width;
    const rightBoundary = TEXT_LAYER_PADDING.right / pageSize.width;
    const topBoundary = TEXT_LAYER_PADDING.top / pageSize.height;
    const bottomBoundary = TEXT_LAYER_PADDING.bottom / pageSize.height;
    const x = clamp(
      point?.x ?? leftBoundary,
      leftBoundary,
      1 - rightBoundary - MIN_TEXT_BOX_WIDTH_RATIO,
    );
    const y = clamp(
      point?.y ?? topBoundary,
      topBoundary,
      1 - bottomBoundary - MIN_TEXT_BOX_HEIGHT_RATIO,
    );
    const width = clamp(
      DEFAULT_TEXT_BOX_WIDTH_RATIO,
      MIN_TEXT_BOX_WIDTH_RATIO,
      1 - x - rightBoundary,
    );
    const nextTextBox = {
      id: `textbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      x,
      y,
      width,
      text: "",
    };
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const nextTextBoxes = [...getPageTextBoxes(pageIndex), nextTextBox];

    commitTextBoxesForPage(targetPageKey, nextTextBoxes);
    queueTextBoxFocus(pageIndex, nextTextBox.id);
    scrollToPage(pageIndex);
    return nextTextBox;
  };

  const removeTextBoxFromPage = (pageIndex, textBoxId) => {
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const nextTextBoxes = getPageTextBoxes(pageIndex).filter((textBox) => textBox.id !== textBoxId);
    commitTextBoxesForPage(targetPageKey, nextTextBoxes);
    if (activeTextBox?.boxId === textBoxId) {
      setActiveTextBox(null);
    }
  };

  const findLastTextBoxOnPage = (pageIndex) => {
    const sorted = sortTextBoxes(getPageTextBoxes(pageIndex));
    return sorted[sorted.length - 1] ?? null;
  };

  const handleFolderSelect = (folderId) => {
    setSelectedNav("folders");
    setScreen("home");
    setSelectedFolderId((current) => (current === folderId ? null : folderId));
    setSearchQuery("");
  };

  const activateTextMode = () => {
    setAnnotationMode("text");
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleNoteContextMenu = (event, noteId) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      type: "note",
      id: noteId,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleFolderContextMenu = (event, folderId) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      type: "folder",
      id: folderId,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleCreateNote = () => {
    const name = window.prompt("새 노트 이름을 입력하세요.");
    if (!name?.trim()) {
      return;
    }

    const newNoteId = `note-${Date.now()}`;
    const folderId = selectedNav === "folders" ? selectedFolderId : null;
    const newNote = {
      id: newNoteId,
      name: name.trim(),
      code: "NEW",
      instructor: "직접 작성",
      accent: "accent-blue",
      folderId,
      favorite: false,
      deleted: false,
      updatedAt: "방금 생성됨",
      pages: [
        {
          title: "새 노트",
          text: "새로 만든 노트입니다. PDF를 연결하고 메모를 작성해보세요.",
          bullets: [
            "상단에서 PDF를 업로드할 수 있습니다.",
            "손글씨와 타이핑 메모를 함께 사용할 수 있습니다.",
            "AI Assistant는 현재 페이지 문맥을 기준으로 응답합니다.",
          ],
        },
      ],
    };

    setNotes((current) => [newNote, ...current]);
    setPageByNote((current) => ({ ...current, [newNoteId]: 0 }));
    setChatByNote((current) => ({ ...current, [newNoteId]: INITIAL_MESSAGES }));
    setSelectedNoteId(newNoteId);
    setScreen("note");
  };

  const handleCreateFolder = () => {
    const name = window.prompt("새 폴더 이름을 입력하세요.");
    if (!name?.trim()) {
      return;
    }

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      deleted: false,
    };

    setFolders((current) => [newFolder, ...current]);
    setSelectedNav("folders");
    setSelectedFolderId(newFolder.id);
  };

  const requestDeleteNote = (noteId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
      return;
    }

    setConfirmDialog({
      kind: "note-delete",
      id: noteId,
      title: "노트를 휴지통으로 이동할까요?",
      message: `"${note.name}" 노트를 휴지통으로 이동합니다.`,
    });
  };

  const requestDeleteFolder = (folderId) => {
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) {
      return;
    }

    setConfirmDialog({
      kind: "folder-delete",
      id: folderId,
      title: "폴더와 폴더 내의 모든 노트들을 휴지통으로 이동할까요?",
      message: `"${folder.name}" 폴더와 내부 노트들이 함께 휴지통으로 이동됩니다.`,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog) {
      return;
    }

    if (confirmDialog.kind === "note-delete") {
      setNotes((current) =>
        current.map((note) =>
          note.id === confirmDialog.id
            ? { ...note, deleted: true, favorite: false, updatedAt: "방금 휴지통으로 이동됨" }
            : note,
        ),
      );
    }

    if (confirmDialog.kind === "folder-delete") {
      setFolders((current) =>
        current.map((folder) =>
          folder.id === confirmDialog.id ? { ...folder, deleted: true } : folder,
        ),
      );
      setNotes((current) =>
        current.map((note) =>
          note.folderId === confirmDialog.id
            ? { ...note, deleted: true, favorite: false, updatedAt: "방금 휴지통으로 이동됨" }
            : note,
        ),
      );
      if (selectedFolderId === confirmDialog.id) {
        setSelectedFolderId(null);
      }
    }

    setConfirmDialog(null);
    setContextMenu(null);
  };

  const handleToggleFavorite = (noteId) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              favorite: !note.favorite,
              updatedAt: note.favorite ? "즐겨찾기 해제됨" : "즐겨찾기에 추가됨",
            }
          : note,
      ),
    );
    setContextMenu(null);
  };

  const handleShareNote = async (noteId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
      return;
    }

    const shareText = `${note.name} (${note.code})`;
    try {
      await navigator.clipboard.writeText(shareText);
      window.alert("노트 제목을 클립보드에 복사했습니다.");
    } catch {
      window.alert(`공유용 텍스트: ${shareText}`);
    }
    setContextMenu(null);
  };

  const handleRenameFolder = (folderId) => {
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) {
      return;
    }

    const nextName = window.prompt("폴더 이름을 수정하세요.", folder.name);
    if (!nextName?.trim()) {
      return;
    }

    setFolders((current) =>
      current.map((item) =>
        item.id === folderId ? { ...item, name: nextName.trim() } : item,
      ),
    );
    setContextMenu(null);
  };

  const pushHistory = (entry) => {
    if (isApplyingHistoryRef.current) {
      return;
    }

    undoHistoryRef.current = [...undoHistoryRef.current, entry];
    redoHistoryRef.current = [];
  };

  const applyHistoryEntry = (entry, direction) => {
    isApplyingHistoryRef.current = true;

    if (entry.kind === "text") {
      const nextValue = direction === "undo" ? entry.before : entry.after;
      notesByPageRef.current = {
        ...notesByPageRef.current,
        [entry.pageKey]: nextValue,
      };
      setNotesByPage(notesByPageRef.current);
      isApplyingHistoryRef.current = false;
      return;
    }

    if (entry.kind === "stroke-add") {
      const nextStrokes =
        direction === "undo"
          ? (strokesByPageRef.current[entry.pageKey] ?? []).filter((stroke) => stroke.id !== entry.stroke.id)
          : [...(strokesByPageRef.current[entry.pageKey] ?? []), entry.stroke];
      strokesByPageRef.current = {
        ...strokesByPageRef.current,
        [entry.pageKey]: nextStrokes,
      };
      setStrokesByPage(strokesByPageRef.current);
      isApplyingHistoryRef.current = false;
      return;
    }

    if (entry.kind === "erase-strokes") {
      const nextStrokes =
        direction === "undo"
          ? [...(strokesByPageRef.current[entry.pageKey] ?? []), ...entry.removedStrokes]
          : (strokesByPageRef.current[entry.pageKey] ?? []).filter(
              (stroke) => !entry.removedStrokes.some((removed) => removed.id === stroke.id),
            );
      strokesByPageRef.current = {
        ...strokesByPageRef.current,
        [entry.pageKey]: nextStrokes,
      };
      setStrokesByPage(strokesByPageRef.current);
      isApplyingHistoryRef.current = false;
      return;
    }

    if (entry.kind === "clear-page") {
      const nextText = direction === "undo" ? entry.beforeText : "";
      const nextStrokes = direction === "undo" ? entry.beforeStrokes : [];
      notesByPageRef.current = {
        ...notesByPageRef.current,
        [entry.pageKey]: nextText,
      };
      strokesByPageRef.current = {
        ...strokesByPageRef.current,
        [entry.pageKey]: nextStrokes,
      };
      setNotesByPage(notesByPageRef.current);
      setStrokesByPage(strokesByPageRef.current);
      isApplyingHistoryRef.current = false;
    }
  };

  const syncActiveStroke = () => {
    const activeStroke = activeStrokeIdRef.current;
    if (!activeStroke) {
      return;
    }

    const targetPageKey = `${selectedNote.id}:${activeStroke.pageIndex}`;
    const nextPoints = liveStrokePointsRef.current;
    setStrokesByPage((current) => ({
      ...current,
      [targetPageKey]: (current[targetPageKey] ?? []).map((stroke) =>
        stroke.id === activeStroke.strokeId ? { ...stroke, points: nextPoints } : stroke,
      ),
    }));
  };

  const scheduleStrokeSync = () => {
    if (drawSyncFrameRef.current) {
      return;
    }

    drawSyncFrameRef.current = window.requestAnimationFrame(() => {
      drawSyncFrameRef.current = null;
      syncActiveStroke();
    });
  };

  const getAnnotationPoint = (pageIndex, event) => {
    const element = pageSurfaceRefs.current[pageIndex];
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
  };

  const handleAnnotationPointerDown = (pageIndex, event) => {
    if (!currentPdf || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (annotationMode === "capture") {
      const point = getAnnotationPoint(pageIndex, event);
      if (!point) {
        return;
      }

      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
      activePointerIdRef.current = event.pointerId;
      isCapturingRef.current = true;
      setCaptureSelection({ pageIndex, points: [point] });
      return;
    }

    if (annotationMode === "erase") {
      handleEraseStroke(pageIndex, event);
      return;
    }

    if (annotationMode !== "draw") {
      return;
    }

    const point = getAnnotationPoint(pageIndex, event);
    if (!point) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
    activePointerIdRef.current = event.pointerId;
    isDrawingRef.current = true;
    liveStrokePointsRef.current = [point];

    const strokeId = `stroke-${Date.now()}`;
    activeStrokeIdRef.current = { strokeId, pageIndex };
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    setRedoStrokesByPage((current) => ({
      ...current,
      [targetPageKey]: [],
    }));
    setStrokesByPage((current) => ({
      ...current,
      [targetPageKey]: [
        ...(current[targetPageKey] ?? []),
        { id: strokeId, points: liveStrokePointsRef.current },
      ],
    }));
  };

  const handleAnnotationPointerMove = (pageIndex, event) => {
    if (
      annotationMode === "capture" &&
      isCapturingRef.current &&
      captureSelection &&
      captureSelection.pageIndex === pageIndex &&
      activePointerIdRef.current === event.pointerId
    ) {
      const point = getAnnotationPoint(pageIndex, event);
      if (!point) {
        return;
      }

      event.preventDefault();
      setCaptureSelection((current) => {
        if (!current || current.pageIndex !== pageIndex) {
          return current;
        }

        const previousPoint = current.points[current.points.length - 1];
        const nextPoints = previousPoint ? interpolatePoints(previousPoint, point, 0.012) : [point];
        return {
          ...current,
          points: [...current.points, ...nextPoints],
        };
      });
      return;
    }

    if (
      !activeStrokeIdRef.current ||
      activeStrokeIdRef.current.pageIndex !== pageIndex ||
      activePointerIdRef.current !== event.pointerId ||
      (event.pointerType === "mouse" && (event.buttons & 1) !== 1)
    ) {
      return;
    }

    const point = getAnnotationPoint(pageIndex, event);
    if (!point) {
      return;
    }

    event.preventDefault();

    const previousPoint = liveStrokePointsRef.current[liveStrokePointsRef.current.length - 1];
    const nextPoints = previousPoint
      ? interpolatePoints(previousPoint, point)
      : [point];

    liveStrokePointsRef.current = [...liveStrokePointsRef.current, ...nextPoints];
    scheduleStrokeSync();
  };

  const handleAnnotationPointerUp = () => {
    const activeStroke = activeStrokeIdRef.current;
    const finishedStroke =
      activeStroke && liveStrokePointsRef.current.length > 0
        ? {
            id: activeStroke.strokeId,
            points: liveStrokePointsRef.current,
          }
        : null;

    if (annotationMode === "capture" && captureSelection && captureSelection.points.length >= 3) {
      const { pageIndex, points } = captureSelection;
      const pageKeyForCapture = `${selectedNote.id}:${pageIndex}`;
      const pageSize = pdfPageSizes[pageIndex] ?? { width: 760, height: 980 };
      const canvas = pdfCanvasRefs.current[pageIndex];

      if (canvas) {
        const xs = points.map((point) => point.x * pageSize.width);
        const ys = points.map((point) => point.y * pageSize.height);
        const minX = Math.max(Math.floor(Math.min(...xs)), 0);
        const minY = Math.max(Math.floor(Math.min(...ys)), 0);
        const maxX = Math.min(Math.ceil(Math.max(...xs)), pageSize.width);
        const maxY = Math.min(Math.ceil(Math.max(...ys)), pageSize.height);
        const width = Math.max(maxX - minX, 1);
        const height = Math.max(maxY - minY, 1);

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = width;
        exportCanvas.height = height;
        const exportContext = exportCanvas.getContext("2d");

        exportContext.save();
        exportContext.beginPath();
        points.forEach((point, index) => {
          const x = point.x * pageSize.width - minX;
          const y = point.y * pageSize.height - minY;
          if (index === 0) {
            exportContext.moveTo(x, y);
          } else {
            exportContext.lineTo(x, y);
          }
        });
        exportContext.closePath();
        exportContext.clip();
        exportContext.drawImage(canvas, -minX, -minY);

        const pageStrokes = strokesByPage[pageKeyForCapture] ?? [];
        exportContext.lineCap = "round";
        exportContext.lineJoin = "round";
        exportContext.strokeStyle = "#1d4ed8";
        exportContext.lineWidth = 4;
        pageStrokes.forEach((stroke) => {
          if (stroke.points.length < 2) {
            return;
          }

          exportContext.beginPath();
          stroke.points.forEach((point, index) => {
            const x = point.x * pageSize.width - minX;
            const y = point.y * pageSize.height - minY;
            if (index === 0) {
              exportContext.moveTo(x, y);
            } else {
              exportContext.lineTo(x, y);
            }
          });
          exportContext.stroke();
        });
        exportContext.restore();

        const capture = {
          id: `capture-${Date.now()}`,
          pageIndex,
          previewUrl: exportCanvas.toDataURL("image/png"),
        };

        setCapturesByPage((current) => ({
          ...current,
          [pageKeyForCapture]: [...(current[pageKeyForCapture] ?? []), capture],
        }));
      }
    }

    if (drawSyncFrameRef.current) {
      window.cancelAnimationFrame(drawSyncFrameRef.current);
      drawSyncFrameRef.current = null;
    }
    syncActiveStroke();
    if (finishedStroke && activeStroke) {
      pushHistory({
        kind: "stroke-add",
        pageKey: `${selectedNote.id}:${activeStroke.pageIndex}`,
        stroke: finishedStroke,
      });
    }
    setCaptureSelection(null);
    activeStrokeIdRef.current = null;
    activePointerIdRef.current = null;
    isDrawingRef.current = false;
    isCapturingRef.current = false;
    liveStrokePointsRef.current = [];
  };

  const handleEraseStroke = (pageIndex, event) => {
    const point = getAnnotationPoint(pageIndex, event);
    if (!point) {
      return;
    }

    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const currentPageStrokes = strokesByPageRef.current[targetPageKey] ?? [];
    const removedStrokes = currentPageStrokes.filter((stroke) => strokeTouchesPoint(stroke, point));
    if (removedStrokes.length === 0) {
      return;
    }

    setRedoStrokesByPage((current) => ({
      ...current,
      [targetPageKey]: [],
    }));
    const nextStrokes = currentPageStrokes.filter(
      (stroke) => !removedStrokes.some((removed) => removed.id === stroke.id),
    );
    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [targetPageKey]: nextStrokes,
    };
    setStrokesByPage(strokesByPageRef.current);
    pushHistory({
      kind: "erase-strokes",
      pageKey: targetPageKey,
      removedStrokes,
    });
  };

  const handleTextLayerPointerDown = (pageIndex, event) => {
    if (annotationMode !== "text" || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const textarea = typingTextareaRefs.current[pageIndex];
    if (!textarea) {
      return;
    }

    const rect = textarea.getBoundingClientRect();
    const { lineHeight, paddingTop, maxLines } = getTextareaMetrics(textarea);
    const rawLineIndex = Math.floor((event.clientY - rect.top - paddingTop) / lineHeight);
    const snappedLineIndex = clamp(rawLineIndex, 0, maxLines - 1);
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const currentValue = notesByPageRef.current[targetPageKey] ?? "";
    const nextValue = ensureLineExists(currentValue, snappedLineIndex);

    if (nextValue !== currentValue) {
      notesByPageRef.current = {
        ...notesByPageRef.current,
        [targetPageKey]: nextValue,
      };
      setNotesByPage(notesByPageRef.current);
    }

    setPageByNote((current) => ({
      ...current,
      [selectedNote.id]: pageIndex,
    }));

    window.requestAnimationFrame(() => {
      const nextTextarea = typingTextareaRefs.current[pageIndex];
      if (!nextTextarea) {
        return;
      }

      const lineStartIndex = getLineStartIndex(nextValue, snappedLineIndex);
      nextTextarea.focus();
      nextTextarea.setSelectionRange(lineStartIndex, lineStartIndex);
    });
  };

  const handleTypedNoteChange = (event, pageIndex = currentPageIndex) => {
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const value = event.target.value;
    const previousValue = notesByPageRef.current[targetPageKey] ?? "";

    if (previousValue === value) {
      return;
    }

    notesByPageRef.current = {
      ...notesByPageRef.current,
      [targetPageKey]: value,
    };
    setNotesByPage(notesByPageRef.current);
    pushHistory({
      kind: "text",
      pageKey: targetPageKey,
      before: previousValue,
      after: value,
    });
  };

  const handleTypingKeyDown = (event, pageIndex) => {
    const target = event.target;
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;
    const isSelectionCollapsed = selectionStart === selectionEnd;
    const isVisuallyBlankPage = target.value.trim().length === 0;
    const currentLineIndex = getLineIndexFromCaret(target.value, selectionStart);
    const currentLineStart = getLineStartIndex(target.value, currentLineIndex);
    const isAtLineStart = isSelectionCollapsed && selectionStart === currentLineStart;

    if (event.key === "Tab") {
      event.preventDefault();
      const value = target.value;
      const start = selectionStart;
      const end = selectionEnd;
      const nextValue = `${value.slice(0, start)}\t${value.slice(end)}`;

      notesByPageRef.current = {
        ...notesByPageRef.current,
        [targetPageKey]: nextValue,
      };
      setNotesByPage(notesByPageRef.current);
      pushHistory({
        kind: "text",
        pageKey: targetPageKey,
        before: value,
        after: nextValue,
      });

      window.requestAnimationFrame(() => {
        target.selectionStart = start + 1;
        target.selectionEnd = start + 1;
      });
      return;
    }

    if (
      event.key === "Backspace" &&
      isSelectionCollapsed &&
      isVisuallyBlankPage
    ) {
      if (!isAtLineStart) {
        return;
      }

      if (currentLineIndex > 0) {
        event.preventDefault();
        const previousLineStart = getLineStartIndex(target.value, currentLineIndex - 1);
        window.requestAnimationFrame(() => {
          target.focus();
          target.setSelectionRange(previousLineStart, previousLineStart);
        });
        return;
      }

      if (pageIndex <= 0) {
        return;
      }

      event.preventDefault();
      notesByPageRef.current = {
        ...notesByPageRef.current,
        [targetPageKey]: "",
      };
      setNotesByPage(notesByPageRef.current);
      const previousPageIndex = pageIndex - 1;
      pendingTextFocusRef.current = {
        pageIndex: previousPageIndex,
        caret: "last-line",
        clearBlank: false,
      };
      setPageByNote((current) => ({
        ...current,
        [selectedNote.id]: previousPageIndex,
      }));
      scrollToPage(previousPageIndex);
      return;
    }

    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    const nextPageIndex = pageIndex + 1;
    if (nextPageIndex >= renderedPageCount) {
      return;
    }

    const { maxLines } = getTextareaMetrics(target);

    if (!isSelectionCollapsed || currentLineIndex < maxLines - 1) {
      return;
    }

    event.preventDefault();
    pendingTextFocusRef.current = {
      pageIndex: nextPageIndex,
      caret: 0,
      clearBlank: true,
    };
    setPageByNote((current) => ({
      ...current,
      [selectedNote.id]: nextPageIndex,
    }));
    scrollToPage(nextPageIndex);
  };

  const handleClearAnnotations = () => {
    const beforeStrokes = strokesByPageRef.current[pageKey] ?? [];
    const beforeText = notesByPageRef.current[pageKey] ?? "";
    if (beforeStrokes.length === 0 && beforeText === "") {
      return;
    }

    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [pageKey]: [],
    };
    notesByPageRef.current = {
      ...notesByPageRef.current,
      [pageKey]: "",
    };
    setStrokesByPage(strokesByPageRef.current);
    setRedoStrokesByPage((current) => ({
      ...current,
      [pageKey]: [],
    }));
    setNotesByPage(notesByPageRef.current);
    pushHistory({
      kind: "clear-page",
      pageKey,
      beforeText,
      beforeStrokes,
    });
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

    setPdfByNote((current) => ({
      ...current,
      [selectedNote.id]: {
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

    setChatByNote((current) => ({
      ...current,
      [selectedNote.id]: [...(current[selectedNote.id] ?? []), userMessage],
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

      setChatByNote((current) => ({
        ...current,
        [selectedNote.id]: [...(current[selectedNote.id] ?? []), assistantMessage],
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

  const mainTitle = NAV_ITEMS.find((item) => item.id === selectedNav)?.label ?? "폴더";

  const noteDetailGridColumns =
    screen === "note"
      ? "minmax(0, 1fr)"
      : leftOpen
        ? "284px minmax(0, 1fr)"
        : `${COLLAPSED_RAIL}px minmax(0, 1fr)`;

  const noteWorkspaceColumns = [
    rightOpen ? `${rightWidth}px` : `${COLLAPSED_RAIL}px`,
    "0px",
    "minmax(0, 1fr)",
  ].join(" ");

  return (
    <main className={`app-shell ${screen === "note" ? "detail-mode" : "home-mode"}`}>
      <div className="app-grid" style={{ gridTemplateColumns: noteDetailGridColumns }}>
        {screen === "home" ? (
          <aside className={`sidebar-shell ${leftOpen ? "" : "is-collapsed"}`}>
            {leftOpen ? (
              <div className="panel sidebar samsung-sidebar">
                <div className="sidebar-toprow">
                  <button type="button" className="menu-button" onClick={() => setLeftOpen(false)} aria-label="메뉴 접기">
                    ☰
                  </button>
                  <strong>Campus Notes AI</strong>
                </div>

                <nav className="nav-list" aria-label="메인 메뉴">
                  {NAV_ITEMS.map((item) => {
                    const active = selectedNav === item.id && screen === "home";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`nav-item ${active ? "is-active" : ""}`}
                        onClick={() => openHome(item.id)}
                      >
                        <span>{item.label}</span>
                        <strong>{noteCounts[item.id]}</strong>
                      </button>
                    );
                  })}
                </nav>

                {selectedNav === "folders" ? (
                  <div className="folder-nav-list">
                    {folders.filter((folder) => !folder.deleted).map((folder) => {
                      const count = notesInFolders.filter((note) => note.folderId === folder.id).length;
                      return (
                        <button
                          key={folder.id}
                          type="button"
                          className={`folder-nav-item ${selectedFolderId === folder.id ? "is-active" : ""}`}
                          onClick={() => handleFolderSelect(folder.id)}
                        >
                          <span>{folder.name}</span>
                          <strong>{count}</strong>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="collapsed-toggle"
                onClick={() => setLeftOpen(true)}
                aria-label="왼쪽 사이드바 열기"
              >
                메뉴
              </button>
            )}
          </aside>
        ) : null}

        {screen === "home" ? (
          <section className="panel home-panel samsung-home-panel">
            <header className="home-header samsung-home-header">
              <h2>{mainTitle}</h2>

              <div className="home-toolbar">
                <div className="header-actions samsung-actions">
                  <button type="button" onClick={handleCreateNote}>노트 작성</button>
                  <button type="button" onClick={handleCreateFolder}>폴더 생성</button>
                </div>
                <div className="search-shell">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="검색"
                    aria-label="노트 검색"
                  />
                </div>
              </div>
            </header>

            {selectedNav === "folders" ? (
              <>
                <div className="folder-strip">
                  {folders.filter((folder) => !folder.deleted).map((folder) => {
                    const count = notesInFolders.filter((note) => note.folderId === folder.id).length;
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        className={`folder-card samsung-folder-card ${selectedFolderId === folder.id ? "is-active" : ""}`}
                        onClick={() => handleFolderSelect(folder.id)}
                        onContextMenu={(event) => handleFolderContextMenu(event, folder.id)}
                      >
                        <div className="folder-tab" />
                        <div className="folder-card-meta">{count}</div>
                        <strong>{folder.name}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="notes-toolbar-row">
                  <button type="button" className="sort-chip">
                    만든 날짜순
                  </button>
                </div>

                <div className="note-card-grid samsung-note-grid">
                  {visibleHomeNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={`note-card samsung-note-card ${note.deleted ? "is-trash" : ""}`}
                      onClick={() => openNote(note.id)}
                      onContextMenu={(event) => handleNoteContextMenu(event, note.id)}
                    >
                      <div className={`note-preview ${getPreviewVariant(note)} ${note.accent}`}>
                        <span className="preview-title">{formatPreviewTitle(note)}</span>
                        <span className="preview-code">{note.code}</span>
                      </div>
                      <strong>{note.name}</strong>
                      <div className="note-card-meta compact">
                        <span>{note.updatedAt}</span>
                      </div>
                    </button>
                  ))}

                  {visibleHomeNotes.length === 0 ? (
                    <div className="empty-state-card">표시할 노트가 없습니다.</div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="notes-toolbar-row">
                  <button type="button" className="sort-chip">
                    만든 날짜순
                  </button>
                </div>

                <div className="note-card-grid samsung-note-grid">
                  {visibleHomeNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={`note-card samsung-note-card ${note.deleted ? "is-trash" : ""}`}
                      onClick={() => openNote(note.id)}
                      onContextMenu={(event) => handleNoteContextMenu(event, note.id)}
                    >
                      <div className={`note-preview ${getPreviewVariant(note)} ${note.accent}`}>
                        <span className="preview-title">{formatPreviewTitle(note)}</span>
                        <span className="preview-code">{note.code}</span>
                      </div>
                      <strong>{note.name}</strong>
                      <div className="note-card-meta compact">
                        <span>{note.updatedAt}</span>
                      </div>
                    </button>
                  ))}

                  {visibleHomeNotes.length === 0 ? (
                    <div className="empty-state-card">표시할 노트가 없습니다.</div>
                  ) : null}
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <section className="panel workspace note-detail-panel">
              <div className="note-study-shell">
                <div className="note-workspace-grid" style={{ gridTemplateColumns: noteWorkspaceColumns }}>
                <div className="note-sidebar-topbar">
                  {rightOpen ? (
                    <>
                      <div>
                        <p className="eyebrow">AI Assistant</p>
                        <strong>페이지 기반 질의응답</strong>
                      </div>
                      <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => setRightOpen(false)}
                        aria-label="AI 어시스턴트 접기"
                      >
                        ◀
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="collapsed-toggle collapsed-toggle--inline"
                      onClick={() => setRightOpen(true)}
                      aria-label="AI 어시스턴트 열기"
                    >
                      AI
                    </button>
                  )}
                </div>

                <div
                  className={`resize-handle note-inline-handle ${rightOpen ? "" : "is-hidden"}`}
                  onMouseDown={() => rightOpen && setDragging("note-ai")}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="AI 어시스턴트 너비 조절"
                />

                <div className="workspace-topbar note-toolbar-bar">
                  <div className="workspace-title-row">
                    <button type="button" className="back-link" onClick={() => setScreen("home")}>
                      ← 메인으로
                    </button>
                    <h2>{selectedNote.name}</h2>
                  </div>
                  <div className="note-top-actions annotation-actions annotation-actions--compact">
                  <button
                    type="button"
                    title="손글씨"
                    aria-label="손글씨"
                    className={annotationMode === "draw" ? "is-active" : ""}
                    onClick={() => setAnnotationMode("draw")}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    title="타이핑"
                    aria-label="타이핑"
                    className={annotationMode === "text" ? "is-active" : ""}
                    onClick={activateTextMode}
                  >
                    T
                  </button>
                  <button
                    type="button"
                    title="지우개"
                    aria-label="지우개"
                    className={annotationMode === "erase" ? "is-active" : ""}
                    onClick={() => setAnnotationMode("erase")}
                  >
                    ⌫
                  </button>
                  <button
                    type="button"
                    title="영역 캡처"
                    aria-label="영역 캡처"
                    className={annotationMode === "capture" ? "is-active" : ""}
                    onClick={() => setAnnotationMode("capture")}
                  >
                    ▣
                  </button>
                  <button type="button" title="현재 페이지 지우기" aria-label="현재 페이지 지우기" onClick={handleClearAnnotations}>
                    ⟲
                  </button>
                  <button type="button" title="이미지 업로드" aria-label="이미지 업로드" onClick={() => galleryInputRef.current?.click()}>
                    ＋I
                  </button>
                  <button type="button" title="카메라 열기" aria-label="카메라 열기" onClick={() => cameraInputRef.current?.click()}>
                    Cam
                  </button>
                  <button type="button" title="PDF 업로드" aria-label="PDF 업로드" onClick={() => pdfInputRef.current?.click()}>
                    PDF
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
                  <input
                    ref={pdfInputRef}
                    className="hidden-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                  />
                </div>
                </div>

                <div className={`note-embedded-ai ${rightOpen ? "" : "is-collapsed"}`}>
                  {rightOpen ? (
                    <div className="chat-panel note-ai-panel note-ai-panel--embedded">
                      <div className="chat-meta">
                        <span>{selectedNote.code}</span>
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
                    <div className="note-ai-collapsed-marker" />
                  )}
                </div>

                <div className="note-content">
                  <div className="pdf-viewer annotation-workspace">
                    {currentPdf ? (
                      <div className="annotation-board">
                        <div className="annotation-stage" ref={annotationStageRef}>
                          <div className="annotation-scroll" ref={annotationScrollRef}>
                            {Array.from({ length: renderedPageCount }, (_, pageIndex) => {
                              const pageKeyForRender = `${selectedNote.id}:${pageIndex}`;
                              const pageStrokes = strokesByPage[pageKeyForRender] ?? [];
                              const pageTypedNote = notesByPage[pageKeyForRender] ?? "";
                              const pageSize = pdfPageSizes[pageIndex] ?? { width: 760, height: 980 };

                              return (
                                <div
                                  key={pageKeyForRender}
                                  className="paper-stage"
                                  ref={(node) => {
                                    if (node) {
                                      pageSurfaceRefs.current[pageIndex] = node;
                                    }
                                  }}
                                  style={{
                                    width: `${pageSize.width * pageZoom}px`,
                                    minHeight: `${pageSize.height * pageZoom}px`,
                                  }}
                                >
                                  <div
                                    className="paper-zoom-surface"
                                    style={{
                                      width: `${pageSize.width}px`,
                                      height: `${pageSize.height}px`,
                                      transform: `scale(${pageZoom})`,
                                    }}
                                  >
                                    <canvas
                                      ref={(node) => {
                                        if (node) {
                                          pdfCanvasRefs.current[pageIndex] = node;
                                        }
                                      }}
                                      className="pdf-canvas"
                                    />
                                    {pdfRenderError && pageIndex === 0 ? (
                                      <div className="pdf-render-error">{pdfRenderError}</div>
                                    ) : null}
                                    <svg
                                      className={`annotation-layer ${annotationMode === "text" ? "is-disabled" : ""}`}
                                      viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
                                      preserveAspectRatio="none"
                                      onPointerDown={(event) => handleAnnotationPointerDown(pageIndex, event)}
                                      onPointerMove={(event) => handleAnnotationPointerMove(pageIndex, event)}
                                      onPointerUp={handleAnnotationPointerUp}
                                      onPointerLeave={handleAnnotationPointerUp}
                                      onPointerCancel={handleAnnotationPointerUp}
                                      onLostPointerCapture={handleAnnotationPointerUp}
                                    >
                                      {pageStrokes.map((stroke) => (
                                        <path
                                          key={stroke.id}
                                          d={buildStrokePath(stroke.points, pageSize.width, pageSize.height)}
                                          fill="none"
                                          stroke="#1d4ed8"
                                          strokeWidth="4"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      ))}
                                      {captureSelection && captureSelection.pageIndex === pageIndex ? (
                                        <path
                                          d={buildSelectionPath(
                                            captureSelection.points,
                                            pageSize.width,
                                            pageSize.height,
                                          )}
                                          fill="rgba(59, 130, 246, 0.12)"
                                          stroke="#2563eb"
                                          strokeWidth="2.5"
                                          strokeDasharray="10 8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      ) : null}
                                    </svg>

                                    <div className={`annotation-text-layer ${annotationMode === "text" ? "is-active" : ""}`}>
                                      <textarea
                                        ref={(node) => {
                                          if (node) {
                                            typingTextareaRefs.current[pageIndex] = node;
                                          } else {
                                            delete typingTextareaRefs.current[pageIndex];
                                          }
                                        }}
                                        className={`annotation-typing-pad ${
                                          annotationMode === "text" ? "is-active" : ""
                                        }`}
                                        value={pageTypedNote}
                                        onChange={(event) => handleTypedNoteChange(event, pageIndex)}
                                        onKeyDown={(event) => handleTypingKeyDown(event, pageIndex)}
                                        onPointerDown={(event) => handleTextLayerPointerDown(pageIndex, event)}
                                        placeholder=""
                                        aria-label={`${pageIndex + 1}페이지 타이핑 메모`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {currentUploads.length > 0 ? (
                          <div className="paper-upload-strip">
                            {currentUploads.map((upload) => (
                              <figure key={upload.id} className="paper-upload-card">
                                <img src={upload.previewUrl} alt={upload.name} />
                                <figcaption>{upload.name}</figcaption>
                              </figure>
                            ))}
                          </div>
                        ) : null}

                        {currentCaptures.length > 0 ? (
                          <div className="capture-strip">
                            {currentCaptures.map((capture) => (
                              <figure key={capture.id} className="capture-card">
                                <img src={capture.previewUrl} alt={`캡처 ${capture.pageIndex + 1}`} />
                                <figcaption>{capture.pageIndex + 1}페이지 캡처</figcaption>
                              </figure>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="pdf-empty">
                        <strong>아직 PDF가 연결되지 않았습니다.</strong>
                        <p>PDF를 연결하면 그 위에 바로 필기하고 타이핑 메모를 남길 수 있습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {screen === "home" && selectedNav === "trash" && deletedFolders.length > 0 ? (
        <div className="trash-folder-dock">
          {deletedFolders.map((folder) => (
            <div key={folder.id} className="trash-folder-chip">
              {folder.name}
            </div>
          ))}
        </div>
      ) : null}

      {contextMenu ? (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {contextMenu.type === "note" ? (
            <>
              <button type="button" onClick={() => requestDeleteNote(contextMenu.id)}>
                삭제
              </button>
              <button type="button" onClick={() => handleToggleFavorite(contextMenu.id)}>
                즐겨찾기 토글
              </button>
              <button type="button" onClick={() => handleShareNote(contextMenu.id)}>
                공유
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => handleRenameFolder(contextMenu.id)}>
                이름변경
              </button>
              <button type="button" onClick={() => requestDeleteFolder(contextMenu.id)}>
                삭제
              </button>
            </>
          )}
        </div>
      ) : null}

      {confirmDialog ? (
        <div className="dialog-backdrop">
          <div className="confirm-dialog" onMouseDown={(event) => event.stopPropagation()}>
            <strong>{confirmDialog.title}</strong>
            <p>{confirmDialog.message}</p>
            <div className="dialog-actions">
              <button type="button" onClick={() => setConfirmDialog(null)}>
                취소
              </button>
              <button type="button" className="danger" onClick={handleConfirmAction}>
                휴지통으로 이동
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
