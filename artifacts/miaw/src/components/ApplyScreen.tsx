// ---------------------------------------------------------------------------
// ApplyScreen — draggable, resizable application submission panel
//
// Previously a fixed full-screen overlay (z-50). Now rendered as a
// FloatingPanel — draggable by the title bar, resizable via the bottom-right
// corner handle — consistent with the image reference panels and the chat
// panel (ADR-014: Resizable Floating Panels).
//
// States: "form" → "processing" → "done"
// API:    POST /api/apply — called via onSubmit prop (assembles full
//         conversation history in ConversationCanvas.handleApplicationSubmit)
// Spec:   docs/screens/SCREENS_SPEC.md
//
// Dismissal: user-initiated from "done" state. handleApplicationSubmit does
// NOT call setShowApplicationSubmit(false) — that was removed so the screen
// stays alive to show the confirmation before the user chooses to go back.
// The panel's ✕ close button and "← back" both call onBack.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import FloatingPanel from "./FloatingPanel";
import { canvasUI, type Lang } from "../lib/i18n";

interface ApplyScreenProps {
  onSubmit: (
    email: string,
    portfolioUrl: string,
    gdprConsent: boolean,
  ) => Promise<void>;
  onBack: () => void;
  /** UI language for translated strings. */
  lang?: Lang;
  /** Panel initial X position (px). Defaults to centred-ish. */
  initialX?: number;
  /** Panel initial Y position (px). */
  initialY?: number;
}

type ScreenState = "form" | "processing" | "done";

export default function ApplyScreen({
  onSubmit,
  onBack,
  lang,
  initialX,
  initialY,
}: ApplyScreenProps) {
  const ui = canvasUI[lang ?? "en"].apply;
  const [state, setState] = useState<ScreenState>("form");
  const [email, setEmail] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute centred position once on mount — stable across re-renders.
  // useRef with lazy initialisation avoids reading window.innerWidth on every render.
  const positionRef = useRef<{ x: number; y: number; w: number } | null>(null);
  if (!positionRef.current) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 800;
    const isMob = vw < 640;
    const panelW = isMob ? Math.min(600, vw - 16) : 600;
    positionRef.current = {
      x: initialX ?? (isMob ? 8 : Math.round((vw - panelW) / 2)),
      y: initialY ?? (isMob ? 60 : 80),
      w: panelW,
    };
  }
  const { x: defaultX, y: defaultY, w: defaultW } = positionRef.current;

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError(ui.errorEmail);
      return;
    }
    if (!gdprConsent) {
      setError(ui.errorConsent);
      return;
    }
    setLoading(true);
    setError(null);
    setState("processing");
    try {
      await onSubmit(email.trim(), portfolioUrl.trim(), gdprConsent);
      setState("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : ui.errorGeneric,
      );
      setState("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FloatingPanel
      title={
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {ui.panelTitle}
        </span>
      }
      onClose={state !== "processing" ? onBack : undefined}
      initialX={defaultX}
      initialY={defaultY}
      width={defaultW}
      height={undefined}
      zIndex={45}
      className="floating-panel--chat floating-panel--apply"
      resizable
    >
      <div className="px-5 sm:px-10 py-6 sm:py-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
        {/* ── Processing ──────────────────────────────────────────────── */}
        {state === "processing" && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-8 h-8 border-2 border-white/18 border-t-white/65 rounded-full animate-spin mx-auto mb-7"
              aria-hidden="true"
            />
            <p
              className="text-white text-base font-medium mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {ui.processingTitle}
            </p>
            <p
              className="text-white/45 text-xs leading-relaxed max-w-xs mx-auto"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              {ui.processingDesc}
            </p>
          </motion.div>
        )}

        {/* ── Done ────────────────────────────────────────────────────── */}
        {state === "done" && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center mx-auto mb-6"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-white/70"
              >
                <path
                  d="M3 8.5L6 11.5L13 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="text-white text-xl font-medium mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {ui.doneTitle}
            </p>
            <p
              className="text-white/58 text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              {ui.doneDesc}
            </p>
            <button
              onClick={onBack}
              className="mt-10 text-white/40 text-xs hover:text-white/65 transition-colors cursor-pointer"
              style={{ fontFamily: "Inter, sans-serif" }}
              aria-label="Return to see personalised response in the conversation"
            >
              {ui.doneBack}
            </button>
          </motion.div>
        )}

        {/* ── Form ────────────────────────────────────────────────────── */}
        {state === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 0.1, 0.22, 1] }}
          >
            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-8" aria-label="Application steps">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/55">
                    <path d="M2 5.5L4 7.5L8.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white/38 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
                  {ui.stepConversation}
                </span>
              </div>

              <div className="flex-1 h-px bg-white/12" aria-hidden="true" />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-white/75 flex items-center justify-center" aria-hidden="true">
                  <span className="text-[9px] font-semibold" style={{ color: "#2a1f5a" }}>2</span>
                </div>
                <span className="text-white/85 text-xs font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  {ui.stepSubmit}
                </span>
              </div>

              <div className="flex-1 h-px bg-white/12" aria-hidden="true" />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-5 h-5 rounded-full border border-white/18" aria-hidden="true" />
                <span className="text-white/28 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
                  {ui.stepReview}
                </span>
              </div>
            </div>

            <h2
              className="text-white text-2xl font-medium mb-2 leading-snug"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {ui.heading}
            </h2>
            <p
              className="text-white/52 text-sm mb-8 leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              {ui.subheading}
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="as-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="as-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !loading && handleSubmit()
                  }
                  placeholder="your@email.com"
                  aria-invalid={!!error && !email.includes("@")}
                  disabled={loading}
                  className="w-full bg-transparent border-b border-white/38 text-white placeholder:text-white/32 text-sm py-2.5 px-0 focus:outline-none focus:border-white/75 transition-colors disabled:opacity-55"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 300 }}
                />
              </div>

              <div>
                <label htmlFor="as-portfolio" className="sr-only">
                  Portfolio or work samples URL (optional)
                </label>
                <input
                  id="as-portfolio"
                  type="text"
                  autoComplete="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="portfolio, GitHub, or work samples — optional"
                  disabled={loading}
                  className="w-full bg-transparent border-b border-white/22 text-white placeholder:text-white/28 text-sm py-2.5 px-0 focus:outline-none focus:border-white/55 transition-colors disabled:opacity-55"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 300 }}
                />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  id="as-gdpr"
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => {
                    setGdprConsent(e.target.checked);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-white cursor-pointer disabled:opacity-55"
                  aria-describedby="as-gdpr-label"
                />
                <label
                  id="as-gdpr-label"
                  htmlFor="as-gdpr"
                  className="text-white/45 text-xs leading-relaxed cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                >
                  {ui.gdprLabel}
                </label>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-white/75 text-xs mt-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !gdprConsent || !email.trim()}
              className="mt-9 w-full py-3.5 px-6 bg-white/12 border border-white/25 rounded-xl text-white text-sm font-medium hover:bg-white/22 active:bg-white/15 transition-colors disabled:opacity-38 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "Inter, sans-serif" }}
              aria-label="Submit application"
            >
              {ui.submitBtn}
            </button>
          </motion.div>
        )}
      </div>
    </FloatingPanel>
  );
}
