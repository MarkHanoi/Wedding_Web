import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const playerRef = useRef<any>(null);
  const [muted, setMuted] = useState(true);

  // Load YouTube IFrame API once and create the player
  useEffect(() => {
    const createPlayer = () => {
      playerRef.current = new (window as any).YT.Player("yt-bg-player", {
        videoId: "6TZ79dQm7OI",
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: "6TZ79dQm7OI",
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0,
          cc_lang_pref: "none",
        },
        events: {
          onReady: (e: any) => e.target.playVideo(),
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      // API already loaded (e.g. after hot reload) — create player immediately
      createPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = createPlayer;
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(80);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

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
        {/* ── Full-bleed YouTube video background (IFrame API) ────────────── */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
          <div
            id="yt-bg-player"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100vw",
              height: "56.25vw",    /* 16:9 */
              minWidth: "177.78vh", /* 16:9 inverted */
              minHeight: "100vh",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Dark overlay for text contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 50% 42%, rgba(0,0,0,0.28) 0%, transparent 70%),
              linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.32) 100%)
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
            19 · 06 · 2027
          </motion.p>
        </motion.div>

        {/* ── Mute / unmute toggle ─────────────────────────────────────────── */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          title={muted ? "Unmute music" : "Mute music"}
          style={{
            position: "absolute",
            bottom: 22,
            right: 22,
            zIndex: 10,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            transition: "background 0.2s",
            color: "rgba(255,255,255,0.80)",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)")}
        >
          {muted ? "🔇" : "🔊"}
        </button>

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
              Explore ↓
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
