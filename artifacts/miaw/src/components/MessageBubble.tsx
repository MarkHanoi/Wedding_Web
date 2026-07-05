import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  isStreaming?: boolean;
}

function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Lightweight markdown renderer — no external dependency.
// Handles the patterns Claude uses in conversational responses:
//   **bold**  *italic*  `inline code`
//   Newlines are preserved via whitespace-pre-wrap on the container.
//
// Strategy: split the text on a regex that captures each delimiter pair.
// Walk the segments and toggle bold/italic/code state as delimiters appear.
// Returns an array of React nodes safe to render inline.
// ---------------------------------------------------------------------------
type Segment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string };

function parseMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  // Match **bold**, *italic*, `code` — order matters: ** before *
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/gs;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: text.slice(last, match.index) });
    }
    if (match[2] !== undefined) {
      segments.push({ type: "bold", value: match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ type: "italic", value: match[3] });
    } else if (match[4] !== undefined) {
      segments.push({ type: "code", value: match[4] });
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }

  return segments;
}

function renderSegments(segments: Segment[]): React.ReactNode[] {
  return segments.map((seg, i) => {
    switch (seg.type) {
      case "bold":
        return <strong key={i} style={{ fontWeight: 600 }}>{seg.value}</strong>;
      case "italic":
        return <em key={i}>{seg.value}</em>;
      case "code":
        return (
          <code
            key={i}
            style={{
              fontFamily: "monospace",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "3px",
              padding: "0.1em 0.35em",
              fontSize: "0.9em",
            }}
          >
            {seg.value}
          </code>
        );
      default:
        return <span key={i}>{seg.value}</span>;
    }
  });
}

const StreamCursor = () => (
  <motion.span
    className="inline-block ml-[1px] align-baseline"
    style={{
      width: "2px",
      height: "1em",
      background: "rgba(255,255,255,0.75)",
      borderRadius: "1px",
      verticalAlign: "text-bottom",
      marginBottom: "0.05em",
    }}
    animate={{ opacity: [1, 1, 0, 0] }}
    transition={{ duration: 1, repeat: Infinity, times: [0, 0.45, 0.5, 0.95], ease: "linear" }}
  />
);

const MessageBubble = function MessageBubble({
  message,
  isLatest,
  isStreaming,
}: MessageBubbleProps) {
  const isAgent = message.role === "assistant";
  const showCursor = isAgent && isLatest && isStreaming;

  return (
    <motion.div
      className={clsx(
        isAgent ? "self-start w-full" : "self-end max-w-[85%]",
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className={clsx(
          "text-white leading-relaxed text-[15px] sm:text-base whitespace-pre-wrap",
          isAgent
            ? "text-left"
            : "text-right bg-white/[0.08] backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-2.5",
        )}
      >
        {isAgent
          ? renderSegments(parseMarkdown(message.content))
          : message.content}
        {showCursor && <StreamCursor />}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
