import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPanel from "./FloatingPanel";
import { getTodaysPalette } from "../lib/dailyPalette";

// ── RSVP Form Panel ───────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

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
    color: "rgba(255,240,218,0.52)",
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.88rem",
    color: "rgba(42,24,8,0.85)",
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
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", color: "rgba(255,240,218,0.85)", lineHeight: 1.6 }}>
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
                      border: "1px solid rgba(255,255,255,0.20)",
                      background: attending === opt ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)",
                      fontFamily: "Inter, sans-serif", fontSize: "0.85rem",
                      color: "rgba(42,24,8,0.82)", cursor: "pointer",
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
                        border: "1px solid rgba(255,255,255,0.20)",
                        background: guestCount === n ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)",
                        fontFamily: "Inter, sans-serif", fontSize: "0.85rem",
                        color: "rgba(42,24,8,0.82)", cursor: "pointer",
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

            {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "rgba(255,160,140,0.90)" }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !attending || submitting}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
                background: "rgba(255,255,255,0.16)", fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,240,218,0.90)",
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

const SCHEDULE_DAYS = [
  {
    day: "Friday, 18 June",
    events: [
      { time: "Evening", label: "Pre-wedding party", icon: "🎉" },
    ],
  },
  {
    day: "Saturday, 19 June",
    events: [
      { time: "16:30", label: "Guests arrive", icon: "🌿" },
      { time: "17:00", label: "Ceremony", icon: "💍" },
      { time: "18:00", label: "Cocktail hour", icon: "🥂" },
      { time: "21:00", label: "Dinner", icon: "🍽️" },
      { time: "00:00", label: "Dancing until 4 AM", icon: "🎶" },
    ],
  },
  {
    day: "Sunday, 20 June",
    events: [
      { time: "12:00", label: "Brunch", icon: "☀️" },
    ],
  },
];

function SchedulePanel({ onClose, initialX, initialY }: { onClose: () => void; initialX: number; initialY: number }) {
  return (
    <FloatingPanel
      title={<span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>The Weekend</span>}
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={300}
      zIndex={28}
    >
      <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {SCHEDULE_DAYS.map((day, di) => (
          <div key={day.day}>
            {/* Day header */}
            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.68rem",
              fontWeight: 500,
              color: "rgba(255,240,218,0.45)",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}>
              {day.day}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {day.events.map((item) => (
                <div key={`${di}-${item.time}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.05rem", width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.70rem", color: "rgba(255,240,218,0.50)", letterSpacing: "0.06em" }}>{item.time}</div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.86rem", color: "rgba(255,240,218,0.88)", fontWeight: 400 }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
      width={340}
      zIndex={26}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Video — square crop of 16:9 source */}
        <div style={{ flexShrink: 0, position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "rgba(0,0,0,0.30)" }}>
          <iframe
            src="https://www.youtube.com/embed/NvJ-ExpmOTc?autoplay=1&mute=1&loop=1&playlist=NvJ-ExpmOTc&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&showinfo=0&start=5&end=180"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "120%",   /* clips ~20% off the left, hiding the YouTube watermark */
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        </div>

        {/* Details */}
        <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(255,240,218,0.50)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>Ceremony &amp; Reception</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.92rem", fontWeight: 500, color: "rgba(255,240,218,0.92)", marginBottom: 2 }}>Quinta Amala</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "rgba(255,240,218,0.70)", lineHeight: 1.5 }}>Melides, Grândola<br />Alentejo, Portugal</p>
          </div>

          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "rgba(255,240,218,0.50)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>Getting there</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "rgba(255,240,218,0.75)", lineHeight: 1.6 }}>🚗 Parking available on site<br />🚂 Lisboa Oriente → Grândola (1h)<br />✈️ Lisbon Airport → car 1h30</p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="https://quintaamala.com/pt/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: "block", textAlign: "center", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.20)", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "rgba(42,24,8,0.75)", textDecoration: "none", background: "rgba(255,255,255,0.50)" }}
            >
              Website →
            </a>
            <a
              href="https://www.google.com/maps/search/Quinta+Amala,+Melides,+Portugal"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: "block", textAlign: "center", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.20)", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "rgba(42,24,8,0.75)", textDecoration: "none", background: "rgba(255,255,255,0.50)" }}
            >
              Maps →
            </a>
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface WeddingCanvasProps {
  initialPanel?: "rsvp" | "schedule" | "venue" | null;
  onGoToHero?: () => void;
}

export default function WeddingCanvas({ initialPanel, onGoToHero }: WeddingCanvasProps) {
  const palette = getTodaysPalette();

  const [showSchedule, setShowSchedule] = useState(initialPanel === "schedule");
  const [showVenue, setShowVenue] = useState(initialPanel === "venue");
  const [showRSVP, setShowRSVP] = useState(initialPanel === "rsvp");

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const panelX = isMobile ? 8 : 64;
  const panelY = isMobile ? 60 : 72;

  const pillStyle: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: 100,
    border: "1px solid rgba(255,255,255,0.28)",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.80rem",
    fontWeight: 300,
    letterSpacing: "0.05em",
    color: "rgba(255,255,255,0.82)",
    cursor: "pointer",
    transition: "background 0.15s",
  };

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
      {/* ← Home */}
      {onGoToHero && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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

      {/* Bottom pill nav */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          gap: 10,
        }}
      >
        <button
          style={pillStyle}
          onClick={() => setShowSchedule(true)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)")}
        >
          📅 Schedule
        </button>
        <button
          style={pillStyle}
          onClick={() => setShowVenue(true)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)")}
        >
          📍 Venue
        </button>
        <button
          style={pillStyle}
          onClick={() => setShowRSVP(true)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)")}
        >
          ✉️ RSVP
        </button>
      </motion.div>

      <AnimatePresence>
        {showSchedule && (
          <SchedulePanel key="schedule" onClose={() => setShowSchedule(false)} initialX={panelX} initialY={panelY} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVenue && (
          <VenuePanel key="venue" onClose={() => setShowVenue(false)} initialX={panelX + (showSchedule ? 300 : 0)} initialY={panelY} />
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
