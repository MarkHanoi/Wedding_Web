import { useMemo } from "react";
import { motion } from "framer-motion";

interface CursorPromptProps {
  onClick: () => void;
}

const PROMPTS = [
  "ask me anything",
  "let's talk",
  "I have a question",
  "what do you need to know?",
  "here to help",
  "tell me more",
  "click to chat",
  "wedding questions?",
];

export default function CursorPrompt({ onClick }: CursorPromptProps) {
  const prompt = useMemo(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
    [],
  );

  return (
    <motion.button
      onClick={onClick}
      className="cursor-enter absolute flex items-center gap-1.5 bg-black/25 hover:bg-black/40 rounded-full px-3 py-1.5 transition-colors"
      style={{ bottom: "28%", right: "24%" }}
      aria-label="Start conversation"
      animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
      transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      whileHover={{ scale: 1.06, y: -10 }}
    >
      <svg
        width="13"
        height="16"
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
        aria-hidden="true"
      >
        <path d="M0 0L0 17.5L4.5 13L7.5 20L9.5 19.2L6.5 12H12L0 0Z" fill="currentColor" />
      </svg>
      <span
        className="text-white text-xs italic tracking-wide"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
      >
        {prompt}
      </span>
    </motion.button>
  );
}
