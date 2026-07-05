/**
 * Typing indicator — three animated dots shown while the agent is generating.
 *
 * role="status" + aria-label: screen readers announce "MIAW is typing" when
 * this element appears. Each dot span is aria-hidden — decorative only.
 */
export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 py-2 px-1"
      role="status"
      aria-label="MIAW is typing"
    >
      <span className="dot-1 w-1.5 h-1.5 bg-white rounded-full block" aria-hidden="true" />
      <span className="dot-2 w-1.5 h-1.5 bg-white rounded-full block" aria-hidden="true" />
      <span className="dot-3 w-1.5 h-1.5 bg-white rounded-full block" aria-hidden="true" />
    </div>
  );
}
