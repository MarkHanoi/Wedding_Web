import { Router } from "express";

const router = Router();

router.get("/og", (_req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="b1" cx="5%" cy="55%" r="70%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#5a78e8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#5a78e8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b2" cx="92%" cy="18%" r="60%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#e050a8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#e050a8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b3" cx="72%" cy="90%" r="58%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f055b8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f055b8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b4" cx="40%" cy="5%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#7ab2f8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#7ab2f8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="1200" height="630" fill="#8e72d5"/>
  <!-- Gradient blobs -->
  <rect width="1200" height="630" fill="url(#b1)"/>
  <rect width="1200" height="630" fill="url(#b2)"/>
  <rect width="1200" height="630" fill="url(#b3)"/>
  <rect width="1200" height="630" fill="url(#b4)"/>

  <!-- miaw logo — pixel-style via letter-spacing + monospace -->
  <text
    x="600"
    y="295"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Courier New', Courier, monospace"
    font-weight="900"
    font-size="180"
    fill="white"
    letter-spacing="12"
    paint-order="stroke"
    stroke="rgba(255,255,255,0.08)"
    stroke-width="2"
  >miaw</text>

  <!-- subtitle -->
  <text
    x="600"
    y="400"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="300"
    font-size="28"
    fill="rgba(255,255,255,0.78)"
    letter-spacing="5"
  >Master In Intelligent Artificial Worlds</text>

  <!-- tagline -->
  <text
    x="600"
    y="452"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="300"
    font-size="20"
    fill="rgba(255,255,255,0.48)"
    letter-spacing="3"
  >AI world models · AEC · First cohort 2026</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  res.send(svg);
});

export default router;
