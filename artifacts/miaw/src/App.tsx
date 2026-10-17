import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import HeroPage from "./components/HeroPage";
import { getBrowserLanguage, isLanguage, type Language } from "./lib/i18n";

const WeddingCanvas = lazy(() => import("./components/WeddingCanvas"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const GiftsPage = lazy(() => import("./components/GiftsPage"));

type View = "hero" | "explore";
const LANGUAGE_STORAGE_KEY = "miaw-language";

function getInitialLanguage(): Language {
  const browserLanguage = getBrowserLanguage([
    ...(window.navigator.languages ?? []),
    window.navigator.language,
  ]);

  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(savedLanguage)) {
      return savedLanguage;
    }
  } catch {
    return browserLanguage;
  }

  return browserLanguage;
}

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
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const isAdminPage = window.location.pathname.replace(/\/+$/, "") === "/admin";
  const isGiftsPage = window.location.pathname.replace(/\/+$/, "") === "/gifts";

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-PT" : language;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Keep the selected language for this visit if browser storage is unavailable.
    }
  }, [language]);

  useEffect(() => {
    if (isAdminPage) return;
    const eventId = window.crypto.randomUUID();
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {
      // Analytics must not prevent guests from viewing or replying to the invitation.
    });
  }, [isAdminPage]);

  const goToExplore = useCallback(() => {
    setView("explore");
  }, []);
  const changeLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        {isAdminPage ? <AdminPage /> : isGiftsPage ? (
          <GiftsPage language={language} onLanguageChange={changeLanguage} />
        ) : (
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
              <HeroPage
                onExplore={goToExplore}
                language={language}
                onLanguageChange={changeLanguage}
              />
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
              <WeddingCanvas
                onGoToHero={() => setView("hero")}
                language={language}
                onLanguageChange={changeLanguage}
              />
            </motion.div>
          )}

        </AnimatePresence>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
