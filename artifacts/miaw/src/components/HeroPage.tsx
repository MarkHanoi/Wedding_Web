import { motion } from "framer-motion";
import beachPhoto from "@assets/Gemini_Generated_Image_d4d3xcd4d3xcd4d3_1783284816056.png";

const BEACH_PALETTE = {
  c1: "#F0E4CC",
  c2: "#E8C99A",
  c3: "#D4A574",
  c4: "#FAF6F0",
  base: "#D8BC90",
};

// ── To add the actual hero photo when ready ────────────────────────────────
// 1. Copy the couple's photo to artifacts/miaw/public/hero.jpg
// 2. Replace the gradient-canvas className with an img or CSS background-image
// 3. Keep the dark overlay div for text legibility
// ──────────────────────────────────────────────────────────────────────────

interface HeroPageProps {
  onEnterChat: () => void;
  onOpenRSVP: () => void;
  onOpenSchedule: () => void;
  onOpenVenue: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HeroPage({ onEnterChat, onOpenRSVP, onOpenSchedule, onOpenVenue }: HeroPageProps) {
  const palette = BEACH_PALETTE;

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>

      {/* ── Navigation bar ──────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          position: "relative",
          zIndex: 100,
          flexShrink: 0,
          height: 56,
          background: "rgba(10,7,3,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 28,
          paddingRight: 28,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Left links */}
        <div style={{ display: "flex", gap: 28, flex: 1 }}>
          {[
            { label: "Our Story", action: onEnterChat },
            { label: "Schedule", action: onOpenSchedule },
            { label: "Venue", action: onOpenVenue },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.62)",
                padding: 0,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.92)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.62)")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Center: initials + date placeholder */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "1rem",
            fontWeight: 400,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.82)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          C &amp; A
        </div>

        {/* Right: RSVP button */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onOpenRSVP}
            style={{
              background: "rgba(255,255,255,0.94)",
              color: "#0a0a0a",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "7px 18px",
              borderRadius: 3,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.80)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.94)")}
          >
            RSVP
          </button>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{ position: "relative", flex: 1, overflow: "hidden" }}
        onClick={onEnterChat}
      >
        {/* Background gradient — replace with hero photo when ready */}
        <div
          className="gradient-canvas"
          style={{
            position: "absolute",
            inset: 0,
            "--c1": palette.c1,
            "--c2": palette.c2,
            "--c3": palette.c3,
            "--c4": palette.c4,
          } as React.CSSProperties}
        />

        {/* Dark overlay for text contrast — works with both gradient and photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 50% 42%, rgba(0,0,0,0.32) 0%, transparent 70%),
              linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.28) 100%)
            `,
          }}
        />

        {/* Hero text — upper section */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            width: "90%",
            maxWidth: 700,
          }}
        >
          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(14px, 2vw, 20px)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            We're Getting Married
          </motion.p>

          {/* Main names */}
          <motion.h1
            variants={fadeUp}
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(40px, 8vw, 100px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.96)",
              letterSpacing: "0.01em",
              lineHeight: 0.95,
              margin: 0,
              userSelect: "none",
            }}
          >
            Clémence &amp; Antonio
          </motion.h1>

          {/* Date placeholder */}
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(11px, 1.4vw, 15px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.70)",
              letterSpacing: "0.28em",
              margin: "4px 0 0",
              textTransform: "uppercase",
            }}
          >
            [D] · [M] · [YY]
          </motion.p>
        </motion.div>

        {/* Venue photo — lower section */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.7 }}
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(1160px, 92vw)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 8px 48px rgba(0,0,0,0.38), 0 2px 12px rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.18)",
            aspectRatio: "16 / 7",
            maxHeight: "38vh",
          }}
        >
          <img
            src={beachPhoto}
            alt="Wedding venue — beach"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.2 }}
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEnterChat(); }}
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 100,
                padding: "9px 22px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.76rem",
                fontWeight: 300,
                color: "rgba(255,255,255,0.80)",
                cursor: "pointer",
                letterSpacing: "0.10em",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                pointerEvents: "all",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.24)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
              }}
            >
              Chat with our assistant ↓
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
