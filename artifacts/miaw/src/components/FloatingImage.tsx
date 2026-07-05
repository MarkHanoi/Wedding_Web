// ---------------------------------------------------------------------------
// P5 FloatingImage — contextual image portal (redesigned)
//
// The image renders as a centered elliptical portal that bleeds into the
// gradient through three layered effects:
//
//   1. mask-image radial-gradient on <img> — hard centre, smooth dissolve
//      outward; image is fully transparent at ~88% of the ellipse radius so
//      there is never a visible edge or crop line.
//
//   2. mix-blend-mode: screen on the container — image colour tones blend
//      with the purple/pink gradient behind. Brights glow; darks vanish.
//      Applied at container level so Framer's opacity animation composites
//      correctly per the CSS compositing spec (blend then opacity).
//
//   3. Framer AnimatePresence opacity — topic changes cross-fade instantly.
//      mode="sync" lets incoming and outgoing images overlap so there is no
//      blank gap between them (no "double render" flicker).
//      loading="eager" ensures the browser fetches the image immediately
//      rather than deferring it, so it is ready the moment the topic fires.
//
// The CSS `imageFloat` @keyframes (compositor-only transform) adds the same
// slow organic drift as the background gradient blobs.
//
// Accessibility: aria-hidden container, draggable=false, reduced-motion guard.
// Resilience: onError → imgError=true → component returns null silently.
// ---------------------------------------------------------------------------

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  TOPIC_SERIES,
  getSeriesImage,
  type TopicSlug,
} from "../lib/topicImages";

interface FloatingImageProps {
  topic: TopicSlug | null;
  turnDepth: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function FloatingImage({ topic, turnDepth }: FloatingImageProps) {
  const [imgError, setImgError] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const prevTopicRef = useRef<TopicSlug | null>(null);

  useEffect(() => {
    if (topic !== prevTopicRef.current) {
      setImgError(false);
      prevTopicRef.current = topic;
    }
  }, [topic]);

  if (!topic || imgError) return null;

  const series = TOPIC_SERIES[topic];
  if (!series) return null;

  const imageIndex = turnDepth % series.images.length;
  const entry = getSeriesImage(topic, turnDepth);

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={`${topic}-${imageIndex}`}
        className="floating-image-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }}
        aria-hidden="true"
      >
        <img
          src={entry.src}
          alt={entry.alt}
          className={`floating-image${reducedMotion ? "" : " floating-image--animated"}`}
          onError={() => setImgError(true)}
          loading="eager"
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );
}
