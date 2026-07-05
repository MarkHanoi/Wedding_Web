import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { getTodaysPalette } from "./lib/dailyPalette";
import { type Lang } from "./lib/i18n";

const ConversationCanvas = lazy(() => import("./components/ConversationCanvas"));
const TimelinePage       = lazy(() => import("./pages/TimelinePage"));
const FoundationsPage    = lazy(() => import("./pages/FoundationsPage"));
const AdvancedPage       = lazy(() => import("./pages/AdvancedPage"));

const path = window.location.pathname.replace(/\/$/, "") || "/";

type View = "splash" | "foundations" | "advanced" | "canvas";

// ── Splash variants ──────────────────────────────────────────────────────────
// Exit: scale up slightly as if the curtain rises, revealing foundations.
// The background gradient is the same in both splash and foundations, so
// the exit is invisible — only the logo / subtitle fade out.
const splashExitVariants = {
  exit: {
    opacity: 0,
    scale: 1.06,
    transition: { duration: 0.55, ease: [0.4, 0, 1, 1] as const },
  },
};

// ── Foundations variants ─────────────────────────────────────────────────────
// Enter from below with a blur-to-focus reveal — premium editorial feel.
// Exit is instant so the canvas appears immediately.
const foundationsVariants = {
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.08, ease: "easeIn" as const },
  },
};

// ── Canvas variants ──────────────────────────────────────────────────────────
// Instant appear — no fade delay when switching from foundations.
// Coming back from canvas to foundations uses a quick fade.
const canvasVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.12, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  },
};

// ── SplashScreen ─────────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  const palette = getTodaysPalette();

  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="gradient-canvas"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        "--c1": palette.c1,
        "--c2": palette.c2,
        "--c3": palette.c3,
        "--c4": palette.c4,
      } as React.CSSProperties}
      variants={splashExitVariants}
      exit="exit"
      onClick={onDone}
    >
      <motion.div
        className="logo-enter"
        style={{
          fontFamily: "'DePixelBreit', monospace",
          fontSize: "clamp(58px, 10vw, 116px)",
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.04em",
          lineHeight: 1,
          userSelect: "none",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        miaw
      </motion.div>

      <motion.div
        className="subtitle-enter"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "clamp(12px, 1.5vw, 15px)",
          color: "rgba(255,255,255,0.65)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginTop: 20,
          userSelect: "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        Master in Intelligent Artificial Worlds
      </motion.div>
    </motion.div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("splash");
  const [openApplyOnCanvas, setOpenApplyOnCanvas] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  if (path === "/timeline") {
    return (
      <ErrorBoundary>
        <Suspense fallback={null}>
          <TimelinePage />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">

          {view === "splash" && (
            <SplashScreen key="splash" onDone={() => setView("foundations")} />
          )}

          {view === "foundations" && (
            <motion.div
              key="foundations"
              variants={foundationsVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
            >
              <FoundationsPage
                onEnterMiaw={() => setView("canvas")}
                onHowToApply={() => { setOpenApplyOnCanvas(true); setView("canvas"); }}
                onSwitchToAdvanced={() => setView("advanced")}
                lang={lang}
                setLang={setLang}
              />
            </motion.div>
          )}

          {view === "advanced" && (
            <motion.div
              key="advanced"
              variants={foundationsVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
            >
              <AdvancedPage
                onEnterMiaw={() => setView("canvas")}
                onHowToApply={() => { setOpenApplyOnCanvas(true); setView("canvas"); }}
                onSwitchToFoundations={() => setView("foundations")}
                lang={lang}
                setLang={setLang}
              />
            </motion.div>
          )}

          {view === "canvas" && (
            <motion.div
              key="canvas"
              variants={canvasVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
            >
              <ConversationCanvas
                onGoToFoundations={() => { setOpenApplyOnCanvas(false); setView("foundations"); }}
                startImmediately
                initialShowApply={openApplyOnCanvas}
                lang={lang}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
