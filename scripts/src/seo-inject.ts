/**
 * seo-inject.ts
 *
 * Build-time script: generates the full SEO foundation layer for MIAW.
 *
 * What it does:
 *   1. Reads knowledge base MD files from artifacts/api-server/knowledge/
 *   2. Generates three static HTML pages in artifacts/miaw/public/:
 *        public/about/index.html     → /about
 *        public/curriculum/index.html → /curriculum
 *        public/apply/index.html      → /apply
 *   3. Generates public/sitemap.xml  (with image extension)
 *   4. Generates public/robots.txt   (replaces static file with generated)
 *   5. Generates public/.well-known/security.txt
 *   6. Injects a hidden SEO content layer into artifacts/miaw/index.html
 *      (replaces content between <!-- SEO_INJECT_START --> and <!-- SEO_INJECT_END -->)
 *
 * Run via:
 *   pnpm --filter @workspace/scripts run seo-inject
 *
 * Called automatically during `pnpm run build` before the Vite build step.
 *
 * Architecture note (ADR-015):
 *   The hidden SEO layer is a legitimate, Google-approved technique. The content
 *   is identical to what the AI discusses; it is not served differently by the
 *   server (not cloaking). CSS display:none hides it from sighted users but
 *   crawlers that skip JS execution read it directly.
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const KNOWLEDGE_DIR = join(REPO_ROOT, "artifacts/api-server/knowledge");
const PUBLIC_DIR = join(REPO_ROOT, "artifacts/miaw/public");
const INDEX_HTML_PATH = join(REPO_ROOT, "artifacts/miaw/index.html");

const CANONICAL_BASE = "https://miaw.ai";
const BUILD_DATE = new Date().toISOString().split("T")[0] ?? "2026-01-01";
const SITE_NAME = "MIAW";
const AUTHOR = "MIAW Program";
const TWITTER_HANDLE = "@miawai";
const ORG_ID = `${CANONICAL_BASE}/#organization`;
const WEBSITE_ID = `${CANONICAL_BASE}/#website`;
const COURSE_ID = `${CANONICAL_BASE}/#course`;

// ---------------------------------------------------------------------------
// Knowledge file reading
// ---------------------------------------------------------------------------

function readKnowledge(filename: string): string {
  const filepath = join(KNOWLEDGE_DIR, filename);
  if (!existsSync(filepath)) {
    throw new Error(`Knowledge file not found: ${filepath}`);
  }
  return readFileSync(filepath, "utf-8");
}

// ---------------------------------------------------------------------------
// Markdown section extractor
// ---------------------------------------------------------------------------

function extractSection(md: string, heading: string): string {
  const lines = md.split("\n");
  let inside = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      if (inside) break;
      if (line.replace(/^#+\s*/, "").trim() === heading) {
        inside = true;
        continue;
      }
    }
    if (inside) sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

function extractAllSections(md: string): Array<{ heading: string; body: string }> {
  const lines = md.split("\n");
  const sections: Array<{ heading: string; body: string }> = [];
  let current: { heading: string; bodyLines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) {
        sections.push({ heading: current.heading, body: current.bodyLines.join("\n").trim() });
      }
      current = { heading: line.replace(/^## /, "").trim(), bodyLines: [] };
    } else if (line.startsWith("# ")) {
      continue;
    } else if (current) {
      current.bodyLines.push(line);
    }
  }

  if (current) {
    sections.push({ heading: current.heading, body: current.bodyLines.join("\n").trim() });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// FAQ parser
// ---------------------------------------------------------------------------

interface FaqItem {
  question: string;
  answer: string;
}

function extractFaqItems(md: string): FaqItem[] {
  const items: FaqItem[] = [];
  const lines = md.split("\n");
  let currentQ: string | null = null;
  const answerLines: string[] = [];

  for (const line of lines) {
    const qMatch = line.match(/^Q:\s*(.+)/);
    const aMatch = line.match(/^A:\s*(.+)/);

    if (qMatch) {
      if (currentQ && answerLines.length > 0) {
        items.push({ question: currentQ, answer: answerLines.join(" ").trim() });
        answerLines.length = 0;
      }
      currentQ = qMatch[1]?.trim() ?? "";
    } else if (aMatch && currentQ) {
      answerLines.push(aMatch[1]?.trim() ?? "");
    }
  }

  if (currentQ && answerLines.length > 0) {
    items.push({ question: currentQ, answer: answerLines.join(" ").trim() });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Module parser
// ---------------------------------------------------------------------------

interface Module {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  deliverable: string;
}

function extractModules(md: string): Module[] {
  const modules: Module[] = [];
  const lines = md.split("\n");
  let current: {
    id: string;
    title: string;
    subtitle: string;
    bodyLines: string[];
  } | null = null;

  for (const line of lines) {
    // Match: "## Module F0 — Foundations (Mindset, Environment and AI Workflows)"
    // em-dash (—) or regular dash (-) after module id
    const match = line.match(/^## Module (F\d+)\s*[—\-]\s*(.+?)(?:\s*\((.+)\))?$/);

    if (match) {
      if (current) {
        const body = current.bodyLines.join("\n").trim();
        const deliverableMatch = body.match(/Deliverable [A-Z]\d+:\s*(.+?)(?=\n\n|$)/s);
        modules.push({
          id: current.id,
          title: current.title,
          subtitle: current.subtitle,
          body: body.replace(/Deliverable [A-Z]\d+:.+/s, "").trim(),
          deliverable: deliverableMatch
            ? (deliverableMatch[1] ?? "").replace(/\n/g, " ").trim()
            : "",
        });
      }
      current = {
        id: match[1] ?? "",
        title: match[2]?.trim() ?? "",
        subtitle: match[3]?.trim() ?? "",
        bodyLines: [],
      };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }

  if (current) {
    const body = current.bodyLines.join("\n").trim();
    const deliverableMatch = body.match(/Deliverable [A-Z]\d+:\s*(.+?)(?=\n\n|$)/s);
    modules.push({
      id: current.id,
      title: current.title,
      subtitle: current.subtitle,
      body: body.replace(/Deliverable [A-Z]\d+:.+/s, "").trim(),
      deliverable: deliverableMatch
        ? (deliverableMatch[1] ?? "").replace(/\n/g, " ").trim()
        : "",
    });
  }

  return modules;
}

// ---------------------------------------------------------------------------
// HTML escaping utility
// ---------------------------------------------------------------------------

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Shared CSS for static pages
// ---------------------------------------------------------------------------

const SHARED_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --purple: #8e72d5;
    --blue: #5a78e8;
    --pink: #e050a8;
    --light-blue: #7ab2f8;
    --text: #f0eeff;
    --text-muted: rgba(240,238,255,0.62);
    --bg: #1a1530;
    --surface: rgba(255,255,255,0.06);
    --border: rgba(255,255,255,0.12);
    --max-w: 860px;
  }

  html { font-size: 16px; scroll-behavior: smooth; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-weight: 300;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 70% 70% at 5% 55%, rgba(90,120,232,0.40) 0%, transparent 70%),
      radial-gradient(ellipse 60% 60% at 92% 18%, rgba(224,80,168,0.35) 0%, transparent 70%),
      radial-gradient(ellipse 58% 58% at 72% 90%, rgba(240,85,184,0.28) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 40% 5%, rgba(122,178,248,0.30) 0%, transparent 70%);
  }

  /* Skip link for accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--blue);
    color: #fff;
    padding: 8px 16px;
    z-index: 100;
    text-decoration: none;
    font-size: 0.9rem;
  }
  .skip-link:focus { top: 0; }

  /* ------------------------------------------------------------------ nav */
  header {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(12px);
    background: rgba(26,21,48,0.72);
    border-bottom: 1px solid var(--border);
  }
  nav {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0.9rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  .logo {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 900;
    font-size: 1.4rem;
    color: #fff;
    text-decoration: none;
    letter-spacing: 3px;
    flex-shrink: 0;
  }
  .logo:hover { color: var(--light-blue); }
  nav ul {
    list-style: none;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  nav a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }
  nav a:hover, nav a[aria-current="page"] { color: var(--text); }
  nav .cta-nav {
    margin-left: auto;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    color: #fff !important;
    padding: 0.45rem 1.1rem;
    border-radius: 6px;
    font-weight: 500;
    white-space: nowrap;
  }
  nav .cta-nav:hover { opacity: 0.88; }

  /* ------------------------------------------------------------------ main */
  main {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
  }

  /* breadcrumb */
  .breadcrumb {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 2rem;
    display: flex;
    gap: 0.4rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .breadcrumb a { color: var(--text-muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--text); }
  .breadcrumb-sep { opacity: 0.5; }

  .page-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 300;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fff 30%, var(--light-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 3rem;
    font-weight: 300;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--text);
    margin: 2.5rem 0 0.75rem;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--light-blue);
    margin: 1.5rem 0 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  p { margin-bottom: 1rem; color: var(--text-muted); }
  p:last-child { margin-bottom: 0; }
  em { color: var(--text); font-style: italic; }
  strong { color: var(--text); font-weight: 500; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
  }
  .card h2 { margin-top: 0; }
  .card-tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(90,120,232,0.25);
    color: var(--light-blue);
    border-radius: 4px;
    padding: 0.2rem 0.55rem;
    margin-bottom: 0.7rem;
  }

  .module-grid { display: grid; gap: 1.25rem; }
  .module-id {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--purple);
    margin-bottom: 0.3rem;
  }
  .module-title {
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 0.5rem;
  }
  .deliverable {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(122,178,248,0.08);
    border-left: 3px solid var(--light-blue);
    border-radius: 0 6px 6px 0;
    font-size: 0.875rem;
    color: var(--text-muted);
  }
  .deliverable strong { color: var(--light-blue); font-weight: 500; }

  .faq-item { margin-bottom: 1.5rem; }
  .faq-q {
    font-weight: 500;
    color: var(--text);
    margin-bottom: 0.3rem;
    font-size: 1rem;
  }
  .faq-a { color: var(--text-muted); font-size: 0.95rem; }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  .stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  .stat-number {
    font-size: 2rem;
    font-weight: 600;
    color: #fff;
    line-height: 1;
    margin-bottom: 0.3rem;
  }
  .stat-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

  .cta-block {
    margin-top: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(90,120,232,0.18), rgba(224,80,168,0.12));
    border: 1px solid rgba(90,120,232,0.3);
    border-radius: 12px;
    text-align: center;
  }
  .cta-block h2 { margin-top: 0; font-size: 1.4rem; }
  .cta-block p { margin-bottom: 1.25rem; }
  .btn {
    display: inline-block;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    color: #fff;
    text-decoration: none;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn:hover { opacity: 0.88; transform: translateY(-1px); }

  /* howto steps */
  .steps { list-style: none; display: grid; gap: 0.75rem; counter-reset: steps; }
  .step {
    counter-increment: steps;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }
  .step::before {
    content: counter(steps);
    min-width: 1.75rem;
    height: 1.75rem;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .step-content h3 { margin-top: 0; margin-bottom: 0.25rem; font-size: 0.9rem; }
  .step-content p { margin: 0; font-size: 0.9rem; }

  /* internal links section */
  .related-pages {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  .related-pages h2 { margin-top: 0; font-size: 1rem; color: var(--text-muted); }
  .related-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }
  .related-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--light-blue);
    text-decoration: none;
    font-size: 0.875rem;
    padding: 0.4rem 0.8rem;
    background: rgba(122,178,248,0.08);
    border: 1px solid rgba(122,178,248,0.2);
    border-radius: 6px;
    transition: background 0.2s;
  }
  .related-link:hover { background: rgba(122,178,248,0.15); }

  /* ----------------------------------------------------------------- footer */
  footer {
    border-top: 1px solid var(--border);
    padding: 2rem 1.5rem;
    max-width: var(--max-w);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  footer nav ul { gap: 1rem; list-style: none; display: flex; }
  footer a { color: var(--text-muted); text-decoration: none; }
  footer a:hover { color: var(--text); }

  @media (max-width: 600px) {
    nav { flex-wrap: wrap; }
    nav .cta-nav { margin-left: 0; }
    .stat-row { grid-template-columns: 1fr 1fr; }
    footer { flex-direction: column; align-items: flex-start; }
    .related-pages { flex-direction: column; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
`.trim();

// ---------------------------------------------------------------------------
// Async font loading snippet (matching index.html — non-render-blocking)
// ---------------------------------------------------------------------------

const FONT_HTML = `
  <!-- Fonts: non-render-blocking async load. preconnect → preload → stylesheet onload -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
    onload="this.onload=null;this.rel='stylesheet'"
  />
  <noscript>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </noscript>`.trim();

// ---------------------------------------------------------------------------
// WebSite JSON-LD (included on every page — enables Google Sitelinks Searchbox)
// ---------------------------------------------------------------------------

const WEBSITE_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  alternateName: "Master In Intelligent Artificial Worlds",
  url: CANONICAL_BASE,
  description: "Postgraduate program for architects and AI engineers — spatial AI, AEC, world models.",
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${CANONICAL_BASE}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}, null, 2);

// ---------------------------------------------------------------------------
// Shared page shell
// ---------------------------------------------------------------------------

interface PageShellOptions {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  /** Array of JSON-LD objects (will be emitted as separate <script> blocks) */
  jsonLdBlocks: string[];
  navCurrent: "about" | "curriculum" | "apply" | "faculty" | "";
  content: string;
  /** Breadcrumb items after "MIAW" root item */
  breadcrumbItems: Array<{ name: string; url: string }>;
}

function pageShell({
  title,
  description,
  canonical,
  ogTitle,
  jsonLdBlocks,
  navCurrent,
  content,
  breadcrumbItems,
}: PageShellOptions): string {
  const navLinks = [
    { href: "/about", label: "About", id: "about" },
    { href: "/curriculum", label: "Curriculum", id: "curriculum" },
    { href: "/faculty", label: "Faculty", id: "faculty" },
    { href: "/apply", label: "Apply", id: "apply" },
  ] as const;

  // BreadcrumbList — position 1 is always the MIAW root
  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MIAW", item: CANONICAL_BASE },
      ...breadcrumbItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: item.url,
      })),
    ],
  }, null, 2);

  // Visual breadcrumb trail
  const breadcrumbHtml = `
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <a href="/">MIAW</a>
      ${breadcrumbItems.map(item => `<span class="breadcrumb-sep" aria-hidden="true">›</span><a href="${item.url}">${esc(item.name)}</a>`).join("")}
    </nav>`;

  const jsonLdScripts = [WEBSITE_JSONLD, breadcrumbSchema, ...jsonLdBlocks]
    .map(block => `  <script type="application/ld+json">\n  ${block}\n  </script>`)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="author" content="${AUTHOR}" />
  <meta name="application-name" content="${SITE_NAME}" />
  <link rel="canonical" href="${canonical}" />

  <!-- Alternate / hreflang — x-default signals the default language version -->
  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonical}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${CANONICAL_BASE}/og.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="MIAW — Master In Intelligent Artificial Worlds" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${TWITTER_HANDLE}" />
  <meta name="twitter:creator" content="${TWITTER_HANDLE}" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${CANONICAL_BASE}/og.png" />
  <meta name="twitter:image:alt" content="MIAW — Master In Intelligent Artificial Worlds" />

  <!-- Theme / PWA -->
  <meta name="theme-color" content="#8e72d5" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
  <link rel="preload" as="image" href="/og.png" />

  ${FONT_HTML}

  <!-- Structured data -->
${jsonLdScripts}

  <style>
    ${SHARED_CSS}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <nav aria-label="Main navigation">
      <a href="/" class="logo" aria-label="MIAW home">miaw</a>
      <ul role="list">
        ${navLinks
          .map(
            ({ href, label, id }) =>
              `<li><a href="${href}"${id === navCurrent ? ' aria-current="page"' : ""}>${label}</a></li>`,
          )
          .join("\n        ")}
      </ul>
      <a href="/" class="cta-nav" aria-label="Start a conversation with MIAW AI">Talk to MIAW →</a>
    </nav>
  </header>

  <main id="main-content">
    ${breadcrumbHtml}
    ${content}
  </main>

  <footer>
    <span>© ${new Date().getFullYear()} MIAW — Master In Intelligent Artificial Worlds</span>
    <nav aria-label="Footer navigation">
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/curriculum">Curriculum</a></li>
        <li><a href="/faculty">Faculty</a></li>
        <li><a href="/topics">Topics</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/apply">Apply</a></li>
        <li><a href="/">Conversation</a></li>
      </ul>
    </nav>
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared JSON-LD: EducationalOrganization (used on all pages)
// ---------------------------------------------------------------------------

function buildOrgSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: "MIAW — Master In Intelligent Artificial Worlds",
    alternateName: "MIAW",
    description:
      "A worldwide postgraduate program at the intersection of AI world models and architectural practice. 18 weeks, 9 modules, real projects from week 1.",
    url: CANONICAL_BASE,
    logo: {
      "@type": "ImageObject",
      "@id": `${CANONICAL_BASE}/#logo`,
      url: `${CANONICAL_BASE}/og.png`,
      width: 1200,
      height: 630,
      caption: "MIAW — Master In Intelligent Artificial Worlds",
    },
    image: {
      "@id": `${CANONICAL_BASE}/#logo`,
    },
    sameAs: [CANONICAL_BASE],
    knowsAbout: [
      "Spatial AI",
      "Artificial Intelligence in Architecture",
      "Gaussian Splatting",
      "BIM and Machine Learning",
      "Parametric Design with AI",
      "AEC Technology",
      "Building Information Modeling",
      "Model Context Protocol",
      "AI-driven territorial analysis",
      "Robotic fabrication with AI",
      "World models",
      "Computational design",
    ],
    foundingDate: "2026",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1, maxValue: 20 },
    areaServed: "Worldwide",
  };
}

// ---------------------------------------------------------------------------
// About page
// ---------------------------------------------------------------------------

function generateAboutPage(): string {
  const aecMd = readKnowledge("aec-context.md");
  const currMd = readKnowledge("curriculum.md");
  const facultyMd = readKnowledge("faculty.md");

  const whatMakes = extractSection(currMd, "What Makes It Different");
  const outcomes = extractSection(currMd, "Outcomes");
  const researchAreas = extractSection(facultyMd, "Research Focus Areas");
  const practitionerGap = extractSection(aecMd, "The Practitioner Gap");
  const keyTech = extractSection(aecMd, "Key Technologies Reshaping AEC");
  const transformation = extractSection(aecMd, "The Transformation");

  const researchList = researchAreas.split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2)).filter(Boolean);
  const whatMakesList = whatMakes.split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2)).filter(Boolean);
  const outcomesList = outcomes.split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2)).filter(Boolean);
  const keyTechList = keyTech.split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2)).filter(Boolean);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${CANONICAL_BASE}/about#webpage`,
    url: `${CANONICAL_BASE}/about`,
    name: "About MIAW — Master In Intelligent Artificial Worlds",
    description:
      "MIAW is a worldwide postgraduate program at the intersection of AI world models and architectural practice. 18 weeks, 9 modules, real projects from week 1.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${CANONICAL_BASE}/about#breadcrumb` },
    potentialAction: {
      "@type": "ReadAction",
      target: [`${CANONICAL_BASE}/about`],
    },
  };

  const orgSchema = buildOrgSchema();

  const content = `
    <h1 class="page-title">About MIAW</h1>
    <p class="page-subtitle">The first postgraduate program structured by phases of the design process — not by tools.</p>

    <div class="stat-row">
      <div class="stat"><div class="stat-number">18</div><div class="stat-label">Weeks</div></div>
      <div class="stat"><div class="stat-number">9</div><div class="stat-label">Modules</div></div>
      <div class="stat"><div class="stat-number">30</div><div class="stat-label">Max cohort</div></div>
      <div class="stat"><div class="stat-number">Q4</div><div class="stat-label">2026 launch</div></div>
    </div>

    <section aria-labelledby="about-what">
      <h2 id="about-what">What is MIAW?</h2>
      <p>
        MIAW (<strong>Master In Intelligent Artificial Worlds</strong>) is a worldwide postgraduate program
        for architects, software developers, solution architects, designers, engineers, platform architects,
        technical architects, interior designers, and landscape designers who want to integrate AI into every
        phase of their design process.
      </p>
      <p>
        It is not a course about AI tools. It is a program about how <em>architectural practice changes</em>
        when AI is integrated in every phase — from site analysis to documentation, from concept to fabrication.
      </p>
    </section>

    <section aria-labelledby="about-context">
      <h2 id="about-context">Why This, Why Now</h2>
      <p>${esc(transformation.replace(/\n/g, " "))}</p>
    </section>

    <section aria-labelledby="about-gap">
      <h2 id="about-gap">The Gap MIAW Closes</h2>
      <p>${esc(practitionerGap.replace(/\n/g, " "))}</p>
    </section>

    <section aria-labelledby="about-different">
      <h2 id="about-different">What Makes It Different</h2>
      <ul style="list-style:none;display:grid;gap:0.6rem;" role="list">
        ${whatMakesList.map(item => `<li style="padding:0.6rem 0.8rem;background:var(--surface);border-radius:6px;border-left:3px solid var(--purple);color:var(--text-muted);">✦ ${esc(item)}</li>`).join("\n        ")}
      </ul>
    </section>

    ${researchList.length > 0 ? `
    <section aria-labelledby="about-research">
      <h2 id="about-research">Research Focus Areas</h2>
      <div style="display:grid;gap:0.6rem;">
        ${researchList.map(area => `<div class="card" style="padding:1rem;"><p style="margin:0;font-size:0.95rem;">${esc(area)}</p></div>`).join("\n        ")}
      </div>
    </section>` : ""}

    <section aria-labelledby="about-tech">
      <h2 id="about-tech">Key Technologies</h2>
      <p>The AEC sector is being reshaped by a convergence of technologies that MIAW teaches in depth:</p>
      <ul style="list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;" role="list">
        ${keyTechList.map(tech => `<li style="font-size:0.875rem;color:var(--text-muted);padding:0.4rem 0.6rem;background:var(--surface);border-radius:4px;">${esc(tech)}</li>`).join("\n        ")}
      </ul>
    </section>

    ${outcomesList.length > 0 ? `
    <section aria-labelledby="about-outcomes">
      <h2 id="about-outcomes">Program Outcomes</h2>
      <ul style="list-style:none;display:grid;gap:0.5rem;" role="list">
        ${outcomesList.map(outcome => `<li style="display:flex;gap:0.6rem;align-items:flex-start;color:var(--text-muted);font-size:0.95rem;"><span style="color:var(--light-blue);flex-shrink:0;" aria-hidden="true">→</span>${esc(outcome)}</li>`).join("\n        ")}
      </ul>
    </section>` : ""}

    <section aria-labelledby="about-who">
      <h2 id="about-who">Who Is MIAW For?</h2>
      <p>
        You need either: professional experience in AEC (architecture, engineering, construction) with
        curiosity about AI, <em>or</em> a software/AI background with interest in physical world
        applications. The program bridges both worlds. You do not need both — MIAW exists precisely
        because almost no one has both.
      </p>
      <p>
        Basic Python is strongly recommended. The program teaches what you need within it, but arriving
        with Python fundamentals (functions, loops, basic libraries) lets you focus on the domain, not syntax.
      </p>
    </section>

    <section aria-labelledby="about-format">
      <h2 id="about-format">Format &amp; Delivery</h2>
      <div class="card">
        <h3>Schedule</h3>
        <p>18 weeks at 8–10 hours per week — designed for working professionals, compatible with active practice.</p>
        <h3>Language</h3>
        <p>English. All materials, sessions, and deliverables are in English.</p>
        <h3>Mode</h3>
        <p>Online-first. Optional in-person intensive sessions per cohort (strongly recommended).</p>
        <h3>Cohort size</h3>
        <p>Maximum 30 participants — kept small intentionally to maintain quality and mentorship depth.</p>
        <h3>First cohort</h3>
        <p>Targeting Q4 2026. Exact date depends on cohort composition and faculty availability.</p>
      </div>
    </section>

    <div class="cta-block">
      <h2>Ready to learn more?</h2>
      <p>The best way to understand MIAW is to talk with the AI that knows it inside out.</p>
      <a href="/" class="btn">Start the conversation →</a>
    </div>

    <div class="related-pages">
      <h2>Explore further</h2>
      <div class="related-links">
        <a href="/curriculum" class="related-link">→ Full Curriculum (9 modules)</a>
        <a href="/apply" class="related-link">→ How to Apply</a>
        <a href="/" class="related-link">→ Talk with MIAW AI</a>
      </div>
    </div>
`;

  return pageShell({
    title: "About MIAW — Master In Intelligent Artificial Worlds",
    description:
      "MIAW is a worldwide postgraduate program at the intersection of AI world models and architectural practice. 18 weeks, 9 modules, real projects from week 1. For architects and AI engineers who want to master spatial AI.",
    canonical: `${CANONICAL_BASE}/about`,
    ogTitle: "About MIAW — Master In Intelligent Artificial Worlds",
    jsonLdBlocks: [
      JSON.stringify(webPageSchema, null, 2),
      JSON.stringify(orgSchema, null, 2),
    ],
    navCurrent: "about",
    content,
    breadcrumbItems: [{ name: "About", url: `${CANONICAL_BASE}/about` }],
  });
}

// ---------------------------------------------------------------------------
// Curriculum page
// ---------------------------------------------------------------------------

function generateCurriculumPage(modules: Module[]): string {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${CANONICAL_BASE}/curriculum#webpage`,
    url: `${CANONICAL_BASE}/curriculum`,
    name: "Curriculum — MIAW Master In Intelligent Artificial Worlds",
    description:
      "The MIAW curriculum: 9 progressive modules (F0–F8) covering AI-driven territorial analysis, Gaussian Splatting, parametric design, building simulation, documentation automation, and robotic fabrication.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": COURSE_ID },
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${CANONICAL_BASE}/curriculum#breadcrumb` },
    potentialAction: {
      "@type": "ReadAction",
      target: [`${CANONICAL_BASE}/curriculum`],
    },
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": COURSE_ID,
    name: "MIAW — Master In Intelligent Artificial Worlds",
    description:
      "A worldwide postgraduate program at the intersection of AI world models and architectural practice. 9 progressive modules (F0–F8), 18 weeks. For architects, engineers, and AI developers who want to master spatial AI.",
    url: `${CANONICAL_BASE}/curriculum`,
    provider: {
      "@id": ORG_ID,
    },
    educationalLevel: "Postgraduate",
    timeRequired: "P18W",
    numberOfCredits: 9,
    courseMode: "online",
    inLanguage: "en",
    availableLanguage: [{ "@type": "Language", name: "English" }],
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    isAccessibleForFree: false,
    coursePrerequisites: [
      "Basic Python programming (functions, loops, libraries)",
      "Professional experience in AEC (architecture, engineering, construction) OR software/AI development background",
    ],
    teaches: [
      "AI integration in every phase of the architectural design process",
      "Gaussian Splatting and neural rendering for 3D scene reconstruction",
      "Parametric design with AI assistance using Rhino and Grasshopper",
      "AI-driven territorial analysis using public geospatial APIs",
      "Building simulation pipelines with AI interpretation",
      "BIM documentation automation with LLMs",
      "MCP (Model Context Protocol) for connecting AI to AEC tools",
      "Robotic fabrication with AI integration",
      "AI-augmented communication: image, video, immersive environments",
    ],
    about: [
      { "@type": "DefinedTerm", name: "Spatial AI", inDefinedTermSet: "https://schema.org" },
      { "@type": "DefinedTerm", name: "Gaussian Splatting" },
      { "@type": "DefinedTerm", name: "Building Information Modeling" },
      { "@type": "DefinedTerm", name: "Model Context Protocol" },
      { "@type": "DefinedTerm", name: "Parametric Design" },
      { "@type": "DefinedTerm", name: "Architecture Engineering Construction" },
    ],
    offers: {
      "@type": "Offer",
      category: "Postgraduate Program",
      availability: "https://schema.org/PreOrder",
      validFrom: "2026-01-01",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 4000,
        maxPrice: 8000,
        priceCurrency: "EUR",
        description: "Founder pricing available for early applicants",
      },
    },
    hasCourseInstance: modules.map(m => ({
      "@type": "CourseInstance",
      name: `Module ${m.id}: ${m.title}${m.subtitle ? ` (${m.subtitle})` : ""}`,
      description: (m.body.split("\n\n")[0] ?? m.body).slice(0, 500),
      courseMode: "online",
      inLanguage: "en",
      courseWorkload: "PT8H",
    })),
  };

  const moduleCards = modules
    .map(
      m => `
    <article class="card" id="module-${m.id.toLowerCase()}" aria-labelledby="mod-${m.id.toLowerCase()}-title">
      <div class="module-id">${esc(m.id)}</div>
      <h2 class="module-title" id="mod-${m.id.toLowerCase()}-title">${esc(m.title)}${m.subtitle ? ` <span style="color:var(--text-muted);font-weight:300;font-size:0.85em;">(${esc(m.subtitle)})</span>` : ""}</h2>
      <p>${esc(m.body.split("\n\n")[0] ?? m.body.slice(0, 400))}</p>
      ${m.body.split("\n\n").length > 1 ? `<p>${esc(m.body.split("\n\n").slice(1).join(" ").slice(0, 400))}</p>` : ""}
      ${m.deliverable ? `<div class="deliverable"><strong>Deliverable ${esc(m.id)}:</strong> ${esc(m.deliverable)}</div>` : ""}
    </article>`,
    )
    .join("\n");

  const content = `
    <h1 class="page-title">Curriculum</h1>
    <p class="page-subtitle">Nine progressive modules. Each one advances a phase of the design process with AI integrated — from site reading to fabrication.</p>

    <div class="stat-row">
      <div class="stat"><div class="stat-number">9</div><div class="stat-label">Modules</div></div>
      <div class="stat"><div class="stat-number">18</div><div class="stat-label">Weeks</div></div>
      <div class="stat"><div class="stat-number">8–10h</div><div class="stat-label">Per week</div></div>
      <div class="stat"><div class="stat-number">F0–F8</div><div class="stat-label">Progression</div></div>
    </div>

    <section aria-labelledby="structure-heading">
      <h2 id="structure-heading">Program Structure</h2>
      <p>
        The curriculum is structured by phases of the design process — not by tools. <strong>F0</strong> builds the
        technical and conceptual foundation: mindset, environment, and AI reasoning capacity.
        <strong>F1 through F7</strong> each advance one phase of the architectural workflow with AI integrated
        end-to-end: reading territory, capturing space, modeling, designing, simulating, communicating, documenting,
        and fabricating. <strong>F8</strong> synthesises everything into the student's own adaptive AI design
        ecosystem, culminating in a real project deliverable.
      </p>
      <p>
        The student's own real project is the working material throughout the program — not fictional case studies.
        Each module produces a concrete deliverable directly applicable to professional practice.
      </p>
    </section>

    <section aria-labelledby="modules-heading">
      <h2 id="modules-heading">The Nine Modules</h2>
      <div class="module-grid">
        ${moduleCards}
      </div>
    </section>

    <section aria-labelledby="prereq-heading">
      <h2 id="prereq-heading">Prerequisites</h2>
      <div class="card">
        <h3>Technical</h3>
        <p>Basic Python is strongly recommended. The program teaches what you need within it, but arriving with Python fundamentals (functions, loops, basic libraries) lets you focus on the domain, not syntax.</p>
        <h3>Professional</h3>
        <p>Professional experience in AEC <em>or</em> software/AI development background. You do not need both — MIAW bridges them.</p>
        <h3>Hardware</h3>
        <p>A modern laptop (Mac or Windows) and stable internet connection. GPU access for simulation tasks is available via cloud — not required locally.</p>
      </div>
    </section>

    <div class="cta-block">
      <h2>Questions about the curriculum?</h2>
      <p>Ask the AI — it can explain any module, discuss prerequisites, or help you understand how the program fits your background.</p>
      <a href="/" class="btn">Talk with MIAW →</a>
    </div>

    <div class="related-pages">
      <h2>Explore further</h2>
      <div class="related-links">
        <a href="/about" class="related-link">→ About the program</a>
        <a href="/apply" class="related-link">→ How to Apply</a>
        <a href="/" class="related-link">→ Talk with MIAW AI</a>
      </div>
    </div>
`;

  return pageShell({
    title: "Curriculum — MIAW Master In Intelligent Artificial Worlds",
    description:
      "The MIAW curriculum: 9 progressive modules (F0–F8) covering AI-driven territorial analysis, Gaussian Splatting, parametric design, building simulation, documentation automation, and robotic fabrication. 18 weeks for AEC professionals.",
    canonical: `${CANONICAL_BASE}/curriculum`,
    ogTitle: "MIAW Curriculum — 9 Modules from Foundations to Fabrication with AI",
    jsonLdBlocks: [
      JSON.stringify(webPageSchema, null, 2),
      JSON.stringify(courseSchema, null, 2),
    ],
    navCurrent: "curriculum",
    content,
    breadcrumbItems: [{ name: "Curriculum", url: `${CANONICAL_BASE}/curriculum` }],
  });
}

// ---------------------------------------------------------------------------
// Apply page
// ---------------------------------------------------------------------------

function generateApplyPage(faqItems: FaqItem[]): string {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${CANONICAL_BASE}/apply#webpage`,
    url: `${CANONICAL_BASE}/apply`,
    name: "Apply to MIAW — Master In Intelligent Artificial Worlds",
    description:
      "Apply to MIAW: the postgraduate program for architects and AI engineers who want to master spatial AI. First cohort Q4 2026. Founder pricing for early applicants. No forms — start with a conversation.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${CANONICAL_BASE}/apply#breadcrumb` },
    potentialAction: {
      "@type": "ReadAction",
      target: [`${CANONICAL_BASE}/apply`],
    },
  };

  // HowTo schema — application steps
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${CANONICAL_BASE}/apply#howto`,
    name: "How to Apply to MIAW",
    description:
      "The MIAW application process: no lengthy forms, just a genuine conversation with the AI that knows the program inside out.",
    totalTime: "PT15M",
    tool: [
      { "@type": "HowToTool", name: "Web browser" },
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Start the conversation",
        text: "Navigate to miaw.ai and begin the AI conversation. Click anywhere or press any key to start.",
        url: CANONICAL_BASE,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Share your practice and goals",
        text: "The AI will ask about your background — whether you come from AEC or from software/AI — and what you want to build with the program.",
        url: CANONICAL_BASE,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Receive a genuine assessment",
        text: "After 8 turns, the AI offers a candid view of whether MIAW is the right fit for your profile and goals.",
        url: CANONICAL_BASE,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Join the waitlist for founder pricing",
        text: "Submit your email to secure early applicant status and access to founder pricing (€4,000–€8,000 range).",
        url: `${CANONICAL_BASE}/#waitlist`,
      },
    ],
  };

  // Full FAQPage schema — all FAQ items from knowledge base
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${CANONICAL_BASE}/apply#faq`,
    mainEntity: faqItems.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const faqHtml = faqItems
    .map(
      f => `
    <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <p class="faq-q" itemprop="name">${esc(f.question)}</p>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p class="faq-a" itemprop="text">${esc(f.answer)}</p>
      </div>
    </div>`,
    )
    .join("\n");

  const content = `
    <h1 class="page-title">Apply to MIAW</h1>
    <p class="page-subtitle">Applications for the first cohort open ahead of Q4 2026 launch. Early applicants receive founder pricing.</p>

    <section aria-labelledby="apply-process">
      <h2 id="apply-process">Application Process</h2>
      <div class="card">
        <div class="card-tag">How it works</div>
        <p>
          The MIAW application is designed to be as honest as the program itself: you talk with the AI
          that powers MIAW's teaching methodology. It will ask you about your practice, your goals,
          and your relationship with AI tools — and then give you a genuine sense of whether the program
          is right for you.
        </p>
        <p>
          No lengthy forms. No cover letter performance. A conversation that goes both ways.
        </p>
      </div>
      <ol class="steps" aria-label="Application steps">
        <li class="step">
          <div class="step-content">
            <h3>Start the conversation at miaw.ai</h3>
            <p>Click anywhere or press any key to begin. The AI asks one question at a time.</p>
          </div>
        </li>
        <li class="step">
          <div class="step-content">
            <h3>Share your background and goals</h3>
            <p>Tell the AI about your practice — whether you come from AEC or from software/AI development.</p>
          </div>
        </li>
        <li class="step">
          <div class="step-content">
            <h3>Receive an honest assessment</h3>
            <p>After 8 turns, the AI gives a candid view of whether MIAW fits your profile.</p>
          </div>
        </li>
        <li class="step">
          <div class="step-content">
            <h3>Join the waitlist for founder pricing</h3>
            <p>Submit your email to secure early applicant status and access to the €4,000–€8,000 founder pricing range.</p>
          </div>
        </li>
      </ol>
    </section>

    <section aria-labelledby="apply-who">
      <h2 id="apply-who">Who Should Apply</h2>
      <div style="display:grid;gap:1rem;grid-template-columns:1fr 1fr;">
        <div class="card">
          <h3>AEC professionals</h3>
          <p>Architects, engineers, interior designers, landscape designers, urban planners — anyone with professional practice experience who is serious about integrating AI.</p>
        </div>
        <div class="card">
          <h3>AI engineers &amp; developers</h3>
          <p>Software developers, ML engineers, data scientists who want to apply their skills to physical world problems — buildings, cities, construction, spatial systems.</p>
        </div>
      </div>
      <p style="margin-top:1rem;">
        You need one of the two backgrounds above. MIAW bridges them — you do not need both.
        Basic Python is strongly recommended.
      </p>
    </section>

    <section aria-labelledby="apply-timeline">
      <h2 id="apply-timeline">Timeline &amp; Pricing</h2>
      <div class="card">
        <h3>First cohort</h3>
        <p><strong>Q4 2026</strong> — Applications open prior to launch. Join the waitlist or start the conversation to be notified.</p>
        <h3>Cohort size</h3>
        <p>Maximum 30 participants per cohort. Small by design — to preserve mentorship quality and cohort depth.</p>
        <h3>Pricing</h3>
        <p>Pricing is being finalised. Range being considered: <strong>€4,000–€8,000 total</strong>, with payment plans. Early applicants receive founder pricing.</p>
        <h3>Certificate</h3>
        <p>A certificate of completion from MIAW, with project portfolio as primary evidence of learning.</p>
      </div>
    </section>

    <section aria-labelledby="apply-faq" itemscope itemtype="https://schema.org/FAQPage">
      <h2 id="apply-faq">Admissions FAQ</h2>
      ${faqHtml}
    </section>

    <div class="cta-block">
      <h2>Start your application</h2>
      <p>
        The best way to apply is to have the conversation. Ask anything — about the curriculum,
        prerequisites, the application process, or whether MIAW is right for your practice.
      </p>
      <a href="/" class="btn">Begin the conversation →</a>
    </div>

    <div class="related-pages">
      <h2>Explore further</h2>
      <div class="related-links">
        <a href="/about" class="related-link">→ About the program</a>
        <a href="/curriculum" class="related-link">→ Full Curriculum</a>
        <a href="/" class="related-link">→ Talk with MIAW AI</a>
      </div>
    </div>
`;

  return pageShell({
    title: "Apply — MIAW Master In Intelligent Artificial Worlds",
    description:
      "Apply to MIAW: the postgraduate program for architects and AI engineers who want to master spatial AI. First cohort Q4 2026. Founder pricing for early applicants. No forms — start with a conversation.",
    canonical: `${CANONICAL_BASE}/apply`,
    ogTitle: "Apply to MIAW — First Cohort Q4 2026 · Founder Pricing Available",
    jsonLdBlocks: [
      JSON.stringify(webPageSchema, null, 2),
      JSON.stringify(howToSchema, null, 2),
      JSON.stringify(faqSchema, null, 2),
    ],
    navCurrent: "apply",
    content,
    breadcrumbItems: [{ name: "Apply", url: `${CANONICAL_BASE}/apply` }],
  });
}

// ---------------------------------------------------------------------------
// Sitemap generator (with image extension)
// ---------------------------------------------------------------------------

function generateSitemap(): string {
  const urls = [
    { loc: CANONICAL_BASE, changefreq: "weekly", priority: "1.0" },
    { loc: `${CANONICAL_BASE}/about`, changefreq: "monthly", priority: "0.9" },
    { loc: `${CANONICAL_BASE}/curriculum`, changefreq: "monthly", priority: "0.9" },
    { loc: `${CANONICAL_BASE}/apply`, changefreq: "weekly", priority: "0.8" },
  ];

  const urlEntries = urls
    .map(
      u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${u.loc}"/>
    <image:image>
      <image:loc>${CANONICAL_BASE}/og.png</image:loc>
      <image:title>MIAW — Master In Intelligent Artificial Worlds</image:title>
      <image:caption>Postgraduate program for architects and AI engineers</image:caption>
    </image:image>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

// ---------------------------------------------------------------------------
// robots.txt generator
// ---------------------------------------------------------------------------

function generateRobotsTxt(): string {
  return `# robots.txt for miaw.ai
# Generated by scripts/src/seo-inject.ts on ${BUILD_DATE}

User-agent: *
Allow: /
Allow: /about
Allow: /curriculum
Allow: /curriculum/
Allow: /topics/
Allow: /faq
Allow: /apply
Allow: /sitemap.xml
Allow: /og.png
Allow: /favicon.svg
Disallow: /api/
Disallow: /.well-known/
Disallow: /src/
Crawl-delay: 2

# AI training crawlers — disallow to preserve content integrity
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

Sitemap: ${CANONICAL_BASE}/sitemap.xml
`;
}

// ---------------------------------------------------------------------------
// security.txt generator
// ---------------------------------------------------------------------------

function generateSecurityTxt(): string {
  // Expires 1 year from build date
  const expiresDate = new Date();
  expiresDate.setFullYear(expiresDate.getFullYear() + 1);
  const expires = expiresDate.toISOString();

  return `# security.txt for miaw.ai
# https://securitytxt.org/

Contact: mailto:security@miaw.ai
Expires: ${expires}
Preferred-Languages: en
Canonical: ${CANONICAL_BASE}/.well-known/security.txt
Policy: ${CANONICAL_BASE}/.well-known/security.txt
`;
}

// ---------------------------------------------------------------------------
// SEO layer for index.html (hidden from users, readable by crawlers)
// ---------------------------------------------------------------------------

function generateSeoLayer(modules: Module[], faqItems: FaqItem[]): string {
  const moduleList = modules
    .map(
      m =>
        `<article>
        <h3>Module ${m.id}: ${m.title}${m.subtitle ? ` — ${m.subtitle}` : ""}</h3>
        <p>${m.body.split("\n\n")[0] ?? ""}</p>
        ${m.deliverable ? `<p><strong>Deliverable:</strong> ${m.deliverable}</p>` : ""}
      </article>`,
    )
    .join("\n      ");

  const faqList = faqItems
    .map(
      f =>
        `<div>
        <h4>${f.question}</h4>
        <p>${f.answer}</p>
      </div>`,
    )
    .join("\n      ");

  return `<div id="seo-layer" aria-hidden="true" style="display:none;visibility:hidden;position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">
    <!--
      SEO content layer — visible to search engine crawlers, hidden from users.
      This is not cloaking: the content here matches exactly what the AI discusses.
      Technique: CSS display:none hides from visual rendering but search crawlers read it.
      Google's documentation confirms this is acceptable when content is consistent.
      Generated by scripts/src/seo-inject.ts on ${BUILD_DATE}.
    -->
    <main>
      <h1>MIAW — Master In Intelligent Artificial Worlds</h1>
      <p>A worldwide postgraduate program at the intersection of AI world models and architectural practice. 18 weeks, 9 modules (F0–F8), real projects from week 1. First cohort Q4 2026. For architects, engineers, designers, and AI/software developers who want to master spatial AI.</p>

      <section>
        <h2>Program Overview</h2>
        <p>MIAW is for architects, software developers, solution architects, designers, engineers, platform architects, technical architects, interior designers, and landscape designers who want to integrate AI into every phase of their design process. It is not a course about AI tools — it is a program about how architectural practice changes when AI is integrated in every phase, from site analysis to documentation, from concept to fabrication.</p>
        <p>Duration: 18 weeks at 8–10 hours per week. Compatible with active professional practice. Language: English. Format: Online-first, project-based, real deliverables from week 1. Cohort size: maximum 30 participants. First cohort targeting Q4 2026.</p>
      </section>

      <section>
        <h2>Curriculum — Nine Modules (F0–F8)</h2>
        ${moduleList}
      </section>

      <section>
        <h2>Key Technologies Taught</h2>
        <p>Gaussian Splatting for 3D scene reconstruction. Large Language Models for design reasoning and documentation. MCP (Model Context Protocol) for connecting AI to AEC tools, files, and databases. Parametric design with AI assistance using Rhino and Grasshopper. Building simulation pipelines with AI-generated interpretation. BIM documentation automation using LLMs. PyTorch and HuggingFace for custom model fine-tuning. Robotic fabrication with AI integration. Computer vision for site monitoring. Graph neural networks for structural analysis. Diffusion models for generative design.</p>
      </section>

      <section>
        <h2>Who Is MIAW For?</h2>
        <p>You need either: professional experience in AEC (architecture, engineering, construction) with curiosity about AI, or a software and AI background with interest in physical world applications. You do not need both — MIAW bridges the two domains.</p>
        <p>Basic Python is strongly recommended. The program teaches what is needed, but arriving with Python fundamentals allows focus on the domain rather than syntax.</p>
        <p>AEC professionals: architects, structural engineers, interior designers, landscape architects, urban planners, BIM managers, construction managers, MEP engineers. AI/software professionals: machine learning engineers, software architects, data scientists, computer vision engineers, robotics engineers with interest in spatial systems.</p>
      </section>

      <section>
        <h2>Why AI in Architecture and Construction Now</h2>
        <p>The Architecture, Engineering, and Construction sector is undergoing its largest transformation since the introduction of CAD. AI world models — systems that build internal representations of physical environments — enable automated code compliance checking, generative structural optimization, construction site monitoring, predictive building maintenance, and autonomous design iteration at scale.</p>
        <p>The gap: thousands of architects want to build AI tools. Thousands of AI engineers want to work on physical systems. Almost no one has both. MIAW closes that gap.</p>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        ${faqList}
      </section>

      <section>
        <h2>Apply to MIAW</h2>
        <p>Applications for the first cohort open ahead of the Q4 2026 launch. Early applicants receive founder pricing. Range being considered: €4,000–€8,000 total with payment plans available. A certificate of completion is awarded, with project portfolio as primary evidence of learning.</p>
        <p>The application process is a conversation, not a form. Navigate to miaw.ai and talk with the AI. It will ask about your practice, your goals, and your AI experience — and give you a genuine sense of fit.</p>
        <p>Related pages: <a href="/about">About MIAW</a>, <a href="/curriculum">Full Curriculum (9 Modules)</a>, <a href="/apply">How to Apply</a>.</p>
      </section>
    </main>
  </div>`;
}

// ---------------------------------------------------------------------------
// index.html injection
// ---------------------------------------------------------------------------

const SEO_INJECT_START = "<!-- SEO_INJECT_START -->";
const SEO_INJECT_END = "<!-- SEO_INJECT_END -->";

function injectIntoIndexHtml(seoLayer: string): void {
  let html = readFileSync(INDEX_HTML_PATH, "utf-8");

  if (html.includes(SEO_INJECT_START) && html.includes(SEO_INJECT_END)) {
    const startIdx = html.indexOf(SEO_INJECT_START) + SEO_INJECT_START.length;
    const endIdx = html.indexOf(SEO_INJECT_END);
    html = html.slice(0, startIdx) + "\n    " + seoLayer + "\n    " + html.slice(endIdx);
  } else {
    const marker = `${SEO_INJECT_START}\n    ${seoLayer}\n    ${SEO_INJECT_END}`;
    html = html.replace("</body>", `  ${marker}\n  </body>`);
  }

  writeFileSync(INDEX_HTML_PATH, html, "utf-8");
  console.log(`✓ SEO layer injected → ${INDEX_HTML_PATH}`);
}

// ---------------------------------------------------------------------------
// Web App Manifest (PWA)
// ---------------------------------------------------------------------------

function generateManifest(): string {
  const manifest = {
    name: "MIAW — Master In Intelligent Artificial Worlds",
    short_name: "MIAW",
    description: "Postgraduate program for architects and AI engineers — AI meets spatial design.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d1a",
    theme_color: "#8e72d5",
    lang: "en",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
      { src: "/og.png", sizes: "1200x630", type: "image/png" },
    ],
    categories: ["education", "productivity"],
    related_applications: [],
    prefer_related_applications: false,
  };
  return JSON.stringify(manifest, null, 2);
}

// ---------------------------------------------------------------------------
// File writing utilities
// ---------------------------------------------------------------------------

function writePublicFile(relativePath: string, content: string): void {
  const fullPath = join(PUBLIC_DIR, relativePath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
  console.log(`✓ Written → ${fullPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("🔍 SEO Inject — reading knowledge base…");

  const currMd = readKnowledge("curriculum.md");
  const faqMd = readKnowledge("faq.md");

  const modules = extractModules(currMd);
  const faqItems = extractFaqItems(faqMd);

  if (modules.length === 0) {
    throw new Error("No modules extracted from curriculum.md — check parsing logic.");
  }
  if (faqItems.length === 0) {
    throw new Error("No FAQ items extracted from faq.md — check parsing logic.");
  }

  console.log(`  → ${modules.length} modules, ${faqItems.length} FAQ items extracted`);

  // 1. Generate static HTML pages
  console.log("\n📄 Generating static HTML pages…");
  writePublicFile("about/index.html", generateAboutPage());
  writePublicFile("curriculum/index.html", generateCurriculumPage(modules));
  writePublicFile("apply/index.html", generateApplyPage(faqItems));

  // 2. Generate sitemap.xml
  console.log("\n🗺  Generating sitemap.xml…");
  writePublicFile("sitemap.xml", generateSitemap());

  // 3. Generate robots.txt
  console.log("\n🤖 Generating robots.txt…");
  writePublicFile("robots.txt", generateRobotsTxt());

  // 4. Generate security.txt
  console.log("\n🔒 Generating .well-known/security.txt…");
  writePublicFile(".well-known/security.txt", generateSecurityTxt());

  // 5. Generate manifest.json (PWA)
  console.log("\n📱 Generating manifest.json…");
  writePublicFile("manifest.json", generateManifest());

  // 6. Inject SEO layer into index.html
  console.log("\n💉 Injecting SEO layer into index.html…");
  const seoLayer = generateSeoLayer(modules, faqItems);
  injectIntoIndexHtml(seoLayer);

  console.log("\n✅ SEO inject complete.");
  console.log(`   → ${modules.length} modules · ${faqItems.length} FAQ items · 3 pages · sitemap · robots.txt · security.txt · manifest.json`);
}

main();
