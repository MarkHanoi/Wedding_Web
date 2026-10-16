import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import HeroPage from "./components/HeroPage";

const WeddingCanvas = lazy(() => import("./components/WeddingCanvas"));

type View = "hero" | "explore";

const exploreVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const heroVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 1.03, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] as const } },
};

export default function App() {
  const [view, setView] = useState<View>("hero");

  const goToExplore = useCallback(() => {
    setView("explore");
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">

          {view === "hero" && (
            <motion.div
              key="hero"
              variants={heroVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
            >
              <HeroPage onExplore={goToExplore} />
            </motion.div>
          )}

          {view === "explore" && (
            <motion.div
              key="explore"
              variants={exploreVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: "100%", height: "100%" }}
            >
              <WeddingCanvas onGoToHero={() => setView("hero")} />
            </motion.div>
          )}

        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
