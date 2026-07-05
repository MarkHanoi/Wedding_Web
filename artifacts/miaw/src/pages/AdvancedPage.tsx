import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getTodaysPalette } from "../lib/dailyPalette";
import { advancedTranslations, type Lang } from "../lib/i18n";
import LanguageSelector from "../components/LanguageSelector";
import { a00Placeholder } from "../lib/a00Placeholder";
import "./FoundationsPage.css";

interface Props {
  onEnterMiaw: () => void;
  onHowToApply: () => void;
  onSwitchToFoundations: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const ADVANCED_MODULE_STATIC = [
  { num: "A00", load: "40h", accumulated: "0h",   image: "/images/a00-setup.webp", placeholder: a00Placeholder },
  { num: "A01", load: "40h", accumulated: "40h",  image: "/images/post8-interfaces.webp", video: "/images/a01-territory.mp4" },
  { num: "A02", load: "40h", accumulated: "80h",  image: "/images/summer-jellyfish.webp", video: "/images/a02-seeing-the-world.mp4" },
  { num: "A03", load: "40h", accumulated: "120h", image: "/images/a03.webp" },
  { num: "A04", load: "40h", accumulated: "160h", image: "/images/post2-procedural.webp", video: "/images/a04-modelling-the-world.mp4" },
  { num: "A05", load: "40h", accumulated: "200h", image: "/images/F05.webp" },
  { num: "A06", load: "40h", accumulated: "240h", image: "/images/a06-communicating.webp" },
  { num: "A07", load: "40h", accumulated: "280h", image: "/images/post6-context.webp", video: "/images/a07-governing-the-world.mp4" },
  { num: "A08", load: "40h", accumulated: "360h", image: "/images/three.webp" },
];

const ADVANCED_WORKSHOP_STATIC = [
  { num: "A·01", modules: ["A00", "A01", "A02", "A03"], image: "/images/a-workshop-01.jpg" },
  { num: "A·02", modules: ["A04", "A05"],               image: "/images/a-workshop-02.jpg" },
  { num: "A·03", modules: ["A06", "A07", "A08"],        image: "/images/a-workshop-03.jpg" },
];

const S = {
  pixelFont: "'DePixelBreit', monospace" as const,
  bodyFont:  "Inter, sans-serif" as const,
  // Dark tones — for elements on the light gradient background
  dark88:    "rgba(30,15,50,0.88)",
  dark70:    "rgba(30,15,50,0.70)",
  dark55:    "rgba(30,15,50,0.55)",
  dark38:    "rgba(30,15,50,0.38)",
  dark28:    "rgba(30,15,50,0.28)",
  // White tones — kept for dark glass panels (topbar, footer, chat, workshop cards)
  white88:   "rgba(255,255,255,1.00)",
  white70:   "rgba(255,255,255,0.90)",
  white55:   "rgba(255,255,255,0.80)",
  white38:   "rgba(255,255,255,0.65)",
  white28:   "rgba(255,255,255,0.50)",
  divider:   "1px solid rgba(255,255,255,0.08)",
} as const;

const labelStyle: React.CSSProperties = {
  fontFamily: S.bodyFont,
  fontSize: "0.70rem",
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: S.dark38,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: S.bodyFont,
  fontSize: "0.94rem",
  fontWeight: 400,
  lineHeight: 1.65,
  color: S.dark70,
};

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: S.bodyFont,
        fontSize: "0.65rem",
        fontWeight: 400,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: S.dark55,
        padding: "4px 11px",
        borderRadius: 100,
        background: "rgba(30,15,50,0.06)",
        border: "1px solid rgba(30,15,50,0.10)",
        marginBottom: 18,
      }}
    >
      {children}
    </span>
  );
}

function TopicChip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: S.bodyFont,
        fontSize: "0.75rem",
        fontWeight: 300,
        color: S.dark55,
        padding: "5px 11px",
        background: "rgba(30,15,50,0.05)",
        border: "1px solid rgba(30,15,50,0.08)",
        borderRadius: 6,
      }}
    >
      {label}
    </span>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ ...labelStyle, display: "block", marginBottom: 4 }}>{label}</span>
      <span style={{ fontFamily: S.bodyFont, fontSize: "0.82rem", fontWeight: 300, color: S.dark55 }}>
        {value}
      </span>
    </div>
  );
}

interface ModuleCardProps {
  num: string;
  load: string;
  accumulated: string;
  image: string;
  video?: string;
  placeholder?: string;
  tag: string;
  title: string;
  subtitle: string;
  deliverable?: string;
  desc: string;
  topics: string[];
  workshopSession: string;
  contentsLabel: string;
  loadLabel: string;
  workshopLabel: string;
  index: number;
}

function ModuleCard({
  num, load, accumulated, image, video, placeholder,
  tag, title, subtitle, deliverable, desc, topics, workshopSession,
  contentsLabel, loadLabel, workshopLabel,
  index,
}: ModuleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.article
      className="fp-module-article"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.04 * (index % 4) }}
    >
      <div className="fp-module-num">
        <div
          style={{
            fontFamily: S.bodyFont,
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 700,
            color: S.dark28,
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {num}
        </div>
      </div>

      <div className="fp-module-image">
        <div
          className="fp-img-wrap"
          style={placeholder ? {
            backgroundImage: `url(${placeholder})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: imgLoaded ? "none" : "blur(8px)",
            transition: "filter 0.4s ease",
          } : undefined}
        >
          {video ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={image}
              style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={image}
              alt={title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              style={placeholder ? {
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.4s ease",
              } : undefined}
            />
          )}
        </div>
      </div>

      <div className="fp-module-content">
        <TagPill>{tag}</TagPill>

        <h3
          style={{
            fontFamily: S.bodyFont,
            fontSize: "clamp(15px, 1.8vw, 22px)",
            color: S.dark88,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
            marginBottom: 8,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: S.bodyFont,
            fontSize: "0.82rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: S.dark38,
            marginBottom: 22,
            lineHeight: 1.55,
            letterSpacing: "0.01em",
          }}
        >
          {subtitle}
        </p>

        {deliverable && (
          <div
            style={{
              marginBottom: 24,
              padding: "12px 16px",
              background: "rgba(30,15,50,0.05)",
              border: "1px solid rgba(30,15,50,0.14)",
              borderLeft: "3px solid rgba(30,15,50,0.45)",
              borderRadius: 2,
            }}
          >
            <div style={{ ...labelStyle, marginBottom: 7, letterSpacing: "0.12em" }}>Deliverable</div>
            <p
              style={{
                fontFamily: S.bodyFont,
                fontSize: "0.83rem",
                fontWeight: 600,
                color: S.dark88,
                lineHeight: 1.55,
                margin: 0,
                letterSpacing: "0.005em",
              }}
            >
              {deliverable}
            </p>
          </div>
        )}

        <p style={{ ...bodyStyle, marginBottom: 24, maxWidth: 600 }}>{desc}</p>

        <div style={{ ...labelStyle, marginBottom: 10 }}>{contentsLabel}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 28 }}>
          {topics.map((t) => (
            <TopicChip key={t} label={t} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 36,
            flexWrap: "wrap",
            paddingTop: 20,
            borderTop: "1px solid rgba(30,15,50,0.10)",
          }}
        >
          <MetaField label={loadLabel} value={`${load} / ${accumulated} accumulated`} />
          <MetaField label={workshopLabel} value={workshopSession} />
        </div>
      </div>
    </motion.article>
  );
}

function WorkshopCard({
  num, modules, image, title, weeks, weekLabel,
}: {
  num: string;
  modules: string[];
  image: string;
  title: string;
  weeks: string[];
  weekLabel: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(0,0,0,0.30)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ height: 240, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img
          src={image}
          alt={title}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            opacity: 0.50,
            filter: "saturate(0.65)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.60) 100%)",
          }}
        />
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        <span style={{ ...labelStyle, display: "block", marginBottom: 8 }}>{num}</span>

        <h3
          style={{
            fontFamily: S.bodyFont,
            fontSize: "clamp(13px, 1.4vw, 17px)",
            color: S.white88,
            fontWeight: 600,
            letterSpacing: "0.01em",
            lineHeight: 1.55,
            marginBottom: 18,
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </h3>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
          {modules.map((m) => (
            <span
              key={m}
              style={{
                fontFamily: S.bodyFont,
                fontSize: "0.65rem",
                fontWeight: 400,
                letterSpacing: "0.10em",
                color: S.white55,
                padding: "3px 9px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 100,
              }}
            >
              {m}
            </span>
          ))}
        </div>

        <div
          style={{
            borderTop: S.divider,
            paddingTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          {weeks.map((w, wi) => (
            <div
              key={wi}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <span style={{ ...labelStyle, fontSize: "0.58rem" }}>{weekLabel} {wi + 1}</span>
              <span style={{ fontFamily: S.bodyFont, fontSize: "0.75rem", fontWeight: 300, color: "rgba(255,255,255,0.45)" }}>
                {w}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CHAT_BASE_ADV = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
let _awid = 0;
function awid() { return `a-${Date.now()}-${++_awid}`; }

function MiniChatWidget({ onEnterMiaw, label, cta, placeholder }: {
  onEnterMiaw: () => void;
  label: string;
  cta: string;
  placeholder: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const hasDragged = useRef(false);
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (!text.trim() || streaming) return;
    const userMsg = { id: awid(), role: "user" as const, content: text };
    const assistantId = awid();
    setMessages(prev => [
      ...prev,
      ...(silent ? [] : [userMsg]),
      { id: assistantId, role: "assistant" as const, content: "" },
    ]);
    setInput("");
    setStreaming(true);
    try {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const history = [...messages, ...(silent ? [] : [userMsg])].map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch(`${CHAT_BASE_ADV}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: silent ? [{ role: "user", content: text }] : history }),
        signal: ctrl.signal,
      });
      if (!resp.ok || !resp.body) throw new Error("failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snap = acc;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: snap } : m));
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "Something went wrong. Please try again." } : m));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (!greeted.current) {
      greeted.current = true;
      setMessages([{ id: awid(), role: "assistant", content: "What brings you to MIAW?" }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMobile) {
    return (
      <motion.button
        aria-label="Open MIAW conversation"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.4 },
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnterMiaw}
        style={{
          position: "fixed", top: 68, right: 14, zIndex: 200,
          display: "flex", alignItems: "center", gap: 7, padding: "9px 14px",
          background: "rgba(0,0,0,0.32)", backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.14)", borderRadius: 100,
          cursor: "pointer", outline: "none", userSelect: "none",
        }}
      >
        <span style={{ fontFamily: S.pixelFont, fontSize: 10, color: S.white88, letterSpacing: "0.05em", lineHeight: 1 }}>miaw</span>
        <span style={{ fontFamily: S.bodyFont, fontSize: "0.65rem", fontWeight: 300, letterSpacing: "0.08em", color: "rgba(255,255,255,0.60)" }}>assistant</span>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", lineHeight: 1 }}>→</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      drag dragMomentum={false} dragElastic={0.06}
      onDragStart={() => { hasDragged.current = false; setIsDragging(true); }}
      onDrag={() => { hasDragged.current = true; }}
      onDragEnd={() => { setIsDragging(false); }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.5 }}
      className="fp-mini-chat"
      style={{
        position: "fixed", top: 68, right: 24, zIndex: 200,
        width: "clamp(240px, 20vw, 300px)",
        cursor: isDragging ? "grabbing" : "default",
        userSelect: "none", touchAction: "none",
      }}
    >
      <div style={{
        background: "rgba(0,0,0,0.38)", backdropFilter: "blur(28px) saturate(140%)",
        WebkitBackdropFilter: "blur(28px) saturate(140%)",
        border: isDragging ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.10)",
        borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
        display: "flex", flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
      }}>
        {/* Header — click (without dragging) navigates to the canvas */}
        <div
          onClick={() => { if (!hasDragged.current) onEnterMiaw(); }}
          style={{
            padding: "11px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: isDragging ? "grabbing" : "pointer",
          }}
        >
          <span style={{ fontFamily: S.pixelFont, fontSize: 13, color: S.white88, letterSpacing: "0.04em" }}>{label}</span>
          <span style={{ fontFamily: S.bodyFont, fontSize: "0.6rem", fontWeight: 300, letterSpacing: "0.12em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}>{cta} →</span>
        </div>
        <div style={{
          overflowY: "auto", padding: "12px 14px",
          maxHeight: 260, minHeight: 100,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
              <span style={{ fontFamily: S.bodyFont, fontSize: "0.72rem", fontWeight: 300, color: "rgba(255,255,255,0.20)", letterSpacing: "0.06em" }}>{placeholder}</span>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "90%", padding: "7px 11px",
                borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                background: m.role === "user" ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
                fontFamily: S.bodyFont, fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.55,
              }}>
                {m.content || (
                  <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.45)", display: "inline-block" }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={e => { e.preventDefault(); if (!hasDragged.current) sendMessage(input); }}
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "9px 12px", display: "flex", gap: 7, alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="type here..."
            disabled={streaming}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "rgba(255,255,255,0.75)",
              fontFamily: S.bodyFont, fontSize: "0.75rem", fontWeight: 300,
              letterSpacing: "0.03em", outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              background: "none", border: "none",
              cursor: input.trim() ? "pointer" : "default",
              color: input.trim() ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.20)",
              fontSize: 15, lineHeight: 1, padding: "2px 4px", transition: "color 0.18s",
            }}
          >↑</button>
        </form>
      </div>
    </motion.div>
  );
}

function ProgramSwitcher({ active, onSwitch }: {
  active: "foundations" | "advanced";
  onSwitch: (p: "foundations" | "advanced") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 100,
        padding: 3,
        gap: 2,
      }}
    >
      {(["foundations", "advanced"] as const).map((p) => {
        const isActive = active === p;
        return (
          <button
            key={p}
            onClick={() => onSwitch(p)}
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.65rem",
              fontWeight: isActive ? 400 : 300,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isActive ? S.white88 : "rgba(255,255,255,0.38)",
              background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
              border: isActive ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
              borderRadius: 100,
              padding: "5px 14px",
              cursor: isActive ? "default" : "pointer",
              transition: "all 0.18s ease",
              whiteSpace: "nowrap",
            }}
          >
            {p === "foundations" ? "Foundations" : "Advanced"}
          </button>
        );
      })}
    </div>
  );
}

export default function AdvancedPage({ onEnterMiaw, onHowToApply, onSwitchToFoundations, lang, setLang }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const palette   = getTodaysPalette();
  const t = advancedTranslations[lang];

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.style.setProperty("--c1", palette.c1);
    el.style.setProperty("--c2", palette.c2);
    el.style.setProperty("--c3", palette.c3);
    el.style.setProperty("--c4", palette.c4);
  }, [palette]);

  const STAT_NUMS = ["30", "750h", "9", "3", "5"];

  return (
    <div
      ref={canvasRef}
      className="gradient-canvas"
      style={{ position: "fixed", inset: 0, overflowY: "auto", overflowX: "hidden" }}
    >
      <MiniChatWidget
        onEnterMiaw={onEnterMiaw}
        label={t.miniChat.label}
        cta={t.miniChat.cta}
        placeholder={t.miniChat.placeholder}
      />

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 500,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderBottom: S.divider,
          padding: "12px clamp(20px, 4vw, 40px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          minHeight: 52,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button
            onClick={onEnterMiaw}
            aria-label="Return to MIAW homepage"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span style={{ fontFamily: S.pixelFont, fontSize: 15, color: S.white88, letterSpacing: "0.04em" }}>
              miaw
            </span>
          </button>
          <ProgramSwitcher
            active="advanced"
            onSwitch={(p) => { if (p === "foundations") onSwitchToFoundations(); }}
          />
        </div>

        <nav className="fp-nav-links" aria-label="Page sections">
          {([
            { key: "timeline",  label: t.nav.timeline,  href: "#timeline" },
            { key: "modules",   label: t.nav.modules,   href: "#modules" },
            { key: "workshops", label: t.nav.workshops, href: "#workshops" },
          ] as const).map((item) => (
            <a key={item.key} href={item.href} className="fp-nav-link">
              {item.label}
            </a>
          ))}
          <button
            onClick={onHowToApply}
            className="fp-nav-link"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 100,
              padding: "5px 16px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            {t.nav.howToApply}
          </button>
        </nav>

        <LanguageSelector lang={lang} onChange={setLang} />
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <motion.section
        className="fp-hero"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: "clamp(56px, 10vh, 112px) clamp(20px, 4vw, 40px) 56px",
          maxWidth: 1400,
          margin: "0 auto",
          borderBottom: S.divider,
        }}
      >
        {/* Meta row with program switcher */}
        <div
          className="fp-hero-meta"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 48,
          }}
        >
          <span style={labelStyle}>{t.hero.metaLeft}</span>
          <span style={{ ...labelStyle, color: S.dark28 }}>{t.hero.metaRight}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: S.bodyFont,
            fontSize: "clamp(32px, 5vw, 72px)",
            color: S.dark88,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 56,
            fontWeight: 700,
          }}
        >
          Course 2: Advanced
        </h1>

        {/* Premise grid */}
        <div className="fp-premise-grid">
          {t.hero.premise.map((block) => (
            <div key={block.label} className="fp-premise-col">
              <span style={{ ...labelStyle, display: "block", marginBottom: 12 }}>{block.label}</span>
              <p style={bodyStyle}>{block.text}</p>
            </div>
          ))}
        </div>

        {/* Stats + CTA row */}
        <div
          className="fp-hero-bottom"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "clamp(28px, 5vw, 64px)",
            marginTop: 56,
            paddingTop: 40,
            borderTop: "1px solid rgba(30,15,50,0.10)",
          }}
        >
          <div className="fp-hero-stats" style={{ display: "flex", gap: "clamp(28px, 5vw, 64px)", flexWrap: "wrap" }}>
            {t.hero.stats.map((s, i) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: S.bodyFont,
                    fontSize: "clamp(22px, 3.5vw, 46px)",
                    fontWeight: 700,
                    color: S.dark88,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {STAT_NUMS[i]}
                </div>
                <div style={{ ...labelStyle, marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <motion.button
            onClick={onHowToApply}
            className="fp-hero-cta"
            whileHover={{ borderColor: "rgba(30,15,50,0.32)", background: "rgba(30,15,50,0.08)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.82rem",
              fontWeight: 500,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: S.dark88,
              background: "rgba(30,15,50,0.05)",
              border: "1px solid rgba(30,15,50,0.18)",
              borderRadius: 100,
              padding: "14px 32px",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.18s, border-color 0.18s",
            }}
          >
            {t.hero.cta}
          </motion.button>
        </div>
      </motion.section>

      {/* ── TIMELINE ────────────────────────────────────────────────────── */}
      <section
        id="timeline"
        className="fp-section-pad"
        style={{
          padding: "64px clamp(20px, 4vw, 40px)",
          maxWidth: 1400,
          margin: "0 auto",
          borderBottom: S.divider,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontFamily: S.bodyFont,
              fontSize: "clamp(18px, 2.5vw, 30px)",
              color: S.dark88,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {t.timeline.title}
          </h2>
          <span style={labelStyle}>{t.timeline.subtitle}</span>
        </div>

        <div className="fp-timeline-scroll">
          <div className="fp-timeline-inner">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: "8px 8px 0 0",
                overflow: "hidden",
              }}
            >
              {t.timeline.monthLabels.map((m) => (
                <div
                  key={m}
                  style={{
                    padding: "8px 14px",
                    background: "rgba(0,0,0,0.18)",
                    ...labelStyle,
                    fontSize: "0.6rem",
                  }}
                >
                  {m}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: 1,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "0 0 8px 8px",
                overflow: "hidden",
              }}
            >
              {ADVANCED_MODULE_STATIC.map((ms, i) => {
                const mt = t.modules.items[i];
                return (
                  <div
                    key={ms.num}
                    style={{
                      padding: "14px 12px",
                      background: "rgba(0,0,0,0.12)",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: S.bodyFont,
                        fontSize: 14,
                        fontWeight: 700,
                        color: S.white55,
                        lineHeight: 1,
                        marginBottom: 8,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {ms.num}
                    </div>
                    <div
                      style={{
                        fontFamily: S.bodyFont,
                        fontSize: "0.68rem",
                        fontWeight: 400,
                        color: S.white55,
                        lineHeight: 1.3,
                        marginBottom: 5,
                      }}
                    >
                      {mt.title.split(" ").slice(0, 3).join(" ")}
                    </div>
                    <div style={{ ...labelStyle, fontSize: "0.55rem" }}>{ms.load}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES ─────────────────────────────────────────────────────── */}
      <section
        id="modules"
        className="fp-section-pad"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)" }}
      >
        <div style={{ padding: "72px 0 52px", maxWidth: 640 }}>
          <h2
            style={{
              fontFamily: S.bodyFont,
              fontSize: "clamp(20px, 3vw, 38px)",
              color: S.dark88,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {t.modules.sectionTitle}
          </h2>
          <p style={bodyStyle}>{t.modules.sectionDesc}</p>
        </div>

        {ADVANCED_MODULE_STATIC.map((ms, i) => {
          const mt = t.modules.items[i];
          return (
            <ModuleCard
              key={ms.num}
              num={ms.num}
              load={ms.load}
              accumulated={ms.accumulated}
              image={ms.image}
              video={ms.video}
              tag={mt.tag}
              title={mt.title}
              subtitle={mt.subtitle}
              deliverable={mt.deliverable}
              desc={mt.desc}
              topics={mt.topics}
              workshopSession={mt.workshopSession}
              contentsLabel={t.modules.contentsLabel}
              loadLabel={t.modules.loadLabel}
              workshopLabel={t.modules.workshopLabel}
              index={i}
            />
          );
        })}
      </section>

      {/* ── WORKSHOPS ───────────────────────────────────────────────────── */}
      <section
        id="workshops"
        className="fp-section-pad"
        style={{
          padding: "72px clamp(20px, 4vw, 40px) 80px",
          maxWidth: 1400,
          margin: "0 auto",
          borderTop: S.divider,
          marginTop: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: S.bodyFont,
              fontSize: "clamp(18px, 2.5vw, 30px)",
              color: S.dark88,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {t.workshops.sectionTitle}
          </h2>
          <span style={labelStyle}>{t.workshops.sectionSubtitle}</span>
        </div>

        <p style={{ ...bodyStyle, maxWidth: 520, marginBottom: 48 }}>
          {t.workshops.sectionDesc}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {ADVANCED_WORKSHOP_STATIC.map((ws, i) => {
            const wt = t.workshops.items[i];
            return (
              <WorkshopCard
                key={ws.num}
                num={ws.num}
                modules={ws.modules}
                image={ws.image}
                title={wt.title}
                weeks={wt.weeks}
                weekLabel={t.workshops.weekLabel}
              />
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: S.divider,
          background: "rgba(0,0,0,0.24)",
          backdropFilter: "blur(20px) saturate(120%)",
          WebkitBackdropFilter: "blur(20px) saturate(120%)",
          padding: "52px clamp(20px, 4vw, 40px)",
        }}
      >
        <div className="fp-footer-grid fp-footer-inner">
          <div>
            <button
              onClick={onEnterMiaw}
              aria-label="Return to MIAW homepage"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span
                style={{
                  fontFamily: S.pixelFont,
                  fontSize: 17,
                  color: S.white88,
                  letterSpacing: "0.04em",
                  display: "block",
                  marginBottom: 14,
                }}
              >
                miaw
              </span>
            </button>
            <p style={bodyStyle}>{t.footer.tagline}</p>
          </div>

          <div>
            <span style={{ ...labelStyle, display: "block", marginBottom: 16 }}>{t.footer.programLabel}</span>
            {t.footer.programItems.map((item) => (
              <p
                key={item}
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.38)",
                  lineHeight: 2.4,
                }}
              >
                {item}
              </p>
            ))}
          </div>

          <div>
            <span style={{ ...labelStyle, display: "block", marginBottom: 16 }}>{t.footer.applyLabel}</span>
            <button onClick={onHowToApply} className="fp-cta-btn">
              {t.footer.applyBtn}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
