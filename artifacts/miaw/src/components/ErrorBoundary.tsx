import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

/**
 * Full-screen error fallback.
 *
 * The container carries bg-black/20 so that all text achieves ≥4.5:1 contrast
 * on top of the gradient (same scrim strategy as the conversation layer).
 *   "miaw" title      text-white  on CONV_BG = 5.54:1 ✅
 *   subtitle          text-white/90 on CONV_BG = 4.94:1 ✅
 *   "Try again" btn   text-white  on CONV_BG = 5.54:1 ✅
 * See scripts/src/contrast-audit.ts for the full audit.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="gradient-canvas bg-black/20 w-screen h-[100dvh] flex flex-col items-center justify-center">
          <p
            className="text-white mb-3"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "28px" }}
          >
            miaw
          </p>
          <p
            className="text-white/90 text-sm mb-6"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            Something went wrong. The agent is taking a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-white border border-white/30 px-6 py-2 text-sm hover:bg-white/10 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", borderRadius: "9999px" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
