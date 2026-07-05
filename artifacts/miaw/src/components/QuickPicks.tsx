import { motion } from "framer-motion";

interface QuickPicksProps {
  onHowToApply: () => void;
  onProgramStructure: () => void;
  onWhoWeAre: () => void;
}

const picks = [
  { label: "How to apply", handler: "onHowToApply" as const },
  { label: "Program structure", handler: "onProgramStructure" as const },
  { label: "Who we are", handler: "onWhoWeAre" as const },
];

export default function QuickPicks({ onHowToApply, onProgramStructure, onWhoWeAre }: QuickPicksProps) {
  const handlers = { onHowToApply, onProgramStructure, onWhoWeAre };

  return (
    <motion.div
      className="self-start w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <p
        className="text-white/40 text-xs mb-3 tracking-wide"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
      >
        where do you want to start?
      </p>
      <div className="flex flex-col gap-2">
        {picks.map(({ label, handler }, i) => (
          <motion.button
            key={label}
            type="button"
            onClick={handlers[handler]}
            className="self-start text-left text-white/70 hover:text-white text-sm border border-white/15 hover:border-white/35 rounded-full px-4 py-2 transition-all hover:bg-white/5"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: i * 0.07, ease: "easeOut" }}
          >
            {label} →
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
