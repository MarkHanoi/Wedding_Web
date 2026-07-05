/**
 * generate-og-image.ts
 *
 * Build-time script: converts the MIAW OG image SVG to a 1200×630 PNG and
 * places it in artifacts/miaw/public/og.png so Vite can copy it into the
 * production build and serve it as a static CDN-cached asset.
 *
 * Uses ImageMagick (`magick`) which is available in the Replit Nix environment.
 * No npm dependencies required — zero additions to node_modules.
 *
 * Run via:
 *   pnpm --filter @workspace/scripts run generate-og
 *
 * Called automatically during `pnpm run build` (before the Vite build so that
 * public/og.png is picked up by Vite's static asset copy step).
 */

import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const publicDir = join(__dirname, "../../artifacts/miaw/public");
const outputPath = join(publicDir, "og.png");
const tmpSvgPath = join(tmpdir(), "miaw-og-build.svg");

// ---------------------------------------------------------------------------
// SVG definition
//
// This is the single source of truth for the MIAW OG image.
// Also referenced (as a duplicate) by artifacts/api-server/src/routes/og.ts
// for the dynamic SVG endpoint — keep both in sync when the design changes.
// ---------------------------------------------------------------------------

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

  <!-- miaw logo: pixel-style via letter-spacing + monospace -->
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

// ---------------------------------------------------------------------------
// Ensure output directory exists
// ---------------------------------------------------------------------------

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Write SVG to a temp file then convert with ImageMagick
// (Piping SVG through stdin to magick is less portable across IM versions.)
// ---------------------------------------------------------------------------

writeFileSync(tmpSvgPath, svg, "utf-8");

console.log("Generating OG image…");

const result = spawnSync(
  "magick",
  [
    "-density", "96",  // 96 DPI: produces the SVG's declared pixel dimensions (1200×630)
    tmpSvgPath,
    "-strip",          // strip all metadata (EXIF, ICC profile) to minimise file size
    outputPath,
  ],
  { encoding: "utf-8" },
);

// Always clean up the temp file, regardless of success or failure
try {
  unlinkSync(tmpSvgPath);
} catch {
  // Non-fatal: temp file cleanup failure does not affect output correctness
}

if (result.status !== 0) {
  console.error("Failed to generate OG image.");
  if (result.stderr) console.error(result.stderr);
  if (result.error) console.error(result.error.message);
  process.exit(1);
}

console.log(`✓ OG image written → ${outputPath}`);
