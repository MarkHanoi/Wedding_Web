import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { getTodaysPalette } from "./lib/dailyPalette";

const WeddingCanvas = lazy(() => import("./components/WeddingCanvas"));

const splashExitVariants = {
  exit: {
    opacity: 0,
    scale: 1.06,
    transition: { duration: 0.55, ease: [0.4, 0, 1, 1] as const },
  },
};

const canvasVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

function SplashScreen({ onDone }: { onDone: () => void }) {
  const palette = getTodaysPalette();

  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
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
        style={{
          fontFamily: "'DePixelBreit', monospace",
          fontSize: "clamp(48px, 9vw, 104px)",
          color: "rgba(255,255,255,0.90)",
          letterSpacing: "0.06em",
          lineHeight: 1,
          userSelect: "none",
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        C &amp; A
      </motion.div>

      <motion.div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          fontSize: "clamp(11px, 1.4vw, 14px)",
          color: "rgba(255,255,255,0.60)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginTop: 24,
          userSelect: "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      >
        Clémence &amp; Antonio
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<"splash" | "canvas">("splash");

  const handleSplashDone = useCallback(() => setView("canvas"), []);

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          {view === "splash" && (
            <SplashScreen key="splash" onDone={handleSplashDone} />
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
              <WeddingCanvas />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
