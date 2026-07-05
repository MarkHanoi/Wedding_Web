// ---------------------------------------------------------------------------
// WaitlistScreen — full-screen waitlist registration overlay
//
// Replaces the inline waitlist sub-view in CTAOverlay with a dedicated
// full-screen experience. Renders at z-50 over the gradient canvas.
//
// States: "form" → "submitted"
// API:    POST /api/waitlist (existing endpoint, no changes needed)
// Spec:   docs/screens/SCREENS_SPEC.md
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useState } from "react";

interface WaitlistScreenProps {
  visitorType: string;
  conversationLength: number;
  onSubmit: (email: string) => Promise<void>;
  onSaveSession?: () => Promise<void>;
  onBack: () => void;
}

type ScreenState = "form" | "submitted";

export default function WaitlistScreen({
  onSubmit,
  onSaveSession,
  onBack,
}: WaitlistScreenProps) {
  const [state, setState] = useState<ScreenState>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [background, setBackground] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email.trim());
      if (rememberMe && onSaveSession) {
        await onSaveSession().catch(() => {});
      }
      setState("submitted");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.1, 0.22, 1] }}
    >
      {/* Back link */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-white/45 text-xs hover:text-white/75 transition-colors cursor-pointer"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
        aria-label="Back to conversation"
      >
        ← back to conversation
      </button>

      {/* Card */}
      <motion.div
        className="w-full max-w-md bg-black/28 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 sm:p-10"
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 0.1, 0.22, 1], delay: 0.04 }}
        role="region"
        aria-label={state === "submitted" ? "Waitlist confirmed" : "Join the waitlist"}
      >
        {state === "submitted" ? (
          /* ── Submitted ──────────────────────────────────────────────── */
          <div className="text-center py-4">
            <p
              className="text-white text-xl font-medium mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {name ? `${name.split(" ")[0]}, you're in.` : "You're in."}
            </p>
            <p
              className="text-white/60 text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              We'll reach out when the first cohort opens. People like you are
              exactly who we're building this for.
            </p>
            <button
              onClick={onBack}
              className="mt-10 text-white/40 text-xs hover:text-white/65 transition-colors cursor-pointer"
              style={{ fontFamily: "Inter, sans-serif" }}
              aria-label="Return to conversation"
            >
              ← back to conversation
            </button>
          </div>
        ) : (
          /* ── Form ───────────────────────────────────────────────────── */
          <>
            <h1
              className="text-white text-2xl font-medium mb-2 leading-snug"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Stay in the loop.
            </h1>
            <p
              className="text-white/55 text-sm mb-8 leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              Leave your email and we'll reach out when the first cohort opens.
            </p>

            <div className="flex flex-col gap-6">
              {/* Name */}
              <div>
                <label htmlFor="wl-name" className="sr-only">
                  Your name (optional)
                </label>
                <input
                  id="wl-name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name — optional"
                  className="w-full bg-transparent border-b border-white/22 text-white placeholder:text-white/28 text-sm py-2.5 px-0 focus:outline-none focus:border-white/60 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 300 }}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="wl-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="wl-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !loading && handleSubmit()
                  }
                  placeholder="your@email.com"
                  aria-invalid={!!error}
                  disabled={loading}
                  className="w-full bg-transparent border-b border-white/38 text-white placeholder:text-white/32 text-sm py-2.5 px-0 focus:outline-none focus:border-white/75 transition-colors disabled:opacity-55"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 300 }}
                />
              </div>

              {/* Background */}
              <div className="relative">
                <label htmlFor="wl-background" className="sr-only">
                  Your background (optional)
                </label>
                <select
                  id="wl-background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full bg-transparent border-b border-white/22 text-sm py-2.5 px-0 focus:outline-none focus:border-white/55 transition-colors appearance-none cursor-pointer"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: 300,
                    color: background ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
                  }}
                >
                  <option value="" style={{ background: "#2e2056", color: "white" }}>
                    Background — optional
                  </option>
                  {["Architect", "Engineer", "Developer", "Researcher", "Other"].map(
                    (opt) => (
                      <option
                        key={opt}
                        value={opt.toLowerCase()}
                        style={{ background: "#2e2056", color: "white" }}
                      >
                        {opt}
                      </option>
                    ),
                  )}
                </select>
                {/* chevron */}
                <svg
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/30"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4.5L6 8L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Remember conversation */}
            {onSaveSession && (
              <label
                className="flex items-start gap-2.5 mt-6 cursor-pointer select-none"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 accent-white/60 cursor-pointer"
                />
                <span
                  className="text-white/38 text-xs leading-snug"
                  style={{ fontWeight: 300 }}
                >
                  Remember our conversation so you don't have to start over
                  next time
                </span>
              </label>
            )}

            {error && (
              <p
                role="alert"
                className="text-white/75 text-xs mt-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              className="mt-9 w-full py-3.5 px-6 bg-white/10 border border-white/22 rounded-xl text-white text-sm font-medium hover:bg-white/18 active:bg-white/12 transition-colors disabled:opacity-38 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "Inter, sans-serif" }}
              aria-label={loading ? "Joining…" : "Join the waitlist"}
            >
              {loading ? "Joining…" : "Join the waitlist"}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
