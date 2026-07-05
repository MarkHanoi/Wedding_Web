import { useState } from "react";
import { canvasUI, type Lang } from "../lib/i18n";

type CTAView = "fork" | "waitlist" | "submitted";

interface CTAOverlayProps {
  visitorType: string;
  conversationLength: number;
  onWaitlistSubmit: (email: string) => Promise<void>;
  onApplyNow: () => void;
  /** UI language for translated strings. */
  lang?: Lang;
  // P3-D: optional callback to persist the conversation as a returnable session.
  // Called after successful waitlist submit if the visitor opted in.
  // Best-effort: failure is swallowed — the CTA experience must not break.
  onSaveSession?: () => Promise<void>;
  // When provided, "Join the waitlist" opens the full-screen WaitlistScreen
  // overlay instead of the inline form sub-view.
  onOpenWaitlistScreen?: () => void;
}

export default function CTAOverlay({
  onWaitlistSubmit,
  onApplyNow,
  lang,
  onSaveSession,
  onOpenWaitlistScreen,
}: CTAOverlayProps) {
  const ui = canvasUI[lang ?? "en"].cta;
  const [view, setView] = useState<CTAView>("fork");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // P3-D: opt-in checkbox state — default false (explicit opt-in, GDPR-compliant)
  const [rememberMe, setRememberMe] = useState(false);

  const handleWaitlistSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError(ui.errorEmail);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onWaitlistSubmit(email.trim());
      // P3-D: save session best-effort if user opted in
      if (rememberMe && onSaveSession) {
        await onSaveSession().catch(() => {
          // Non-blocking — session save failure must not affect the UX
        });
      }
      setView("submitted");
    } catch {
      setError(ui.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  // ── Submitted state ───────────────────────────────────────────────────────
  if (view === "submitted") {
    return (
      <div className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start">
        <p className="text-white text-base font-medium mb-1">{ui.doneTitle}</p>
        {/* text-white on bg-white/5+CONV_BG = 4.99:1 ✅ WCAG AA */}
        <p className="text-white text-sm leading-relaxed">
          {ui.doneDesc}
        </p>
      </div>
    );
  }

  // ── Waitlist email form ───────────────────────────────────────────────────
  if (view === "waitlist") {
    return (
      <div
        className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start"
        role="region"
        aria-label="Join the waitlist"
      >
        <p className="text-white text-base font-medium mb-1">
          {ui.waitlistTitle}
        </p>
        {/* text-white on bg-white/5+CONV_BG = 4.99:1 ✅ WCAG AA */}
        <p
          className="text-white text-sm mb-4 leading-relaxed"
          id="waitlist-desc"
        >
          {ui.waitlistDesc}
        </p>

        <div
          className="flex gap-2 items-end"
          role="group"
          aria-labelledby="waitlist-desc"
        >
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleWaitlistSubmit()}
            placeholder="your@email.com"
            aria-describedby={error ? "waitlist-error" : "waitlist-desc"}
            aria-invalid={!!error}
            disabled={loading}
            className="flex-1 bg-transparent border-b border-white/40 text-white placeholder:text-white/40 text-sm py-2 px-1 focus:outline-none focus:border-white/80 transition-colors disabled:opacity-60"
            style={{ fontSize: "16px" }}
          />
          {/* text-white on bg-white/5+CONV_BG = 4.99:1 ✅ WCAG AA */}
          <button
            onClick={handleWaitlistSubmit}
            disabled={loading}
            aria-label={loading ? "Submitting…" : ui.waitlistBtn}
            className="text-white text-sm font-medium hover:text-white/80 transition-colors disabled:opacity-50 ml-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {loading ? "…" : ui.waitlistBtn}
          </button>
        </div>

        {error && (
          <p
            id="waitlist-error"
            role="alert"
            className="text-white text-xs mt-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {error}
          </p>
        )}

        {/* P3-D: Remember conversation checkbox — shown in waitlist view too
            so the state persists if the user navigated back from fork */}
        {onSaveSession && (
          <label
            className="flex items-center gap-2 mt-4 cursor-pointer select-none"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 accent-white/60 cursor-pointer"
              aria-describedby="remember-desc"
            />
            <span
              id="remember-desc"
              className="text-white/45 text-xs leading-snug"
            >
              {ui.remember}
            </span>
          </label>
        )}

        <button
          onClick={() => setView("fork")}
          className="mt-3 text-white/50 text-xs hover:text-white/70 transition-colors cursor-pointer"
          style={{ fontFamily: "Inter, sans-serif" }}
          aria-label="Go back to options"
        >
          {ui.waitlistBack}
        </button>
      </div>
    );
  }

  // ── Fork view (default) ───────────────────────────────────────────────────
  return (
    <div
      className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start"
      role="region"
      aria-label="Join the first cohort"
    >
      <p className="text-white text-base font-medium mb-1">
        {ui.forkTitle}
      </p>
      {/* text-white on bg-white/5+CONV_BG = 4.99:1 ✅ WCAG AA */}
      <p className="text-white text-sm mb-5 leading-relaxed">
        {ui.forkDesc}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() =>
            onOpenWaitlistScreen
              ? onOpenWaitlistScreen()
              : setView("waitlist")
          }
          className="text-white/80 text-sm border border-white/30 rounded-lg px-4 py-2.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          style={{ fontFamily: "Inter, sans-serif" }}
          aria-label={ui.joinWaitlist}
        >
          {ui.joinWaitlist}
        </button>
        <button
          onClick={onApplyNow}
          className="text-white text-sm bg-white/15 border border-white/40 rounded-lg px-4 py-2.5 hover:bg-white/25 transition-colors cursor-pointer font-medium"
          style={{ fontFamily: "Inter, sans-serif" }}
          aria-label="Apply now — continue the conversation as an application"
        >
          {ui.applyNow}
        </button>
      </div>

      {/* P3-D: Remember conversation opt-in — explicit consent, GDPR-compliant.
          Shown in fork view so the visitor sees it before choosing a path.
          State persists into the waitlist form view. */}
      {onSaveSession && (
        <label
          className="flex items-center gap-2 mt-5 cursor-pointer select-none"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 accent-white/60 cursor-pointer"
            aria-describedby="remember-fork-desc"
          />
          <span
            id="remember-fork-desc"
            className="text-white/45 text-xs leading-snug"
          >
            {ui.remember}
          </span>
        </label>
      )}
    </div>
  );
}
