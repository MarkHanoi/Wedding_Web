import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

let idCounter = 0;
function makeId() {
  return `mini-${Date.now()}-${++idCounter}`;
}

interface MiniChatProps {
  onEnterMiaw: () => void;
}

export default function MiniChat({ onEnterMiaw }: MiniChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showMiawPrompt, setShowMiawPrompt] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: makeId(),
        role: "assistant",
        content: "What brings you to MIAW?",
      }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  function checkForMiaw(text: string) {
    if (/\bmiaw\b/i.test(text)) {
      setShowMiawPrompt(true);
    }
  }

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { id: makeId(), role: "user", content: text };
    const assistantId = makeId();

    setMessages((prev) => [
      ...prev,
      ...(silent ? [] : [userMsg]),
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const history = [...messages, ...(silent ? [] : [userMsg])].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: silent ? [{ role: "user", content: text }] : history }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) throw new Error("Request failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m)),
        );
      }

      checkForMiaw(accumulated);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "min(360px, calc(100vw - 32px))",
              background: "rgba(0,0,0,0.52)",
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#86efac",
                    boxShadow: "0 0 6px #86efac",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.05em",
                  }}
                >
                  miaw advisor
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "2px 4px",
                  borderRadius: 4,
                }}
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div
              className="message-list"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 14px",
                maxHeight: 300,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "8px 12px",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user"
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      fontWeight: 300,
                      lineHeight: 1.55,
                    }}
                  >
                    {m.content || (
                      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <span className="dot-1" style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)", display: "inline-block" }} />
                        <span className="dot-2" style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)", display: "inline-block" }} />
                        <span className="dot-3" style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)", display: "inline-block" }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {showMiawPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}
                >
                  <button
                    onClick={onEnterMiaw}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.20)",
                      borderRadius: 100,
                      padding: "7px 18px",
                      color: "rgba(255,255,255,0.90)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      fontWeight: 400,
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{ fontFamily: "'DePixelBreit', monospace", fontSize: 10 }}>miaw</span>
                    <span>→ enter full experience</span>
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 12px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ask anything…"
                disabled={streaming}
                className="chat-input"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  padding: "7px 11px",
                  color: "rgba(255,255,255,0.88)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                }}
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                style={{
                  background: input.trim() ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "7px 13px",
                  color: "rgba(255,255,255,0.7)",
                  cursor: input.trim() ? "pointer" : "default",
                  fontSize: 14,
                  transition: "background 0.2s",
                }}
              >
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger pill */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(18px) saturate(130%)",
          WebkitBackdropFilter: "blur(18px) saturate(130%)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 100,
          padding: "10px 20px",
          color: "rgba(255,255,255,0.88)",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          fontWeight: 300,
          letterSpacing: "0.03em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 9,
          boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.7 }}>
          <path d="M1 6.5L1 3C1 2.44772 1.44772 2 2 2H10C10.5523 2 11 2.44772 11 3V7.5C11 8.05228 10.5523 8.5 10 8.5H7L4 11V8.5H2C1.44772 8.5 1 8.05228 1 7.5V6.5Z" stroke="white" strokeWidth="1.2" />
        </svg>
        {open ? "close" : "speak to an advisor"}
      </motion.button>
    </div>
  );
}
