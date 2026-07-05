import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Lang, LANG_LABELS, LANG_NAMES } from "../lib/i18n";

const ALL_LANGS: Lang[] = ["en", "es", "fr", "de", "pt", "zh", "ja"];

const T = {
  pixelFont: "'DePixelBreit', monospace" as const,
  bodyFont: "Inter, sans-serif" as const,
};

interface Props {
  lang: Lang;
  onChange: (l: Lang) => void;
}

export default function LanguageSelector({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.bodyFont,
          fontSize: "0.65rem",
          fontWeight: 400,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: open ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)",
          background: open ? "rgba(255,255,255,0.10)" : "transparent",
          border: "1px solid",
          borderColor: open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
          borderRadius: 100,
          padding: "5px 12px",
          cursor: "pointer",
          transition: "color 0.18s, background 0.18s, border-color 0.18s",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.42)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)";
          }
        }}
      >
        <span>{LANG_LABELS[lang]}</span>
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            opacity: 0.55,
          }}
        >
          <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: 130,
              background: "rgba(12,12,16,0.88)",
              backdropFilter: "blur(28px) saturate(140%)",
              WebkitBackdropFilter: "blur(28px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              overflow: "hidden",
              zIndex: 300,
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            }}
          >
            {ALL_LANGS.map((l) => {
              const active = l === lang;
              return (
                <button
                  key={l}
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(l); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "9px 14px",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.14s",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.bodyFont,
                      fontSize: "0.78rem",
                      fontWeight: active ? 400 : 300,
                      color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.50)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {LANG_NAMES[l]}
                  </span>
                  <span
                    style={{
                      fontFamily: T.bodyFont,
                      fontSize: "0.62rem",
                      fontWeight: 400,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: active ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.22)",
                    }}
                  >
                    {LANG_LABELS[l]}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
