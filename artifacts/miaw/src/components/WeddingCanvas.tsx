import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import CursorPrompt from "./CursorPrompt";
import FloatingPanel from "./FloatingPanel";
import { getTodaysPalette } from "../lib/dailyPalette";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

let idCounter = 0;
function makeId() {
  return `msg-${Date.now()}-${++idCounter}`;
}

const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

// ── RSVP Form Panel ───────────────────────────────────────────────────────────

function RSVPPanel({ onClose, initialX, initialY }: {
  onClose: () => void;
  initialX: number;
  initialY: number;
}) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [guestCount, setGuestCount] = useState(0);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !attending) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), attending, guests: guestCount, dietary, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.68rem",
    fontWeight: 400,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(30,15,50,0.45)",
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(30,15,50,0.14)",
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.88rem",
    color: "rgba(30,15,50,0.85)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <FloatingPanel
      title={
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
          RSVP
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={360}
      zIndex={30}
    >
      <div style={{ padding: "16px 20px 20px", overflowY: "auto", maxHeight: "calc(100% - 48px)" }}>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "24px 0" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎉</div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", color: "rgba(30,15,50,0.75)", lineHeight: 1.6 }}>
              Thank you, {name.split(" ")[0]}!<br />
              {attending === "yes" ? "We can't wait to celebrate with you." : "We'll miss you, but thank you for letting us know."}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Will you attend?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["yes", "no"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAttending(opt)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 8,
                      border: "1px solid rgba(30,15,50,0.18)",
                      background: attending === opt ? "rgba(30,15,50,0.12)" : "rgba(255,255,255,0.55)",
                      fontFamily: "Inter, sans-serif", fontSize: "0.85rem",
                      color: "rgba(30,15,50,0.80)", cursor: "pointer",
                      fontWeight: attending === opt ? 500 : 400, transition: "all 0.15s",
                    }}
                  >
                    {opt === "yes" ? "✓ Attending" : "✗ Can't make it"}
                  </button>
                ))}
              </div>
            </div>

            {attending === "yes" && (
              <div>
                <label style={labelStyle}>Additional guests (excl. yourself)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setGuestCount(n)}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: "1px solid rgba(30,15,50,0.18)",
                        background: guestCount === n ? "rgba(30,15,50,0.12)" : "rgba(255,255,255,0.55)",
                        fontFamily: "Inter, sans-serif", fontSize: "0.85rem",
                        color: "rgba(30,15,50,0.80)", cursor: "pointer",
                        fontWeight: guestCount === n ? 600 : 400,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Dietary requirements</label>
              <input type="text" value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="Vegetarian, allergies, etc." style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Message to the couple (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="A little note for Clémence & Antonio…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              />
            </div>

            {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "rgba(180,60,60,0.85)" }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !attending || submitting}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
                background: "rgba(30,15,50,0.18)", fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem", fontWeight: 500, color: "rgba(30,15,50,0.80)",
                cursor: !name.trim() || !attending || submitting ? "not-allowed" : "pointer",
                opacity: !name.trim() || !attending ? 0.45 : 1, transition: "all 0.15s",
              }}
            >
              {submitting ? "Sending…" : "Send RSVP"}
            </button>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}

// ── Schedule Panel ────────────────────────────────────────────────────────────

const SCHEDULE = [
  { time: "3:45 PM", label: "Guests arrive", icon: "🌿" },
  { time: "4:00 PM", label: "Ceremony", icon: "💍" },
  { time: "5:30 PM", label: "Cocktail hour", icon: "🥂" },
  { time: "7:00 PM", label: "Dinner", icon: "🍽️" },
  { time: "9:00 PM", label: "Dancing", icon: "🎶" },
  { time: "12:00 AM", label: "Evening ends", icon: "✨" },
];

function SchedulePanel({ onClose, initialX, initialY }: { onClose: () => void; initialX: number; initialY: number }) {
  return (
    <FloatingPanel
      title={<span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>The Day</span>}
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={280}
      zIndex={28}
    >
      <div style={{ padding: "12px 20px 20px" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(30,15,50,0.40)", letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase" }}>
          Times are indicative
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SCHEDULE.map((item) => (
            <div key={item.time} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(30,15,50,0.45)", letterSpacing: "0.06em" }}>{item.time}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.88rem", color: "rgba(30,15,50,0.78)", fontWeight: 400 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FloatingPanel>
  );
}

// ── Venue Panel ───────────────────────────────────────────────────────────────

function VenuePanel({ onClose, initialX, initialY }: { onClose: () => void; initialX: number; initialY: number }) {
  return (
    <FloatingPanel
      title={<span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Venue</span>}
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={300}
      zIndex={26}
    >
      <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(30,15,50,0.40)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>Ceremony &amp; Reception</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.92rem", fontWeight: 500, color: "rgba(30,15,50,0.80)", marginBottom: 4 }}>[Venue Name]</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "rgba(30,15,50,0.55)", lineHeight: 1.5 }}>[Full Address]<br />[City, Country]</p>
        </div>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(30,15,50,0.40)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>Getting there</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "rgba(30,15,50,0.60)", lineHeight: 1.6 }}>🚗 Parking available on site<br />🚂 [Nearest station] → taxi 15 min<br />✈️ [Nearest airport] → car 45 min</p>
        </div>
        <a
          href="https://maps.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", textAlign: "center", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(30,15,50,0.18)", fontFamily: "Inter, sans-serif", fontSize: "0.80rem", color: "rgba(30,15,50,0.60)", textDecoration: "none", background: "rgba(255,255,255,0.40)" }}
        >
          Open in Maps →
        </a>
      </div>
    </FloatingPanel>
  );
}

// ── Quick Picks ───────────────────────────────────────────────────────────────

function QuickPicks({ onSchedule, onVenue, onRSVP }: { onSchedule: () => void; onVenue: () => void; onRSVP: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}
    >
      {[
        { label: "📅 Schedule", action: onSchedule },
        { label: "📍 Venue", action: onVenue },
        { label: "✉️ RSVP", action: onRSVP },
      ].map((p) => (
        <button
          key={p.label}
          onClick={p.action}
          style={{
            padding: "6px 14px", borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.14)",
            fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 300,
            color: "rgba(255,255,255,0.80)", cursor: "pointer",
            transition: "all 0.15s", letterSpacing: "0.04em",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.24)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; }}
        >
          {p.label}
        </button>
      ))}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface WeddingCanvasProps {
  initialPanel?: "rsvp" | "schedule" | "venue" | null;
  onGoToHero?: () => void;
}

export default function WeddingCanvas({ initialPanel, onGoToHero }: WeddingCanvasProps) {
  const palette = getTodaysPalette();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [showSchedule, setShowSchedule] = useState(initialPanel === "schedule");
  const [showVenue, setShowVenue] = useState(initialPanel === "venue");
  const [showRSVP, setShowRSVP] = useState(initialPanel === "rsvp");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isStreaming && conversationStarted) inputRef.current?.focus();
  }, [isStreaming, conversationStarted]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      document.documentElement.style.setProperty("--keyboard-height", `${window.innerHeight - vv.height}px`);
    };
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  const streamMessage = useCallback(async (userMessages: Message[], nextTurn: number) => {
    setIsStreaming(true);
    setError(null);

    const assistantId = makeId();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    try {
      const res = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: userMessages.map((m) => ({ role: m.role, content: m.content })), turnCount: nextTurn }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        setError("Too many messages. Please take a break and come back later.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snap = accumulated;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: snap } : m)));
      }

      setTurnCount(nextTurn + 1);
    } catch (err) {
      clearTimeout(timeout);
      setError(err instanceof Error && err.name === "AbortError"
        ? "Connection timed out. Please try again."
        : "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const startConversation = useCallback(async () => {
    if (conversationStarted) return;
    setConversationStarted(true);
    await streamMessage([], 0);
  }, [conversationStarted, streamMessage]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!conversationStarted && e.key !== "Tab" && e.key !== "Escape") startConversation();
  }, [conversationStarted, startConversation]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Auto-start conversation when arriving from hero
  useEffect(() => {
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;
    const userMessage: Message = { id: makeId(), role: "user", content, timestamp: Date.now() };
    setInputValue("");
    const updated = [...messages, userMessage];
    setMessages(updated);
    await streamMessage(updated, turnCount + 1);
  }, [inputValue, isStreaming, messages, turnCount, streamMessage]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const chatX = isMobile ? 8 : 48;
  const chatY = isMobile ? 120 : 72;
  const chatW = isMobile ? "calc(100vw - 16px)" : "clamp(300px, 36vw, 480px)";
  const chatH = isMobile
    ? "calc(100dvh - 134px - env(safe-area-inset-bottom,0px))"
    : "calc(100dvh - 124px)";

  const panelX = isMobile
    ? 8
    : Math.min(window.innerWidth - 380, 48 + Math.round(Math.min(Math.max(window.innerWidth * 0.36, 300), 480)) + 24);

  const showQuickPicks = turnCount === 0 && !isStreaming && messages.length >= 1 && messages.at(-1)?.role === "assistant";

  return (
    <main
      className="gradient-canvas"
      style={{
        position: "fixed",
        inset: 0,
        "--c1": palette.c1,
        "--c2": palette.c2,
        "--c3": palette.c3,
        "--c4": palette.c4,
      } as React.CSSProperties}
    >
      {/* Back to hero button */}
      {onGoToHero && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onGoToHero}
          style={{
            position: "fixed",
            top: 18,
            right: 20,
            zIndex: 200,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 100,
            padding: "6px 14px",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.72rem",
            fontWeight: 300,
            color: "rgba(255,255,255,0.72)",
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
        >
          ← Home
        </motion.button>
      )}

      <AnimatePresence>
        {conversationStarted && (
          <FloatingPanel
            key="chat"
            resizable
            title={
              <span style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "clamp(12px, 1.4vw, 17px)",
                fontWeight: 400,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "0.06em",
                userSelect: "none",
              }}>
                C &amp; A
              </span>
            }
            initialX={chatX}
            initialY={chatY}
            width={chatW}
            height={chatH}
            zIndex={50}
            className="floating-panel--chat"
          >
            <div aria-live="polite" aria-atomic="false" className="sr-only">
              {messages.at(-1)?.role === "assistant" ? messages.at(-1)?.content : ""}
            </div>

            <div
              className="message-list flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4"
              role="log"
              aria-label="Conversation"
              aria-live="off"
            >
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isLatest={i === messages.length - 1}
                  isStreaming={isStreaming && i === messages.length - 1}
                />
              ))}

              <AnimatePresence>
                {showQuickPicks && (
                  <QuickPicks
                    key="quick-picks"
                    onSchedule={() => setShowSchedule(true)}
                    onVenue={() => setShowVenue(true)}
                    onRSVP={() => setShowRSVP(true)}
                  />
                )}
              </AnimatePresence>

              {isStreaming && messages.at(-1)?.role !== "assistant" && (
                <div className="self-start"><TypingIndicator /></div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 px-6 input-bar pt-2">
              <div className="flex items-end gap-3 border-b border-white/20 pb-1">
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <input
                  id="chat-input"
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message…"
                  className="chat-input flex-1 bg-transparent text-white placeholder:text-white/40 py-2 focus:outline-none"
                  style={{ fontSize: "16px", fontFamily: "Inter, sans-serif" }}
                  disabled={isStreaming}
                />
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
                <p className="text-white/90 text-xs mt-2" style={{ fontFamily: "Inter, sans-serif" }} role="alert">
                  {error}
                </p>
              )}
            </div>
          </FloatingPanel>
        )}
      </AnimatePresence>

      {!conversationStarted && <CursorPrompt onClick={startConversation} />}

      <AnimatePresence>
        {showSchedule && (
          <SchedulePanel key="schedule" onClose={() => setShowSchedule(false)} initialX={panelX} initialY={isMobile ? 60 : 72} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVenue && (
          <VenuePanel key="venue" onClose={() => setShowVenue(false)} initialX={panelX + (showSchedule ? 300 : 0)} initialY={isMobile ? 60 : 72} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRSVP && (
          <RSVPPanel
            key="rsvp"
            onClose={() => setShowRSVP(false)}
            initialX={isMobile ? 8 : Math.round((window.innerWidth - 360) / 2)}
            initialY={isMobile ? 60 : 90}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
