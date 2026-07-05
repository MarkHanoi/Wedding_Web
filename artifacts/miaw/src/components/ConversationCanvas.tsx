import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import CursorPrompt from "./CursorPrompt";
import CTAOverlay from "./CTAOverlay";
import WaitlistScreen from "./WaitlistScreen";
import ApplyScreen from "./ApplyScreen";
import FloatingPanel from "./FloatingPanel";
import ZoomableBody from "./ZoomableBody";
import MindMapPanel from "./MindMapPanel";
import QuickPicks from "./QuickPicks";
import ProgramPanel from "./ProgramPanel";
import ModuleDetailPanel from "./ModuleDetailPanel";
import FacultyPanel from "./FacultyPanel";
import PersonDetailPanel from "./PersonDetailPanel";
import GuestPanel from "./GuestPanel";
import GuestDetailPanel from "./GuestDetailPanel";
import WorkshopPanel from "./WorkshopPanel";
import InstitutionsPanel from "./InstitutionsPanel";
import InstitutionsMapPanel from "./InstitutionsMapPanel";
import InstitutionDetailPanel from "./InstitutionDetailPanel";
import TimelinePanel from "./TimelinePanel";
import NavPill from "./NavPill";
import { analytics } from "../lib/analytics";
import { canvasUI, type Lang } from "../lib/i18n";
import { detectTopic, getSeriesImage, findNonCollidingDepth, TOPIC_SERIES, type TopicSlug } from "../lib/topicImages";
import { getTodaysPalette } from "../lib/dailyPalette";
import {
  computeAdaptiveLayout,
  computeGlobalLayout,
  computeSinglePanelSlot,
  GAP as PANEL_GAP,
  type PanelId,
  type LayoutSlot,
} from "../lib/layout";
import { useIsMobile } from "../hooks/use-mobile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface VisitorProfile {
  type: string;
  context: string;
  identified: boolean;
  identifiedAtTurn: number | null;
}

const INITIAL_PROFILE: VisitorProfile = {
  type: "unknown",
  context: "",
  identified: false,
  identifiedAtTurn: null,
};

// ---------------------------------------------------------------------------
// P5: Image reference panels
// ---------------------------------------------------------------------------

/** One floating reference window per detected topic. */
interface ImagePanel {
  /** Unique key for React + z-order tracking. */
  id: string;
  topic: TopicSlug;
  /** Index into the topic's image series (cycles on repeated turns). */
  turnDepth: number;
  /** Absolute left offset — drag composes on top via Framer transform. */
  initialX: number;
  /** Absolute top offset. */
  initialY: number;
}

/** Maximum simultaneous image panels. Oldest is dropped when cap exceeded. */
const MAX_IMAGE_PANELS = 3;

// ---------------------------------------------------------------------------
// P4-C: Voice Interface — Web Speech API helpers
// ---------------------------------------------------------------------------

// Resolves the SpeechRecognition constructor, handling the webkit prefix
// required on Safari / iOS 14.5+. Returns null in unsupported browsers
// (Firefox) so the mic button can be hidden gracefully.
function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Maps our 2-letter language detection codes (P3-C) to BCP-47 tags that
// the Web Speech API expects for accurate recognition.
const SPEECH_LANG_TAGS: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  ar: "ar-SA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

// Keywords that signal apply/sign-up intent across languages.
// Covers English, Spanish, Portuguese, French, German, Italian, Arabic,
// Chinese (Pinyin), Japanese (Romaji), Korean (Romaji).
const APPLY_KEYWORDS = [
  // English
  "apply", "sign up", "signup", "register", "enroll", "enrol", "join",
  "how to apply", "application", "how do i apply", "want to apply",
  "i want to join", "i'd like to apply", "interested in applying",
  "how can i join", "how can i apply", "how to sign up",
  // Spanish
  "aplicar", "inscribir", "inscribirme", "registrar", "registrarme",
  "cómo aplicar", "cómo me inscribo", "quiero aplicar", "quiero inscribirme",
  "unirme", "como aplicar", "como inscribirse",
  // Portuguese
  "candidatar", "inscrever", "me inscrever", "registrar", "cadastrar",
  "como me inscrevo", "quero me inscrever", "quero aplicar",
  "como aplicar", "como me candidatar",
  // French
  "postuler", "s'inscrire", "m'inscrire", "rejoindre", "candidater",
  "comment postuler", "comment s'inscrire", "je veux postuler",
  "je veux m'inscrire", "candidature",
  // German
  "bewerben", "anmelden", "registrieren", "beitreten",
  "wie bewerbe ich mich", "ich möchte mich bewerben", "wie anmelden",
  "bewerbung", "anmeldung",
  // Italian
  "candidarsi", "iscriversi", "registrarsi", "aderire",
  "come candidarsi", "voglio candidarmi", "voglio iscrivermi",
  "candidatura", "iscrizione",
  // Arabic (transliterated)
  "التقديم", "التسجيل", "أريد التقديم", "كيف أتقدم",
  // Chinese (common terms)
  "申请", "报名", "注册", "如何申请", "我想申请",
  // Japanese
  "申し込む", "登録", "応募", "参加したい", "申し込みたい",
  // Korean
  "신청", "지원", "등록", "참여", "신청하고 싶어", "어떻게 신청",
];

function mentionsApply(text: string): boolean {
  const lower = text.toLowerCase();
  return APPLY_KEYWORDS.some((kw) => lower.includes(kw));
}

const PROFILE_KEYWORDS: Record<string, string[]> = {
  architect: [
    "architect", "architecture", "building", "design", "studio", "facade",
    "floor plan", "bim", "revit", "autocad", "rhino", "grasshopper",
  ],
  engineer: [
    "engineer", "engineering", "structural", "civil", "mep", "systems",
    "infrastructure", "construction",
  ],
  developer: [
    "developer", "software", "code", "coding", "programmer", "frontend",
    "backend", "fullstack", "api", "devops",
  ],
  researcher: [
    "research", "phd", "university", "academic", "paper", "study",
    "thesis", "professor", "lab",
  ],
  designer: [
    "designer", "ux", "ui", "product design", "interior", "landscape",
    "spatial", "graphic",
  ],
  urban: [
    "urban", "city", "planner", "planning", "smart city", "municipality",
    "territory", "masterplan",
  ],
};

function inferProfileFromMessages(
  messages: Message[],
  current: VisitorProfile,
  turnCount: number,
): VisitorProfile {
  if (current.identified) return current;

  const allText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  for (const [type, keywords] of Object.entries(PROFILE_KEYWORDS)) {
    if (keywords.some((kw) => allText.includes(kw))) {
      return {
        type,
        context: allText.slice(0, 200),
        identified: true,
        identifiedAtTurn: turnCount,
      };
    }
  }

  return current.context !== allText.slice(0, 200)
    ? { ...current, context: allText.slice(0, 200) }
    : current;
}

let idCounter = 0;
function makeId() {
  return `msg-${Date.now()}-${++idCounter}`;
}

// ---------------------------------------------------------------------------
// P4-C: TTS sentence extraction
//
// Splits accumulated streaming text into completed sentences (ending in
// . ! ?) and returns the remainder (incomplete trailing sentence) separately.
// Called on every streaming chunk so TTS can begin sentence-by-sentence
// during generation rather than waiting for the full response.
// ---------------------------------------------------------------------------
function extractCompletedSentences(text: string): {
  sentences: string[];
  remainder: string;
} {
  const regex = /[^.!?]+[.!?]+/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence.length > 3) sentences.push(sentence);
    lastIndex = match.index + match[0].length;
  }
  return { sentences, remainder: text.slice(lastIndex) };
}

// ---------------------------------------------------------------------------
// P3-C: Client-side language detection
//
// Runs on the accumulated user messages after each turn. Returns an ISO 639-1
// language code when a non-English language is detected with sufficient
// confidence, or null when the language is English, mixed, or undetermined.
//
// Design: intentionally simple heuristic — Claude's built-in multilingual
// support handles the actual response quality. The detected code is forwarded
// in every subsequent /api/chat request so the server can inject the in-
// language tone reinforcement in the dynamic suffix, making Claude more
// reliably consistent for non-English conversations.
//
// Script-based detection (Arabic, Chinese, Japanese, Korean) is unambiguous.
// Latin-script detection uses distinctive word markers — each language has
// markers unlikely to appear in other Latin-script languages. A minimum of
// 3 matching markers is required to avoid false positives on cognates.
// ---------------------------------------------------------------------------
function detectLanguage(messages: Message[]): string | null {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  if (userText.length < 15) return null;

  // Script-based detection (unambiguous — no marker counting needed)
  if (/[\u0600-\u06FF]/.test(userText)) return "ar";
  if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(userText)) return "zh";
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(userText)) return "ja";
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(userText)) return "ko";

  // Portuguese — check before Spanish (many shared cognates; PT markers are
  // more distinctive: "não", "também", "construção", "tenho", "são").
  const ptMarkers = [
    "não", "também", "são", "está", "isso", "aqui", "tudo",
    "arquiteto", "construção", "projeto", "trabalho", "tenho", "sou",
    "então", "porque", "muito",
  ];
  if (ptMarkers.filter((w) => userText.includes(w)).length >= 2) return "pt";

  // Spanish
  const esMarkers = [
    "pero", "también", "están", "eso", "aquí", "todo",
    "arquitecto", "edificio", "proyecto", "trabajo", "tengo", "soy",
    "entonces", "porque", "muy", "cómo", "qué",
  ];
  if (esMarkers.filter((w) => userText.includes(w)).length >= 2) return "es";

  // French
  const frMarkers = [
    "mais", "aussi", "sont", "ça", "ici", "tout",
    "architecte", "bâtiment", "projet", "travail", "j'ai", "je suis",
    "alors", "parce", "très", "comment", "qu'est",
  ];
  if (frMarkers.filter((w) => userText.includes(w)).length >= 2) return "fr";

  // German
  const deMarkers = [
    "aber", "auch", "sind", "das", "hier", "alles",
    "architekt", "gebäude", "projekt", "arbeit", "ich bin", "wir sind",
    "dann", "weil", "sehr", "wie", "was",
  ];
  if (deMarkers.filter((w) => userText.includes(w)).length >= 2) return "de";

  // Italian
  const itMarkers = [
    "ma", "anche", "sono", "quello", "qui", "tutto",
    "architetto", "edificio", "progetto", "lavoro", "ho", "siamo",
    "allora", "perché", "molto", "come", "cosa",
  ];
  if (itMarkers.filter((w) => userText.includes(w)).length >= 2) return "it";

  return null; // English or undetermined
}

function extractEmailDomainTld(email: string): string {
  try {
    const domain = email.split("@")[1] ?? "";
    const parts = domain.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Hex color helpers — used for conversation-depth gradient evolution (item 5)
// ---------------------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}
/** Blend two hex colors by factor t (0 = from, 1 = to). */
function blendHex(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
/** Shift a hex color slightly more saturated (move away from gray). */
function saturate(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const gray = 128;
  return rgbToHex(
    gray + (r - gray) * (1 + amount),
    gray + (g - gray) * (1 + amount),
    gray + (b - gray) * (1 + amount),
  );
}

const DEFAULT_LOGO_FONT = "'DePixelBreit', monospace";

// ---------------------------------------------------------------------------
// Smart image panel placement — finds a non-overlapping position on the right
// half of the viewport (item 3). Estimated panel height ≈ 220 px at default
// 240 px width.
// ---------------------------------------------------------------------------
function findNonOverlappingPosition(
  existingPanels: ImagePanel[],
  vw: number,
  vh: number,
  panelW: number,
  panelH = 220,
): { x: number; y: number } {
  const pad = 16;
  const candidates: Array<{ x: number; y: number }> = [];
  const colCount = 3;
  const rowCount = 4;
  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      const x = Math.min(
        vw - panelW - pad,
        Math.max(vw * 0.52, vw - panelW - pad) - col * (panelW + pad),
      );
      const y = 72 + row * (panelH + pad);
      if (x > pad && y + panelH < vh - pad) candidates.push({ x, y });
    }
  }
  for (const c of candidates) {
    const overlaps = existingPanels.some(
      (p) =>
        !(
          c.x + panelW + pad <= p.initialX ||
          c.x >= p.initialX + panelW + pad ||
          c.y + panelH + pad <= p.initialY ||
          c.y >= p.initialY + panelH + pad
        ),
    );
    if (!overlaps) return c;
  }
  // Fallback: stagger from top-right
  const col = existingPanels.length;
  return {
    x: Math.min(vw - panelW - pad, vw - panelW - pad - col * 20),
    y: 72 + col * 36,
  };
}

// VITE_API_URL lets CF Pages (or any static host) point at an external backend.
// Falls back to BASE_URL so Replit dev/prod keeps working with zero config.
const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

// After this many agent responses in application mode the submit UI appears.
const APPLICATION_TURN_LIMIT = 6;

// ── P2-C: Gradient evolution color palettes ─────────────────────────────────
//
// Each palette entry is a partial Record of the 4 CSS @property color vars
// (--c1 through --c4). Only changed blobs are listed — unmodified blobs
// retain their @property initial-value.
//
// Palette sources are from PRODUCTION_ROADMAP.md P2-C:
//   --c1 = blob 1 (blue, left)    initial: #a8bef7
//   --c2 = blob 2 (pink, right)   initial: #f4a8d8
//   --c3 = blob 3 (pink, bottom)  initial: #f7b8e2
//   --c4 = blob 4 (blue, top)     initial: #b8d8fd
//
// Transition duration is set in index.css: 8s ease on all four color vars.
// This is imperceptibly slow — ambient, not jarring.
type GradientBlob = "--c1" | "--c2" | "--c3" | "--c4";
const GRADIENT_PALETTES: Record<string, Partial<Record<GradientBlob, string>>> = {
  // Physical world, material, warmth — terracotta shift on the right blobs
  architect:  { "--c2": "#f5b090", "--c3": "#f0a878" },
  designer:   { "--c2": "#f5b090", "--c3": "#f0a878" },
  // Systems, code, precision — deeper electric blue shift on left blobs
  engineer:   { "--c1": "#90a8ef", "--c3": "#98acea" },
  developer:  { "--c1": "#90a8ef", "--c3": "#98acea" },
  // Knowledge, expansiveness, academia — cooler/lighter blue on top blobs
  researcher: { "--c4": "#c0d8ff", "--c1": "#a0b8f8" },
  // urban_planner, student, unknown — no shift (default palette)
};

// Convergence palette: all blobs shift toward the pastel lavender #c4b4ee.
// Slight variation between blobs maintains the mesh visual; they don't
// all become identical, they just all feel like "the same synthesis".
const GRADIENT_ACKNOWLEDGED: Record<GradientBlob, string> = {
  "--c1": "#c4b4ee",
  "--c2": "#d4baf2",
  "--c3": "#ceb6f0",
  "--c4": "#bdb0ec",
};

// Topic-driven gradient shifts (ADR-016).
// Each topic overrides specific blobs to evoke the subject's sensory territory —
// e.g. teal for land/site analysis, amber for automation flows, violet for neural
// world models. All values are pastel (similar lightness to the daily palette)
// so the shift is clearly felt without breaking the soft aesthetic.
// Only the blobs listed are overridden; the rest stay at whatever value the
// daily+depth+profile layers set, so the daily mood is still faintly present.
const TOPIC_GRADIENT_SHIFTS: Record<TopicSlug, Partial<Record<GradientBlob, string>>> = {
  "ai-workflows":         { "--c1": "#8eb4f8", "--c4": "#a8c0fc" }, // periwinkle-blue — code, precision
  "territorial-analysis": { "--c1": "#9ad4c0", "--c3": "#aadcc8" }, // teal-sage — land, site, openness
  "gaussian-splatting":   { "--c1": "#a8a0f4", "--c4": "#bcb4f8" }, // violet — 3D depth, point clouds
  "parametric-design":    { "--c2": "#f5b898", "--c3": "#f2c4a8" }, // warm peach — organic, generative form
  "bim-documentation":    { "--c1": "#98b4e8", "--c4": "#a8c4ec" }, // steel-blue — precision, documentation
  "ai-pipelines":         { "--c2": "#f4d490", "--c3": "#f2d89e" }, // honey-amber — flow, automation
  "simulation":           { "--c1": "#9cd4ec", "--c4": "#b0e0f4" }, // sky — environment, daylight, air
  "robotic-fabrication":  { "--c2": "#f0a888", "--c3": "#ebb098" }, // terracotta — material, physical making
  "world-models":         { "--c1": "#a894f0", "--c4": "#baaef4" }, // deep lavender — neural, latent space
  "curriculum":           { "--c2": "#e8b0d4", "--c4": "#f0b8d8" }, // rose-mauve — learning, knowledge
  "application":          { "--c2": "#f4d898", "--c3": "#f0dc9c" }, // gold — achievement, admission
};

// ---------------------------------------------------------------------------
// Nav pill layout constants (used in ConversationCanvas render)
//
// Approximate rendered widths per pill (text + px-3.5 padding = 28px total).
// These are estimates — exact layout is not critical because the user can
// drag each pill to any position after mount.
//
// Pill row initial Y: 20px from the canvas top edge (inside old pt-5 zone).
// Pill gap: 8px between each pill — matches the old `gap-2` flex spacing.
//
// Pill Z-index is PILL_Z = 48 (defined in NavPill.tsx):
//   above floating panels (15–38), below chat panel (50).
// ---------------------------------------------------------------------------
const NAV_PILL_APPROX_WIDTHS: Record<string, number> = {
  "how-to-apply":  132,
  "program":        92,
  "faculty":        90,
  "guests":         84,
  "institutions":  116,
  "timeline":       98,
  "workshop":      108,
  "global":         82,
};
const NAV_PILL_Y   = 20; // px from canvas top
const NAV_PILL_GAP = 14; // px between pills — generous to prevent touching

/**
 * Right edge of the conversation FloatingPanel in px.
 *
 * The chat panel is rendered at initialX=56 with CSS width
 * `clamp(300px, 38vw, 520px)`. This pure function mirrors that formula so
 * the layout engine always knows where it ends and where panel tiles can begin.
 *
 * Single source of truth — used in all individual panel openers and in
 * openGlobalView so the boundary is never duplicated.
 */
function chatPanelRightEdge(vw: number): number {
  return 56 + Math.round(Math.min(Math.max(vw * 0.38, 300), 520));
}

/** Narrower chat panel width used in Global view so content tiles get more room. */
const GLOBAL_CHAT_W = 200;

/**
 * Full-screen panel slot for mobile (< 768px).
 * Secondary panels take the full viewport width below the fixed nav bar.
 * Nav bar height: 44px. Gap: 6px.
 */
function getMobilePanelSlot() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return { x: 8, y: 50, width: vw - 16, height: vh - 64 };
}

interface ConversationCanvasProps {
  /**
   * When true the ApplyScreen panel is shown immediately on mount.
   * Use this when navigating from an external page with "How to apply" intent.
   */
  initialShowApply?: boolean;
  /** UI language — controls nav tab labels, placeholders, and form strings. */
  lang?: Lang;
  /**
   * Called when the user clicks the miaw logo inside the chat panel.
   * App-level navigation — routes back to the Foundations landing page.
   * When undefined the button falls back to the in-session resetToHome().
   */
  onGoToFoundations?: () => void;
  /**
   * When true the pre-conversation landing screen is skipped entirely:
   * the canvas opens directly in conversation mode and fires the first
   * AI message immediately (as if the user had clicked to start).
   * Use this when navigating from an external page (e.g. Foundations).
   */
  startImmediately?: boolean;
}

export default function ConversationCanvas({ onGoToFoundations, startImmediately, initialShowApply, lang }: ConversationCanvasProps) {
  const isMobile = useIsMobile();
  // Stable ref so callbacks with empty dep-arrays can read the current value.
  const isMobileRef = useRef(false);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  // Translated UI strings — reactive to lang prop changes.
  const ui = canvasUI[lang ?? "en"];
  const langRef = useRef<Lang>(lang ?? "en");
  useEffect(() => { langRef.current = lang ?? "en"; }, [lang]);

  // ── Qualification state ────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<VisitorProfile>(INITIAL_PROFILE);
  const [turnCount, setTurnCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [conversationStarted, setConversationStarted] = useState(startImmediately === true);
  const [showHowToApply, setShowHowToApply] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Application mode state ─────────────────────────────────────────────
  const [applicationMode, setApplicationMode] = useState(false);
  const [applicationTurnCount, setApplicationTurnCount] = useState(0);
  const [showApplicationSubmit, setShowApplicationSubmit] = useState(false);
  // Full-screen overlay screens — rendered at z-50 over the gradient canvas
  const [showWaitlistScreen, setShowWaitlistScreen] = useState(false);
  const [applicationAcknowledged, setApplicationAcknowledged] = useState(false);
  // P4-A: opaque portal token stored in sessionStorage after submission so the
  // applicant can navigate back to their status page in the same session.
  const [applicationStatusToken, setApplicationStatusToken] = useState<string | null>(null);

  // Snapshot of messages.length when application mode starts — used to split
  // the conversation into qualification and application segments on submit.
  const qualificationMessageCountRef = useRef<number>(0);

  // ── Refs ───────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // P2-C: ref to the .gradient-canvas <main> element for CSS @property updates.
  // Using HTMLElement (not HTMLDivElement) because <main> is a sectioning element.
  const canvasRef = useRef<HTMLElement>(null);
  // Daily palette — computed once at mount, stable for the lifetime of the page.
  // Stored in a ref so resetGradient can restore it without triggering re-renders.
  const dailyPaletteRef = useRef(getTodaysPalette());
  // P3-D: session context for returning visitors. Populated on mount if a valid
  // session token is found in sessionStorage. Passed to every /api/chat request
  // so Claude recognises the returning visitor across sessions.
  const sessionCtxRef = useRef<string | null>(null);
  // P3-C: detected language ISO 639-1 code (e.g. "es", "pt", "fr"). Populated
  // after the first turn where language can be determined from the visitor's
  // messages. Once set it is locked — language doesn't change mid-conversation.
  // Passed to /api/chat so the server injects the in-language reinforcement.
  const detectedLangRef = useRef<string | null>(null);

  // P4-C: Voice input — SpeechRecognition ref + listening state
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  // Computed once: true in Chrome, Edge, Safari 14.5+; false in Firefox
  const speechSupported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  // P5: Image reference panels — one floating window per detected topic.
  // Accumulate up to MAX_IMAGE_PANELS; clicking a topic again cycles the image.
  const [imagePanels, setImagePanels] = useState<ImagePanel[]>([]);
  // Z-order array: panel IDs in ascending z-index order (last = topmost).
  const [zOrder, setZOrder] = useState<string[]>([]);

  // Curriculum mind map panel — shown instead of an image panel when the
  // user asks about modules / program structure.
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapPos, setMindMapPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Ref that mirrors showMindMap so streamMessage can read the latest value
  // without including the state variable in its useCallback dependency array
  // (which would force recreation of streamMessage — and every callback that
  // depends on it — every time the panel opens or closes).
  const showMindMapRef = useRef(false);
  useEffect(() => {
    showMindMapRef.current = showMindMap;
  }, [showMindMap]);

  // ── Show-state refs for adaptive tiling ───────────────────────────────────
  // Mirrors of every secondary-panel show-state kept in refs so the tiling
  // callbacks (retileDesktopPanels) can read the current open set without
  // stale closures.
  const showProgramPanelRef      = useRef(false);
  const showFacultyPanelRef      = useRef(false);
  const showGuestPanelRef        = useRef(false);
  const showWorkshopPanelRef     = useRef(false);
  const showTimelinePanelRef     = useRef(false);
  const showInstitutionsPanelRef = useRef(false);
  const showInstitutionsMapRef   = useRef(false);

  // Direct apply panel — opened when the user clicks "How to apply" / "Apply now"
  // at the top of the canvas. Shows the ApplyScreen FloatingPanel immediately,
  // without requiring the full qualification → CTA → interview flow.
  const [showDirectApplyPanel, setShowDirectApplyPanel] = useState(initialShowApply === true);

  // Program structure panel + optional module detail panel
  const [showProgramPanel, setShowProgramPanel] = useState(false);
  const [programPanelPos, setProgramPanelPos] = useState({ x: 0, y: 80 });
  const [selectedModuleCode, setSelectedModuleCode] = useState<string | null>(null);
  const [modulePanelPos, setModulePanelPos] = useState({ x: 0, y: 80 });

  // Timeline panel
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);
  const [timelinePanelPos, setTimelinePanelPos] = useState({ x: 0, y: 80 });

  // Faculty ("Who We Are") panel + optional person detail panel
  const [showFacultyPanel, setShowFacultyPanel] = useState(false);
  const [facultyPanelPos, setFacultyPanelPos] = useState({ x: 0, y: 80 });
  const [selectedPersonSlug, setSelectedPersonSlug] = useState<string | null>(null);
  const [personPanelPos, setPersonPanelPos] = useState({ x: 0, y: 80 });

  // Guest Lectures panel + optional guest detail panel (ADR-018)
  const [showGuestPanel, setShowGuestPanel] = useState(false);
  const [guestPanelPos, setGuestPanelPos] = useState({ x: 0, y: 80 });
  const [selectedGuestSlug, setSelectedGuestSlug] = useState<string | null>(null);
  const [guestDetailPanelPos, setGuestDetailPanelPos] = useState({ x: 0, y: 80 });

  // Workshop panel
  const [showWorkshopPanel, setShowWorkshopPanel] = useState(false);
  const [workshopPanelPos, setWorkshopPanelPos] = useState({ x: 0, y: 80 });

  // Institutions panel + optional institution detail panel (ADR-019)
  const [showInstitutionsPanel, setShowInstitutionsPanel] = useState(false);
  const [institutionsPanelPos, setInstitutionsPanelPos] = useState({ x: 0, y: 80 });
  const [showInstitutionsMap, setShowInstitutionsMap] = useState(false);
  const [institutionsMapPos, setInstitutionsMapPos] = useState({ x: 0, y: 80 });
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [institutionDetailPanelPos, setInstitutionDetailPanelPos] = useState({ x: 0, y: 80 });

  // Sync effects for the show-state refs declared above — placed here so all
  // referenced state variables are in scope (declared earlier in this block).
  useEffect(() => { showProgramPanelRef.current      = showProgramPanel;      }, [showProgramPanel]);
  useEffect(() => { showFacultyPanelRef.current      = showFacultyPanel;      }, [showFacultyPanel]);
  useEffect(() => { showGuestPanelRef.current        = showGuestPanel;        }, [showGuestPanel]);
  useEffect(() => { showWorkshopPanelRef.current     = showWorkshopPanel;     }, [showWorkshopPanel]);
  useEffect(() => { showTimelinePanelRef.current     = showTimelinePanel;     }, [showTimelinePanel]);
  useEffect(() => { showInstitutionsPanelRef.current = showInstitutionsPanel; }, [showInstitutionsPanel]);
  useEffect(() => { showInstitutionsMapRef.current   = showInstitutionsMap;   }, [showInstitutionsMap]);

  // ── Generative layout engine slots (panelLayout) ──────────────────────
  //
  // Single source of truth for every panel's computed width + height.
  // Populated by two code paths:
  //   1. openGlobalView  — computeGlobalLayout() fills all 5 slots at once.
  //   2. Individual openers — computeSinglePanelSlot() fills one slot each.
  //
  // Panels read their slot's width/height via panelLayout[id] so their
  // FloatingPanel wrapper (and internal SVG zoom) auto-fits to the
  // available viewport space instead of using hardcoded defaults.
  //
  // Cleared wholesale by closeGlobalView / resetToHome.
  // Individual slots are overwritten each time a panel is reopened.
  const [panelLayout, setPanelLayout] = useState<
    Partial<Record<string, { width: number; height: number }>>
  >({});

  // Item 2: Chat panel width tracking — collapses input icons when narrow.
  const [chatPanelWidth, setChatPanelWidth] = useState(480);
  // True while Global view is open — shrinks chat panel to a narrow sidebar.
  const [globalViewActive, setGlobalViewActive] = useState(false);
  const inputBarRef = useRef<HTMLDivElement>(null);

  // ── Mobile: single-panel-at-a-time ────────────────────────────────────
  // True when any secondary info panel is open (chat hides on mobile).
  const anySecondaryPanelOpen =
    showDirectApplyPanel || showProgramPanel || showMindMap ||
    showFacultyPanel || !!selectedPersonSlug ||
    showGuestPanel || !!selectedGuestSlug ||
    showWorkshopPanel || showInstitutionsPanel || showInstitutionsMap ||
    !!selectedInstitutionId || showTimelinePanel;

  // Close ALL secondary panels — called by the mobile nav bar before opening
  // a new one so only one panel is ever visible at a time on small screens.
  const closeMobileSecondaryPanels = useCallback(() => {
    setShowDirectApplyPanel(false);
    setShowProgramPanel(false);
    setShowMindMap(false);
    setShowFacultyPanel(false);
    setSelectedPersonSlug(null);
    setShowGuestPanel(false);
    setSelectedGuestSlug(null);
    setShowWorkshopPanel(false);
    setShowInstitutionsPanel(false);
    setShowInstitutionsMap(false);
    setSelectedInstitutionId(null);
    setShowTimelinePanel(false);
    setZOrder([]);
  }, []);

  // P4-C: TTS state — Web Speech API output synthesis.
  // ttsEnabledRef is the stable ref read inside streamMessage (empty-dep
  // useCallback). ttsEnabled state drives the speaker button UI only.
  // ttsBufferRef accumulates incomplete sentence fragments across chunks.
  // ttsSupported is true in Chrome, Edge, Safari, Firefox (wider than STT).
  const ttsEnabledRef = useRef(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const ttsBufferRef = useRef<string>("");
  const ttsSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  // P4-C: Cancel all queued / playing synthesis and reset the sentence buffer.
  // Stable useCallback (no deps) — safe to reference inside streamMessage's
  // empty-dep useCallback without causing recreation.
  const cancelTTS = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    ttsBufferRef.current = "";
  }, []);

  // P4-C: Enqueue one sentence for synthesis. Language-aware via
  // detectedLangRef (same BCP-47 map as STT in toggleVoiceInput).
  // Rate 0.95 is slightly slower than default — easier to follow
  // in a technical conversation. Respects prefers-reduced-motion (WCAG 2.3.3).
  const speakSentence = useCallback((sentence: string) => {
    if (!ttsEnabledRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const utterance = new SpeechSynthesisUtterance(sentence.trim());
    const lang = detectedLangRef.current;
    utterance.lang =
      (lang ? SPEECH_LANG_TAGS[lang] : null) ?? navigator.language ?? "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ── P2-C: Gradient evolution helpers ──────────────────────────────────
  //
  // All gradient updates respect prefers-reduced-motion. The CSS rule in
  // index.css already sets animation:none and transition:none under that
  // media query. The JavaScript guard here prevents even attempting to set
  // inline styles when motion is reduced — belt-and-suspenders compliance
  // with WCAG 2.3.3 (AAA).
  //
  // Returns true when the gradient can be animated (motion is allowed AND
  // the canvas element is mounted).
  const canAnimate = useCallback((): HTMLElement | null => {
    if (typeof window === "undefined") return null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    return canvasRef.current;
  }, []);

  const resetGradient = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Restore today's palette rather than falling back to the CSS @property
    // initial-values (which are the hardcoded defaults and ignore daily rotation).
    const p = dailyPaletteRef.current;
    el.style.setProperty("--c1", p.c1);
    el.style.setProperty("--c2", p.c2);
    el.style.setProperty("--c3", p.c3);
    el.style.setProperty("--c4", p.c4);
    el.style.animationDuration = "45s";
  }, []);

  // ── Daily palette: apply on mount ─────────────────────────────────────
  //
  // Sets today's color palette on the gradient canvas and the body background
  // immediately on mount (before the user interacts). All 7 palettes are fully
  // pastel — the mood changes each day but the softness is constant.
  useEffect(() => {
    const el = canvasRef.current;
    const p = dailyPaletteRef.current;
    if (el) {
      el.style.setProperty("--c1", p.c1);
      el.style.setProperty("--c2", p.c2);
      el.style.setProperty("--c3", p.c3);
      el.style.setProperty("--c4", p.c4);
    }
    // Sync the body background so there's no flash of the default #c4b4ee
    // behind the gradient-canvas on non-Lavender days.
    document.body.style.background = p.base;
  }, []);

  // ── Unified gradient state effect (ADR-016) ────────────────────────────
  //
  // Single effect managing all four colour layers in priority order:
  //   1. Daily palette  (always the base)
  //   2. Depth saturation  (subtle richness increase as conversation deepens)
  //   3. Profile shift  (semantic hue based on identified visitor type)
  //   4. Topic shift  (evocative hue based on the currently open image panel)
  //
  // Keeping all layers in one effect prevents the two-effect conflict where
  // the depth effect and profile/topic effects would race and overwrite each
  // other. The 8 s CSS transition on --c1..--c4 (set in index.css) makes
  // every change imperceptibly slow — ambient, never jarring.
  //
  // The acknowledged convergence effect remains separate (it's a terminal
  // state that never reverts while the page is open).
  useEffect(() => {
    if (applicationAcknowledged) return; // acknowledged effect owns this state
    const el = canAnimate();
    if (!el) return;

    const p = dailyPaletteRef.current;
    let c1 = p.c1, c2 = p.c2, c3 = p.c3, c4 = p.c4;

    // Layer 2 — depth saturation (qualification mode only, pre-identification)
    if (turnCount >= 1 && !profile.identified && !applicationMode) {
      const t = Math.min((turnCount - 1) / 6, 0.55);
      const sat = t * 0.18; // max 18 % saturation lift — stays pastel
      c1 = blendHex(p.c1, saturate(p.c1, sat), t);
      c2 = blendHex(p.c2, saturate(p.c2, sat), t);
      c3 = blendHex(p.c3, saturate(p.c3, sat), t);
      c4 = blendHex(p.c4, saturate(p.c4, sat), t);
    }

    // Layer 3 — profile semantic shift (once visitor type is identified)
    if (profile.identified && !applicationMode) {
      const palette = GRADIENT_PALETTES[profile.type];
      if (palette) {
        if (palette["--c1"]) c1 = palette["--c1"]!;
        if (palette["--c2"]) c2 = palette["--c2"]!;
        if (palette["--c3"]) c3 = palette["--c3"]!;
        if (palette["--c4"]) c4 = palette["--c4"]!;
      }
    }

    // Layer 4 — topic evocative shift (most recently opened image panel)
    if (imagePanels.length > 0) {
      const lastTopic = imagePanels[imagePanels.length - 1].topic;
      const shift = TOPIC_GRADIENT_SHIFTS[lastTopic];
      if (shift) {
        if (shift["--c1"]) c1 = shift["--c1"]!;
        if (shift["--c2"]) c2 = shift["--c2"]!;
        if (shift["--c3"]) c3 = shift["--c3"]!;
        if (shift["--c4"]) c4 = shift["--c4"]!;
      }
    }

    el.style.setProperty("--c1", c1);
    el.style.setProperty("--c2", c2);
    el.style.setProperty("--c3", c3);
    el.style.setProperty("--c4", c4);
  }, [
    imagePanels,
    turnCount,
    profile.identified,
    profile.type,
    applicationMode,
    applicationAcknowledged,
    canAnimate,
  ]);

  // ── Item 2: Chat panel width tracking — ResizeObserver ────────────────
  //
  // Observes the input bar wrapper to detect when the chat panel is narrow.
  // chatPanelWidth drives conditional rendering of the mic/tts icons so
  // they gracefully disappear rather than stack awkwardly on small panels.
  useEffect(() => {
    const el = inputBarRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 480;
      setChatPanelWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [conversationStarted]);

  // ── P5: Image panel helpers ────────────────────────────────────────────

  /** Move a panel to the top of the z-stack (call on any pointerdown). */
  const bringImagePanelToFront = useCallback((id: string) => {
    setZOrder((prev) => [...prev.filter((x) => x !== id), id]);
  }, []);

  /** Remove an image panel (close button). */
  const removeImagePanel = useCallback((id: string) => {
    setImagePanels((prev) => prev.filter((p) => p.id !== id));
    setZOrder((prev) => prev.filter((x) => x !== id));
  }, []);

  /**
   * Z-index for an image panel. Image panels live at z=15..17 (max 3 panels);
   * the chat panel is always at z=40 so it sits above all image panels.
   */
  const getImagePanelZ = useCallback(
    (id: string): number => {
      const idx = zOrder.indexOf(id);
      return idx >= 0 ? 15 + idx : 15;
    },
    [zOrder],
  );

  // ── P2-C Effect 2: Application mode — slow the animation ──────────────
  //
  // When the visitor enters application mode (clicked "Apply now"), the
  // gradient cycle slows from 45s to 120s. This communicates a shift in
  // register: from discovery to commitment. Calm, considered, serious.
  //
  // The transition back to 45s fires if the user resets to home (which also
  // clears applicationMode via resetToHome).
  useEffect(() => {
    const el = canAnimate();
    if (!el) return;
    el.style.animationDuration = applicationMode ? "120s" : "45s";
  }, [applicationMode, canAnimate]);

  // ── P2-C Effect 3: Acknowledgment — convergence to purple synthesis ────
  //
  // After the application is submitted and the personalised acknowledgment
  // appears in the conversation, all four blobs shift toward the base purple
  // #8e72d5 — synthesis achieved. The 8s CSS transition makes this a gentle,
  // meditative fade rather than an abrupt change. The animation also slows
  // further to 120s — the program has received them.
  useEffect(() => {
    if (!applicationAcknowledged) return;
    const el = canAnimate();
    if (!el) return;

    for (const [prop, value] of Object.entries(GRADIENT_ACKNOWLEDGED)) {
      el.style.setProperty(prop, value);
    }
    el.style.animationDuration = "180s";
  }, [applicationAcknowledged, canAnimate]);

  // ── Reset ──────────────────────────────────────────────────────────────
  const resetToHome = useCallback(() => {
    setMessages([]);
    setProfile(INITIAL_PROFILE);
    setTurnCount(0);
    setIsStreaming(false);
    setShowCTA(false);
    setInputValue("");
    setConversationStarted(false);
    setShowHowToApply(true);
    setError(null);
    setApplicationMode(false);
    setApplicationTurnCount(0);
    setShowApplicationSubmit(false);
    setApplicationAcknowledged(false);
    setShowDirectApplyPanel(false);
    setShowProgramPanel(false);
    setSelectedModuleCode(null);
    setShowFacultyPanel(false);
    setSelectedPersonSlug(null);
    setShowGuestPanel(false);
    setSelectedGuestSlug(null);
    setShowWorkshopPanel(false);
    setShowInstitutionsPanel(false);
    setShowInstitutionsMap(false);
    setSelectedInstitutionId(null);
    setShowTimelinePanel(false);
    setZOrder((prev) => prev.filter((x) => x !== "timeline"));
    // Clear all image reference panels immediately — no fade lag on reset.
    setImagePanels([]);
    setZOrder([]);
    setShowMindMap(false);
    setGlobalViewActive(false);
    qualificationMessageCountRef.current = 0;
    // P2-C: restore CSS @property initial-values by removing inline overrides.
    // removeProperty() causes the element to fall back to @property initial-value
    // declarations in index.css — no explicit value needed.
    resetGradient();
  }, [resetGradient]);

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    analytics.pageLoaded(document.referrer);
  }, []);

  // P5: Preload all topic images on mount so panels appear instantly.
  // Using the Image() constructor forces the browser to fetch and cache each
  // image before it's needed — negligible bandwidth cost, major perceived-speed
  // improvement (images appear without a loading flash when a panel first opens).
  useEffect(() => {
    const refs: HTMLImageElement[] = [];
    Object.values(TOPIC_SERIES).forEach((series) => {
      series.images.forEach((entry) => {
        const img = new Image();
        img.src = entry.src;
        refs.push(img);
      });
    });
    // Keep refs alive until the component unmounts so GC doesn't cancel fetches.
    return () => { refs.length = 0; };
  }, []);

  // P3-D: Session restore — check sessionStorage for a session token on mount.
  // If found, fetch the stored conversation summary from /api/sessions/:token
  // and keep it in sessionCtxRef so it's included in the first /api/chat call.
  // If the token is expired or invalid, clear it from sessionStorage silently.
  useEffect(() => {
    const token = sessionStorage.getItem("miaw_session_token");
    if (!token) return;

    fetch(`${BASE}/api/sessions/${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) {
          sessionStorage.removeItem("miaw_session_token");
          return null;
        }
        return r.json() as Promise<{ summary?: string }>;
      })
      .then((data) => {
        if (data?.summary) {
          sessionCtxRef.current = data.summary;
        }
      })
      .catch(() => {
        // Session restore is best-effort — proceed as new visitor on failure
      });
  }, []);

  // Mobile keyboard compensation
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      const keyboardHeight = window.innerHeight - vv.height;
      document.documentElement.style.setProperty(
        "--keyboard-height",
        `${keyboardHeight}px`,
      );
    };
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (conversationStarted) {
      inputRef.current?.focus();
    }
  }, [conversationStarted]);

  // Re-focus the input the moment streaming ends so the user can type
  // immediately without having to click — no setTimeout, instant.
  useEffect(() => {
    if (!isStreaming && conversationStarted) {
      inputRef.current?.focus();
    }
  }, [isStreaming, conversationStarted]);

  // ── Core streaming function ────────────────────────────────────────────
  // Handles both qualification (/api/chat) and application (/api/apply/chat)
  // modes. When appModeOpts is provided, sends to the application endpoint
  // and tracks application turn count instead of qualification turn count.
  const streamMessage = useCallback(
    async (
      userMessages: Message[],
      newTurnCount: number,
      currentProfile: VisitorProfile,
      appModeOpts?: { applicationTurnCount: number },
    ) => {
      setIsStreaming(true);
      setError(null);
      // P4-C: Cancel any TTS playing from the previous turn before starting
      cancelTTS();

      const assistantId = makeId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
      ]);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const isAppMode = appModeOpts !== undefined;
      const endpoint = isAppMode
        ? `${BASE}/api/apply/chat`
        : `${BASE}/api/chat`;

      const requestBody = isAppMode
        ? {
            messages: userMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            profile: currentProfile,
            applicationTurnCount: appModeOpts.applicationTurnCount,
          }
        : {
            messages: userMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            profile: currentProfile,
            turnCount: newTurnCount,
            // P3-D: include session context for returning visitors so Claude
            // can greet them without asking them to repeat themselves.
            ...(sessionCtxRef.current
              ? { sessionContext: sessionCtxRef.current }
              : {}),
            // P3-C: include detected language so the server injects in-language
            // tone reinforcement into the dynamic suffix. Absent on turn 0 or
            // until sufficient user text exists to detect reliably.
            ...(detectedLangRef.current
              ? { detectedLanguage: detectedLangRef.current }
              : {}),
          };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 429) {
          setError(canvasUI[langRef.current].chat.rateLimit);
          analytics.errorShown("rate_limit", newTurnCount);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { message?: string }).message || `Error ${res.status}`,
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";
        ttsBufferRef.current = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // P4-C: Feed chunk into TTS sentence buffer and speak completed
          // sentences immediately — output starts before streaming ends.
          if (ttsEnabledRef.current) {
            ttsBufferRef.current += chunk;
            const { sentences, remainder } = extractCompletedSentences(
              ttsBufferRef.current,
            );
            ttsBufferRef.current = remainder;
            sentences.forEach(speakSentence);
          }

          const snap = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snap } : m,
            ),
          );
        }
        // P4-C: Flush any remaining text that never ended with punctuation
        // (e.g. a short closing phrase without a final period).
        if (ttsEnabledRef.current && ttsBufferRef.current.trim().length > 3) {
          speakSentence(ttsBufferRef.current.trim());
          ttsBufferRef.current = "";
        }

        const finalMessages: Message[] = [
          ...userMessages,
          {
            id: assistantId,
            role: "assistant",
            content: accumulated,
            timestamp: Date.now(),
          },
        ];

        // Profile inference runs regardless of mode
        const nextQualTurn = newTurnCount + 1;
        const wasIdentified = currentProfile.identified;
        const updatedProfile = inferProfileFromMessages(
          finalMessages,
          currentProfile,
          isAppMode ? newTurnCount : nextQualTurn,
        );
        setProfile(updatedProfile);

        // P3-C: language detection — qualification mode only. Runs after each
        // turn and locks in the detected language when confidence is reached.
        // Application mode re-uses the same ref (already populated by then).
        if (!isAppMode && !detectedLangRef.current) {
          const detected = detectLanguage(finalMessages);
          if (detected) {
            detectedLangRef.current = detected;
          }
        }

        // P5: Topic detection → image reference panel management.
        // Each unique topic opens a new floating panel (max MAX_IMAGE_PANELS).
        // Repeating a topic cycles to the next image in that panel's series.
        // Panels accumulate as the conversation explores multiple topics.
        // Images only appear after the user has sent at least one message (newTurnCount > 0).
        if (!isAppMode && newTurnCount > 0) {
          const detectedTopic = detectTopic(accumulated, finalMessages);
          if (detectedTopic) {
            // Curriculum topic → open the animated mind map panel instead of
            // a static image panel. If it's already open just leave it.
            if (detectedTopic === "curriculum") {
              // Curriculum → animated mind map panel. Guard via ref so this
              // check reads the latest value without needing showMindMap in
              // the streamMessage useCallback dependency array.
              if (!showMindMapRef.current) {
                const vw = typeof window !== "undefined" ? window.innerWidth  : 1200;
                const vh = typeof window !== "undefined" ? window.innerHeight : 800;
                const panelW = 700;
                const panelH = 340;
                setMindMapPos({
                  x: Math.max(20, Math.min(vw - panelW - 20, vw / 2 - panelW / 2 + 60)),
                  y: Math.max(20, Math.min(vh - panelH - 20, 70)),
                });
                setShowMindMap(true);
                setZOrder((prev) => [...prev.filter((x) => x !== "mindmap"), "mindmap"]);
              }
            } else {
              // Non-curriculum topic → standard floating image panel.
              setImagePanels((prev) => {
                const existing = prev.find((p) => p.topic === detectedTopic);

                if (existing) {
                  // Same topic — advance to next image in series, skipping any
                  // src already shown in a different panel.
                  const otherSrcs = new Set(
                    prev
                      .filter((p) => p.topic !== detectedTopic)
                      .map((p) => getSeriesImage(p.topic, p.turnDepth).src),
                  );
                  const nextDepth = findNonCollidingDepth(
                    detectedTopic,
                    existing.turnDepth + 1,
                    otherSrcs,
                  );
                  // If every image in the series is already visible elsewhere,
                  // leave the panel as-is rather than showing a duplicate.
                  if (nextDepth === null) return prev;
                  return prev.map((p) =>
                    p.topic === detectedTopic
                      ? { ...p, turnDepth: nextDepth }
                      : p,
                  );
                }

                // New topic — find a depth whose image isn't already on screen.
                const visibleSrcs = new Set(
                  prev.map((p) => getSeriesImage(p.topic, p.turnDepth).src),
                );
                const startDepth = findNonCollidingDepth(
                  detectedTopic,
                  0,
                  visibleSrcs,
                );
                // All images for this topic are already visible — skip.
                if (startDepth === null) return prev;

                // Place panel intelligently without overlapping others.
                const vw = typeof window !== "undefined" ? window.innerWidth : 900;
                const vh = typeof window !== "undefined" ? window.innerHeight : 700;
                const panelW = 240;
                const id = `img-${detectedTopic}-${Date.now()}`;
                const pos = findNonOverlappingPosition(prev, vw, vh, panelW);
                const newPanel: ImagePanel = {
                  id,
                  topic: detectedTopic,
                  turnDepth: startDepth,
                  initialX: pos.x,
                  initialY: pos.y,
                };
                const next = [...prev, newPanel];
                // Drop oldest panel when at cap
                return next.length > MAX_IMAGE_PANELS ? next.slice(1) : next;
              });
            }
          } // close if (detectedTopic)
        } // close if (!isAppMode)

        if (!wasIdentified && updatedProfile.identified) {
          analytics.profileIdentified(updatedProfile.type, nextQualTurn);
        }

        if (isAppMode) {
          // Application mode: track application turns, show submit when limit reached
          const nextAppTurn = appModeOpts.applicationTurnCount + 1;
          setApplicationTurnCount(nextAppTurn);

          analytics.applicationTurn(
            nextAppTurn,
            updatedProfile.type,
            accumulated.length,
          );

          if (nextAppTurn >= APPLICATION_TURN_LIMIT) {
            setShowApplicationSubmit(true);
            analytics.applicationSubmitShown(updatedProfile.type, nextAppTurn);
          }
        } else {
          // Qualification mode: track qualification turns, show CTA at turn 8
          setTurnCount(nextQualTurn);

          if (nextQualTurn >= 8) {
            setShowCTA(true);
            analytics.ctaShown(nextQualTurn, updatedProfile.type);
          }

          analytics.conversationTurn(
            nextQualTurn,
            updatedProfile.type,
            accumulated.length,
          );
        }
      } catch (err) {
        clearTimeout(timeout);
        let msg = "Something went wrong. Try again.";
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            msg = "Connection timed out. Check your internet and try again.";
            analytics.errorShown("timeout", newTurnCount);
          } else {
            msg = err.message;
            analytics.errorShown("api_error", newTurnCount);
          }
        }
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
      }
    },
    [cancelTTS, speakSentence],
  );

  // ── Qualification conversation handlers ────────────────────────────────
  const startConversation = useCallback(async () => {
    if (conversationStarted) return;
    setConversationStarted(true);
    setShowHowToApply(false);
    analytics.conversationStarted();
    await streamMessage([], 0, INITIAL_PROFILE);
  }, [conversationStarted, streamMessage]);

  // When arriving from an external page (startImmediately=true) the
  // conversationStarted flag is already true (set via useState), so
  // startConversation's guard would bail. Instead fire the stream directly.
  useEffect(() => {
    if (startImmediately === true) {
      setShowHowToApply(false);
      analytics.conversationStarted();
      streamMessage([], 0, INITIAL_PROFILE);
    }
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!conversationStarted && e.key !== "Tab" && e.key !== "Escape") {
        startConversation();
      }
    },
    [conversationStarted, startConversation],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);


  const sendMessage = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;

    const userMessage: Message = {
      id: makeId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setInputValue("");
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Immediately surface the CTA panel when the user expresses apply/sign-up
    // intent in any language — don't make them wait for turn 8.
    if (!applicationMode && !showCTA && mentionsApply(content)) {
      setShowCTA(true);
    }

    if (applicationMode) {
      await streamMessage(updatedMessages, turnCount, profile, {
        applicationTurnCount,
      });
    } else {
      await streamMessage(updatedMessages, turnCount + 1, profile);
    }
  }, [
    inputValue,
    isStreaming,
    messages,
    turnCount,
    applicationTurnCount,
    applicationMode,
    showCTA,
    profile,
    streamMessage,
  ]);

  // ── P3-D: Session save handler ─────────────────────────────────────────
  // Called by CTAOverlay when the user opts in via the "Remember conversation"
  // checkbox and submits to the waitlist. POSTs the current conversation to
  // /api/sessions (Claude summarises it server-side), then stores the returned
  // opaque token in sessionStorage so it survives page refreshes within the
  // same browser session. Token clears automatically on browser close.
  //
  // Best-effort: all failures are swallowed — the waitlist UX must not break.
  const handleSaveSession = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          visitorType: profile.type,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { token?: string };
      if (data.token) {
        sessionStorage.setItem("miaw_session_token", data.token);
      }
    } catch {
      // Swallowed — session save is non-blocking and non-critical
    }
  }, [messages, profile.type]);

  // ── Waitlist handler ───────────────────────────────────────────────────
  const handleWaitlistSubmit = async (email: string) => {
    const res = await fetch(`${BASE}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        visitorType: profile.type,
        conversationLength: turnCount,
        referrer: document.referrer || undefined,
      }),
    });

    if (!res.ok) throw new Error("Failed to submit");

    const data = (await res.json()) as { domainTld?: string };
    analytics.waitlistSubmitted(
      profile.type,
      data.domainTld ?? "unknown",
      turnCount,
    );
  };

  // ── Quick-pick panel openers ───────────────────────────────────────────
  // Compute sensible initial positions for the info panels relative to the
  // current viewport so they land in the visible right-hand area.
  // ── Individual panel openers (generative layout) ──────────────────────
  //
  // ── Adaptive tiling helpers ───────────────────────────────────────────────
  //
  // getOpenDesktopPanels() reads show-state refs (always current) to build
  // the canonical ordered list of currently visible panels.
  // mindmap and program are mutually exclusive; institutions list/map share id.
  const getOpenDesktopPanels = useCallback((): PanelId[] => {
    const ids: PanelId[] = [];
    if      (showMindMapRef.current)           ids.push("mindmap");
    else if (showProgramPanelRef.current)      ids.push("program");
    if (showFacultyPanelRef.current)           ids.push("faculty");
    if (showGuestPanelRef.current)             ids.push("guests");
    if (showWorkshopPanelRef.current)          ids.push("workshop");
    if (showTimelinePanelRef.current)          ids.push("timeline");
    if (showInstitutionsPanelRef.current || showInstitutionsMapRef.current)
                                               ids.push("institutions");
    return ids;
  }, []);

  // applyAdaptiveLayoutToCanvas() dispatches computed slot positions + sizes
  // to all relevant React state setters in one synchronous batch.
  const applyAdaptiveLayoutToCanvas = useCallback(
    (layout: Partial<Record<string, LayoutSlot>>) => {
      const nextLayout: Partial<Record<string, { width: number; height: number }>> = {};
      if (layout.mindmap) {
        setMindMapPos({ x: layout.mindmap.x, y: layout.mindmap.y });
        nextLayout.mindmap = { width: layout.mindmap.width, height: layout.mindmap.height };
      }
      if (layout.program) {
        setProgramPanelPos({ x: layout.program.x, y: layout.program.y });
        nextLayout.program = { width: layout.program.width, height: layout.program.height };
      }
      if (layout.faculty) {
        setFacultyPanelPos({ x: layout.faculty.x, y: layout.faculty.y });
        nextLayout.faculty = { width: layout.faculty.width, height: layout.faculty.height };
      }
      if (layout.guests) {
        setGuestPanelPos({ x: layout.guests.x, y: layout.guests.y });
        nextLayout.guests = { width: layout.guests.width, height: layout.guests.height };
      }
      if (layout.workshop) {
        setWorkshopPanelPos({ x: layout.workshop.x, y: layout.workshop.y });
        nextLayout.workshop = { width: layout.workshop.width, height: layout.workshop.height };
      }
      if (layout.timeline) {
        setTimelinePanelPos({ x: layout.timeline.x, y: layout.timeline.y });
        nextLayout.timeline = { width: layout.timeline.width, height: layout.timeline.height };
      }
      if (layout.institutions) {
        setInstitutionsPanelPos({ x: layout.institutions.x, y: layout.institutions.y });
        setInstitutionsMapPos({ x: layout.institutions.x, y: layout.institutions.y });
        nextLayout.institutions = { width: layout.institutions.width, height: layout.institutions.height };
      }
      if (Object.keys(nextLayout).length > 0) {
        setPanelLayout((prev) => ({ ...prev, ...nextLayout }));
      }
    },
    [],
  );

  // retileDesktopPanels() is called by every panel opener and closer.
  // It reads current open-panel refs (always fresh), applies an optional
  // `adding` / `removing` delta, then computes and applies the
  // non-overlapping adaptive layout. No-op on mobile.
  //
  // Canonical panel order: program/mindmap → faculty → guests → workshop →
  // timeline → institutions.  Panels always appear left-to-right in this
  // order regardless of the order in which they were opened.
  const retileDesktopPanels = useCallback(
    (opts?: { adding?: PanelId; removing?: PanelId }) => {
      if (isMobileRef.current) return;

      const CANONICAL_ORDER: PanelId[] = [
        "mindmap", "program", "faculty", "guests", "workshop", "timeline", "institutions",
      ];
      const openSet = new Set<PanelId>(getOpenDesktopPanels());
      if (opts?.adding)   openSet.add(opts.adding);
      if (opts?.removing) openSet.delete(opts.removing);

      // mindmap and program are mutually exclusive — keep only the one being added.
      if (opts?.adding === "mindmap")  openSet.delete("program");
      if (opts?.adding === "program")  openSet.delete("mindmap");

      const panels = CANONICAL_ORDER.filter((id) => openSet.has(id));
      if (panels.length === 0) return;

      const vw       = window.innerWidth;
      const vh       = window.innerHeight;
      const chatEdge = chatPanelRightEdge(vw);

      const layout =
        panels.length === 1
          ? { [panels[0]]: computeSinglePanelSlot(panels[0], vw, vh, chatEdge) }
          : computeAdaptiveLayout(panels, vw, vh, chatEdge + PANEL_GAP);

      applyAdaptiveLayoutToCanvas(layout);
    },
    [getOpenDesktopPanels, applyAdaptiveLayoutToCanvas],
  );

  // ── Panel openers ─────────────────────────────────────────────────────────
  //
  // Each opener calls retileDesktopPanels() so all currently open panels are
  // repositioned at once to non-overlapping tiled slots. On mobile the tiling
  // is skipped and getMobilePanelSlot() is used instead.
  //
  // All openers share chatPanelRightEdge(vw) as the left boundary (the
  // single function defined above the component).

  const openProgramPanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setProgramPanelPos({ x: m.x, y: m.y });
      setShowProgramPanel(true);
      setPanelLayout((prev) => ({ ...prev, program: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "program", removing: "mindmap" });
      setShowMindMap(false);
      setZOrder((prev) => prev.filter((x) => x !== "mindmap"));
      setShowProgramPanel(true);
    }
  }, [retileDesktopPanels]);

  const openProgramAsMap = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setMindMapPos({ x: m.x, y: m.y });
      setShowMindMap(true);
      setZOrder((prev) => [...prev.filter((x) => x !== "mindmap"), "mindmap"]);
      setPanelLayout((prev) => ({ ...prev, mindmap: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "mindmap", removing: "program" });
      setShowProgramPanel(false);
      setShowMindMap(true);
      setZOrder((prev) => [...prev.filter((x) => x !== "mindmap"), "mindmap"]);
    }
  }, [retileDesktopPanels]);

  const openFacultyPanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setFacultyPanelPos({ x: m.x, y: m.y });
      setShowFacultyPanel(true);
      setPanelLayout((prev) => ({ ...prev, faculty: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "faculty" });
      setShowFacultyPanel(true);
    }
  }, [retileDesktopPanels]);

  // Workshop panel opener — placed right of the chat panel.
  const openWorkshopPanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setWorkshopPanelPos({ x: m.x, y: m.y });
      setShowWorkshopPanel(true);
    } else {
      retileDesktopPanels({ adding: "workshop" });
      setShowWorkshopPanel(true);
    }
  }, [retileDesktopPanels]);

  // ADR-018: Guest Lectures panel opener — layout engine places it right of
  // the chat panel so it never overlaps the conversation.
  const openGuestPanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setGuestPanelPos({ x: m.x, y: m.y });
      setShowGuestPanel(true);
      setPanelLayout((prev) => ({ ...prev, guests: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "guests" });
      setShowGuestPanel(true);
    }
  }, [retileDesktopPanels]);

  const handleSelectGuest = useCallback((slug: string) => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setGuestDetailPanelPos({ x: m.x, y: m.y });
    } else {
      const vw = window.innerWidth;
      setGuestDetailPanelPos({ x: Math.min(chatPanelRightEdge(vw) + 40, vw - 400), y: 80 });
    }
    setSelectedGuestSlug(slug);
  }, []);

  // ADR-020: Global view — opens all 5 content panels tiled left-to-right so
  // none overlap. Natural panel widths are used (cannot override from here);
  // panels are draggable so users can reposition after opening.
  //
  // Layout (computed at call-time from viewport width):
  //   Row 1: Faculty (WHO WE ARE) | MindMap (curriculum map, wide) | Guests (GUEST LECTURES)
  //   Row 2: Timeline (COURSE TIMELINE, wide left) | Institutions (right)
  //
  // On narrower viewports panels scale proportionally; they remain draggable.
  const openGlobalView = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // In Global view the chat panel is narrowed to GLOBAL_CHAT_W so content
    // tiles can use the freed space. panelAreaLeft reflects this narrower width.
    const panelAreaLeft = 56 + GLOBAL_CHAT_W + 10; // 10 px gap after chat
    setGlobalViewActive(true);

    // Compute tile positions + sizes from the generative layout engine so
    // every panel fills its assigned slot with no overlap and never covers the
    // conversation panel.
    const layout = computeGlobalLayout(vw, vh, panelAreaLeft);

    // Row 1, slot 0: MindMap (curriculum map) — wider slot combining the old
    // Program + Institutions columns so the map has more room to breathe.
    // computeGlobalLayout always populates these 5 keys — non-null assert is safe.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gl = layout as Required<typeof layout>;

    setMindMapPos({ x: gl.mindmap.x, y: gl.mindmap.y });
    setShowMindMap(true);
    setZOrder((prev) => [...prev.filter((x) => x !== "mindmap"), "mindmap"]);

    setFacultyPanelPos({ x: gl.faculty.x, y: gl.faculty.y });
    setShowFacultyPanel(true);

    setGuestPanelPos({ x: gl.guests.x, y: gl.guests.y });
    setShowGuestPanel(true);

    // Row 2 left: Timeline.
    setTimelinePanelPos({ x: gl.timeline.x, y: gl.timeline.y });
    setZOrder((prev) => [...prev.filter((x) => x !== "timeline"), "timeline"]);
    setShowTimelinePanel(true);

    // Row 2 right: Institutions map — sits in the empty slot right of Timeline.
    setInstitutionsMapPos({ x: gl.institutions.x, y: gl.institutions.y });
    setShowInstitutionsMap(true);
    setShowInstitutionsPanel(false);

    // Store the width + height for each slot so panel components can
    // resize their FloatingPanel and auto-fit internal zoom/SVG.
    setPanelLayout({
      mindmap:      { width: gl.mindmap.width,      height: gl.mindmap.height },
      institutions: { width: gl.institutions.width, height: gl.institutions.height },
      faculty:      { width: gl.faculty.width,      height: gl.faculty.height },
      guests:       { width: gl.guests.width,       height: gl.guests.height },
      timeline:     { width: gl.timeline.width,     height: gl.timeline.height },
    });
  }, []);

  const closeGlobalView = useCallback(() => {
    setGlobalViewActive(false);
    setShowMindMap(false);
    setZOrder((prev) => prev.filter((x) => x !== "mindmap"));
    setShowInstitutionsPanel(false);
    setShowInstitutionsMap(false);
    setSelectedInstitutionId(null);
    setShowFacultyPanel(false);
    setSelectedPersonSlug(null);
    setShowGuestPanel(false);
    setSelectedGuestSlug(null);
    setShowTimelinePanel(false);
    setZOrder((prev) => prev.filter((x) => x !== "timeline"));
    setPanelLayout({});
  }, []);

  // ADR-019: Institutions panel opener — layout engine places it right of the
  // chat panel so it never overlaps the conversation.
  const openInstitutionsPanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setInstitutionsPanelPos({ x: m.x, y: m.y });
      setShowInstitutionsPanel(true);
      setShowInstitutionsMap(false);
      setPanelLayout((prev) => ({ ...prev, institutions: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "institutions" });
      setShowInstitutionsPanel(true);
      setShowInstitutionsMap(false);
    }
  }, [retileDesktopPanels]);

  const openInstitutionsAsMap = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setInstitutionsMapPos({ x: m.x, y: m.y });
      setShowInstitutionsMap(true);
      setShowInstitutionsPanel(false);
      setPanelLayout((prev) => ({ ...prev, institutions: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "institutions" });
      setShowInstitutionsMap(true);
      setShowInstitutionsPanel(false);
    }
  }, [retileDesktopPanels]);

  // ── Panel close callbacks ─────────────────────────────────────────────────
  // Each close handler dismisses its panel and immediately retiles the
  // remaining open panels so they expand to fill the freed space.

  const openTimelinePanel = useCallback(() => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setTimelinePanelPos({ x: m.x, y: m.y });
      setZOrder((prev) => [...prev.filter((x) => x !== "timeline"), "timeline"]);
      setShowTimelinePanel(true);
      setPanelLayout((prev) => ({ ...prev, timeline: { width: m.width, height: m.height } }));
    } else {
      retileDesktopPanels({ adding: "timeline" });
      setZOrder((prev) => [...prev.filter((x) => x !== "timeline"), "timeline"]);
      setShowTimelinePanel(true);
    }
  }, [retileDesktopPanels]);

  const closeProgramPanel = useCallback(() => {
    setShowProgramPanel(false);
    setSelectedModuleCode(null);
    retileDesktopPanels({ removing: "program" });
  }, [retileDesktopPanels]);

  const closeMindMapPanel = useCallback(() => {
    setShowMindMap(false);
    setZOrder((prev) => prev.filter((x) => x !== "mindmap"));
    retileDesktopPanels({ removing: "mindmap" });
  }, [retileDesktopPanels]);

  const closeFacultyPanel = useCallback(() => {
    setShowFacultyPanel(false);
    setSelectedPersonSlug(null);
    retileDesktopPanels({ removing: "faculty" });
  }, [retileDesktopPanels]);

  const closeGuestPanel = useCallback(() => {
    setShowGuestPanel(false);
    setSelectedGuestSlug(null);
    retileDesktopPanels({ removing: "guests" });
  }, [retileDesktopPanels]);

  const closeWorkshopPanel = useCallback(() => {
    setShowWorkshopPanel(false);
    retileDesktopPanels({ removing: "workshop" });
  }, [retileDesktopPanels]);

  const closeTimelinePanel = useCallback(() => {
    setShowTimelinePanel(false);
    setZOrder((prev) => prev.filter((x) => x !== "timeline"));
    retileDesktopPanels({ removing: "timeline" });
  }, [retileDesktopPanels]);

  const closeInstitutionsList = useCallback(() => {
    setShowInstitutionsPanel(false);
    setSelectedInstitutionId(null);
    retileDesktopPanels({ removing: "institutions" });
  }, [retileDesktopPanels]);

  const closeInstitutionsMap = useCallback(() => {
    setShowInstitutionsMap(false);
    retileDesktopPanels({ removing: "institutions" });
  }, [retileDesktopPanels]);

  const handleSelectInstitution = useCallback((id: string) => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setInstitutionDetailPanelPos({ x: m.x, y: m.y });
    } else {
      const vw = window.innerWidth;
      setInstitutionDetailPanelPos({ x: Math.min(chatPanelRightEdge(vw) + 40, vw - 410), y: 80 });
    }
    setSelectedInstitutionId(id);
  }, []);

  const handleSelectModule = useCallback((code: string) => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setModulePanelPos({ x: m.x, y: m.y });
    } else {
      const vw = window.innerWidth;
      setModulePanelPos({ x: Math.min(chatPanelRightEdge(vw) + 40, vw - 400), y: 80 });
    }
    setSelectedModuleCode(code);
  }, []);

  const handleSelectPerson = useCallback((slug: string) => {
    if (isMobileRef.current) {
      const m = getMobilePanelSlot();
      setPersonPanelPos({ x: m.x, y: m.y });
    } else {
      const vw = window.innerWidth;
      setPersonPanelPos({ x: Math.min(chatPanelRightEdge(vw) + 40, vw - 400), y: 80 });
    }
    setSelectedPersonSlug(slug);
  }, []);

  // ── Application mode handlers ──────────────────────────────────────────
  const handleApplyNow = useCallback(async () => {
    // Snapshot qualification message count before adding any application messages
    qualificationMessageCountRef.current = messages.length;
    setShowCTA(false);
    setApplicationMode(true);

    analytics.applicationStarted(profile.type, turnCount);

    // Fire the opening application interview turn (agent speaks first)
    await streamMessage(messages, turnCount, profile, {
      applicationTurnCount: 0,
    });
  }, [messages, turnCount, profile, streamMessage]);

  const handleApplicationSubmit = useCallback(
    async (email: string, portfolioUrl: string, gdprConsent: boolean) => {
      const qualCount = qualificationMessageCountRef.current;
      const qualMsgs = messages.slice(0, qualCount).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const appMsgs = messages.slice(qualCount).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${BASE}/api/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          visitorType: profile.type,
          qualificationMessages: qualMsgs,
          applicationMessages: appMsgs,
          portfolioUrl: portfolioUrl || undefined,
          gdprConsent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string }).message || `Error ${res.status}`,
        );
      }

      const data = (await res.json()) as {
        applicationId: string;
        // P4-A: opaque token for the applicant portal — separate from the
        // internal applicationId, never exposed in admin URLs.
        statusToken?: string;
        ack: string;
        fitScore: number;
      };

      // P4-A: persist the status token so the applicant can check their
      // status. Stored in sessionStorage (survives page reload in the same
      // tab) and component state (drives the status link in the UI).
      if (data.statusToken) {
        try {
          sessionStorage.setItem("miaw_application_token", data.statusToken);
        } catch {
          // sessionStorage unavailable (private mode, quota exceeded) — non-critical
        }
        setApplicationStatusToken(data.statusToken);
      }

      // Render the personalised acknowledgment as an assistant message in the
      // conversation flow — the payoff moment of the application experience.
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: data.ack,
          timestamp: Date.now(),
        },
      ]);
      // NOTE: setShowApplicationSubmit(false) is intentionally NOT called here.
      // ApplyScreen manages its own "done" state and lets the user dismiss it
      // via the "← see your personalised response" button (onBack prop).
      // This gives them time to read the confirmation before returning.

      // P2-C: Trigger the convergence gradient effect — all blobs shift toward
      // purple synthesis. This fires Effect 3 above via state change.
      setApplicationAcknowledged(true);

      analytics.applicationSubmitted(
        profile.type,
        applicationTurnCount,
        data.fitScore,
        extractEmailDomainTld(email),
        Boolean(portfolioUrl),
      );
    },
    [messages, profile, applicationTurnCount],
  );

  // P4-C: Toggle voice input. Starts or stops Web Speech API recognition.
  //
  // Design choices:
  //   - interimResults:true  → live transcript appears in the input field as
  //     the user speaks, giving immediate feedback.
  //   - continuous:false     → recognition stops automatically after a natural
  //     pause; the user reviews the transcript then sends with Enter / ↵.
  //   - Language             → derived from conversation (detectedLangRef → BCP-47
  //     via SPEECH_LANG_TAGS), falling back to browser navigator.language.
  //   - Error handling       → "aborted" is our own stop() call, not a real error;
  //     all other errors stop listening and surface gracefully.
  //   - Mic button hidden    → when speechSupported is false (Firefox, older
  //     browsers) — no feature detection prompt, no polyfill.
  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    const langCode = detectedLangRef.current;
    recognition.lang =
      (langCode ? SPEECH_LANG_TAGS[langCode] : null) ??
      navigator.language ??
      "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("")
        .trim();
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      // "aborted" = our own stop() call — not a real error, skip state update
      if (event.error !== "aborted") {
        setIsListening(false);
      }
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // start() throws if called twice or in a non-HTTPS context in some browsers
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isListening]);

  // P4-C: Stop recognition and cancel TTS on unmount — prevents dangling
  // listeners / queued utterances if the component is torn down mid-session.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // P4-C: Keep ttsEnabledRef in sync with ttsEnabled state so the stable
  // streamMessage callback always reads the current value without needing
  // to be in its dependency array.
  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  // P4-C: Toggle TTS voice output. Cancels any in-flight synthesis on
  // turn-off so speech stops immediately when the user presses the button.
  const toggleTTS = useCallback(() => {
    setTtsEnabled((prev) => {
      if (prev && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────
  // Input bar is hidden when: qualification CTA is showing OR application
  // submit UI is showing (both are inline card replacements).
  // Keep the input bar visible while the CTA card is shown — users should be
  // able to keep asking questions after seeing "Join the waitlist / Apply now".
  // Only hide it on the final application-submit screen.
  const inputBarVisible = !showApplicationSubmit;

  return (
    <LayoutGroup>
      {/*
       * P2-C: canvasRef is attached here so gradient effects can call
       * element.style.setProperty('--c1', ...) directly on this element.
       * The @property color vars (--c1..--c4) have inherits:false, meaning
       * they must be set on the element that uses them — not on :root.
       */}
      <main
        ref={canvasRef}
        className="gradient-canvas w-screen relative flex flex-col overflow-hidden"
        style={{ height: "100dvh" }}
        onClick={!conversationStarted ? startConversation : undefined}
        aria-label="MIAW — Master In Intelligent Artificial Worlds"
      >
        {/* ── P5: Image reference panels ──────────────────────────────────
            Each detected topic opens a draggable glass panel with a
            contextual image. Panels accumulate as the conversation explores
            different topics (max MAX_IMAGE_PANELS — oldest removed at cap).
            Drag anywhere on the panel to reposition. ✕ to dismiss.
            Z-order managed by click-to-front via bringImagePanelToFront.
        */}
        <AnimatePresence>
          {conversationStarted && imagePanels.map((panel) => {
            const entry = getSeriesImage(panel.topic, panel.turnDepth);
            if (!entry) return null;
            return (
              <FloatingPanel
                key={panel.id}
                onClose={() => removeImagePanel(panel.id)}
                initialX={panel.initialX}
                initialY={panel.initialY}
                width={240}
                zIndex={getImagePanelZ(panel.id)}
                onPointerDown={() => bringImagePanelToFront(panel.id)}
                dragFromEverywhere
                className="floating-panel--image"
                resizable
              >
                <ZoomableBody fillContent isolateWhenZoomed>
                  <img
                    src={entry.src}
                    alt={entry.alt}
                    draggable={false}
                    loading="eager"
                  />
                </ZoomableBody>
              </FloatingPanel>
            );
          })}
        </AnimatePresence>

        {/* ── Curriculum mind map panel ────────────────────────────────────
            Opens when the user asks about modules / program structure.
            Replaces the static image panel for the "curriculum" topic with
            an animated SVG mind map that draws in branch by branch.
        */}
        <AnimatePresence>
          {conversationStarted && showMindMap && (
            <MindMapPanel
              key="mindmap"
              onClose={closeMindMapPanel}
              initialX={mindMapPos.x}
              initialY={mindMapPos.y}
              onSelectModule={handleSelectModule}
              onShowList={() => { closeMindMapPanel(); openProgramPanel(); }}
              zIndex={getImagePanelZ("mindmap")}
              onPanelPointerDown={() => bringImagePanelToFront("mindmap")}
              width={panelLayout.mindmap?.width}
              height={panelLayout.mindmap?.height}
            />
          )}
        </AnimatePresence>

        {/* ── Timeline panel ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {conversationStarted && showTimelinePanel && (
            <TimelinePanel
              key="timeline"
              onClose={closeTimelinePanel}
              initialX={timelinePanelPos.x}
              initialY={timelinePanelPos.y}
              zIndex={getImagePanelZ("timeline")}
              onPanelPointerDown={() => bringImagePanelToFront("timeline")}
              width={panelLayout.timeline?.width}
              height={panelLayout.timeline?.height}
            />
          )}
        </AnimatePresence>

        {/* ── Navigation pills (draggable) ─────────────────────────────────
            Each pill is an individually draggable NavPill (Framer Motion).
            Pills start centred at the top of the canvas; the user can drag
            them anywhere on screen without affecting the toggle behaviour.

            Architecture (ADR-017):
              • Positions are computed from window.innerWidth using approximate
                pill widths (NAV_PILL_APPROX_WIDTHS) so the row is centred on
                mount. After the first render Framer owns the x/y state.
              • Drag-vs-click disambiguation is handled inside NavPill via a
                boolean ref set in onDragStart and checked in onClick.
              • AnimatePresence enables staggered exit when applicationMode
                starts or the conversation resets.
              • stopPropagation is unnecessary here because canvas onClick is
                only registered when !conversationStarted (pills only render
                when conversationStarted is true).
        */}
        {/* ── Mobile scrollable nav bar ──────────────────────────────────────
            Fixed to the very top on phones. Non-draggable horizontal scroll.
            One tap opens the panel and closes all others (single-panel UX).
        */}
        {isMobile && conversationStarted && !applicationMode && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 300,
              height: 44,
              background: "rgba(0,0,0,0.24)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none",
              gap: 5,
              padding: "0 10px",
            }}
          >
            {([
              { id: "how-to-apply", label: ui.nav.howToApply, active: showDirectApplyPanel,
                onTap: () => { closeMobileSecondaryPanels(); setShowDirectApplyPanel(true); } },
              { id: "program", label: ui.nav.program, active: showMindMap || showProgramPanel,
                onTap: () => { closeMobileSecondaryPanels(); openProgramAsMap(); } },
              { id: "faculty", label: ui.nav.faculty, active: showFacultyPanel,
                onTap: () => { closeMobileSecondaryPanels(); openFacultyPanel(); } },
              { id: "guests", label: ui.nav.guests, active: showGuestPanel,
                onTap: () => { closeMobileSecondaryPanels(); openGuestPanel(); } },
              { id: "institutions", label: ui.nav.institutions, active: showInstitutionsPanel || showInstitutionsMap,
                onTap: () => { closeMobileSecondaryPanels(); openInstitutionsAsMap(); } },
              { id: "timeline", label: ui.nav.timeline, active: showTimelinePanel,
                onTap: () => {
                  closeMobileSecondaryPanels();
                  const m = getMobilePanelSlot();
                  setTimelinePanelPos({ x: m.x, y: m.y });
                  setShowTimelinePanel(true);
                  setPanelLayout((prev) => ({ ...prev, timeline: { width: m.width, height: m.height } }));
                }},
              { id: "workshop", label: ui.nav.workshop, active: showWorkshopPanel,
                onTap: () => { closeMobileSecondaryPanels(); openWorkshopPanel(); } },
            ] as const).map(({ id, label, active, onTap }) => (
              <button
                key={id}
                type="button"
                onClick={onTap}
                style={{
                  flexShrink: 0,
                  background: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.10)",
                  color: active ? "rgba(0,0,0,0.80)" : "rgba(255,255,255,0.78)",
                  border: `1px solid ${active ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 100,
                  padding: "5px 12px",
                  fontSize: "0.62rem",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: active ? 500 : 300,
                  letterSpacing: "0.11em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  outline: "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Navigation pills (draggable) — desktop only ───────────────────
            Hidden on mobile (< 768 px) — replaced by the scrollable nav bar.
        */}
        <AnimatePresence>
          {conversationStarted && !applicationMode && !isMobile && (() => {
            // Single centred row + Global pill top-right (desktop only).
            const ids = ["how-to-apply", "program", "faculty", "guests", "institutions", "timeline", "workshop"];
            const totalW = ids.reduce((s, id) => s + NAV_PILL_APPROX_WIDTHS[id], 0)
                         + NAV_PILL_GAP * (ids.length - 1);
            const startX = Math.max(8, Math.round(window.innerWidth / 2 - totalW / 2));
            let cursor = startX;
            const positions = ids.map((id) => {
              const x = cursor;
              cursor += NAV_PILL_APPROX_WIDTHS[id] + NAV_PILL_GAP;
              return x;
            });
            const yPositions = ids.map(() => NAV_PILL_Y);
            const globalX = Math.max(8, window.innerWidth - NAV_PILL_APPROX_WIDTHS["global"] - 16);
            const globalY = NAV_PILL_Y;

            return [
              <NavPill
                key="how-to-apply"
                id="how-to-apply"
                label="How to apply"
                active={showDirectApplyPanel}
                onClick={() => setShowDirectApplyPanel((v) => !v)}
                initialX={positions[0]}
                initialY={yPositions[0]}
              />,
              <NavPill
                key="program"
                id="program"
                label="Program"
                active={showMindMap || showProgramPanel}
                onClick={() => {
                  if (showMindMap || showProgramPanel) {
                    if (showMindMap) closeMindMapPanel(); else closeProgramPanel();
                  } else {
                    openProgramAsMap();
                  }
                }}
                initialX={positions[1]}
                initialY={yPositions[1]}
              />,
              <NavPill
                key="faculty"
                id="faculty"
                label="Faculty"
                active={showFacultyPanel}
                onClick={() => {
                  if (showFacultyPanel) {
                    closeFacultyPanel();
                  } else {
                    openFacultyPanel();
                  }
                }}
                initialX={positions[2]}
                initialY={yPositions[2]}
              />,
              <NavPill
                key="guests"
                id="guests"
                label="Guests"
                active={showGuestPanel}
                onClick={() => {
                  if (showGuestPanel) {
                    closeGuestPanel();
                  } else {
                    openGuestPanel();
                  }
                }}
                initialX={positions[3]}
                initialY={yPositions[3]}
              />,
              <NavPill
                key="institutions"
                id="institutions"
                label="Institutions"
                active={showInstitutionsPanel || showInstitutionsMap}
                onClick={() => {
                  if (showInstitutionsPanel || showInstitutionsMap) {
                    if (showInstitutionsPanel) closeInstitutionsList(); else closeInstitutionsMap();
                  } else {
                    openInstitutionsAsMap();
                  }
                }}
                initialX={positions[4]}
                initialY={yPositions[4]}
              />,
              <NavPill
                key="timeline"
                id="timeline"
                label="Timeline"
                active={showTimelinePanel}
                onClick={() => {
                  if (showTimelinePanel) {
                    closeTimelinePanel();
                  } else {
                    openTimelinePanel();
                  }
                }}
                initialX={positions[5]}
                initialY={yPositions[5]}
              />,
              <NavPill
                key="workshop"
                id="workshop"
                label="Workshop"
                active={showWorkshopPanel}
                onClick={() => {
                  if (showWorkshopPanel) {
                    closeWorkshopPanel();
                  } else {
                    openWorkshopPanel();
                  }
                }}
                initialX={positions[6]}
                initialY={yPositions[6]}
              />,
              (() => {
                // Derive global-active: true when all 5 content panels are open.
                const globalActive =
                  showMindMap &&
                  (showInstitutionsPanel || showInstitutionsMap) &&
                  showFacultyPanel &&
                  showGuestPanel &&
                  showTimelinePanel;
                return (
                  <NavPill
                    key="global"
                    id="global"
                    label="Global"
                    active={globalActive}
                    variant="global"
                    onClick={() => {
                      if (globalActive) {
                        closeGlobalView();
                      } else {
                        openGlobalView();
                      }
                    }}
                    initialX={globalX}
                    initialY={globalY}
                  />
                );
              })(),
            ];
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {!conversationStarted && (
            <motion.div
              key="landing"
              className="flex-1 flex flex-col items-center justify-center select-none"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              <motion.h1
                style={{
                  fontFamily: DEFAULT_LOGO_FONT,
                  fontSize: "clamp(66px, 9.5vw, 128px)",
                  lineHeight: 1.2,
                  color: "rgba(30,15,50,0.88)",
                  textShadow: "0 2px 24px rgba(200,180,238,0.18)",
                  imageRendering: "pixelated",
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                miaw
              </motion.h1>
              {/* Subtitle */}
              <motion.p
                className="mt-0 tracking-wide"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(11px, 1.1vw, 14px)",
                  letterSpacing: "0.09em",
                  color: "rgba(30,15,50,0.65)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
              >
                Master In Intelligent Artificial Worlds
              </motion.p>

              {/* Back-to-foundations link — visible only in pre-conversation
                  landing state. Gives the user a way to return to the program
                  overview without starting a chat first. */}
              {onGoToFoundations && (
                <motion.button
                  onClick={onGoToFoundations}
                  className="bg-transparent border-none cursor-pointer"
                  style={{
                    marginTop: 36,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(10px, 1vw, 12px)",
                    fontWeight: 400,
                    letterSpacing: "0.12em",
                    color: "rgba(30,15,50,0.45)",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: 100,
                    border: "1px solid rgba(30,15,50,0.15)",
                    background: "rgba(30,15,50,0.06)",
                    transition: "color 0.2s, border-color 0.2s, background 0.2s",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
                  whileHover={{
                    color: "rgba(30,15,50,0.78)",
                    borderColor: "rgba(30,15,50,0.28)",
                    background: "rgba(30,15,50,0.10)",
                  }}
                  aria-label="Return to foundations page"
                >
                  ← program overview
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat panel ──────────────────────────────────────────────────
            The conversation lives in a draggable glass FloatingPanel.
            On mobile it is hidden while any secondary panel is open —
            the user returns to it via the "💬 chat" back button.
        */}
        <AnimatePresence>
          {conversationStarted && (!isMobile || !anySecondaryPanelOpen) && (
            <FloatingPanel
              key="chat"
              resizable
              title={
                <motion.button
                  onClick={onGoToFoundations ?? resetToHome}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="text-white/90 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                  style={{
                    fontFamily: DEFAULT_LOGO_FONT,
                    fontSize: "clamp(11px, 1.4vw, 16px)",
                    lineHeight: 1.2,
                    imageRendering: "pixelated",
                  }}
                  aria-label="Return to foundations"
                  title="Back to program overview"
                >
                  miaw
                </motion.button>
              }
              initialX={isMobile ? 8 : 56}
              initialY={isMobile ? 140 : 80}
              width={
                globalViewActive
                  ? `${GLOBAL_CHAT_W}px`
                  : isMobile
                  ? "calc(100vw - 16px)"
                  : (showDirectApplyPanel || (showApplicationSubmit && !isStreaming))
                  ? "clamp(200px, 22vw, 260px)"
                  : "clamp(300px, 38vw, 520px)"
              }
              height={
                isMobile
                  ? "calc(100dvh - 155px - env(safe-area-inset-bottom, 0px))"
                  : globalViewActive
                  ? "calc(100dvh - 94px)"
                  : "calc(100dvh - 140px)"
              }
              zIndex={50}
              className="floating-panel--chat"
            >
              {/* Visually hidden live region — screen readers announce new messages */}
              <div
                aria-live="polite"
                aria-atomic="false"
                className="sr-only"
              >
                {messages.at(-1)?.role === "assistant"
                  ? messages.at(-1)?.content
                  : ""}
              </div>

              <div
                className="message-list flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4"
                role="log"
                aria-label="Conversation"
                aria-live="off"
              >
                {/* No bottom-push spacer — messages start from the top */}
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLatest={i === messages.length - 1}
                    isStreaming={isStreaming && i === messages.length - 1}
                  />
                ))}

                {/* Quick-pick navigation — shown after the first assistant message
                    (turn 0) while Claude hasn't asked a question yet. Disappears
                    automatically as soon as turnCount > 0 (user sent something). */}
                <AnimatePresence>
                  {turnCount === 0 && !isStreaming && messages.length >= 1 && messages[messages.length - 1]?.role === "assistant" && (
                    <QuickPicks
                      key="quick-picks"
                      onHowToApply={() => { setShowDirectApplyPanel(true); }}
                      onProgramStructure={() => { openProgramPanel(); }}
                      onWhoWeAre={() => { openFacultyPanel(); }}
                    />
                  )}
                </AnimatePresence>

                {isStreaming && messages.at(-1)?.role !== "assistant" && (
                  <div className="self-start">
                    <TypingIndicator />
                  </div>
                )}

                {/* Qualification CTA — shown after 8 turns */}
                {showCTA && !isStreaming && (
                  <CTAOverlay
                    visitorType={profile.type}
                    conversationLength={turnCount}
                    onWaitlistSubmit={handleWaitlistSubmit}
                    onApplyNow={handleApplyNow}
                    onSaveSession={handleSaveSession}
                    onOpenWaitlistScreen={() => setShowWaitlistScreen(true)}
                    lang={lang}
                  />
                )}

                {/* P4-A: Status portal link — shown after application acknowledged.
                    Lets the applicant bookmark their status page in the same session
                    without relying solely on the email link. */}
                {applicationAcknowledged && applicationStatusToken && (
                  <div className="message-enter mt-2 self-start">
                    <a
                      href={`/api/apply/portal?token=${encodeURIComponent(applicationStatusToken)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 text-xs hover:text-white/65 transition-colors"
                      style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                    >
                      Track your application status →
                    </a>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar — hidden during application submit card */}
              {inputBarVisible && (
                <div ref={inputBarRef} className="flex-shrink-0 px-6 input-bar pt-2">
                  <div className="flex items-end gap-3 border-b border-white/20 pb-1">
                    {/* sr-only label: Lighthouse and screen readers require every
                        input to have an associated label element. Placeholder text
                        alone is not a substitute (WCAG 1.3.1, 3.3.2). */}
                    <label htmlFor="chat-input" className="sr-only">
                      {applicationMode
                        ? "Your response to MIAW"
                        : "Message to MIAW"}
                    </label>
                    <input
                      id="chat-input"
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={ui.chat.placeholder}
                      className="chat-input flex-1 bg-transparent text-white placeholder:text-white/40 py-2 focus:outline-none"
                      style={{ fontSize: "16px", fontFamily: "Inter, sans-serif" }}
                      disabled={isStreaming}
                    />
                    {/* P4-C: Voice input button — hidden when panel is too narrow (<260px) */}
                    {speechSupported && chatPanelWidth >= 260 && (
                      <button
                        onClick={toggleVoiceInput}
                        disabled={isStreaming}
                        className={[
                          "transition-colors disabled:opacity-30 p-2",
                          chatPanelWidth >= 320
                            ? "min-w-[44px] min-h-[44px]"
                            : "min-w-[32px] min-h-[32px]",
                          "flex items-center justify-center",
                          isListening
                            ? "text-pink-300 mic-active"
                            : "text-white/40 hover:text-white/70",
                        ].join(" ")}
                        aria-label={
                          isListening ? "Stop voice input" : "Start voice input"
                        }
                        aria-pressed={isListening}
                      >
                        <svg
                          width={chatPanelWidth >= 320 ? 16 : 13}
                          height={chatPanelWidth >= 320 ? 16 : 13}
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <rect x="5.5" y="1" width="5" height="8" rx="2.5" fill="currentColor" />
                          <path d="M3 7.5c0 2.761 2.239 5 5 5s5-2.239 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                    {/* P4-C: TTS (voice output) button — hidden when panel is too narrow (<300px) */}
                    {ttsSupported && chatPanelWidth >= 300 && (
                      <button
                        onClick={toggleTTS}
                        disabled={isStreaming}
                        className={[
                          "transition-colors disabled:opacity-30 p-2",
                          chatPanelWidth >= 320
                            ? "min-w-[44px] min-h-[44px]"
                            : "min-w-[32px] min-h-[32px]",
                          "flex items-center justify-center",
                          ttsEnabled
                            ? "text-pink-300"
                            : "text-white/40 hover:text-white/70",
                        ].join(" ")}
                        aria-label={
                          ttsEnabled
                            ? "Disable voice responses"
                            : "Enable voice responses"
                        }
                        aria-pressed={ttsEnabled}
                      >
                        <svg
                          width={chatPanelWidth >= 320 ? 16 : 13}
                          height={chatPanelWidth >= 320 ? 16 : 13}
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path d="M9 2L5 5.5H2.5C2.224 5.5 2 5.724 2 6v4c0 .276.224.5.5.5H5L9 14V2Z" fill="currentColor" />
                          <path d="M11.5 5.5c1 .8 1.5 1.6 1.5 2.5s-.5 1.7-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={ttsEnabled ? 1 : 0.35} />
                          {ttsEnabled && (
                            <path d="M13.5 3.5C15.2 4.9 16 6.4 16 8s-.8 3.1-2.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          )}
                        </svg>
                      </button>
                    )}
                    {/* Send button */}
                    <button
                      onClick={sendMessage}
                      disabled={isStreaming || !inputValue.trim()}
                      className="text-white transition-colors disabled:opacity-30 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm"
                      aria-label="Send message"
                    >
                      ↵
                    </button>
                  </div>

                  {error && (
                    <p
                      className="text-white/90 text-xs mt-2"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </div>
              )}
            </FloatingPanel>
          )}
        </AnimatePresence>

        {!conversationStarted && (
          <CursorPrompt onClick={startConversation} />
        )}

        {/* ── Mobile: back-to-chat button ───────────────────────────────────
            Floats at the bottom-right when a secondary panel is showing on
            mobile so the user can return to the conversation in one tap.
        */}
        <AnimatePresence>
          {isMobile && conversationStarted && anySecondaryPanelOpen && (
            <motion.button
              key="mobile-chat-back"
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22 }}
              onClick={closeMobileSecondaryPanels}
              style={{
                position: "fixed",
                bottom: 24,
                right: 16,
                zIndex: 400,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                background: "rgba(0,0,0,0.38)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 100,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <span style={{ fontSize: "0.8rem", lineHeight: 1 }}>💬</span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 300,
                  letterSpacing: "0.10em",
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                assistant
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Program structure panel + module detail ───────────────────── */}
        <AnimatePresence>
          {showProgramPanel && (
            <ProgramPanel
              key="program-panel"
              onClose={closeProgramPanel}
              onSelectModule={handleSelectModule}
              initialX={programPanelPos.x}
              initialY={programPanelPos.y}
              onShowMap={() => { setShowProgramPanel(false); openProgramAsMap(); }}
              width={panelLayout.program?.width}
              height={panelLayout.program?.height}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedModuleCode && (
            <ModuleDetailPanel
              key={`module-detail-${selectedModuleCode}`}
              moduleCode={selectedModuleCode}
              onClose={() => setSelectedModuleCode(null)}
              initialX={modulePanelPos.x}
              initialY={modulePanelPos.y}
            />
          )}
        </AnimatePresence>

        {/* ── Faculty ("Who We Are") panel + person detail ──────────────── */}
        <AnimatePresence>
          {showFacultyPanel && (
            <FacultyPanel
              key="faculty-panel"
              onClose={closeFacultyPanel}
              onSelectPerson={handleSelectPerson}
              initialX={facultyPanelPos.x}
              initialY={facultyPanelPos.y}
              width={panelLayout.faculty?.width}
              height={panelLayout.faculty?.height}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedPersonSlug && (
            <PersonDetailPanel
              key={`person-detail-${selectedPersonSlug}`}
              slug={selectedPersonSlug}
              onClose={() => setSelectedPersonSlug(null)}
              initialX={personPanelPos.x}
              initialY={personPanelPos.y}
            />
          )}
        </AnimatePresence>

        {/* ── Guest Lectures panel + guest detail (ADR-018) ─────────────── */}
        <AnimatePresence>
          {showGuestPanel && (
            <GuestPanel
              key="guest-panel"
              onClose={closeGuestPanel}
              onSelectGuest={handleSelectGuest}
              initialX={guestPanelPos.x}
              initialY={guestPanelPos.y}
              width={panelLayout.guests?.width}
              height={panelLayout.guests?.height}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedGuestSlug && (
            <GuestDetailPanel
              key={`guest-detail-${selectedGuestSlug}`}
              slug={selectedGuestSlug}
              onClose={() => setSelectedGuestSlug(null)}
              initialX={guestDetailPanelPos.x}
              initialY={guestDetailPanelPos.y}
            />
          )}
        </AnimatePresence>

        {/* ── Workshop panel ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showWorkshopPanel && (
            <WorkshopPanel
              key="workshop-panel"
              onClose={closeWorkshopPanel}
              onSelectGuest={(slug) => {
                const vw = window.innerWidth;
                const x = Math.min(chatPanelRightEdge(vw) + 40, vw - 410);
                setGuestDetailPanelPos({ x, y: 80 });
                setSelectedGuestSlug(slug);
              }}
              initialX={workshopPanelPos.x}
              initialY={workshopPanelPos.y}
              width={panelLayout.workshop?.width}
              height={panelLayout.workshop?.height}
            />
          )}
        </AnimatePresence>

        {/* ── Institutions panel + institution detail (ADR-019) ─────────── */}
        <AnimatePresence>
          {showInstitutionsPanel && (
            <InstitutionsPanel
              key="institutions-panel"
              onClose={closeInstitutionsList}
              onSelectInstitution={handleSelectInstitution}
              onShowMap={() => { setShowInstitutionsPanel(false); openInstitutionsAsMap(); }}
              initialX={institutionsPanelPos.x}
              initialY={institutionsPanelPos.y}
              width={panelLayout.institutions?.width}
              height={panelLayout.institutions?.height}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInstitutionsMap && (
            <InstitutionsMapPanel
              key="institutions-map"
              onClose={closeInstitutionsMap}
              onSelectInstitution={handleSelectInstitution}
              onShowList={() => { setShowInstitutionsMap(false); openInstitutionsPanel(); }}
              initialX={institutionsMapPos.x}
              initialY={institutionsMapPos.y}
              width={panelLayout.institutions?.width ?? 700}
              height={panelLayout.institutions?.height}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedInstitutionId && (
            <InstitutionDetailPanel
              key={`institution-detail-${selectedInstitutionId}`}
              institutionId={selectedInstitutionId}
              onClose={() => setSelectedInstitutionId(null)}
              initialX={institutionDetailPanelPos.x}
              initialY={institutionDetailPanelPos.y}
            />
          )}
        </AnimatePresence>

        {/* ── Full-screen overlay screens ─────────────────────────────── */}
        {/* WaitlistScreen: triggered by CTAOverlay "Join the waitlist" */}
        {showWaitlistScreen && (
          <WaitlistScreen
            visitorType={profile.type}
            conversationLength={turnCount}
            onSubmit={handleWaitlistSubmit}
            onSaveSession={handleSaveSession}
            onBack={() => setShowWaitlistScreen(false)}
          />
        )}

        {/* ApplyScreen: shown either when:
            a) User clicked "How to apply" (showDirectApplyPanel) — fast path,
               skips the qualification + interview flow entirely.
            b) Application chat interview completed (showApplicationSubmit) —
               the existing end-of-interview submission form.
            Both cases use the same draggable, resizable FloatingPanel (ADR-014).
            onBack closes whichever path opened the panel. */}
        <AnimatePresence>
          {(showDirectApplyPanel || (showApplicationSubmit && !isStreaming)) && (
            <ApplyScreen
              key="apply-screen"
              onSubmit={handleApplicationSubmit}
              lang={lang}
              onBack={() => {
                setShowDirectApplyPanel(false);
                setShowApplicationSubmit(false);
              }}
              initialX={window.innerWidth < 640 ? 8 : Math.round((window.innerWidth - 600) / 2)}
              initialY={window.innerWidth < 640 ? 60 : 68}
            />
          )}
        </AnimatePresence>
      </main>
    </LayoutGroup>
  );
}
