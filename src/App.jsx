import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Home,
  Camera,
  Eraser,
  FileText,
  FileUp,
  Folder,
  ImagePlus,
  PenLine,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Star,
  Trash2,
  Type,
} from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DEFAULT_PDF_PATH = "/4_Maximum%20likelihood%20learning.pdf";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const COLLAPSED_RAIL = 62;
const NOTE_AI_MIN = 260;
const NOTE_AI_COLLAPSE_THRESHOLD = 240;

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

const WELCOME_MESSAGE_ID = "welcome-1";
const DEFAULT_NOTE_PAGE = {
  title: "새 노트",
  text: "",
  bullets: ["아직 저장된 페이지 내용이 없습니다."],
};
const EMPTY_NOTE = {
  id: "",
  name: "노트를 선택하세요",
  code: "",
  instructor: "직접 작성",
  accent: "accent-blue",
  folderId: null,
  favorite: false,
  deleted: false,
  updatedAt: "",
  pages: [DEFAULT_NOTE_PAGE],
};

const PEN_COLORS = [
  { id: "blue", label: "파랑", value: "#1d4ed8" },
  { id: "black", label: "검정", value: "#111827" },
  { id: "green", label: "초록", value: "#047857" },
  { id: "red", label: "빨강", value: "#dc2626" },
];

const NAV_ITEMS = [
  { id: "all", label: "모든 노트" },
  { id: "favorites", label: "즐겨찾기" },
  { id: "trash", label: "휴지통" },
  { id: "folders", label: "폴더" },
];

const NAV_ICONS = {
  all: FileText,
  favorites: Star,
  trash: Trash2,
  folders: Folder,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

function makeFrontendPage(pageIndex, typedText = "") {
  const text = typedText?.trim() ?? "";
  const bullets = text
    ? text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return {
    title: `${pageIndex + 1}페이지`,
    text,
    bullets: bullets.length > 0 ? bullets : DEFAULT_NOTE_PAGE.bullets,
  };
}

function parsePageStrokes(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapFolderFromApi(folder) {
  return {
    id: String(folder.id),
    name: folder.name,
    deleted: folder.deleted,
  };
}

function formatNoteDate(value) {
  if (!value) {
    return "저장됨";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function mapNoteFromApi(note, existingNote) {
  const sortedPages = note.pages?.length
    ? [...note.pages].sort((a, b) => a.page_index - b.page_index)
    : [];
  const pages = sortedPages.length
    ? sortedPages
        .map((page) => makeFrontendPage(page.page_index - 1, page.typed_text))
    : existingNote?.pages?.length
      ? existingNote.pages
      : [DEFAULT_NOTE_PAGE];
  const firstRawPage = sortedPages[0] ?? null;

  return {
    id: String(note.id),
    name: note.title,
    code: note.code ?? "NEW",
    instructor: existingNote?.instructor ?? "직접 작성",
    accent: existingNote?.accent ?? "accent-blue",
    folderId: note.folder_id == null ? null : String(note.folder_id),
    favorite: Boolean(note.favorite),
    deleted: Boolean(note.deleted),
    updatedAt: formatNoteDate(note.updated_at ?? note.created_at),
    previewStrokes: parsePageStrokes(firstRawPage?.handwriting_data),
    pages,
  };
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

function makeCaptureChatAnalysis(currentPage, captureCount, selectedStrokeCount) {
  const selectionText =
    selectedStrokeCount > 0
      ? `캡처 영역에서 손글씨 ${selectedStrokeCount}개가 함께 선택되었습니다.`
      : "캡처 영역 안에 선택 가능한 손글씨는 없었습니다.";

  return `${currentPage.title} 페이지의 선택 영역을 AI 참고 이미지로 첨부했습니다. ${selectionText} 현재 페이지 핵심은 ${currentPage.bullets[0]}`;
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

async function renderPdfFirstPageThumbnail(pdfUrl, strokes = []) {
  const loadingTask = getDocument(pdfUrl);
  const pdfDocument = await loadingTask.promise;

  try {
    const page = await pdfDocument.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const targetWidth = 360;
    const viewport = page.getViewport({ scale: targetWidth / baseViewport.width });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    strokes.forEach((stroke) => {
      const points = stroke.points ?? [];
      if (points.length < 2) {
        return;
      }

      context.save();
      context.beginPath();
      points.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (index === 0) {
          context.moveTo(x, y);
          return;
        }
        context.lineTo(x, y);
      });
      context.strokeStyle = stroke.color ?? "#1d4ed8";
      context.lineWidth = Math.max((stroke.width ?? 4) * 0.45, 1);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      context.restore();
    });

    return canvas.toDataURL("image/png");
  } finally {
    pdfDocument?.destroy?.();
  }
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

function buildRectangleSelectionPoints(start, end) {
  return [
    start,
    { x: end.x, y: start.y },
    end,
    { x: start.x, y: end.y },
  ];
}

function isPointInsidePolygon(point, polygon) {
  if (!polygon || polygon.length < 3) {
    return false;
  }

  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          ((previousPoint.y - currentPoint.y) || Number.EPSILON) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function getStrokeBounds(strokes) {
  const points = strokes.flatMap((stroke) => stroke.points);
  if (points.length === 0) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.max(Math.min(...xs), 0);
  const minY = Math.max(Math.min(...ys), 0);
  const maxX = Math.min(Math.max(...xs), 1);
  const maxY = Math.min(Math.max(...ys), 1);

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 0.001),
    height: Math.max(maxY - minY, 0.001),
  };
}

function strokeIntersectsPolygon(stroke, polygon) {
  if (!stroke.points.length || !polygon.length) {
    return false;
  }

  return (
    stroke.points.some((point) => isPointInsidePolygon(point, polygon)) ||
    polygon.some((point) => strokeTouchesPoint(stroke, point, 0.03))
  );
}

function selectionContainsPoint(selectionBounds, point) {
  if (!selectionBounds) {
    return false;
  }

  return (
    point.x >= selectionBounds.x &&
    point.x <= selectionBounds.x + selectionBounds.width &&
    point.y >= selectionBounds.y &&
    point.y <= selectionBounds.y + selectionBounds.height
  );
}

function offsetStrokePoints(stroke, deltaX, deltaY) {
  return {
    ...stroke,
    points: stroke.points.map((point) => ({
      x: clamp(point.x + deltaX, 0, 1),
      y: clamp(point.y + deltaY, 0, 1),
    })),
  };
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

function splitStrokeByPoint(stroke, point, threshold = 0.02) {
  const segments = [];
  let currentSegment = [];
  let touched = false;

  stroke.points.forEach((strokePoint) => {
    const isErased = Math.hypot(strokePoint.x - point.x, strokePoint.y - point.y) <= threshold;
    if (isErased) {
      touched = true;
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [];
      return;
    }

    currentSegment.push(strokePoint);
  });

  if (currentSegment.length >= 2) {
    segments.push(currentSegment);
  }

  if (!touched) {
    return { touched: false, nextStrokes: [stroke] };
  }

  return {
    touched: true,
    nextStrokes: segments.map((segment, index) => ({
      ...stroke,
      id: `${stroke.id}-part-${index}-${Date.now()}`,
      points: segment,
    })),
  };
}

function mapPenWidthToStrokeWidth(penWidth) {
  return Number((1 + (penWidth / 100) * 11).toFixed(2));
}

export default function App() {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [screen, setScreen] = useState("home");
  const [selectedNav, setSelectedNav] = useState("folders");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageByNote, setPageByNote] = useState({});
  const [notesByPage, setNotesByPage] = useState({});
  const [chatByNote, setChatByNote] = useState({});
  const [uploadsByPage, setUploadsByPage] = useState({});
  const [strokesByPage, setStrokesByPage] = useState({});
  const [redoStrokesByPage, setRedoStrokesByPage] = useState({});
  const [capturesByPage, setCapturesByPage] = useState({});
  const [pendingChatAttachmentByNote, setPendingChatAttachmentByNote] = useState({});
  const [pdfByNote, setPdfByNote] = useState({});
  const [pdfPreviewByNote, setPdfPreviewByNote] = useState({});
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [chatSessionByNote, setChatSessionByNote] = useState({});
  const [dragPayload, setDragPayload] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [pageJumpInput, setPageJumpInput] = useState("1");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(320);
  const [annotationMode, setAnnotationMode] = useState("draw");
  const [toolMenu, setToolMenu] = useState(null);
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [penWidth, setPenWidth] = useState(28);
  const [eraserMode, setEraserMode] = useState("partial");
  const [captureMode, setCaptureMode] = useState("freeform");
  const [captureSelection, setCaptureSelection] = useState(null);
  const [strokeSelection, setStrokeSelection] = useState(null);
  const [selectionMoveState, setSelectionMoveState] = useState(null);
  const [pageZoom, setPageZoom] = useState(1);
  const [dragging, setDragging] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const typingTextareaRefs = useRef({});
  const uploadUrlsRef = useRef([]);
  const annotationStageRef = useRef(null);
  const annotationScrollRef = useRef(null);
  const chatThreadRef = useRef(null);
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
  const strokesByPageRef = useRef({});
  const undoHistoryRef = useRef([]);
  const redoHistoryRef = useRef([]);
  const isApplyingHistoryRef = useRef(false);
  const saveStatusTimerRef = useRef(null);
  const hydratedNotesRef = useRef(new Set());
  const isHydratingRemoteRef = useRef(false);
  const pageSaveTimerRef = useRef(null);
  const [pdfPageSizes, setPdfPageSizes] = useState([]);
  const [pdfPageTextsByNote, setPdfPageTextsByNote] = useState({});
  const [pdfRenderError, setPdfRenderError] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(0);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? EMPTY_NOTE;
  const currentPageIndex = pageByNote[selectedNote.id] ?? 0;
  const safeContentPageIndex = Math.min(currentPageIndex, selectedNote.pages.length - 1);
  const currentPage = selectedNote.pages[safeContentPageIndex];
  const pageKey = `${selectedNote.id}:${currentPageIndex}`;
  const currentNote = notesByPage[pageKey] ?? "";
  const currentUploads = uploadsByPage[pageKey] ?? [];
  const currentPdf = pdfByNote[selectedNote.id] ?? null;
  const messages = chatByNote[selectedNote.id] ?? INITIAL_MESSAGES;
  const pendingChatAttachment = pendingChatAttachmentByNote[selectedNote.id] ?? null;
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null;
  const renderedPageCount = pdfPageCount || selectedNote.pages.length;
  const extractedPdfPageTexts = pdfPageTextsByNote[selectedNote.id] ?? [];
  const hasSelectedNote = Boolean(selectedNote.id);

  const nearbyPages = useMemo(() => {
    return selectedNote.pages.filter((_, index) => Math.abs(index - safeContentPageIndex) <= 1);
  }, [safeContentPageIndex, selectedNote.pages]);

  const nearbyPageIndexes = useMemo(() => {
    return selectedNote.pages
      .map((_, index) => index)
      .filter((index) => Math.abs(index - safeContentPageIndex) <= 1);
  }, [safeContentPageIndex, selectedNote.pages]);

  const currentPageTextForAI =
    extractedPdfPageTexts[safeContentPageIndex]?.trim() || currentPage.text || "";

  const nearbyPagesTextForAI = nearbyPageIndexes.map((pageIndex) => {
    return extractedPdfPageTexts[pageIndex]?.trim() || selectedNote.pages[pageIndex]?.text || "";
  });

  const nearbyPagesForAI = nearbyPageIndexes.map((pageIndex) => ({
    page_index: pageIndex + 1,
    text: extractedPdfPageTexts[pageIndex]?.trim() || selectedNote.pages[pageIndex]?.text || "",
  }));

  const getVisiblePageIndex = () => {
    const element = annotationScrollRef.current;
    if (!element) {
      return safeContentPageIndex;
    }

    const containerRect = element.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height * 0.5;
    const pageEntries = Object.entries(pageSurfaceRefs.current)
      .map(([index, node]) => {
        if (!node) {
          return null;
        }

        const rect = node.getBoundingClientRect();
        return {
          index: Number(index),
          rect,
          distance: Math.abs(rect.top + rect.height * 0.5 - containerCenter),
        };
      })
      .filter((entry) => entry && Number.isFinite(entry.distance));

    if (pageEntries.length === 0) {
      return safeContentPageIndex;
    }

    const containingEntry = pageEntries.find(
      (entry) => entry.rect.top <= containerCenter && entry.rect.bottom >= containerCenter,
    );
    const nearest = pageEntries.reduce((best, entry) =>
      entry.distance < best.distance ? entry : best,
    );

    return containingEntry?.index ?? nearest.index;
  };

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
  const visibleFolderCards = useMemo(() => {
    if (selectedNav === "folders") {
      return folders.filter((folder) => !folder.deleted);
    }
    if (selectedNav === "trash") {
      return folders.filter((folder) => folder.deleted);
    }
    return [];
  }, [folders, selectedNav]);

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
    if (screen !== "home" || visibleHomeNotes.length === 0) {
      return undefined;
    }

    let cancelled = false;

    const renderVisibleThumbnails = async () => {
      await Promise.all(
        visibleHomeNotes.map(async (note) => {
          const pdfInfo = pdfByNote[note.id] ?? {
            name: "4_Maximum likelihood learning.pdf",
            previewUrl: DEFAULT_PDF_PATH,
            isBundled: true,
          };
          const firstPageStrokes = strokesByPage[`${note.id}:0`] ?? note.previewStrokes ?? [];
          const strokeSignature = JSON.stringify(
            firstPageStrokes.map((stroke) => ({
              id: stroke.id,
              color: stroke.color,
              width: stroke.width,
              points: stroke.points,
            })),
          );
          const cacheKey = `${note.id}:${pdfInfo.previewUrl}:${strokeSignature}`;

          if (pdfPreviewByNote[note.id]?.cacheKey === cacheKey) {
            return;
          }

          try {
            const imageUrl = await renderPdfFirstPageThumbnail(pdfInfo.previewUrl, firstPageStrokes);
            if (cancelled) {
              return;
            }
            setPdfPreviewByNote((current) => ({
              ...current,
              [note.id]: {
                cacheKey,
                imageUrl,
              },
            }));
          } catch (error) {
            console.error("Failed to render note preview thumbnail:", error);
          }
        }),
      );
    };

    renderVisibleThumbnails();

    return () => {
      cancelled = true;
    };
  }, [pdfByNote, pdfPreviewByNote, screen, strokesByPage, visibleHomeNotes]);

  const hydrateNoteDetail = async (noteId) => {
    if (!noteId) {
      return;
    }

    isHydratingRemoteRef.current = true;
    try {
      const detail = await fetchJson(`${API_BASE_URL}/api/notes/${noteId}`);
      const normalizedNoteId = String(detail.id);

      setNotes((current) =>
        current.map((note) =>
          note.id === normalizedNoteId ? mapNoteFromApi(detail, note) : note,
        ),
      );

      const nextNotesByPage = {};
      const nextStrokesByPage = {};
      const nextUploadsByPage = {};

      (detail.pages ?? []).forEach((page) => {
        const pageIndex = page.page_index - 1;
        const notePageKey = `${normalizedNoteId}:${pageIndex}`;
        nextNotesByPage[notePageKey] = page.typed_text ?? "";

        try {
          nextStrokesByPage[notePageKey] = page.handwriting_data ? JSON.parse(page.handwriting_data) : [];
        } catch {
          nextStrokesByPage[notePageKey] = [];
        }

        try {
          const savedUploads = page.image_data ? JSON.parse(page.image_data) : [];
          nextUploadsByPage[notePageKey] = savedUploads.filter(
            (upload) => typeof upload?.previewUrl === "string" && !upload.previewUrl.startsWith("blob:"),
          );
        } catch {
          nextUploadsByPage[notePageKey] = [];
        }
      });

      notesByPageRef.current = {
        ...notesByPageRef.current,
        ...nextNotesByPage,
      };
      strokesByPageRef.current = {
        ...strokesByPageRef.current,
        ...nextStrokesByPage,
      };
      setNotesByPage(notesByPageRef.current);
      setStrokesByPage(strokesByPageRef.current);
      setUploadsByPage((current) => ({
        ...current,
        ...nextUploadsByPage,
      }));

      const existingSessions = detail.chat_sessions ?? [];
      let activeSession = existingSessions[0] ?? null;

      if (!activeSession) {
        activeSession = await fetchJson(`${API_BASE_URL}/api/notes/${noteId}/chat-sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "새 AI 대화" }),
        });
      }

      setChatSessionByNote((current) => ({
        ...current,
        [normalizedNoteId]: activeSession.id,
      }));

      const sessionDetail = await fetchJson(`${API_BASE_URL}/api/chat-sessions/${activeSession.id}`);
      const sessionMessages = (sessionDetail.messages ?? []).map((message) => ({
        id: `db-message-${message.id}`,
        role: message.role,
        text: message.content,
      }));

      setChatByNote((current) => ({
        ...current,
        [normalizedNoteId]: sessionMessages.length > 0 ? sessionMessages : INITIAL_MESSAGES,
      }));

      hydratedNotesRef.current.add(normalizedNoteId);
    } finally {
      isHydratingRemoteRef.current = false;
    }
  };

  const loadStorageData = async () => {
    setIsStorageLoading(true);
    setStorageError("");

    try {
      const [folderData, noteData] = await Promise.all([
        fetchJson(`${API_BASE_URL}/api/folders`),
        fetchJson(`${API_BASE_URL}/api/notes`),
      ]);

      const noteDetails = await Promise.all(
        noteData.map(async (note) => {
          try {
            return await fetchJson(`${API_BASE_URL}/api/notes/${note.id}`);
          } catch {
            return note;
          }
        }),
      );

      const nextFolders = folderData.map(mapFolderFromApi);
      const nextNotes = noteDetails.map((note) => mapNoteFromApi(note));

      setFolders(nextFolders);
      setNotes(nextNotes);
      setPageByNote((current) => {
        const nextPageByNote = { ...current };
        nextNotes.forEach((note) => {
          if (!(note.id in nextPageByNote)) {
            nextPageByNote[note.id] = 0;
          }
        });
        return nextPageByNote;
      });
      setSelectedNoteId((current) => current ?? nextNotes.find((note) => !note.deleted)?.id ?? nextNotes[0]?.id ?? null);
    } catch (error) {
      console.error("Failed to load storage data:", error);
      setStorageError("DB에서 노트와 폴더를 불러오지 못했습니다.");
    } finally {
      setIsStorageLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      uploadUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      if (drawSyncFrameRef.current) {
        window.cancelAnimationFrame(drawSyncFrameRef.current);
      }
      if (saveStatusTimerRef.current) {
        window.clearTimeout(saveStatusTimerRef.current);
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
    if (!selectedNoteId || hydratedNotesRef.current.has(selectedNoteId)) {
      return;
    }

    hydrateNoteDetail(selectedNoteId).catch((error) => {
      console.error("Failed to hydrate note detail:", error);
      setStorageError("노트 상세 데이터를 불러오지 못했습니다.");
    });
  }, [selectedNoteId]);

  useEffect(() => {
    if (!selectedNote.id) {
      return;
    }

    setPdfByNote((current) => {
      if (current[selectedNote.id]) {
        return current;
      }

      return {
        ...current,
        [selectedNote.id]: {
          name: "4_Maximum likelihood learning.pdf",
          previewUrl: DEFAULT_PDF_PATH,
          isBundled: true,
        },
      };
    });
  }, [selectedNote.id]);

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    try {
      const savedPages = localStorage.getItem("campus-notes-page-index");
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
    notesByPageRef.current = notesByPage;
  }, [notesByPage]);

  useEffect(() => {
    strokesByPageRef.current = strokesByPage;
  }, [strokesByPage]);

  useEffect(() => {
    localStorage.setItem("campus-notes-redo-strokes", JSON.stringify(redoStrokesByPage));
  }, [redoStrokesByPage]);

  useEffect(() => {
    localStorage.setItem("campus-notes-page-index", JSON.stringify(pageByNote));
  }, [pageByNote]);

  useEffect(() => {
    setPageJumpInput(String(currentPageIndex + 1));
  }, [currentPageIndex, selectedNote.id]);

  useEffect(() => {
    if (screen !== "note" || !rightOpen || !chatThreadRef.current) {
      return undefined;
    }

    const scrollFrame = window.requestAnimationFrame(() => {
      const chatThread = chatThreadRef.current;
      if (chatThread) {
        chatThread.scrollTop = chatThread.scrollHeight;
      }
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [isThinking, messages.length, rightOpen, screen, selectedNote.id]);

  useEffect(() => {
    setSaveStatus("saving");
    if (saveStatusTimerRef.current) {
      window.clearTimeout(saveStatusTimerRef.current);
    }
    saveStatusTimerRef.current = window.setTimeout(() => {
      setSaveStatus("saved");
      saveStatusTimerRef.current = null;
    }, 280);
  }, [notesByPage, pageByNote, redoStrokesByPage, strokesByPage]);

  useEffect(() => {
    if (isHydratingRemoteRef.current || !selectedNote.id) {
      return undefined;
    }

    if (pageSaveTimerRef.current) {
      window.clearTimeout(pageSaveTimerRef.current);
    }

    pageSaveTimerRef.current = window.setTimeout(async () => {
      const noteId = selectedNote.id;
      const noteKeys = new Set([
        ...Object.keys(notesByPageRef.current),
        ...Object.keys(strokesByPageRef.current),
        ...Object.keys(uploadsByPage),
      ]);

      const pagesToPersist = [...noteKeys]
        .filter((key) => key.startsWith(`${noteId}:`))
        .map((key) => Number(key.split(":")[1]))
        .filter((value) => Number.isFinite(value));

      if (pagesToPersist.length === 0) {
        return;
      }

      try {
        await Promise.all(
          [...new Set(pagesToPersist)].map((pageIndex) =>
            fetchJson(`${API_BASE_URL}/api/notes/${noteId}/pages/${pageIndex + 1}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                typed_text: notesByPageRef.current[`${noteId}:${pageIndex}`] ?? "",
                handwriting_data: JSON.stringify(strokesByPageRef.current[`${noteId}:${pageIndex}`] ?? []),
                image_data: JSON.stringify(
                  (uploadsByPage[`${noteId}:${pageIndex}`] ?? []).map((upload) => ({
                    id: upload.id,
                    name: upload.name,
                    analysis: upload.analysis,
                    previewUrl:
                      typeof upload.previewUrl === "string" && !upload.previewUrl.startsWith("blob:")
                        ? upload.previewUrl
                        : "",
                  })),
                ),
              }),
            }),
          ),
        );
      } catch (error) {
        console.error("Failed to persist note pages:", error);
        setStorageError("페이지 메모를 DB에 저장하지 못했습니다.");
      }
    }, 500);

    return () => {
      if (pageSaveTimerRef.current) {
        window.clearTimeout(pageSaveTimerRef.current);
      }
    };
  }, [notesByPage, selectedNote.id, strokesByPage, uploadsByPage]);

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
        setPdfPageTextsByNote((current) => ({
          ...current,
          [selectedNote.id]: [],
        }));
        const loadingTask = getDocument(currentPdf.previewUrl);
        pdfDocument = await loadingTask.promise;
        const totalPages = pdfDocument.numPages;
        setPdfPageCount(totalPages);
        const containerWidth = Math.min(annotationStageRef.current.clientWidth - 80, 860);
        const nextSizes = [];
        const nextPageTexts = [];

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const canvas = pdfCanvasRefs.current[pageNumber - 1];
          const textContent = await page.getTextContent();
          nextPageTexts[pageNumber - 1] = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

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
          setPdfPageTextsByNote((current) => ({
            ...current,
            [selectedNote.id]: nextPageTexts,
          }));
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
  }, [currentPdf, screen, selectedNote.id]);

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
      const nextPageIndex = getVisiblePageIndex();

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
  }, [screen, selectedNote.id, safeContentPageIndex]);

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

  const activateDrawMode = () => {
    setAnnotationMode("draw");
    setToolMenu((current) => (current === "draw" ? null : "draw"));
  };

  const activateEraseMode = () => {
    setAnnotationMode("erase");
    setToolMenu((current) => (current === "erase" ? null : "erase"));
  };

  const activateCaptureMode = () => {
    setAnnotationMode("capture");
    setToolMenu((current) => (current === "capture" ? null : "capture"));
  };

  const updateStrokeSelection = (pageIndex, strokeIds) => {
    const targetPageKey = `${selectedNote.id}:${pageIndex}`;
    const pageStrokes = strokesByPageRef.current[targetPageKey] ?? [];
    const selectedStrokes = pageStrokes.filter((stroke) => strokeIds.includes(stroke.id));
    const bounds = getStrokeBounds(selectedStrokes);

    if (!bounds || selectedStrokes.length === 0) {
      setStrokeSelection(null);
      return null;
    }

    const nextSelection = {
      pageIndex,
      pageKey: targetPageKey,
      strokeIds: selectedStrokes.map((stroke) => stroke.id),
      bounds,
    };
    setStrokeSelection(nextSelection);
    return nextSelection;
  };

  const handleSelectionCopy = () => {
    if (!strokeSelection) {
      return;
    }

    const currentPageStrokes = strokesByPageRef.current[strokeSelection.pageKey] ?? [];
    const selectedIds = new Set(strokeSelection.strokeIds);
    const copiedStrokes = currentPageStrokes
      .filter((stroke) => selectedIds.has(stroke.id))
      .map((stroke, index) => ({
        ...offsetStrokePoints(stroke, 0.02, 0.02),
        id: `${stroke.id}-copy-${Date.now()}-${index}`,
      }));

    if (copiedStrokes.length === 0) {
      return;
    }

    const nextStrokes = [...currentPageStrokes, ...copiedStrokes];
    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [strokeSelection.pageKey]: nextStrokes,
    };
    setStrokesByPage(strokesByPageRef.current);
    setRedoStrokesByPage((current) => ({
      ...current,
      [strokeSelection.pageKey]: [],
    }));
    pushHistory({
      kind: "page-strokes-replace",
      pageKey: strokeSelection.pageKey,
      beforeStrokes: currentPageStrokes,
      afterStrokes: nextStrokes,
    });
    updateStrokeSelection(strokeSelection.pageIndex, copiedStrokes.map((stroke) => stroke.id));
    setContextMenu(null);
  };

  const handleSelectionDelete = () => {
    if (!strokeSelection) {
      return;
    }

    const currentPageStrokes = strokesByPageRef.current[strokeSelection.pageKey] ?? [];
    const selectedIds = new Set(strokeSelection.strokeIds);
    const nextStrokes = currentPageStrokes.filter((stroke) => !selectedIds.has(stroke.id));

    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [strokeSelection.pageKey]: nextStrokes,
    };
    setStrokesByPage(strokesByPageRef.current);
    setRedoStrokesByPage((current) => ({
      ...current,
      [strokeSelection.pageKey]: [],
    }));
    pushHistory({
      kind: "page-strokes-replace",
      pageKey: strokeSelection.pageKey,
      beforeStrokes: currentPageStrokes,
      afterStrokes: nextStrokes,
    });
    setStrokeSelection(null);
    setContextMenu(null);
  };

  const handleSelectionStyleChange = () => {
    if (!strokeSelection) {
      return;
    }

    const currentPageStrokes = strokesByPageRef.current[strokeSelection.pageKey] ?? [];
    const selectedIds = new Set(strokeSelection.strokeIds);
    const sampleStroke = currentPageStrokes.find((stroke) => selectedIds.has(stroke.id)) ?? null;
    const nextColor = window.prompt("변경할 색상 코드를 입력하세요.", sampleStroke?.color ?? penColor);
    if (!nextColor?.trim()) {
      return;
    }

    const nextWidthInput = window.prompt(
      "변경할 두께를 입력하세요. (1-24)",
      String(Math.round(sampleStroke?.width ?? mapPenWidthToStrokeWidth(penWidth))),
    );
    if (!nextWidthInput?.trim()) {
      return;
    }

    const nextWidth = clamp(Number(nextWidthInput), 1, 24);
    if (!Number.isFinite(nextWidth)) {
      return;
    }

    const nextStrokes = currentPageStrokes.map((stroke) =>
      selectedIds.has(stroke.id)
        ? { ...stroke, color: nextColor.trim(), width: nextWidth }
        : stroke,
    );

    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [strokeSelection.pageKey]: nextStrokes,
    };
    setStrokesByPage(strokesByPageRef.current);
    setRedoStrokesByPage((current) => ({
      ...current,
      [strokeSelection.pageKey]: [],
    }));
    pushHistory({
      kind: "page-strokes-replace",
      pageKey: strokeSelection.pageKey,
      beforeStrokes: currentPageStrokes,
      afterStrokes: nextStrokes,
    });
    updateStrokeSelection(strokeSelection.pageIndex, strokeSelection.strokeIds);
    setContextMenu(null);
  };

  const handleSelectionMoveRequest = () => {
    if (!strokeSelection) {
      return;
    }

    setSelectionMoveState(strokeSelection);
    setContextMenu(null);
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

  const handleFolderSelect = (folderId) => {
    setSelectedNav("folders");
    setScreen("home");
    setSelectedFolderId(folderId);
    setSearchQuery("");
  };

  const activateTextMode = () => {
    setAnnotationMode("text");
    setToolMenu(null);
  };

  const handleJumpToPage = () => {
    const nextPageIndex = clamp(Number(pageJumpInput) - 1, 0, Math.max(renderedPageCount - 1, 0));
    setPageByNote((current) => ({
      ...current,
      [selectedNote.id]: nextPageIndex,
    }));
    scrollToPage(nextPageIndex);
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

  const handleCreateNote = async () => {
    const name = window.prompt("새 노트 이름을 입력하세요.");
    if (!name?.trim()) {
      return;
    }

    try {
      const folderId = selectedNav === "folders" ? selectedFolderId : null;
      const createdNote = await fetchJson(`${API_BASE_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: name.trim(),
          code: "NEW",
          folder_id: folderId ? Number(folderId) : null,
          favorite: false,
        }),
      });

      await fetchJson(`${API_BASE_URL}/api/notes/${createdNote.id}/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_index: 1,
          typed_text: "",
          handwriting_data: "[]",
          image_data: "[]",
        }),
      });

      const newNote = mapNoteFromApi(
        {
          ...createdNote,
          pages: [{ page_index: 1, typed_text: "" }],
        },
      );

      setNotes((current) => [newNote, ...current]);
      setPageByNote((current) => ({ ...current, [newNote.id]: 0 }));
      setChatByNote((current) => ({ ...current, [newNote.id]: INITIAL_MESSAGES }));
      setSelectedNoteId(newNote.id);
      setScreen("note");
      hydratedNotesRef.current.delete(newNote.id);
    } catch (error) {
      console.error("Failed to create note:", error);
      window.alert("노트를 DB에 저장하지 못했습니다.");
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("새 폴더 이름을 입력하세요.");
    if (!name?.trim()) {
      return;
    }

    try {
      const createdFolder = await fetchJson(`${API_BASE_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const newFolder = mapFolderFromApi(createdFolder);
      setFolders((current) => [newFolder, ...current]);
      setSelectedNav("folders");
      setSelectedFolderId(newFolder.id);
    } catch (error) {
      console.error("Failed to create folder:", error);
      window.alert("폴더를 DB에 저장하지 못했습니다.");
    }
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

  const handleConfirmAction = async () => {
    if (!confirmDialog) {
      return;
    }

    if (confirmDialog.kind === "note-delete") {
      try {
        const updated = await fetchJson(`${API_BASE_URL}/api/notes/${confirmDialog.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted: true, favorite: false }),
        });

        setNotes((current) =>
          current.map((note) =>
            note.id === String(updated.id) ? mapNoteFromApi(updated, note) : note,
          ),
        );
      } catch (error) {
        console.error("Failed to delete note:", error);
        window.alert("노트를 휴지통으로 옮기지 못했습니다.");
        return;
      }
    }

    if (confirmDialog.kind === "folder-delete") {
      try {
        const updatedFolder = await fetchJson(`${API_BASE_URL}/api/folders/${confirmDialog.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted: true }),
        });

        const notesInFolder = notes.filter((note) => note.folderId === String(confirmDialog.id));
        await Promise.all(
          notesInFolder.map((note) =>
            fetchJson(`${API_BASE_URL}/api/notes/${note.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ deleted: true, favorite: false }),
            }),
          ),
        );

        setFolders((current) =>
          current.map((folder) =>
            folder.id === String(updatedFolder.id) ? mapFolderFromApi(updatedFolder) : folder,
          ),
        );
        setNotes((current) =>
          current.map((note) =>
            note.folderId === String(confirmDialog.id)
              ? { ...note, deleted: true, favorite: false, updatedAt: "방금 휴지통으로 이동됨" }
              : note,
          ),
        );
      } catch (error) {
        console.error("Failed to delete folder:", error);
        window.alert("폴더를 휴지통으로 옮기지 못했습니다.");
        return;
      }
      if (selectedFolderId === confirmDialog.id) {
        setSelectedFolderId(null);
      }
    }

    setConfirmDialog(null);
    setContextMenu(null);
  };

  const handleToggleFavorite = async (noteId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
      return;
    }

    try {
      const updated = await fetchJson(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !note.favorite }),
      });

      setNotes((current) =>
        current.map((item) =>
          item.id === String(updated.id) ? mapNoteFromApi(updated, item) : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update favorite state:", error);
      window.alert("즐겨찾기 상태를 저장하지 못했습니다.");
    }
    setContextMenu(null);
  };

  const handleNoteCardKeyDown = (event, noteId) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openNote(noteId);
  };

  const handleCardDragStart = (event, payload) => {
    setDragPayload(payload);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${payload.type}:${payload.id}`);
  };

  const handleCardDragEnd = () => {
    setDragPayload(null);
    setDragOverFolderId(null);
  };

  const moveNoteToFolder = async (noteId, targetFolderId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note || note.folderId === targetFolderId) {
      return;
    }

    const previousFolderId = note.folderId;
    setNotes((current) =>
      current.map((item) =>
        item.id === noteId ? { ...item, folderId: targetFolderId, updatedAt: "방금 폴더로 이동됨" } : item,
      ),
    );

    try {
      const updated = await fetchJson(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: Number(targetFolderId) }),
      });

      setNotes((current) =>
        current.map((item) =>
          item.id === String(updated.id) ? mapNoteFromApi(updated, item) : item,
        ),
      );
    } catch (error) {
      console.error("Failed to move note to folder:", error);
      setNotes((current) =>
        current.map((item) =>
          item.id === noteId ? { ...item, folderId: previousFolderId } : item,
        ),
      );
      window.alert("노트를 폴더로 이동하지 못했습니다.");
    }
  };

  const handleFolderDragOver = (event, folderId) => {
    if (!dragPayload || (dragPayload.type === "folder" && dragPayload.id === folderId)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleFolderDrop = async (event, targetFolderId) => {
    event.preventDefault();
    event.stopPropagation();

    const payload = dragPayload;
    setDragPayload(null);
    setDragOverFolderId(null);

    if (!payload) {
      return;
    }

    if (payload.type === "note") {
      await moveNoteToFolder(payload.id, targetFolderId);
      return;
    }

    window.alert("폴더 안에 폴더를 넣는 기능은 폴더 중첩 저장 구조가 추가된 뒤 연결할 수 있습니다.");
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

  const handleRenameFolder = async (folderId) => {
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) {
      return;
    }

    const nextName = window.prompt("폴더 이름을 수정하세요.", folder.name);
    if (!nextName?.trim()) {
      return;
    }

    try {
      const updated = await fetchJson(`${API_BASE_URL}/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName.trim() }),
      });

      setFolders((current) =>
        current.map((item) =>
          item.id === String(updated.id) ? mapFolderFromApi(updated) : item,
        ),
      );
    } catch (error) {
      console.error("Failed to rename folder:", error);
      window.alert("폴더 이름을 저장하지 못했습니다.");
      return;
    }
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

    if (entry.kind === "page-strokes-replace") {
      const nextStrokes = direction === "undo" ? entry.beforeStrokes : entry.afterStrokes;
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

    if (selectionMoveState && selectionMoveState.pageIndex === pageIndex) {
      const point = getAnnotationPoint(pageIndex, event);
      if (!point) {
        return;
      }

      const targetPageKey = `${selectedNote.id}:${pageIndex}`;
      const currentPageStrokes = strokesByPageRef.current[targetPageKey] ?? [];
      const selectedIds = new Set(selectionMoveState.strokeIds);
      const deltaX = point.x - selectionMoveState.bounds.x;
      const deltaY = point.y - selectionMoveState.bounds.y;
      const nextStrokes = currentPageStrokes.map((stroke) =>
        selectedIds.has(stroke.id) ? offsetStrokePoints(stroke, deltaX, deltaY) : stroke,
      );

      strokesByPageRef.current = {
        ...strokesByPageRef.current,
        [targetPageKey]: nextStrokes,
      };
      setStrokesByPage(strokesByPageRef.current);
      setRedoStrokesByPage((current) => ({
        ...current,
        [targetPageKey]: [],
      }));
      pushHistory({
        kind: "page-strokes-replace",
        pageKey: targetPageKey,
        beforeStrokes: currentPageStrokes,
        afterStrokes: nextStrokes,
      });
      updateStrokeSelection(pageIndex, selectionMoveState.strokeIds);
      setSelectionMoveState(null);
      event.preventDefault();
      event.stopPropagation();
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
      setCaptureSelection({ pageIndex, mode: captureMode, startPoint: point, points: [point] });
      return;
    }

    if (annotationMode === "erase") {
      setStrokeSelection(null);
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
    setStrokeSelection(null);
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
        {
          id: strokeId,
          points: liveStrokePointsRef.current,
          color: penColor,
          width: mapPenWidthToStrokeWidth(penWidth),
        },
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

        if (current.mode === "rectangle" && current.startPoint) {
          return {
            ...current,
            points: buildRectangleSelectionPoints(current.startPoint, point),
          };
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
      const targetPage = selectedNote.pages[Math.min(pageIndex, selectedNote.pages.length - 1)] ?? currentPage;

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
        pageStrokes.forEach((stroke) => {
          if (stroke.points.length < 2) {
            return;
          }

          exportContext.strokeStyle = stroke.color ?? "#1d4ed8";
          exportContext.lineWidth = stroke.width ?? 4;
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
          analysis: makeCaptureChatAnalysis(targetPage, (capturesByPage[pageKeyForCapture] ?? []).length + 1, 0),
        };

        setCapturesByPage((current) => ({
          ...current,
          [pageKeyForCapture]: [...(current[pageKeyForCapture] ?? []), capture],
        }));

        const selectedStrokeIds = pageStrokes
          .filter((stroke) => strokeIntersectsPolygon(stroke, points))
          .map((stroke) => stroke.id);
        const selectedCount = selectedStrokeIds.length;

        capture.analysis = makeCaptureChatAnalysis(targetPage, (capturesByPage[pageKeyForCapture] ?? []).length + 1, selectedCount);

        if (selectedStrokeIds.length > 0) {
          updateStrokeSelection(pageIndex, selectedStrokeIds);
        } else {
          setStrokeSelection(null);
        }

        setPendingChatAttachmentByNote((current) => ({
          ...current,
          [selectedNote.id]: {
            id: capture.id,
            previewUrl: capture.previewUrl,
            imageLabel: `${pageIndex + 1}페이지 캡처`,
            analysis: capture.analysis,
          },
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
    if (eraserMode === "stroke") {
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
      return;
    }

    let touched = false;
    const nextStrokes = currentPageStrokes.flatMap((stroke) => {
      const result = splitStrokeByPoint(stroke, point);
      if (result.touched) {
        touched = true;
      }
      return result.nextStrokes;
    });

    if (!touched) {
      return;
    }

    setRedoStrokesByPage((current) => ({
      ...current,
      [targetPageKey]: [],
    }));
    strokesByPageRef.current = {
      ...strokesByPageRef.current,
      [targetPageKey]: nextStrokes,
    };
    setStrokesByPage(strokesByPageRef.current);
    pushHistory({
      kind: "page-strokes-replace",
      pageKey: targetPageKey,
      beforeStrokes: currentPageStrokes,
      afterStrokes: nextStrokes,
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

  const handleAnnotationContextMenu = (pageIndex, event) => {
    if (!strokeSelection || strokeSelection.pageIndex !== pageIndex) {
      return;
    }

    const point = getAnnotationPoint(pageIndex, event);
    if (!point || !selectionContainsPoint(strokeSelection.bounds, point)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      type: "stroke-selection",
      x: event.clientX,
      y: event.clientY,
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

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();
    const queuedAttachment = pendingChatAttachmentByNote[selectedNote.id] ?? null;
    if (!hasSelectedNote || (!trimmedQuestion && !queuedAttachment) || isThinking) {
      return;
    }

    const visiblePageIndex = getVisiblePageIndex();
    const nextPageIndex = clamp(visiblePageIndex, 0, Math.max(renderedPageCount - 1, 0));
    const nextSafeContentPageIndex = Math.min(nextPageIndex, selectedNote.pages.length - 1);
    const nextPageKey = `${selectedNote.id}:${nextPageIndex}`;
    const nextCurrentPage = selectedNote.pages[nextSafeContentPageIndex] ?? currentPage;
    const nextCurrentNote = notesByPageRef.current[nextPageKey] ?? "";
    const nextCurrentUploads = uploadsByPage[nextPageKey] ?? [];
    const nextNearbyPageIndexes = Array.from({ length: renderedPageCount }, (_, index) => index)
      .filter((index) => Math.abs(index - nextPageIndex) <= 1);
    const nextCurrentPageTextForAI =
      extractedPdfPageTexts[nextPageIndex]?.trim() || nextCurrentPage.text || "";
    const nextNearbyPagesTextForAI = nextNearbyPageIndexes.map((pageIndex) => {
      const fallbackPage = selectedNote.pages[Math.min(pageIndex, selectedNote.pages.length - 1)];
      return extractedPdfPageTexts[pageIndex]?.trim() || fallbackPage?.text || "";
    });
    const nextNearbyPagesForAI = nextNearbyPageIndexes.map((pageIndex) => ({
      page_index: pageIndex + 1,
      text:
        extractedPdfPageTexts[pageIndex]?.trim()
        || selectedNote.pages[Math.min(pageIndex, selectedNote.pages.length - 1)]?.text
        || "",
    }));

    setPageByNote((current) =>
      current[selectedNote.id] === nextPageIndex
        ? current
        : { ...current, [selectedNote.id]: nextPageIndex },
    );

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedQuestion || "영역 캡처 이미지를 보냈습니다.",
      imageUrl: queuedAttachment?.previewUrl,
      imageLabel: queuedAttachment?.imageLabel,
    };

    setChatByNote((current) => ({
      ...current,
      [selectedNote.id]: [
        ...(current[selectedNote.id] ?? []).filter((message) => message.id !== WELCOME_MESSAGE_ID),
        userMessage,
      ],
    }));
    setPendingChatAttachmentByNote((current) => ({
      ...current,
      [selectedNote.id]: null,
    }));
    setQuestion("");
    setIsThinking(true);

    try {
      let activeSessionId = chatSessionByNote[selectedNote.id] ?? null;
      if (!activeSessionId) {
        const createdSession = await fetchJson(`${API_BASE_URL}/api/notes/${selectedNote.id}/chat-sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "새 AI 대화" }),
        });
        activeSessionId = createdSession.id;
        setChatSessionByNote((current) => ({
          ...current,
          [selectedNote.id]: activeSessionId,
        }));
      }

      await fetchJson(`${API_BASE_URL}/api/chat-sessions/${activeSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: trimmedQuestion || "영역 캡처 이미지를 보냈습니다.",
          capture_analysis: queuedAttachment?.analysis ?? "",
        }),
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          current_page_index: nextPageIndex + 1,
          total_page_count: renderedPageCount,
          current_page_text: nextCurrentPageTextForAI,
          nearby_pages_text: nextNearbyPagesTextForAI,
          nearby_pages: nextNearbyPagesForAI,
          user_note: nextCurrentNote,
          capture_analysis: queuedAttachment?.analysis ?? "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.answer,
      };

      await fetchJson(`${API_BASE_URL}/api/chat-sessions/${activeSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: data.answer,
          capture_analysis: "",
        }),
      });

      setChatByNote((current) => ({
        ...current,
        [selectedNote.id]: [...(current[selectedNote.id] ?? []), assistantMessage],
      }));
    } catch (error) {
      const latestImage = currentUploads[currentUploads.length - 1];
      const answer = buildMockAnswer(
        trimmedQuestion,
        nextCurrentPage,
        selectedNote.pages.filter((_, index) => Math.abs(index - nextSafeContentPageIndex) <= 1),
        nextCurrentNote,
        queuedAttachment
          ? { analysis: queuedAttachment.analysis, previewUrl: queuedAttachment.previewUrl }
          : nextCurrentUploads[nextCurrentUploads.length - 1] ?? latestImage,
      );

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: `${answer}\n\n(백엔드 연결 실패로 mock 응답을 대신 표시했습니다.)`,
      };

      setChatByNote((current) => ({
        ...current,
        [selectedNote.id]: [...(current[selectedNote.id] ?? []), assistantMessage],
      }));
      console.error("Failed to call /api/chat:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  };

  const mainTitle =
    selectedNav === "folders" && selectedFolder
      ? selectedFolder.name
      : NAV_ITEMS.find((item) => item.id === selectedNav)?.label ?? "폴더";

  const noteDetailGridColumns =
    screen === "note"
      ? "minmax(0, 1fr)"
      : leftOpen
        ? "284px minmax(0, 1fr)"
        : `${COLLAPSED_RAIL}px minmax(0, 1fr)`;

  const noteWorkspaceColumns = [
    rightOpen ? `${rightWidth}px` : "0px",
    rightOpen ? "8px" : "0px",
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
                    const Icon = NAV_ICONS[item.id];
                    const active = selectedNav === item.id && screen === "home";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`nav-item ${active ? "is-active" : ""}`}
                        onClick={() => openHome(item.id)}
                      >
                        <span className="nav-item-label">
                          <Icon
                            size={17}
                            strokeWidth={2.1}
                            fill={item.id === "favorites" && active ? "currentColor" : "none"}
                          />
                          {item.label}
                        </span>
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
              <div className="collapsed-sidebar" aria-label="접힌 메인 메뉴">
                <button
                  type="button"
                  className="collapsed-menu-button"
                  onClick={() => setLeftOpen(true)}
                  aria-label="왼쪽 사이드바 열기"
                  title="메뉴 열기"
                >
                  ☰
                </button>
                <nav className="collapsed-nav-list" aria-label="접힌 메인 메뉴">
                  {NAV_ITEMS.map((item) => {
                    const Icon = NAV_ICONS[item.id];
                    const active = selectedNav === item.id && screen === "home";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`collapsed-nav-item ${active ? "is-active" : ""}`}
                        onClick={() => openHome(item.id)}
                        aria-label={item.label}
                        title={item.label}
                      >
                        <Icon size={17} strokeWidth={2.1} fill={item.id === "favorites" && active ? "currentColor" : "none"} />
                      </button>
                    );
                  })}
                </nav>
              </div>
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

            {selectedNav === "folders" && selectedFolder ? (
              <div className="folder-breadcrumb" aria-label="현재 폴더 위치">
                <button
                  type="button"
                  className="folder-breadcrumb-icon"
                  onClick={() => setSelectedFolderId(null)}
                  aria-label="폴더 목록으로 돌아가기"
                  title="폴더 목록"
                >
                  <Folder size={17} strokeWidth={2} />
                </button>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className="folder-breadcrumb-current"
                  onClick={() => handleFolderSelect(selectedFolder.id)}
                  aria-label={`${selectedFolder.name} 폴더 열기`}
                  title={selectedFolder.name}
                >
                  {selectedFolder.name}
                </button>
              </div>
            ) : visibleFolderCards.length > 0 ? (
              <div className="folder-strip">
                {visibleFolderCards.map((folder) => {
                  const count = notes.filter((note) => {
                    if (note.folderId !== folder.id) {
                      return false;
                    }
                    if (selectedNav === "trash") {
                      return note.deleted;
                    }
                    return !note.deleted;
                  }).length;
                  const isActiveFolder = selectedNav === "folders" && selectedFolderId === folder.id;

                  return (
                    <button
                      key={folder.id}
                      type="button"
                      className={`folder-card samsung-folder-card ${
                        isActiveFolder ? "is-active" : ""
                      } ${dragOverFolderId === folder.id ? "is-drag-over" : ""} ${
                        dragPayload?.type === "folder" && dragPayload.id === folder.id ? "is-dragging" : ""
                      }`}
                      draggable
                      onDragStart={(event) => handleCardDragStart(event, { type: "folder", id: folder.id })}
                      onDragEnd={handleCardDragEnd}
                      onDragOver={(event) => handleFolderDragOver(event, folder.id)}
                      onDragLeave={() => setDragOverFolderId((current) => (current === folder.id ? null : current))}
                      onDrop={(event) => handleFolderDrop(event, folder.id)}
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
            ) : null}

            <div className="notes-toolbar-row">
              <button type="button" className="sort-chip">
                만든 날짜순
              </button>
            </div>

            <div className="note-card-grid samsung-note-grid">
              {visibleHomeNotes.map((note) => {
                const pdfPreview = pdfPreviewByNote[note.id]?.imageUrl ?? "";

                return (
                  <article
                    key={note.id}
                    className={`note-card samsung-note-card ${note.deleted ? "is-trash" : ""} ${
                      dragPayload?.type === "note" && dragPayload.id === note.id ? "is-dragging" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(event) => handleCardDragStart(event, { type: "note", id: note.id })}
                    onDragEnd={handleCardDragEnd}
                    onClick={() => openNote(note.id)}
                    onKeyDown={(event) => handleNoteCardKeyDown(event, note.id)}
                    onContextMenu={(event) => handleNoteContextMenu(event, note.id)}
                  >
                    <div className={`note-preview ${getPreviewVariant(note)} ${note.accent}`}>
                      <button
                        type="button"
                        className={`note-favorite-button ${note.favorite ? "is-active" : ""}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleFavorite(note.id);
                        }}
                        onContextMenu={(event) => event.stopPropagation()}
                        aria-label={note.favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                      >
                        <Star
                          size={16}
                          strokeWidth={2.1}
                          fill={note.favorite ? "currentColor" : "#ffffff"}
                        />
                      </button>
                      <div className="note-preview-content">
                        {pdfPreview ? (
                          <img src={pdfPreview} alt={`${note.name} 1페이지 미리보기`} />
                        ) : (
                          <div className="note-preview-loading" aria-label="1페이지 미리보기 준비 중" />
                        )}
                      </div>
                    </div>
                    <strong>{note.name}</strong>
                    <div className="note-card-meta compact">
                      <span>{note.updatedAt}</span>
                    </div>
                  </article>
                );
              })}

            </div>
          </section>
        ) : (
          <>
            <section className="panel workspace note-detail-panel">
              <div className="note-study-shell">
                <div className="note-workspace-grid" style={{ gridTemplateColumns: noteWorkspaceColumns }}>
                <div
                  className={`resize-handle note-inline-handle ${rightOpen ? "" : "is-hidden"}`}
                  onMouseDown={() => rightOpen && setDragging("note-ai")}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="AI 어시스턴트 너비 조절"
                />

                <div className="workspace-topbar note-toolbar-bar">
                  <div className="workspace-title-row">
                    <button type="button" className="back-link note-home-button" onClick={() => setScreen("home")} aria-label="메인으로">
                      <Home size={17} strokeWidth={2.1} />
                    </button>
                    <h2>{selectedNote.name}</h2>
                    <button
                      type="button"
                      className={`note-ai-toggle ${rightOpen ? "is-active" : ""}`}
                      onClick={() => setRightOpen((current) => !current)}
                      aria-label={rightOpen ? "AI 어시스턴트 접기" : "AI 어시스턴트 열기"}
                    >
                      <Sparkles size={17} strokeWidth={2.1} />
                    </button>
                  </div>
                  <div className="note-top-actions annotation-actions annotation-actions--compact">
                  <button
                    type="button"
                    title="손글씨"
                    aria-label="손글씨"
                    className={annotationMode === "draw" ? "is-active" : ""}
                    onClick={activateDrawMode}
                  >
                    <PenLine size={17} strokeWidth={2.1} />
                  </button>
                  <button
                    type="button"
                    title="타이핑"
                    aria-label="타이핑"
                    className={annotationMode === "text" ? "is-active" : ""}
                    onClick={activateTextMode}
                  >
                    <Type size={17} strokeWidth={2.1} />
                  </button>
                  <button
                    type="button"
                    title="지우개"
                    aria-label="지우개"
                    className={annotationMode === "erase" ? "is-active" : ""}
                    onClick={activateEraseMode}
                  >
                    <Eraser size={17} strokeWidth={2.1} />
                  </button>
                  <button
                    type="button"
                    title="영역 캡처"
                    aria-label="영역 캡처"
                    className={annotationMode === "capture" ? "is-active" : ""}
                    onClick={activateCaptureMode}
                  >
                    <ScanSearch size={17} strokeWidth={2.1} />
                  </button>
                  <button type="button" title="현재 페이지 지우기" aria-label="현재 페이지 지우기" onClick={handleClearAnnotations}>
                    <RotateCcw size={17} strokeWidth={2.1} />
                  </button>
                  <button type="button" title="이미지 업로드" aria-label="이미지 업로드" onClick={() => galleryInputRef.current?.click()}>
                    <ImagePlus size={17} strokeWidth={2.1} />
                  </button>
                  <button type="button" title="카메라 열기" aria-label="카메라 열기" onClick={() => cameraInputRef.current?.click()}>
                    <Camera size={17} strokeWidth={2.1} />
                  </button>
                  <button type="button" title="PDF 업로드" aria-label="PDF 업로드" onClick={() => pdfInputRef.current?.click()}>
                    <FileUp size={17} strokeWidth={2.1} />
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
                  {toolMenu === "draw" ? (
                    <div className="tool-option-bar" aria-label="펜 옵션">
                      <div className="tool-option-group">
                        <span>색상</span>
                        <div className="tool-chip-row">
                          {PEN_COLORS.map((color) => (
                            <button
                              key={color.id}
                              type="button"
                              className={`color-swatch ${penColor === color.value ? "is-active" : ""}`}
                              style={{ "--swatch-color": color.value }}
                              onClick={() => setPenColor(color.value)}
                              aria-label={`${color.label} 펜`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="tool-option-group">
                        <span>굵기</span>
                        <div className="tool-width-control">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={penWidth}
                            onChange={(event) => setPenWidth(Number(event.target.value))}
                            aria-label="펜 굵기"
                          />
                          <strong>{penWidth}</strong>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {toolMenu === "erase" ? (
                    <div className="tool-option-bar" aria-label="지우개 옵션">
                      <div className="tool-option-group">
                        <span>지우개 방식</span>
                        <div className="tool-chip-row">
                          <button
                            type="button"
                            className={`tool-chip ${eraserMode === "partial" ? "is-active" : ""}`}
                            onClick={() => setEraserMode("partial")}
                          >
                            부분지우개
                          </button>
                          <button
                            type="button"
                            className={`tool-chip ${eraserMode === "stroke" ? "is-active" : ""}`}
                            onClick={() => setEraserMode("stroke")}
                          >
                            선택지우개
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {toolMenu === "capture" ? (
                    <div className="tool-option-bar" aria-label="영역 캡처 옵션">
                      <div className="tool-option-group">
                        <span>캡처 방식</span>
                        <div className="tool-chip-row">
                          <button
                            type="button"
                            className={`tool-chip ${captureMode === "freeform" ? "is-active" : ""}`}
                            onClick={() => setCaptureMode("freeform")}
                          >
                            자유형
                          </button>
                          <button
                            type="button"
                            className={`tool-chip ${captureMode === "rectangle" ? "is-active" : ""}`}
                            onClick={() => setCaptureMode("rectangle")}
                          >
                            사각형
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="note-toolbar-spacer" aria-hidden="true" />
                </div>

                {rightOpen ? (
                  <div className="note-embedded-ai">
                    <div className="chat-panel note-ai-panel note-ai-panel--embedded">
                      <div className="chat-thread" ref={chatThreadRef}>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
                          >
                            {message.imageUrl ? (
                              <figure className="chat-image-attachment">
                                <img src={message.imageUrl} alt={message.imageLabel ?? "첨부 이미지"} />
                              </figure>
                            ) : null}
                            <p>{message.text}</p>
                          </div>
                        ))}

                        {isThinking ? (
                          <div className="chat-bubble assistant">
                            <p>현재 페이지와 메모, 이미지 문맥을 바탕으로 답변을 정리하는 중입니다...</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="chat-composer">
                        <div className="chat-input-shell">
                          {pendingChatAttachment ? (
                            <figure className="chat-queued-attachment">
                              <img
                                src={pendingChatAttachment.previewUrl}
                                alt="첨부 이미지"
                              />
                              <button
                                type="button"
                                className="chat-attachment-remove"
                                onClick={() =>
                                  setPendingChatAttachmentByNote((current) => ({
                                    ...current,
                                    [selectedNote.id]: null,
                                  }))
                                }
                                aria-label="첨부 이미지 제거"
                              >
                                ×
                              </button>
                            </figure>
                          ) : null}
                          <textarea
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="현재 페이지 내용이나 첨부 이미지에 대해 질문해보세요..."
                          />
                          <button type="button" className="chat-send-button" onClick={handleAsk} aria-label="질문 보내기">
                            ↑
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="note-content">
                  <div className="note-document-layout">
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
                                      onContextMenu={(event) => handleAnnotationContextMenu(pageIndex, event)}
                                    >
                                      {pageStrokes.map((stroke) => (
                                        <React.Fragment key={stroke.id}>
                                          {strokeSelection &&
                                          strokeSelection.pageIndex === pageIndex &&
                                          strokeSelection.strokeIds.includes(stroke.id) ? (
                                            <path
                                              d={buildStrokePath(stroke.points, pageSize.width, pageSize.height)}
                                              fill="none"
                                              stroke="rgba(95, 121, 255, 0.35)"
                                              strokeWidth={(stroke.width ?? 4) + 8}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          ) : null}
                                          <path
                                            d={buildStrokePath(stroke.points, pageSize.width, pageSize.height)}
                                            fill="none"
                                            stroke={stroke.color ?? "#1d4ed8"}
                                            strokeWidth={stroke.width ?? 4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </React.Fragment>
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
                                    {strokeSelection && strokeSelection.pageIndex === pageIndex ? (
                                      <div
                                        className="stroke-selection-box"
                                        style={{
                                          left: `${strokeSelection.bounds.x * 100}%`,
                                          top: `${strokeSelection.bounds.y * 100}%`,
                                          width: `${strokeSelection.bounds.width * 100}%`,
                                          height: `${strokeSelection.bounds.height * 100}%`,
                                        }}
                                      />
                                    ) : null}

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
              </div>
            </section>
          </>
        )}
      </div>

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
          ) : contextMenu.type === "stroke-selection" ? (
            <>
              <button type="button" onClick={handleSelectionCopy}>
                복사
              </button>
              <button type="button" onClick={handleSelectionDelete}>
                삭제
              </button>
              <button type="button" onClick={handleSelectionMoveRequest}>
                이동
              </button>
              <button type="button" onClick={handleSelectionStyleChange}>
                스타일 변경
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
