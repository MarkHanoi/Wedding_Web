import { useState } from "react";

interface ApplicationSubmitProps {
  onSubmit: (email: string, portfolioUrl: string, gdprConsent: boolean) => Promise<void>;
}

export default function ApplicationSubmit({ onSubmit }: ApplicationSubmitProps) {
  const [email, setEmail] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!gdprConsent) {
      setError("Please confirm consent to proceed.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email.trim(), portfolioUrl.trim(), gdprConsent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start"
      role="region"
      aria-label="Submit your application"
    >
      <p className="text-white text-base font-medium mb-1">
        Ready to submit?
      </p>
      {/* text-white on bg-white/5+CONV_BG = 4.99:1 ✅ WCAG AA */}
      <p
        className="text-white text-sm mb-5 leading-relaxed"
        id="apply-submit-desc"
      >
        Leave your email below. We will process your application and a
        personalised response will appear here shortly.
      </p>

      <div className="flex flex-col gap-3">
        {/* Email */}
        <div>
          <label htmlFor="apply-email" className="sr-only">
            Email address
          </label>
          <input
            id="apply-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            placeholder="your@email.com"
            aria-describedby={error ? "apply-error" : "apply-submit-desc"}
            aria-invalid={!!error && !email.includes("@")}
            disabled={loading}
            className="w-full bg-transparent border-b border-white/40 text-white placeholder:text-white/40 text-sm py-2 px-1 focus:outline-none focus:border-white/80 transition-colors disabled:opacity-60"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Portfolio URL — optional */}
        <div>
          <label htmlFor="apply-portfolio" className="sr-only">
            Portfolio or work samples URL (optional)
          </label>
          <input
            id="apply-portfolio"
            type="text"
            autoComplete="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="portfolio, GitHub, or work samples — optional"
            disabled={loading}
            className="w-full bg-transparent border-b border-white/30 text-white placeholder:text-white/35 text-sm py-2 px-1 focus:outline-none focus:border-white/60 transition-colors disabled:opacity-60"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* GDPR consent */}
        <div className="flex items-start gap-2.5 pt-2">
          <input
            id="apply-gdpr"
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-white cursor-pointer disabled:opacity-60"
            aria-describedby="gdpr-label"
          />
          <label
            id="gdpr-label"
            htmlFor="apply-gdpr"
            className="text-white/75 text-xs leading-relaxed cursor-pointer"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            I agree to MIAW processing this conversation and my contact details
            for admissions consideration. I can withdraw consent at any time by
            emailing MIAW directly.
          </label>
        </div>
      </div>

      {error && (
        <p
          id="apply-error"
          role="alert"
          className="text-white/90 text-xs mt-3"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !gdprConsent || !email.trim()}
        aria-label={
          loading ? "Processing your application…" : "Submit application"
        }
        className="mt-5 text-white text-sm font-medium hover:text-white/80 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {loading ? "Processing your application…" : "Submit application →"}
      </button>
    </div>
  );
}
