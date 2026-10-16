import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const BEACH_PALETTE = {
  c1: "#F0E4CC",
  c2: "#E8C99A",
  c3: "#D4A574",
  c4: "#FAF6F0",
  base: "#D8BC90",
};

interface HeroPageProps {
  onExplore: () => void;
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

export default function HeroPage({ onExplore }: HeroPageProps) {
  const palette = BEACH_PALETTE;
  const playerRef = useRef<any>(null);
  const [muted, setMuted] = useState(true);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

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
          vq: "hd1080",
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
            // Force highest available quality
            e.target.setPlaybackQuality("hd1080");
          },
          onPlaybackQualityChange: (e: any) => {
            // Re-assert quality if YouTube downgrades it
            const q = e.target.getPlaybackQuality();
            if (q !== "hd1080" && q !== "highres") {
              e.target.setPlaybackQuality("hd1080");
            }
          },
          onError: () => setVideoUnavailable(true),
        },
      });
    };

    // Unmute on the very first user interaction (browsers block autoplay+audio)
    const unmuteOnInteraction = () => {
      if (playerRef.current?.unMute) {
        playerRef.current.unMute();
        playerRef.current.setVolume(80);
        setMuted(false);
      }
      window.removeEventListener("click", unmuteOnInteraction);
      window.removeEventListener("keydown", unmuteOnInteraction);
      window.removeEventListener("touchstart", unmuteOnInteraction);
    };
    window.addEventListener("click", unmuteOnInteraction, { once: true });
    window.addEventListener("keydown", unmuteOnInteraction, { once: true });
    window.addEventListener("touchstart", unmuteOnInteraction, { once: true });

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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{ position: "relative", flex: 1, overflow: "hidden" }}
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
          {videoUnavailable && (
            <img
              src="/hero-video-poster.jpg"
              alt=""
              aria-hidden="true"
              data-testid="img-video-fallback"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
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

        {/* Bottom mask — covers burned-in subtitles in the video footage */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.95) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero text — upper section */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            position: "absolute",
            top: "var(--wedding-heading-anchor-y)",
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
        {!videoUnavailable && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            title={muted ? "Unmute music" : "Mute music"}
            aria-label={muted ? "Unmute music" : "Mute music"}
            data-testid="button-toggle-music"
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
        )}

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
              onClick={(e) => { e.stopPropagation(); onExplore(); }}
              aria-label="Explore the wedding information"
              data-testid="button-explore"
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
