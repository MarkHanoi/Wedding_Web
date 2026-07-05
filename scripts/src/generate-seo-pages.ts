/**
 * generate-seo-pages.ts
 *
 * P3-A: Full SSR Shadow Layer — Entity-Based SEO
 *
 * Generates deep entity pages for MIAW:
 *   public/curriculum/f0/index.html  →  /curriculum/f0
 *   public/curriculum/f1/index.html  →  /curriculum/f1
 *   …
 *   public/curriculum/f8/index.html  →  /curriculum/f8
 *   public/topics/gaussian-splatting/index.html
 *   public/topics/bim-ai/index.html
 *   public/topics/parametric-design-ai/index.html
 *   public/topics/spatial-ai/index.html
 *   public/topics/digital-twins/index.html
 *   public/faq/index.html
 *
 * Also extends public/sitemap.xml with all new page URLs.
 *
 * Run via:
 *   pnpm --filter @workspace/scripts run generate-seo-pages
 *
 * Must run AFTER seo-inject.ts (which generates the sitemap base layer).
 * Called automatically from `pnpm run build`.
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, "../..");
const KNOWLEDGE_DIR = join(REPO_ROOT, "artifacts/api-server/knowledge");
const PUBLIC_DIR = join(REPO_ROOT, "artifacts/miaw/public");

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
// Module parser (same logic as seo-inject.ts)
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
// FAQ parser (same logic as seo-inject.ts)
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
// Faculty parser
// ---------------------------------------------------------------------------

interface FacultyMember {
  name: string;
  slug: string;
  role: string;
  affiliation: string;
  location: string;
  expertise: string[];
  modules: string[];
  bio: string;
  publications: string[];
}

function extractFacultyMembers(md: string): FacultyMember[] {
  const members: FacultyMember[] = [];
  // Split on ## section headers — each faculty profile starts with ## Name
  const sections = md.split(/\n## /);

  for (const section of sections) {
    const lines = section.split("\n");
    const name = (lines[0] ?? "").trim();
    if (!name) continue;

    // Only process sections that contain a slug: field (individual profiles)
    if (!lines.some(l => /^slug:\s+\S/.test(l))) continue;

    const fields: Record<string, string> = {};
    const bioLines: string[] = [];
    const publicationLines: string[] = [];
    let mode: "fields" | "bio" | "publications" = "fields";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i] ?? "";
      const trimmedLine = line.trim();

      // Sub-section header — switch mode based on content
      if (/^### /.test(trimmedLine)) {
        mode = /publication|project|work/i.test(trimmedLine) ? "publications" : "bio";
        continue;
      }

      if (mode === "fields") {
        const fieldMatch = trimmedLine.match(/^([a-z]+):\s*(.+)/);
        if (fieldMatch) {
          fields[fieldMatch[1]!] = fieldMatch[2]!.trim();
          continue;
        }
        // First blank line after metadata block → switch to bio
        if (trimmedLine === "" && Object.keys(fields).length > 0) {
          mode = "bio";
          continue;
        }
        // Non-blank non-field line while still in field mode → bio start
        if (trimmedLine !== "" && Object.keys(fields).length > 0) {
          mode = "bio";
          bioLines.push(line);
        }
        continue;
      }

      if (mode === "publications") {
        if (trimmedLine.startsWith("- ")) publicationLines.push(trimmedLine.slice(2).trim());
        continue;
      }

      // mode === "bio": collect all lines (including blank paragraph separators)
      bioLines.push(line);
    }

    const slug =
      fields["slug"] ??
      name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|ms\.)\s+/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    members.push({
      name,
      slug,
      role: fields["role"] ?? "",
      affiliation: fields["affiliation"] ?? "",
      location: fields["location"] ?? "",
      expertise: (fields["expertise"] ?? "").split(",").map(s => s.trim()).filter(Boolean),
      modules: (fields["modules"] ?? "").split(",").map(s => s.trim()).filter(Boolean),
      bio: bioLines.join("\n").trim(),
      publications: publicationLines,
    });
  }

  return members;
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
// Paragraph splitter — converts double-newline body text into <p> tags
// ---------------------------------------------------------------------------

function bodyToParagraphs(body: string): string {
  return body
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${esc(p.trim().replace(/\n/g, " "))}</p>`)
    .join("\n      ");
}

// ---------------------------------------------------------------------------
// Shared CSS (mirrors seo-inject.ts SHARED_CSS)
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

  .skip-link {
    position: absolute; top: -40px; left: 0;
    background: var(--blue); color: #fff;
    padding: 8px 16px; z-index: 100;
    text-decoration: none; font-size: 0.9rem;
  }
  .skip-link:focus { top: 0; }

  header {
    position: sticky; top: 0; z-index: 10;
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
    font-weight: 900; font-size: 1.4rem;
    color: #fff; text-decoration: none;
    letter-spacing: 3px; flex-shrink: 0;
  }
  .logo:hover { color: var(--light-blue); }
  nav ul { list-style: none; display: flex; gap: 1.5rem; flex-wrap: wrap; }
  nav a {
    color: var(--text-muted); text-decoration: none;
    font-size: 0.875rem; font-weight: 400;
    letter-spacing: 0.03em; transition: color 0.2s;
  }
  nav a:hover, nav a[aria-current="page"] { color: var(--text); }
  nav .cta-nav {
    margin-left: auto;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    color: #fff !important;
    padding: 0.45rem 1.1rem; border-radius: 6px;
    font-weight: 500; white-space: nowrap;
  }
  nav .cta-nav:hover { opacity: 0.88; }

  main { max-width: var(--max-w); margin: 0 auto; padding: 3rem 1.5rem 5rem; }

  .breadcrumb {
    font-size: 0.8rem; color: var(--text-muted);
    margin-bottom: 2rem;
    display: flex; gap: 0.4rem;
    align-items: center; flex-wrap: wrap;
  }
  .breadcrumb a { color: var(--text-muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--text); }
  .breadcrumb-sep { opacity: 0.5; }

  .module-badge {
    display: inline-block;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--purple); background: rgba(142,114,213,0.15);
    border: 1px solid rgba(142,114,213,0.3);
    border-radius: 4px; padding: 0.2rem 0.6rem;
    margin-bottom: 0.75rem;
  }
  .topic-badge {
    display: inline-block;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(90,120,232,0.2);
    color: var(--light-blue);
    border: 1px solid rgba(122,178,248,0.25);
    border-radius: 4px; padding: 0.2rem 0.55rem;
    margin-bottom: 0.75rem;
  }

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
    font-size: 1.1rem; color: var(--text-muted);
    margin-bottom: 3rem; font-weight: 300;
  }

  h2 {
    font-size: 1.25rem; font-weight: 500;
    color: var(--text); margin: 2.5rem 0 0.75rem;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 0.78rem; font-weight: 500;
    color: var(--light-blue); margin: 1.5rem 0 0.4rem;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  p { margin-bottom: 1rem; color: var(--text-muted); }
  p:last-child { margin-bottom: 0; }
  em { color: var(--text); font-style: italic; }
  strong { color: var(--text); font-weight: 500; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 1.5rem;
    margin-bottom: 1.25rem;
  }
  .card h2 { margin-top: 0; }

  .deliverable {
    margin-top: 1.5rem; padding: 1rem 1.25rem;
    background: rgba(122,178,248,0.08);
    border-left: 3px solid var(--light-blue);
    border-radius: 0 8px 8px 0; font-size: 0.875rem;
    color: var(--text-muted);
  }
  .deliverable strong { color: var(--light-blue); font-weight: 500; }

  .module-nav {
    display: flex; gap: 1rem; flex-wrap: wrap;
    margin-top: 2.5rem;
    justify-content: space-between;
  }
  .module-nav-link {
    flex: 1; min-width: 160px;
    display: flex; flex-direction: column; gap: 0.2rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 1rem 1.25rem;
    text-decoration: none; transition: border-color 0.2s;
  }
  .module-nav-link:hover { border-color: rgba(122,178,248,0.4); }
  .module-nav-link.next { text-align: right; }
  .module-nav-dir {
    font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-muted);
  }
  .module-nav-title { font-size: 0.9rem; color: var(--text); font-weight: 400; }

  .faq-item { margin-bottom: 1.5rem; }
  .faq-q {
    font-weight: 500; color: var(--text);
    margin-bottom: 0.3rem; font-size: 1rem;
  }
  .faq-a { color: var(--text-muted); font-size: 0.95rem; }

  .tag-list {
    display: flex; gap: 0.5rem; flex-wrap: wrap;
    margin: 1rem 0;
  }
  .tag {
    font-size: 0.75rem; font-weight: 500;
    color: var(--text-muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 0.25rem 0.7rem;
  }

  .cta-block {
    margin-top: 3rem; padding: 2rem;
    background: linear-gradient(135deg, rgba(90,120,232,0.18), rgba(224,80,168,0.12));
    border: 1px solid rgba(90,120,232,0.3);
    border-radius: 12px; text-align: center;
  }
  .cta-block h2 { margin-top: 0; font-size: 1.4rem; }
  .cta-block p { margin-bottom: 1.25rem; }
  .btn {
    display: inline-block;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    color: #fff; text-decoration: none;
    padding: 0.85rem 2rem; border-radius: 8px;
    font-weight: 500; font-size: 1rem;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .related-pages {
    margin-top: 2.5rem; padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  .related-pages h2 { margin-top: 0; font-size: 1rem; color: var(--text-muted); }
  .related-links {
    display: flex; gap: 0.75rem; flex-wrap: wrap;
    margin-top: 0.75rem;
  }
  .related-link {
    display: inline-flex; align-items: center; gap: 0.35rem;
    color: var(--light-blue); text-decoration: none;
    font-size: 0.875rem; padding: 0.4rem 0.8rem;
    background: rgba(122,178,248,0.08);
    border: 1px solid rgba(122,178,248,0.2);
    border-radius: 6px; transition: background 0.2s;
  }
  .related-link:hover { background: rgba(122,178,248,0.15); }

  footer {
    border-top: 1px solid var(--border);
    padding: 2rem 1.5rem;
    max-width: var(--max-w); margin: 0 auto;
    display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap;
    gap: 1rem; font-size: 0.85rem; color: var(--text-muted);
  }
  footer nav ul { gap: 1rem; list-style: none; display: flex; }
  footer a { color: var(--text-muted); text-decoration: none; }
  footer a:hover { color: var(--text); }

  @media (max-width: 600px) {
    nav { flex-wrap: wrap; }
    nav .cta-nav { margin-left: 0; }
    .module-nav { flex-direction: column; }
    footer { flex-direction: column; align-items: flex-start; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }

  /* ---------------------------------------------------------------- faculty */

  .faculty-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem; margin-top: 2rem;
  }

  .faculty-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 1.75rem;
    display: flex; flex-direction: column; gap: 1rem;
  }

  .faculty-card-header { display: flex; gap: 1rem; align-items: flex-start; }

  .faculty-avatar {
    width: 64px; height: 64px; flex-shrink: 0; border-radius: 50%;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35rem; font-weight: 500; color: #fff; letter-spacing: 0.02em;
  }

  .faculty-card-meta { display: flex; flex-direction: column; gap: 0.2rem; }

  .faculty-badge {
    display: inline-block; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--pink); background: rgba(224,80,168,0.12);
    border: 1px solid rgba(224,80,168,0.25);
    border-radius: 4px; padding: 0.15rem 0.55rem; margin-bottom: 0.25rem;
  }

  .faculty-name { font-size: 1.05rem; font-weight: 500; color: var(--text); margin: 0; }
  .faculty-role { font-size: 0.8rem; color: var(--light-blue); font-weight: 400; margin: 0; }
  .faculty-affiliation { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
  .faculty-meta-item { font-size: 0.85rem; color: var(--text-muted); }
  .meta-sep { color: var(--text-muted); }

  .module-list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }

  .module-link {
    font-size: 0.72rem; font-weight: 600;
    color: var(--purple); background: rgba(142,114,213,0.15);
    border: 1px solid rgba(142,114,213,0.3);
    border-radius: 4px; padding: 0.2rem 0.55rem;
    text-decoration: none; transition: background 0.2s; white-space: nowrap;
  }
  .module-link:hover { background: rgba(142,114,213,0.28); }

  .faculty-profile-header {
    display: flex; gap: 2rem; align-items: flex-start;
    margin-bottom: 2.5rem; flex-wrap: wrap;
  }

  .faculty-avatar-lg {
    width: 96px; height: 96px; flex-shrink: 0; border-radius: 50%;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; font-weight: 400; color: #fff; letter-spacing: 0.02em;
  }

  .faculty-meta { display: flex; flex-direction: column; gap: 0.35rem; }

  .publications-list { list-style: none; padding: 0; margin-top: 0.5rem; }
  .publications-list li {
    padding: 0.65rem 0; border-bottom: 1px solid var(--border);
    color: var(--text-muted); font-size: 0.9rem;
  }
  .publications-list li:last-child { border-bottom: none; }

  @media (max-width: 600px) {
    .faculty-profile-header { flex-direction: column; }
    .faculty-avatar-lg { width: 72px; height: 72px; font-size: 1.4rem; }
  }
`.trim();

// ---------------------------------------------------------------------------
// Async font loading snippet
// ---------------------------------------------------------------------------

const FONT_HTML = `
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
// WebSite JSON-LD (included on every page)
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
  jsonLdBlocks: string[];
  navCurrent: "about" | "curriculum" | "apply" | "faculty" | "";
  content: string;
  breadcrumbItems: Array<{ name: string; url: string }>;
  /** Optional extra <head> elements — e.g. <link rel="prev/next"> for series pagination */
  headExtra?: string;
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
  headExtra,
}: PageShellOptions): string {
  const navLinks = [
    { href: "/about", label: "About", id: "about" },
    { href: "/curriculum", label: "Curriculum", id: "curriculum" },
    { href: "/faculty", label: "Faculty", id: "faculty" },
    { href: "/apply", label: "Apply", id: "apply" },
  ] as const;

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

  const breadcrumbHtml = `
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <a href="/">MIAW</a>
      ${breadcrumbItems.map(item =>
        `<span class="breadcrumb-sep" aria-hidden="true">›</span><a href="${item.url}">${esc(item.name)}</a>`
      ).join("")}
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
  <link rel="canonical" href="${canonical}" />

  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonical}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta name="application-name" content="${SITE_NAME}" />
  <meta property="og:image" content="${CANONICAL_BASE}/og.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="MIAW — Master In Intelligent Artificial Worlds" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${TWITTER_HANDLE}" />
  <meta name="twitter:creator" content="${TWITTER_HANDLE}" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${CANONICAL_BASE}/og.png" />
  <meta name="twitter:image:alt" content="MIAW — Master In Intelligent Artificial Worlds" />

  <meta name="theme-color" content="#8e72d5" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preload" as="image" href="/og.png" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />${headExtra ? `\n  ${headExtra}` : ""}

  ${FONT_HTML}

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
          .map(({ href, label, id }) =>
            `<li><a href="${href}"${id === navCurrent ? ' aria-current="page"' : ""}>${label}</a></li>`
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
// Module → topic relationship map
// ---------------------------------------------------------------------------

const MODULE_TOPICS: Record<string, string[]> = {
  F0: ["spatial-ai", "mcp-aec", "computational-design", "llm-aec"],
  F1: ["spatial-ai", "ai-territory-analysis", "computational-design"],
  F2: ["gaussian-splatting", "digital-twins", "neural-rendering"],
  F3: ["parametric-design-ai", "generative-ai-architecture", "computational-design"],
  F4: ["spatial-ai", "digital-twins", "building-simulation-ai"],
  F5: ["neural-rendering", "generative-ai-architecture"],
  F6: ["bim-ai", "digital-twins", "llm-aec"],
  F7: ["digital-twins", "parametric-design-ai", "robotic-fabrication-ai"],
  F8: ["spatial-ai", "parametric-design-ai", "mcp-aec", "aec-ai"],
};

const TOPIC_LABELS: Record<string, string> = {
  "spatial-ai": "Spatial AI",
  "gaussian-splatting": "Gaussian Splatting",
  "bim-ai": "BIM + AI",
  "parametric-design-ai": "Parametric Design + AI",
  "digital-twins": "Digital Twins",
  "mcp-aec": "Model Context Protocol",
  "ai-territory-analysis": "AI Site Analysis",
  "robotic-fabrication-ai": "Robotic Fabrication",
  "building-simulation-ai": "Building Simulation + AI",
  "aec-ai": "AI in AEC",
  "neural-rendering": "Neural Rendering",
  "world-models": "World Models",
  "computational-design": "Computational Design",
  "llm-aec": "LLMs in Architecture",
  "generative-ai-architecture": "Generative AI Design",
};

// ---------------------------------------------------------------------------
// Module detail page generator
// ---------------------------------------------------------------------------

function generateModulePage(
  module: Module,
  allModules: Module[],
): string {
  const idx = allModules.findIndex(m => m.id === module.id);
  const prev = idx > 0 ? allModules[idx - 1] : null;
  const next = idx < allModules.length - 1 ? allModules[idx + 1] : null;
  const slug = module.id.toLowerCase();
  const canonical = `${CANONICAL_BASE}/curriculum/${slug}`;
  const topics = MODULE_TOPICS[module.id] ?? [];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${canonical}#course`,
    name: `MIAW ${module.id} — ${module.title}${module.subtitle ? ` (${module.subtitle})` : ""}`,
    description: module.body.split("\n\n")[0]?.trim() ?? module.body.slice(0, 200),
    url: canonical,
    provider: { "@id": ORG_ID },
    isPartOf: { "@id": COURSE_ID },
    position: idx,
    timeRequired: "PT20H",
    inLanguage: "en",
    educationalLevel: "Postgraduate",
    teaches: module.deliverable || undefined,
  };

  const paragraphs = bodyToParagraphs(module.body);

  const topicLinks = topics
    .map(t => `<a href="/topics/${t}" class="related-link">→ ${TOPIC_LABELS[t] ?? t}</a>`)
    .join("\n        ");

  const modulePrevNext = `
    <nav class="module-nav" aria-label="Module navigation">
      ${prev
        ? `<a href="/curriculum/${prev.id.toLowerCase()}" class="module-nav-link prev">
          <span class="module-nav-dir">← Previous</span>
          <span class="module-nav-title">${esc(prev.id)}: ${esc(prev.title)}</span>
        </a>`
        : `<span></span>`}
      ${next
        ? `<a href="/curriculum/${next.id.toLowerCase()}" class="module-nav-link next">
          <span class="module-nav-dir">Next →</span>
          <span class="module-nav-title">${esc(next.id)}: ${esc(next.title)}</span>
        </a>`
        : `<a href="/apply" class="module-nav-link next">
          <span class="module-nav-dir">Ready?</span>
          <span class="module-nav-title">Apply to MIAW →</span>
        </a>`}
    </nav>`;

  const content = `
    <div class="module-badge">Module ${esc(module.id)} of 9</div>
    <h1 class="page-title">${esc(module.title)}</h1>
    <p class="page-subtitle">${esc(module.subtitle || "MIAW — Master In Intelligent Artificial Worlds")}</p>

    <article>
      ${paragraphs}

      ${module.deliverable ? `
      <div class="deliverable">
        <strong>Deliverable ${esc(module.id)}:</strong> ${esc(module.deliverable)}
      </div>` : ""}
    </article>

    ${modulePrevNext}

    ${topics.length > 0 ? `
    <section aria-label="Related technologies">
      <h2>Key Technologies</h2>
      <div class="related-links">
        ${topicLinks}
      </div>
    </section>` : ""}

    <div class="cta-block">
      <h2>Learn this in MIAW</h2>
      <p>This module is part of the 18-week postgraduate program. Work with your own real project from week 1. First cohort Q4 2026.</p>
      <a href="/" class="btn">Talk to MIAW AI →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Explore More</h2>
      <div class="related-links">
        <a href="/curriculum" class="related-link">← All 9 Modules</a>
        <a href="/about" class="related-link">→ About the Program</a>
        <a href="/apply" class="related-link">→ Apply</a>
        <a href="/faq" class="related-link">→ FAQ</a>
      </div>
    </section>`;

  const prevNextLinks = [
    ...(prev ? [`<link rel="prev" href="${CANONICAL_BASE}/curriculum/${prev.id.toLowerCase()}" />`] : []),
    ...(next ? [`<link rel="next" href="${CANONICAL_BASE}/curriculum/${next.id.toLowerCase()}" />`] : []),
  ].join("\n  ");

  return pageShell({
    title: `Module ${module.id} — ${module.title} | MIAW`,
    description: `${module.title}: ${module.body.split("\n\n")[0]?.slice(0, 160) ?? ""}. Part of the MIAW postgraduate program for architects and AI engineers.`,
    canonical,
    ogTitle: `MIAW ${module.id} — ${module.title}${module.subtitle ? ` (${module.subtitle})` : ""}`,
    jsonLdBlocks: [JSON.stringify(courseSchema, null, 2)],
    navCurrent: "curriculum",
    content,
    headExtra: prevNextLinks || undefined,
    breadcrumbItems: [
      { name: "Curriculum", url: `${CANONICAL_BASE}/curriculum` },
      { name: `${module.id}: ${module.title}`, url: canonical },
    ],
  });
}

// ---------------------------------------------------------------------------
// Topic / concept pages
// ---------------------------------------------------------------------------

interface TopicPage {
  slug: string;
  title: string;
  pageTitle: string;
  description: string;
  badge: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  relatedModules: string[];
  relatedTopics: string[];
  technologies: string[];
}

const TOPICS: TopicPage[] = [
  {
    slug: "spatial-ai",
    title: "Spatial AI",
    pageTitle: "Spatial AI — Intelligence for the Physical World",
    description: "Spatial AI systems understand and reason about 3D space, physical structures, and the built environment. The discipline at the core of MIAW — bridging AI engineering with architectural practice.",
    badge: "Core Concept",
    intro: "Spatial AI refers to artificial intelligence systems that perceive, understand, and reason about three-dimensional physical environments. Unlike language models that operate purely in text, or image classifiers that operate on 2D pixels, spatial AI systems build internal representations of space — understanding geometry, material properties, structural relationships, and how things change over time.",
    sections: [
      {
        heading: "What Makes AI Spatial?",
        body: "Spatial AI systems reason about the physical world as a structured environment — not as a flat image or a stream of tokens. They understand that a wall has two faces, a structural column transmits load, a window admits light at particular angles at particular times of year. This spatial reasoning capacity is what separates world models from general-purpose language models.\n\nKey capabilities include 3D scene reconstruction from sensor data, geometric reasoning about space and structure, temporal reasoning about how environments change, and cross-modal understanding that connects visual perception, physical simulation, and natural language.",
      },
      {
        heading: "Applications in Architecture, Engineering, and Construction",
        body: "For AEC professionals, Spatial AI unlocks capabilities that were previously either impossible or required deep specialist expertise:\n\nSite analysis: AI systems that query public geospatial databases, process terrain and urban fabric, and generate interpretive reports about a site's constraints and opportunities. Design synthesis: generative systems that propose structural and spatial configurations evaluated against multiple criteria — natural light, area, structural efficiency, cost. Construction monitoring: computer vision systems that track site progress, identify safety conditions, and compare built reality against design intent. Predictive maintenance: systems that monitor building performance over time and anticipate failure before it occurs.",
      },
      {
        heading: "World Models and the AEC Opportunity",
        body: "A world model is an AI system that builds a structured internal representation of a physical environment — understanding not just what something looks like, but how it behaves, what forces act on it, and what happens when conditions change. In AEC, world models are the enabling technology for true digital twins: AI-connected models that reflect the state of actual buildings and sites in near-real-time.\n\nThe AEC sector has been slow to adopt AI because data is fragmented across projects, tools are siloed, and there are few practitioners with both domain expertise and AI engineering capability. MIAW closes that gap.",
      },
      {
        heading: "MIAW and Spatial AI",
        body: "Spatial AI is not one module in MIAW — it is the organizing principle of the entire program. Every module (F0 through F8) works a different phase of the design process through the lens of spatial intelligence: reading territory (F1), capturing physical space (F2), generating spatial designs (F3), simulating building behavior (F4), communicating spatial intent (F5), documenting spatial information (F6), fabricating spatial components (F7), and integrating it all into a coherent professional practice (F8).",
      },
    ],
    relatedModules: ["f0", "f1", "f4", "f5", "f8"],
    relatedTopics: ["gaussian-splatting", "digital-twins", "parametric-design-ai"],
    technologies: ["World Models", "3D Reconstruction", "Computer Vision", "Neural Radiance Fields", "Gaussian Splatting", "Spatial Reasoning", "LiDAR", "Photogrammetry"],
  },
  {
    slug: "gaussian-splatting",
    title: "Gaussian Splatting",
    pageTitle: "Gaussian Splatting in Architecture and Construction",
    description: "Gaussian Splatting enables photorealistic 3D reconstruction from photos and video — without the intensive post-processing of traditional photogrammetry. How MIAW integrates it into the AEC design workflow.",
    badge: "3D Reconstruction",
    intro: "Gaussian Splatting (3D Gaussian Splatting, or 3DGS) is a technique for reconstructing photorealistic 3D scenes from a collection of photographs or video frames. Unlike traditional photogrammetry, which produces dense point clouds requiring extensive cleanup, or NeRF (Neural Radiance Fields), which is computationally expensive to render, Gaussian Splatting produces real-time-renderable 3D scenes that can be directly integrated into design workflows.",
    sections: [
      {
        heading: "How Gaussian Splatting Works",
        body: "The technique represents a 3D scene as a collection of millions of tiny 3D Gaussian distributions — each one an ellipsoid with a position, orientation, size, opacity, and color. By optimizing these Gaussians to reproduce the input photographs from their respective camera positions, the system learns a compact and accurate representation of the scene that can be rendered from any viewpoint at real-time frame rates.\n\nFor practical use in AEC: capture 100–500 overlapping photographs of a space or building, run the optimization (minutes to hours depending on scene complexity and hardware), and receive a fully navigable 3D model with photorealistic appearance — no manual point cloud cleaning, no mesh reconstruction, no UV unwrapping.",
      },
      {
        heading: "Applications for Architects and Engineers",
        body: "The primary AEC application is as-built capture: documenting existing conditions of a site, building, or construction phase without traditional photogrammetry workflows. An architect can capture a heritage building interior, a construction site at a specific phase, or an urban context, and integrate the result directly into their design software as a spatial reference.\n\nSecond application: the Gaussian Splatting representation preserves photometric accuracy — it records how light actually behaves in the captured space. This makes it valuable as a reference for material and lighting decisions in later design phases.\n\nThird: for client communication. A Gaussian Splatting capture of a site, embedded in a real-time viewer or exported as video, provides spatial intuition about a place that no plan or section can convey.",
      },
      {
        heading: "Gaussian Splatting vs. Traditional Photogrammetry",
        body: "Traditional photogrammetry pipelines (Reality Capture, Metashape, Pix4D) produce triangle meshes and texture maps — formats that design software already understands, but at the cost of hours of post-processing to clean artifacts, fill holes, and correct geometry. Gaussian Splatting skips the mesh entirely and produces a representation that is more photorealistic but less geometrically clean.\n\nFor AEC use cases that require precise measurements — structural surveys, BIM as-built documentation — photogrammetry or laser scanning remains the appropriate tool. For spatial context, client communication, and early design reference, Gaussian Splatting is significantly faster and more photorealistic.",
      },
      {
        heading: "MIAW Module F2 — Modeling with AI",
        body: "Gaussian Splatting is covered in MIAW Module F2 alongside language-assisted geometric modeling. The deliverable: a 3D capture model of a real space integrated in the student's design environment, produced without intensive post-processing, alongside a natural language-assisted modeling exercise applied to an element of the student's actual project.",
      },
    ],
    relatedModules: ["f2"],
    relatedTopics: ["spatial-ai", "digital-twins"],
    technologies: ["3D Gaussian Splatting", "Neural Radiance Fields (NeRF)", "Real-time Rendering", "Photogrammetry", "Structure from Motion", "COLMAP", "Point Cloud Processing"],
  },
  {
    slug: "bim-ai",
    title: "AI in BIM Workflows",
    pageTitle: "AI in BIM Workflows — Documentation, Compliance, and Design Intelligence",
    description: "How large language models and computer vision are transforming Building Information Modeling — from automated documentation to conversational queries directly to the building model.",
    badge: "BIM + AI",
    intro: "Building Information Modeling (BIM) is the shared data environment of the modern AEC project: a structured, 3D digital representation of a building that contains not just geometry but material properties, system relationships, cost data, and construction schedules. AI is now transforming what that model can do — not by changing the model format, but by adding a layer of intelligence that connects the model's structured data to natural language, automated analysis, and generated documentation.",
    sections: [
      {
        heading: "What AI Changes in BIM Workflows",
        body: "The traditional BIM workflow is human-intensive at the documentation stage: specifications written manually from the model, regulatory compliance checked line by line, quantities extracted by the estimating team, reports produced from scratch for each design phase. AI changes all of these:\n\nAutomated specifications: an LLM reads the model's material and system data and generates preliminary technical specifications for each building system, formatted to the project's standard.\n\nRegulatory compliance: an AI system cross-references the model's spatial data against applicable building codes and flags potential violations — catching problems months before permit submission.\n\nQuantity extraction: structured queries against the model's element database, processed through an AI layer that adds interpretive context and formatting for cost estimation.\n\nConversational queries: instead of navigating complex BIM software, the architect or client asks questions in natural language — 'what is the total glazed area facing southwest?' or 'which structural elements are within 3 meters of the property boundary?' — and the AI answers from the model data.",
      },
      {
        heading: "BIM as a Knowledge System",
        body: "The most powerful shift AI enables in BIM is treating the model as a knowledge base — a structured document about a building that can be queried, summarized, and cross-referenced. As a language model's context window expands and tool-calling capabilities improve, an architect can connect Claude or GPT-4 directly to their Revit API, enabling a conversational interface to the entire building model.\n\nThis changes who can access the BIM model's intelligence. A project manager who has never opened Revit can ask: 'What are the critical path items that depend on the structural steel delivery?' A contractor can ask: 'Show me all MEP elements in Zone B that require coordination before framing.' The model becomes legible to the entire project team.",
      },
      {
        heading: "The Limits of AI in BIM",
        body: "AI does not replace the BIM coordinator. It automates the mechanical parts of BIM work — repetitive documentation, structured queries, pattern-matching against regulations — while the architect's judgment remains essential for design decisions, coordination with stakeholders, and the interpretation of ambiguous requirements that no AI system can resolve from model data alone.\n\nThe risk is uncritical dependency: treating AI-generated specifications as final without review, or accepting regulatory compliance outputs without checking the model data they were based on. MIAW teaches BIM + AI as a critical practice — understanding both what the AI can do and where human verification is essential.",
      },
    ],
    relatedModules: ["f6"],
    relatedTopics: ["parametric-design-ai", "digital-twins"],
    technologies: ["Revit API", "IFC", "OpenBIM", "LLMs for AEC", "Natural Language to BIM", "Automated Specifications", "Regulatory AI", "BIM Coordination"],
  },
  {
    slug: "parametric-design-ai",
    title: "Parametric Design + AI",
    pageTitle: "Parametric Design with AI — Generative Architecture for Every Practice",
    description: "AI makes parametric design accessible beyond visual programming specialists. Describe the system you need in natural language; AI generates, tests, and documents the implementation in Grasshopper or Python.",
    badge: "Generative Design",
    intro: "Parametric design is the practice of defining a design as a system of relationships and constraints — rather than as a fixed form — so that the design can adapt, vary, and respond to changing requirements without starting over. Until recently, parametric design required mastery of visual programming environments like Grasshopper or Dynamo, limiting it to a small subset of the architectural profession. AI changes that equation.",
    sections: [
      {
        heading: "How AI Democratizes Parametric Design",
        body: "A current-generation large language model — given sufficient context about the problem and the target environment — can generate working Grasshopper scripts, Python-for-Rhino code, or Dynamo definitions from a natural language description. An architect who has never written a line of code can describe what they need:\n\n'A facade panel system that varies its depth based on the solar exposure of each panel, with maximum depth at south-facing panels, minimum at north-facing, and a smooth gradient between them. Panels should be 600mm wide with a 20mm joint. Export as individual breps ready for CNC.'\n\nThe AI generates a working implementation, the architect reviews the output, and the dialogue continues — refining, testing, adjusting — until the result matches the design intent. The architect's expertise shifts from visual programming syntax to design judgment and AI communication.",
      },
      {
        heading: "Generative Design with Multiple Criteria",
        body: "Beyond scripting individual parametric systems, AI enables multi-criteria generative design: defining a set of objectives (natural light, floor area, structural regularity, construction cost) and exploring a space of design alternatives that are evaluated systematically against all criteria simultaneously.\n\nThe result is not one 'optimal' design — there is no single optimum when criteria trade off against each other — but a Pareto front of alternatives, each representing a different balance between competing objectives. The architect's role is to navigate that space of options with design judgment that goes beyond what the optimization criteria can capture.",
      },
      {
        heading: "Building Reusable Parametric Libraries",
        body: "One of the most valuable long-term outcomes of AI-assisted parametric design is the accumulation of a practice's own library of parametric components — documented, tested, and co-generated with AI. A structural connection detail that works for a range of geometries. A facade panel system parameterized for different materials. A stair component that handles any floor-to-floor height within code.\n\nThese components are the intellectual capital of the practice. AI accelerates their creation and documentation. Over time, the library becomes a competitive advantage — a set of solved problems that can be redeployed on any project.",
      },
      {
        heading: "MIAW Module F3 — Design with AI",
        body: "Parametric design with AI is the focus of MIAW Module F3. The module covers: natural language-to-code parametric systems in Grasshopper and Python, generative design with multi-criteria evaluation, and building a library of co-generated parametric components. The deliverable is a parametric system co-developed with AI for a real element of the student's actual project, with generative exploration of alternatives and a comparative metrics synthesis.",
      },
    ],
    relatedModules: ["f3", "f7"],
    relatedTopics: ["spatial-ai", "bim-ai"],
    technologies: ["Grasshopper", "Rhino 3D", "Python for Rhino", "Dynamo", "Generative Design", "Multi-Criteria Optimization", "Parametric Components", "Claude Code", "LLM-to-Code"],
  },
  {
    slug: "digital-twins",
    title: "Digital Twins",
    pageTitle: "Digital Twins in Architecture and Construction — AI-Connected Building Models",
    description: "A digital twin is a living AI-connected model of a physical building or site that reflects real-world state in near-real-time. How architects and engineers build and operate true digital twins.",
    badge: "Digital Infrastructure",
    intro: "A digital twin is more than a 3D model of a building — it is a living, AI-connected representation that continuously reflects the state of the physical building or site it represents. The model receives data from sensors, cameras, and building management systems; the AI layer interprets that data, detects anomalies, predicts failures, and answers questions about the building's current state and future behavior.",
    sections: [
      {
        heading: "Digital Twin vs. BIM: What Is the Difference?",
        body: "A BIM model represents design intent at a point in time — the building as designed, not necessarily as built, and not as it operates. A digital twin is a different category: it represents the building as it is right now, and it changes as the building changes.\n\nThe connection is bidirectional: sensors in the physical building feed data into the digital model; analysis in the digital model informs decisions about the physical building. This feedback loop is what makes a digital twin useful for operations — not just as a construction document, but as an ongoing management tool for the built asset's entire lifecycle.",
      },
      {
        heading: "AI Enables True Digital Twins",
        body: "Without AI, a digital twin is just an expensive sensor dashboard — data accumulates but insight requires manual interpretation. AI changes what the twin can do:\n\nAnomaly detection: identifying abnormal patterns in energy consumption, structural movement, or HVAC performance before they become failures. Predictive maintenance: forecasting when systems will require service based on performance degradation curves. Construction progress monitoring: computer vision systems that compare photographic evidence of site progress against the construction schedule. Occupancy optimization: systems that adjust building systems (lighting, HVAC, access) based on real-time and predicted occupancy patterns.",
      },
      {
        heading: "Building a Digital Twin: The Technical Stack",
        body: "A practical digital twin for a building or site requires several layers: a 3D geometric representation (typically BIM-derived), a sensor data ingestion layer (IoT devices, building management systems, cameras), a data processing pipeline that normalizes and contextualizes the incoming data, and an AI reasoning layer that interprets the data and generates insights.\n\nFor construction sites, Gaussian Splatting captures and periodic photographic documentation are increasingly used as the primary update mechanism — cheaper and higher-information than full sensor instrumentation, and directly comparable against the design model.",
      },
      {
        heading: "MIAW Module F7 — Fabrication and Digital Twins",
        body: "MIAW Module F7 works the design-to-fabrication pipeline — how parametric systems, robotic fabrication, and AI integration combine to produce physical components from digital designs. The digital twin concept runs through this module: the fabricated component, like the building itself, is part of a larger system where digital and physical are in constant dialogue. The deliverable includes machining and assembly simulation with AI integration and documentation of the design-fabrication process.",
      },
    ],
    relatedModules: ["f2", "f6", "f7"],
    relatedTopics: ["spatial-ai", "bim-ai", "gaussian-splatting"],
    technologies: ["IoT Sensors", "Building Management Systems", "Computer Vision", "Predictive Analytics", "Gaussian Splatting", "BIM Integration", "SCADA", "Edge Computing", "Azure Digital Twins", "Revit API"],
  },
  // ── New topics (P3-A expansion) ───────────────────────────────────────────
  {
    slug: "mcp-aec",
    title: "Model Context Protocol",
    pageTitle: "Model Context Protocol for Architecture — Connecting AI to AEC Tools",
    description: "Model Context Protocol (MCP) is the open standard that lets language models communicate with external tools, files, and databases. How MIAW uses MCP to connect AI directly to design software, BIM models, and geospatial data.",
    badge: "AI Integration",
    intro: "Model Context Protocol (MCP) is an open protocol published by Anthropic in 2024 that standardizes how large language models communicate with external tools, services, and data sources. Before MCP, integrating an AI assistant with design software required custom, one-off API wrappers that broke with every software update. MCP changes this: it defines a universal interface that any AI model and any tool can implement once and use everywhere.",
    sections: [
      {
        heading: "What MCP Does in Practice",
        body: "MCP servers expose \"tools\" — named operations that an AI model can call with typed parameters and receive structured responses from. An MCP server for Rhino3D might expose tools like `get_geometry(object_id)`, `create_surface(control_points)`, or `run_grasshopper_definition(file_path, inputs)`. The AI model calls these tools during a conversation or task, integrating design software interaction into the same context window where it is reasoning about the design problem.\n\nFor architects and engineers, this means describing a problem in natural language and having the AI operate your design software to explore or implement solutions — without writing custom automation code for every workflow.",
      },
      {
        heading: "MCP Servers for AEC",
        body: "The AEC sector is building MCP server implementations for the tools that architects and engineers use daily. Current and emerging implementations cover: Rhino and Grasshopper (geometry operations, parametric definition execution), Revit (BIM element queries, family creation, documentation extraction), AutoCAD (drawing operations, layer management), geospatial databases (OpenStreetMap, land registry APIs, terrain data), simulation engines (EnergyPlus, structural FEM solvers), and file formats (IFC parsing, PDF extraction from specifications).\n\nOnce a tool has an MCP server, any AI model that supports the protocol can use it — the integration cost drops from weeks of custom engineering to hours of configuration.",
      },
      {
        heading: "Building Your Own MCP Server",
        body: "MCP servers are lightweight — a minimal implementation is 50–100 lines of Python or TypeScript. The server declares its tools with typed schemas, implements handler functions for each tool, and exposes them via the MCP transport (standard I/O or HTTP). Claude Code, the AI development environment used extensively in MIAW, ships with MCP client support built in — meaning you can connect your own MCP server to Claude Code and immediately use it within any Claude conversation.\n\nFor a practice building its first MCP server, the highest-value target is usually the tool they use most: a Grasshopper MCP server that can run parametric definitions from natural language, or a BIM MCP server that answers questions about the active project.",
      },
      {
        heading: "MIAW Module F0 — Foundations",
        body: "MCP is introduced in MIAW Module F0 as part of the foundational working environment: Claude Code + basic MCP + Git repository. From F0, every subsequent module can optionally leverage MCP connections to the student's design tools. By F8, students build their own MCP servers as part of their adaptive AI ecosystem — connecting the AI infrastructure they have built across all nine modules into a coherent professional practice.",
      },
    ],
    relatedModules: ["f0", "f6", "f8"],
    relatedTopics: ["spatial-ai", "bim-ai", "llm-aec", "computational-design"],
    technologies: ["Model Context Protocol", "Claude Code", "MCP Servers", "Rhino MCP", "Revit API", "Grasshopper Automation", "TypeScript", "Python", "JSON-RPC", "Tool Calling"],
  },
  {
    slug: "ai-territory-analysis",
    title: "AI-Driven Site Analysis",
    pageTitle: "AI-Driven Site and Territory Analysis for Architects",
    description: "How AI automates the reading and analysis of sites, urban context, terrain, regulations, and geospatial data — producing interpretive reports and 3D context models from public APIs in minutes.",
    badge: "Site Intelligence",
    intro: "Before any design decision, an architect must read the place: understanding the site's physical constraints, urban context, regulatory framework, and latent opportunities. This territorial intelligence — traditionally gathered over days of research — can now be automated. AI systems query public geospatial APIs, process terrain and urban data, and generate interpretive site analysis reports in minutes.",
    sections: [
      {
        heading: "What AI-Driven Territory Analysis Covers",
        body: "A complete AI-driven site analysis pipeline integrates several data streams: terrain and topography from SRTM or regional elevation models; urban fabric from OpenStreetMap, Overture Maps, or national cadastral APIs; sun exposure and solar radiation from climate data services; regulatory constraints from building permit databases and zoning APIs; and surrounding building context from 3D city models (CityGML, 3D BAG, or equivalent). The AI layer processes all of these, identifies patterns and constraints, and generates a narrative interpretive report — what the place affords, what it prohibits, and what opportunities the analysis reveals.",
      },
      {
        heading: "From Data to 3D Context Model",
        body: "The pipeline produces not just a report but geometry: terrain surfaces, building volumes, and urban context in a format directly importable into the architect's design environment. Rhino, Grasshopper, and Blender all have Python APIs that accept geometry from external pipelines. The 3D context model becomes the base on which design begins — already calibrated to the actual place, without manual reconstruction from aerial photographs and cadastral maps.\n\nFor urban projects, this step alone eliminates 2–3 days of preparatory work per site. For residential projects, the terrain model and solar analysis that previously required surveying are generated automatically.",
      },
      {
        heading: "Regulatory Intelligence",
        body: "Planning regulations — floor area ratios, height limits, setback requirements, use restrictions — are typically read manually from PDF documents and cross-referenced with site measurements. AI makes this systematic: a language model reads the applicable regulations, extracts the constraints as structured parameters, and validates the design geometry against them automatically. This regulatory AI layer catches compliance issues before permit submission, not after.\n\nThe same approach applies to environmental regulations, heritage protection zones, and infrastructure easements — constraints that architects must know but that are distributed across dozens of public documents.",
      },
      {
        heading: "MIAW Module F1 — Territory with AI",
        body: "AI-driven site analysis is the core subject of MIAW Module F1. Students build an automated territorial analysis pipeline applied to their own real project site, producing an AI-generated interpretive report and a 3D context model integrated in their design environment. The pipeline becomes a reusable asset — applicable to any future site with minimal reconfiguration.",
      },
    ],
    relatedModules: ["f1", "f4"],
    relatedTopics: ["spatial-ai", "computational-design", "digital-twins"],
    technologies: ["OpenStreetMap API", "Overture Maps", "SRTM Elevation Data", "Copernicus", "EnergyPlus Climate", "CityGML", "Python GeoPandas", "Shapely", "Rhino3D", "LLM Analysis"],
  },
  {
    slug: "robotic-fabrication-ai",
    title: "Robotic Fabrication with AI",
    pageTitle: "Robotic Fabrication with AI — From Parametric Design to Physical Components",
    description: "How AI integrates into the robotic fabrication pipeline — from parametric design of fabrication-aware components through tool path generation, assembly simulation, and construction monitoring.",
    badge: "Digital Fabrication",
    intro: "Robotic fabrication — the use of industrial robots and CNC machines to produce architectural components — has been practiced in research and high-end construction for two decades. AI changes what that practice can do: not by replacing the robot, but by integrating intelligence into every step of the pipeline from design to physical output.",
    sections: [
      {
        heading: "Fabrication-Aware Design",
        body: "The central insight of AI-integrated robotic fabrication is that design and fabrication are no longer sequential phases. The AI layer understands both the design intent and the fabrication constraints — tool reach envelope, material behavior, joint tolerances, assembly sequence — and holds them simultaneously during design generation. A parametric facade panel system designed with AI can be optimized for aesthetic variation at the design level and for minimal material waste and maximum CNC throughput at the fabrication level, without these goals being traded off sequentially.\n\nFor architects without a robotics background, this means accessing fabrication intelligence through natural language: describing a component, specifying the production constraints, and receiving a design that is buildable from the start.",
      },
      {
        heading: "Tool Path Generation and Simulation",
        body: "Generating a robot tool path from a parametric model — the sequence of robot positions and end-effector orientations that will produce the desired geometry — has traditionally required specialist software (Grasshopper HAL, KUKA prc, RoboDK) and deep robotics knowledge. AI assistants trained on fabrication workflows can generate HAL/RAPID code from design geometry descriptions, flag collisions and unreachable configurations, and simulate the fabrication sequence before any physical material is committed.\n\nFor one-off components or small batches — typical of architectural work — this dramatically reduces the engineering overhead of robotic fabrication.",
      },
      {
        heading: "Construction Monitoring with Computer Vision",
        body: "Beyond the fabrication phase, AI-integrated construction monitoring uses computer vision to verify that fabricated components have been correctly assembled on site. Cameras at key positions compare photographic evidence of the assembled state against the digital model, flagging deviations that require correction before the next phase of construction proceeds. This closes the loop between digital design and physical reality — making the construction process itself AI-connected.",
      },
      {
        heading: "MIAW Module F7 — Fabrication with AI",
        body: "Robotic fabrication with AI is the focus of MIAW Module F7. Students develop a parametric detail or system oriented to advanced fabrication, execute machining and assembly simulation with AI integration, and document the design-fabrication process and decision analysis. The module works the transition from digital model to physical component when AI is an active part of that transition — not as a tool course in robotics, but as a design practice that integrates fabrication intelligence from the first sketch.",
      },
    ],
    relatedModules: ["f7", "f3"],
    relatedTopics: ["parametric-design-ai", "digital-twins", "computational-design"],
    technologies: ["Grasshopper HAL", "KUKA prc", "RoboDK", "ABB RobotStudio", "Computer Vision", "Python for Robotics", "CNC Toolpath Generation", "Parametric Fabrication", "G-Code", "Assembly Simulation"],
  },
  {
    slug: "building-simulation-ai",
    title: "Building Simulation with AI",
    pageTitle: "Building Simulation with AI — Energy, Structure, Daylight, and Acoustics",
    description: "How AI transforms building performance simulation from a specialist's tool into a design-integrated workflow — automated simulation pipelines connected to the parametric model, with AI-generated interpretation and design recommendations.",
    badge: "Performance Design",
    intro: "Building performance simulation — energy consumption, structural behavior, daylighting, thermal comfort, acoustics — generates data that should inform every significant design decision. In practice, it typically happens too late and too rarely: as a compliance check at permit stage rather than an exploratory tool during design. AI changes this by connecting simulation engines directly to the parametric model and automating the interpretation of results.",
    sections: [
      {
        heading: "The Simulation Gap in Architectural Practice",
        body: "The barrier to simulation is not the simulation engines — EnergyPlus, Radiance, OpenFOAM, and SAP2000 are powerful and free. The barrier is the workflow: manually preparing the geometry, configuring the simulation parameters, running the solver, and interpreting numerical output requires specialist knowledge that most architects do not have and cannot justify acquiring for each project phase.\n\nAI dissolves this barrier in two directions: upstream (automated geometry preparation and parameter configuration from natural language) and downstream (AI interpretation of simulation results as design recommendations rather than tables of numbers).",
      },
      {
        heading: "Energy Simulation Integrated into Design",
        body: "An AI-connected energy simulation pipeline receives the current design geometry from the parametric model, configures an EnergyPlus or similar model with the climate data and building use profile, runs the simulation, and returns results as narrative interpretation: 'The current south facade glazing ratio produces a 23% overheating risk in summer. Reducing glazing to 40% with external shading improves thermal comfort significantly while maintaining the design's transparency intent. The following three alternatives balance comfort, energy performance, and light quality differently — here is the comparison.'\n\nThe architect responds to a design recommendation, not to a CSV file of hourly energy loads.",
      },
      {
        heading: "Structural and Acoustic Simulation",
        body: "The same pipeline pattern applies across simulation domains: connect geometry to solver, run simulation, interpret results as design feedback. For structural analysis, AI can prepare a schematic FEM model from the conceptual design, identify overstressed members, and suggest geometric modifications that improve structural efficiency without departing from the design intent. For daylighting, AI interprets annual Useful Daylight Illuminance maps and recommends window positioning changes. For acoustics, AI reads reverberation time predictions and suggests material or geometry modifications.\n\nThe key is that simulation becomes a conversation rather than a specialist report — integrated into the design process rather than delivered as a periodic external review.",
      },
      {
        heading: "MIAW Module F4 — Simulation with AI",
        body: "Building simulation with AI is the subject of MIAW Module F4. Students build a simulation pipeline applied to at least two relevant performance domains for their own project — typically one bioclimatic and one structural or acoustic. The deliverable is an AI-generated results report with design recommendations, produced directly from the project geometry. The pipeline is reusable: configured once, it can re-simulate the project at any design stage with minimal additional work.",
      },
    ],
    relatedModules: ["f4", "f1"],
    relatedTopics: ["digital-twins", "spatial-ai", "computational-design"],
    technologies: ["EnergyPlus", "Radiance", "OpenFOAM", "SAP2000", "Ladybug Tools", "Grasshopper", "Python Simulation Wrappers", "FEM Analysis", "Climate APIs", "LLM Result Interpretation"],
  },
  {
    slug: "aec-ai",
    title: "AI in Architecture, Engineering and Construction",
    pageTitle: "Artificial Intelligence in AEC — The Complete Overview",
    description: "AI is transforming every phase of the architecture, engineering, and construction sector — from site analysis and generative design through automated documentation, construction monitoring, and building operations. The landscape in 2026.",
    badge: "Sector Overview",
    intro: "The Architecture, Engineering, and Construction sector is undergoing a transformation driven by artificial intelligence that rivals the introduction of CAD in the 1980s. Unlike previous software waves — CAD, BIM, parametric design — AI does not primarily change how architects draw or model. It changes what architects can know, generate, evaluate, and automate at every phase of a project's life.",
    sections: [
      {
        heading: "AI Across the AEC Value Chain",
        body: "The application of AI in AEC spans the full project lifecycle:\n\nPre-design: automated site analysis, regulatory constraint extraction, precedent analysis, brief optimization.\n\nDesign: generative design systems, multi-criteria optimization, natural language parametric scripting, AI-augmented visualization.\n\nEngineering: structural optimization, MEP coordination, code compliance checking, clash detection with natural language queries.\n\nDocumentation: automated specification generation, BIM-to-report pipelines, regulatory submission support, meeting minute synthesis.\n\nConstruction: progress monitoring with computer vision, quantity tracking, safety condition detection, supply chain AI.\n\nOperations: predictive maintenance, energy optimization, occupancy management, end-of-life scenario analysis.",
      },
      {
        heading: "The Skills Gap and Why It Matters",
        body: "The AEC sector has a unique talent problem: the professionals who understand building — architects, structural engineers, MEP engineers, contractors — largely do not have AI engineering skills. The engineers who can build AI systems — machine learning engineers, software architects, computer vision researchers — largely do not understand how buildings work, what AEC projects require, or how design decisions are actually made.\n\nThis gap means that most AI applications in AEC are either too generic (a general chatbot applied to architecture) or too narrow (a specialist tool that solves one sub-problem). The professionals who can bridge both domains — who understand spatial reasoning, design process, and structural behavior AND can build, train, and deploy AI systems — are extraordinarily rare and disproportionately valuable.",
      },
      {
        heading: "Current Limitations and Honest Assessment",
        body: "AI in AEC is not a solved problem. Current limitations that practitioners must understand: AI design systems lack genuine spatial intuition — they optimize within defined parameter spaces but do not understand why a space feels right. AI documentation systems require careful validation — specifications and compliance reports generated by language models must be reviewed by qualified professionals before submission. AI simulation interpretation can miss domain-specific nuances that an experienced engineer would catch.\n\nThe honest framing: AI in AEC in 2026 is a powerful accelerator for human expertise, not a replacement for it. The practices that will benefit most are those where skilled AEC professionals learn to use AI as a lever on their own judgment — not those that try to automate professional judgment itself.",
      },
      {
        heading: "What MIAW Teaches",
        body: "MIAW is built on a specific thesis about AI in AEC: the most valuable skill is not knowing how to use AI tools, but understanding how the design process changes when AI is integrated at every phase. Nine modules, each focused on a phase of the process (territory, modeling, design, simulation, communication, documentation, fabrication, integration) teach how AI changes what is possible, what is worth automating, and what remains the architect's judgment. The result is not tool literacy but process intelligence.",
      },
    ],
    relatedModules: ["f0", "f1", "f8"],
    relatedTopics: ["spatial-ai", "bim-ai", "digital-twins", "computational-design", "llm-aec"],
    technologies: ["Large Language Models", "Computer Vision", "Generative AI", "Building Information Modeling", "Parametric Design", "Gaussian Splatting", "Robotic Fabrication", "MCP", "Python", "PyTorch"],
  },
  {
    slug: "neural-rendering",
    title: "Neural Rendering",
    pageTitle: "Neural Rendering for Architectural Visualization",
    description: "Neural rendering technologies — Gaussian Splatting, NeRF, diffusion-based image synthesis — are transforming how architects produce and communicate spatial images. From photorealistic site captures to AI-augmented renders, the new visualization pipeline.",
    badge: "Visualization",
    intro: "Neural rendering refers to a family of techniques that use neural networks to generate, reconstruct, or augment visual representations of three-dimensional space. For architectural visualization, neural rendering has produced three practically useful capabilities: real-time photorealistic 3D scene reconstruction (Gaussian Splatting), view synthesis from sparse images (NeRF), and AI-augmented image and video generation from geometric control signals (ControlNet, diffusion models).",
    sections: [
      {
        heading: "The Three Levels of Neural Rendering in Architecture",
        body: "MIAW Module F5 works three levels of neural rendering in architectural communication:\n\nLevel 1 — Concept visualization without geometry: AI generates images of spaces from text descriptions and sketch inputs. Useful at the earliest design stage for communicating atmosphere and intent to clients before committing to a form.\n\nLevel 2 — Geometry-controlled generation: the parametric model provides geometry as a control signal; AI adds materials, lighting, atmosphere, and photorealism without manual texturing or lighting setup. The architect maintains control over spatial configuration while AI handles visual production.\n\nLevel 3 — Production-quality renders with AI enhancement: an existing rendering pipeline (V-Ray, Enscape, D5) is augmented with AI upscaling, detail enhancement, and post-production — producing outputs at quality levels that previously required specialist render farms.",
      },
      {
        heading: "Gaussian Splatting as Scene Reconstruction",
        body: "Gaussian Splatting (covered in depth in /topics/gaussian-splatting) is the dominant neural rendering technique for as-built scene reconstruction. For visualization purposes, it offers something unique: a photometric reconstruction of how light actually behaves in a captured space. When an architect needs to understand the quality of light in a heritage building for a renovation, or document the spatial character of a site for a competition, Gaussian Splatting provides a navigable, photorealistic record that no photograph series can match.",
      },
      {
        heading: "Diffusion Models for Design Communication",
        body: "Diffusion models — the technology behind Midjourney, Stable Diffusion, and Adobe Firefly — are the most accessible entry point into AI-augmented architectural visualization. Given a sketch, floor plan, or 3D model geometry as input (via ControlNet or similar guidance), they generate photorealistic images of the designed space in seconds.\n\nThe professional challenge is maintaining visual consistency across a project: AI-generated images can easily drift between different aesthetic registers across a set of views. Techniques for controlling consistency — character embedding, style locking, multi-view ControlNet — are active areas of development and are taught in MIAW's F5 module as professional workflow skills.",
      },
    ],
    relatedModules: ["f2", "f5"],
    relatedTopics: ["gaussian-splatting", "spatial-ai", "generative-ai-architecture"],
    technologies: ["Gaussian Splatting", "NeRF", "Stable Diffusion", "ControlNet", "Midjourney API", "ComfyUI", "Enscape", "V-Ray", "Real-time Rendering", "DLSS", "Video Diffusion"],
  },
  {
    slug: "world-models",
    title: "World Models",
    pageTitle: "World Models for the Built Environment — AI Systems That Understand Space",
    description: "World models are AI systems that build internal representations of physical environments — understanding not just how they look but how they behave, what forces act on them, and what happens when conditions change. The enabling technology for true spatial AI.",
    badge: "Foundation AI",
    intro: "A world model is an AI system that builds a structured internal representation of a physical environment — understanding not just its appearance but its physical behavior, structural relationships, and how it responds to changing conditions. World models are the AI substrate that makes possible true spatial intelligence: systems that can reason about buildings, cities, and physical spaces the way an experienced architect or engineer would.",
    sections: [
      {
        heading: "What Makes a Model a World Model",
        body: "The distinction between a world model and a pattern-matching system is the capacity for physical reasoning. A system trained to recognize windows in photographs is not a world model — it learns statistical associations but has no representation of what a window is: that it admits light, that it has structural implications, that its size relates to energy performance and ventilation. A world model, in contrast, builds representations where these physical relationships are encoded and available for reasoning.\n\nIn practice, current AI systems exist on a spectrum: large language models have substantial implicit world knowledge from training text; vision-language models extend this to visual scenes; physics-informed neural networks add explicit physical simulation. The frontier is systems that combine all three — language, vision, and physical simulation — into coherent reasoning about the built environment.",
      },
      {
        heading: "World Models and AEC",
        body: "For AEC, world models enable the most ambitious applications of AI: automated code compliance checking that understands why regulations exist and can reason about edge cases; generative structural systems that optimize topology under real physical constraints rather than surrogate metrics; construction site monitoring that understands the three-dimensional state of the site and can reason about sequence and safety; energy performance prediction that models how a building will actually behave in use, not just in idealized simulation.\n\nThese applications are partially available today through combinations of specialized AI tools. Full world model reasoning — where a single system holds all of these capacities in an integrated representation — remains a research frontier. MIAW teaches at the productive edge: what is available now, what is emerging, and how to build practices that can adopt new capabilities as they mature.",
      },
      {
        heading: "Foundation Models for Architecture",
        body: "Foundation models — large pre-trained neural networks that can be fine-tuned for specific tasks — are the current practical vehicle for world model capabilities in AEC. A foundation model pre-trained on diverse architectural data (drawings, models, specifications, photographs) can be fine-tuned on a practice's own project data to develop domain-specific intelligence: recognizing the practice's design vocabulary, understanding its structural preferences, learning the regulatory environment it operates in.\n\nMIAW Module F8 works the construction of practice-specific AI ecosystems that leverage foundation model capabilities — not by training models from scratch, but by configuring, fine-tuning, and composing existing models with domain knowledge.",
      },
    ],
    relatedModules: ["f0", "f4", "f8"],
    relatedTopics: ["spatial-ai", "digital-twins", "aec-ai", "bim-ai"],
    technologies: ["Foundation Models", "Physics-Informed Neural Networks", "Vision-Language Models", "GPT-4o", "Claude 3.5", "Fine-tuning", "RAG Systems", "Semantic 3D Representations", "IFC Ontologies", "Knowledge Graphs"],
  },
  {
    slug: "computational-design",
    title: "Computational Design",
    pageTitle: "Computational Design — AI Expands What Is Possible",
    description: "Computational design uses algorithms, parametric systems, and data to explore and generate architectural forms. AI is the most significant expansion of computational design capabilities since Grasshopper — making generative systems accessible to every architect.",
    badge: "Design Method",
    intro: "Computational design — the practice of using algorithms, mathematical relationships, and data to drive architectural form and spatial organization — has been part of advanced architectural practice since the 1960s. AI is the most significant expansion of computational design capabilities in a generation: it makes algorithmic design accessible to practitioners without programming skills, enables multi-criteria optimization at previously impossible scale, and introduces learning-based generative systems that go beyond rule-following into genuine novelty.",
    sections: [
      {
        heading: "The History and Current State",
        body: "Computational design has evolved through several generations: early algorithmic experiments in the 1960s–70s; CAD's formalization of geometric computation in the 1980s; parametric modeling with Catia and early Rhino in the 1990s; visual programming with Grasshopper in the 2000s; and now AI-augmented computation in the 2020s. Each transition has expanded who can access computational design tools and what those tools can do.\n\nThe AI transition is distinctive: previous tools required learning a new computational syntax (Grasshopper components, Python syntax). AI allows working in natural language — describing the computational system you need, and receiving an implementation that can be reviewed, modified, and extended. The computational expertise shifts from syntax mastery to design judgment.",
      },
      {
        heading: "Multi-Criteria Optimization",
        body: "The most analytically powerful application of AI in computational design is multi-criteria optimization: simultaneously exploring a design space against multiple competing objectives — structural efficiency, energy performance, material use, natural light, construction cost — and producing a set of Pareto-optimal alternatives that represent different trade-offs between those objectives.\n\nFor an architect, this replaces the intuitive sequential process (optimize for light, then check structure, then revise for cost) with a systematic simultaneous exploration. The result is a set of alternatives that can be compared on explicit criteria — not one 'best' answer, but an honest representation of the trade-offs available within the design constraints.",
      },
      {
        heading: "Generative AI and Design Form",
        body: "Beyond parametric systems, AI introduces a different mode of computational design: learning-based generation. Trained on large datasets of architectural precedents, geometric relationships, and spatial types, generative AI systems can propose novel spatial configurations, facade patterns, structural topologies, and material assemblies that go beyond the solution space defined by explicit parametric rules.\n\nThis generative capacity is most useful in early design phases, where the design space is largest and the most radical departures from convention are possible. By the time detailed design begins, the architect's judgment has typically narrowed the options to a few well-understood configurations — and parametric refinement, not generative exploration, is the appropriate tool.",
      },
    ],
    relatedModules: ["f0", "f3", "f7", "f8"],
    relatedTopics: ["parametric-design-ai", "generative-ai-architecture", "spatial-ai", "aec-ai"],
    technologies: ["Grasshopper", "Rhino3D", "Dynamo", "Python", "Genetic Algorithms", "Evolutionary Solvers", "Galapagos", "Wallacei", "Generative AI", "Multi-Objective Optimization"],
  },
  {
    slug: "llm-aec",
    title: "Large Language Models in Architecture",
    pageTitle: "Large Language Models in Architectural Practice — From Text to Design Intelligence",
    description: "How large language models — Claude, GPT-4, and their successors — are being integrated into architectural practice: documentation, design reasoning, code generation for parametric tools, and conversational BIM queries.",
    badge: "AI Core Technology",
    intro: "Large language models (LLMs) — AI systems trained on vast text corpora to predict and generate language — have become the most broadly applicable AI technology in architectural practice. Unlike specialized tools for specific tasks, LLMs operate through natural language, making them accessible to any architect who can describe what they need. Their applications in AEC range from the mundane (drafting specification sections, summarizing meeting minutes) to the transformative (reasoning about design alternatives, querying BIM models conversationally, generating parametric code from descriptions).",
    sections: [
      {
        heading: "LLMs as Architectural Assistants",
        body: "The most immediate application of LLMs in architectural practice is as writing assistants for the substantial documentation burden that architects carry: project descriptions, tender submissions, specification sections, regulatory submissions, client reports, meeting minutes. An LLM provided with the relevant project data — from the BIM model, from meeting notes, from the regulatory framework — can produce accurate first drafts that the architect reviews and refines, rather than writing from scratch.\n\nThis application alone — documentation assistance — can save practicing architects 30–50% of their time on certain project phases. The savings compound over a practice: documentation templates, specification libraries, and report structures developed with AI assistance become reusable assets.",
      },
      {
        heading: "LLMs for Parametric Code Generation",
        body: "The capability that most expands computational design access is LLM-based parametric code generation: describing a Grasshopper definition, a Python script for Rhino, or a Dynamo definition in natural language, and receiving working implementation code. This removes the syntax barrier that has kept parametric design a specialist skill.\n\nThe professional reality: current LLMs produce code that works 60–80% of the time for well-specified parametric problems. The architect must be able to review the code for logical errors and modify it when needed. This requires understanding what the code should do, not necessarily how to write it from scratch — a much more accessible skill level. MIAW Module F0 builds this foundational literacy explicitly.",
      },
      {
        heading: "Conversational BIM and Knowledge Retrieval",
        body: "One of the most architecturally specific applications of LLMs is conversational query to structured data: asking questions in natural language about a BIM model, a regulatory database, or a project knowledge base, and receiving answers that integrate information from multiple sources. 'What structural members in the north wing are within 2 meters of the revised floor plan boundary?' 'Which specifications sections need updating for the change from concrete to steel frame?' 'What does the building code require for the egress path through the lobby?'\n\nThese questions today require navigating complex software interfaces or searching through documents manually. With an LLM connected to the relevant data sources via MCP (Model Context Protocol) or RAG (Retrieval-Augmented Generation), they become one-step natural language queries.",
      },
    ],
    relatedModules: ["f0", "f6", "f8"],
    relatedTopics: ["bim-ai", "mcp-aec", "computational-design", "aec-ai"],
    technologies: ["Claude", "GPT-4o", "Prompt Engineering", "RAG Systems", "Tool Calling", "Fine-tuning", "Embeddings", "Vector Databases", "Context Windows", "Anthropic API"],
  },
  {
    slug: "generative-ai-architecture",
    title: "Generative AI for Architectural Design",
    pageTitle: "Generative AI for Architectural Design — From Concept to Production",
    description: "Generative AI systems — diffusion models, multimodal LLMs, and AI-driven parametric engines — are changing how architects produce design options, communicate spatial intent, and explore form across the full design process.",
    badge: "Generative Design",
    intro: "Generative AI for architecture encompasses a family of AI systems that produce new content — images, spatial configurations, parametric geometries, material specifications — from learned patterns combined with design intent. Unlike rule-following parametric systems, generative AI can propose solutions that were not explicitly programmed, drawing on patterns learned from large datasets of architectural precedent, spatial typologies, and material behavior.",
    sections: [
      {
        heading: "Image Generation for Architectural Communication",
        body: "Diffusion model-based image generation (Midjourney, Stable Diffusion, DALL-E 3) has the lowest barrier to entry of any generative AI tool in architecture — any architect who can describe a space in words can generate photorealistic images of it. The professional value is highest in early design phases: communicating spatial character and design intent to clients and collaborators before the project has a formal model, exploring atmospheric alternatives quickly, and generating visual references for internal design discussion.\n\nThe professional risk is equally clear: AI-generated images are easier to generate than to control. Managing visual consistency across a project's image set, maintaining fidelity to the actual design geometry as it develops, and avoiding the homogenizing aesthetic effect of large generative models requires deliberate technique.",
      },
      {
        heading: "Geometry-Guided Image Generation",
        body: "The step that makes generative AI useful for production-phase architectural work (not just conceptual communication) is geometric guidance: using the parametric model as a structural control signal that constrains the AI's generation to respect the designed space. ControlNet architectures allow an architect to provide depth maps, normal maps, edge renders, or floor plan silhouettes as conditioning inputs, producing photorealistic images that are geometrically faithful to the model while AI handles materials, lighting, and atmosphere.\n\nThis separates the spatial design decision (where to place walls, how to proportion volumes) from the material and atmospheric design decision (what surfaces look like, how light behaves) — allowing rapid exploration of the second without re-litigating the first.",
      },
      {
        heading: "AI-Driven Design Exploration",
        body: "Beyond image generation, AI enables systematic design exploration: given a design brief and constraints, generating and evaluating multiple spatial configurations against explicit criteria. This combines generative capacity (proposing novel configurations) with analytic capacity (evaluating them against performance objectives) in a workflow that the architect steers through design criteria rather than through direct geometric manipulation.\n\nThe professional value is in early design phases where the design space is largest: AI can explore a space of hundreds of configurations that no architect could manually generate, identify the most promising alternatives, and present them for the architect's judgment. The architect remains in control of what constitutes 'promising' — defining the criteria that shape the exploration.",
      },
      {
        heading: "MIAW Modules F3 and F5",
        body: "Generative AI for architectural design is addressed across two MIAW modules: F3 (Design with AI) covers AI-driven parametric exploration and multi-criteria generative design; F5 (Communication with AI) covers diffusion model-based image and video generation for all phases of architectural communication. Together they cover the full spectrum of generative AI applications — from design logic to spatial imagery.",
      },
    ],
    relatedModules: ["f3", "f5"],
    relatedTopics: ["parametric-design-ai", "neural-rendering", "computational-design", "spatial-ai"],
    technologies: ["Stable Diffusion", "ControlNet", "Midjourney", "DALL-E 3", "ComfyUI", "Flux", "LoRA Fine-tuning", "Video Diffusion", "Multi-Criteria Optimization", "Generative Adversarial Networks"],
  },
];

// ---------------------------------------------------------------------------
// Topic page generator
// ---------------------------------------------------------------------------

function generateTopicPage(topic: TopicPage): string {
  const canonical = `${CANONICAL_BASE}/topics/${topic.slug}`;

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonical}#term`,
    name: topic.title,
    description: topic.description,
    url: canonical,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": COURSE_ID,
      name: "MIAW Curriculum",
    },
  };

  const sections = topic.sections
    .map(s => `
      <section>
        <h2>${esc(s.heading)}</h2>
        ${bodyToParagraphs(s.body)}
      </section>`)
    .join("\n");

  const techTags = topic.technologies
    .map(t => `<span class="tag">${esc(t)}</span>`)
    .join("\n        ");

  const relatedModuleLinks = topic.relatedModules
    .map(slug => {
      const id = slug.toUpperCase();
      const label = TOPIC_LABELS[slug] ?? slug;
      return `<a href="/curriculum/${slug}" class="related-link">→ Module ${id}</a>`;
    })
    .join("\n        ");

  const relatedTopicLinks = topic.relatedTopics
    .map(t => `<a href="/topics/${t}" class="related-link">→ ${TOPIC_LABELS[t] ?? t}</a>`)
    .join("\n        ");

  const content = `
    <div class="topic-badge">${esc(topic.badge)}</div>
    <h1 class="page-title">${esc(topic.title)}</h1>
    <p class="page-subtitle">${esc(topic.description)}</p>

    <article>
      <p><em>${esc(topic.intro)}</em></p>

      ${sections}

      ${topic.technologies.length > 0 ? `
      <section aria-label="Technologies">
        <h2>Technologies and Tools</h2>
        <div class="tag-list">
          ${techTags}
        </div>
      </section>` : ""}
    </article>

    ${topic.relatedModules.length > 0 ? `
    <section aria-label="Related modules">
      <h2>MIAW Modules</h2>
      <div class="related-links">
        ${relatedModuleLinks}
      </div>
    </section>` : ""}

    <div class="cta-block">
      <h2>Master ${esc(topic.title)} in Practice</h2>
      <p>MIAW teaches ${esc(topic.title.toLowerCase())} as a professional skill — applied to your own real project from week 1. First cohort Q4 2026.</p>
      <a href="/" class="btn">Talk to MIAW AI →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Related Topics</h2>
      <div class="related-links">
        ${relatedTopicLinks}
        <a href="/curriculum" class="related-link">→ Full Curriculum</a>
        <a href="/about" class="related-link">→ About MIAW</a>
      </div>
    </section>`;

  return pageShell({
    title: `${topic.title} in Architecture — MIAW`,
    description: topic.description,
    canonical,
    ogTitle: `${topic.pageTitle} | MIAW`,
    jsonLdBlocks: [JSON.stringify(definedTermSchema, null, 2)],
    navCurrent: "curriculum",
    content,
    breadcrumbItems: [
      { name: "Topics", url: `${CANONICAL_BASE}/topics` },
      { name: topic.title, url: canonical },
    ],
  });
}

// ---------------------------------------------------------------------------
// FAQ page generator
// ---------------------------------------------------------------------------

function generateFaqPage(items: FaqItem[]): string {
  const canonical = `${CANONICAL_BASE}/faq`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const faqHtml = items
    .map(item => `
      <div class="faq-item">
        <p class="faq-q">${esc(item.question)}</p>
        <p class="faq-a">${esc(item.answer)}</p>
      </div>`)
    .join("\n");

  const content = `
    <h1 class="page-title">Frequently Asked Questions</h1>
    <p class="page-subtitle">Everything you need to know about MIAW — the postgraduate program at the intersection of AI and architectural practice.</p>

    <article aria-label="FAQ">
      ${faqHtml}
    </article>

    <div class="cta-block">
      <h2>Still have questions?</h2>
      <p>The MIAW AI is available to answer any question about the program, admissions, curriculum, or how it might fit your specific practice.</p>
      <a href="/" class="btn">Talk to MIAW AI →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Explore More</h2>
      <div class="related-links">
        <a href="/curriculum" class="related-link">→ Full Curriculum (9 Modules)</a>
        <a href="/about" class="related-link">→ About the Program</a>
        <a href="/apply" class="related-link">→ Apply</a>
        <a href="/" class="related-link">→ Talk with MIAW AI</a>
      </div>
    </section>`;

  return pageShell({
    title: "FAQ — MIAW Master In Intelligent Artificial Worlds",
    description: "Frequently asked questions about MIAW: admissions requirements, program structure, cost, timeline, tools, methodology, and what makes it different from other AI courses.",
    canonical,
    ogTitle: "MIAW FAQ — Everything About the Program",
    jsonLdBlocks: [JSON.stringify(faqSchema, null, 2)],
    navCurrent: "apply",
    content,
    breadcrumbItems: [{ name: "FAQ", url: canonical }],
  });
}

// ---------------------------------------------------------------------------
// Faculty helpers
// ---------------------------------------------------------------------------

const MODULE_TITLES: Record<string, string> = {
  F0: "Foundations",
  F1: "Territory",
  F2: "World Modelling",
  F3: "Generative Design",
  F4: "Simulation",
  F5: "Communication",
  F6: "Documentation",
  F7: "Fabrication",
  F8: "Integration",
};

function nameInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => (w[0] ?? "").toUpperCase())
    .join("");
}

// ---------------------------------------------------------------------------
// Faculty index page — /faculty/
// ---------------------------------------------------------------------------

function generateFacultyIndexPage(facultyMembers: FacultyMember[]): string {
  const canonical = `${CANONICAL_BASE}/faculty`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: "Faculty — MIAW Master In Intelligent Artificial Worlds",
    description:
      "Meet the MIAW faculty — practitioners and researchers leading the intersection of spatial AI and architectural practice. Every instructor has shipped something real.",
    isPartOf: { "@id": WEBSITE_ID },
    about: facultyMembers.map(f => ({
      "@type": "Person",
      "@id": `${CANONICAL_BASE}/faculty/${f.slug}#person`,
      name: f.name,
      jobTitle: f.role,
      url: `${CANONICAL_BASE}/faculty/${f.slug}`,
    })),
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
    potentialAction: { "@type": "ReadAction", target: [canonical] },
  };

  const facultyCards = facultyMembers
    .map(f => {
      const initials = nameInitials(f.name);
      const expertiseTags = f.expertise
        .slice(0, 3)
        .map(e => `<span class="tag">${esc(e)}</span>`)
        .join("");
      const moduleLinks = f.modules
        .map(m => `<a href="/curriculum/${m.toLowerCase()}" class="module-link">${esc(m)}</a>`)
        .join("");

      return `
    <article class="faculty-card" aria-labelledby="faculty-${esc(f.slug)}">
      <div class="faculty-card-header">
        <div class="faculty-avatar" aria-hidden="true">${esc(initials)}</div>
        <div class="faculty-card-meta">
          <div class="faculty-badge">Faculty</div>
          <h2 class="faculty-name" id="faculty-${esc(f.slug)}">
            <a href="/faculty/${esc(f.slug)}" style="color:inherit;text-decoration:none;">${esc(f.name)}</a>
          </h2>
          <p class="faculty-role">${esc(f.role)}</p>
          ${f.affiliation && !f.affiliation.includes("to be confirmed") ? `<p class="faculty-affiliation">${esc(f.affiliation)}</p>` : ""}
        </div>
      </div>
      ${f.expertise.length > 0 ? `<div class="tag-list">${expertiseTags}</div>` : ""}
      ${f.modules.length > 0 ? `<div class="module-list">${moduleLinks}</div>` : ""}
      <a href="/faculty/${esc(f.slug)}" class="related-link" style="margin-top:0.5rem;">View profile →</a>
    </article>`;
    })
    .join("\n");

  const content = `
    <h1 class="page-title">Faculty</h1>
    <p class="page-subtitle">Practitioners and researchers leading the intersection of spatial AI and architectural practice. Every instructor has shipped something real — a tool used in practice, a system deployed on a real project.</p>

    <div class="faculty-grid">
      ${facultyCards}
    </div>

    <div class="cta-block" style="margin-top:3rem;">
      <h2>Ready to learn from them?</h2>
      <p>The 18-week postgraduate program. First cohort Q4 2026. Founder pricing for early applicants.</p>
      <a href="/" class="btn">Start the conversation →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Explore the Program</h2>
      <div class="related-links">
        <a href="/curriculum" class="related-link">→ Full Curriculum (9 Modules)</a>
        <a href="/about" class="related-link">→ About MIAW</a>
        <a href="/topics" class="related-link">→ Topics &amp; Concepts</a>
        <a href="/faq" class="related-link">→ FAQ</a>
        <a href="/apply" class="related-link">→ Apply</a>
      </div>
    </section>`;

  return pageShell({
    title: "Faculty — MIAW Master In Intelligent Artificial Worlds",
    description:
      "Meet the MIAW faculty — practitioners and researchers at the intersection of spatial AI, computational design, and architectural practice. Every instructor has shipped something real.",
    canonical,
    ogTitle: "Faculty — MIAW",
    jsonLdBlocks: [JSON.stringify(collectionSchema, null, 2)],
    navCurrent: "faculty",
    content,
    breadcrumbItems: [{ name: "Faculty", url: canonical }],
  });
}

// ---------------------------------------------------------------------------
// Faculty profile page — /faculty/[slug]/
// ---------------------------------------------------------------------------

function generateFacultyProfilePage(
  faculty: FacultyMember,
  allFaculty: FacultyMember[],
): string {
  const canonical = `${CANONICAL_BASE}/faculty/${faculty.slug}`;
  const initials = nameInitials(faculty.name);
  const bioFirstParagraph = faculty.bio.split(/\n\n+/)[0] ?? "";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${canonical}#person`,
    name: faculty.name,
    jobTitle: faculty.role,
    worksFor: { "@id": ORG_ID },
    ...(faculty.affiliation && !faculty.affiliation.includes("to be confirmed")
      ? { affiliation: { "@type": "Organization", name: faculty.affiliation } }
      : {}),
    knowsAbout: faculty.expertise,
    description: bioFirstParagraph.replace(/\n/g, " ").slice(0, 250),
    url: canonical,
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: `${faculty.name} — MIAW Faculty`,
    description: `${faculty.role} at MIAW. ${bioFirstParagraph.replace(/\n/g, " ").slice(0, 200)}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": `${canonical}#person` },
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
    potentialAction: { "@type": "ReadAction", target: [canonical] },
  };

  const expertiseTags = faculty.expertise
    .map(e => `<span class="tag">${esc(e)}</span>`)
    .join("");

  const moduleLinks = faculty.modules
    .map(
      m => `
      <a href="/curriculum/${m.toLowerCase()}" class="module-link" aria-label="${esc(m)}: ${esc(MODULE_TITLES[m] ?? m)}">
        ${esc(m)}: ${esc(MODULE_TITLES[m] ?? m)}
      </a>`,
    )
    .join("\n      ");

  const bioParagraphs = bodyToParagraphs(faculty.bio);

  const publicationsList =
    faculty.publications.length > 0
      ? `<h2>Selected Publications &amp; Projects</h2>
      <ul class="publications-list">
        ${faculty.publications.map(p => `<li>${esc(p)}</li>`).join("\n        ")}
      </ul>`
      : "";

  const otherFaculty = allFaculty.filter(f => f.slug !== faculty.slug);
  const otherFacultyLinks = otherFaculty
    .map(f => `<a href="/faculty/${esc(f.slug)}" class="related-link">→ ${esc(f.name)}</a>`)
    .join("\n        ");

  const metaParts = [
    faculty.affiliation && !faculty.affiliation.includes("to be confirmed")
      ? `<span class="faculty-meta-item">${esc(faculty.affiliation)}</span>`
      : "",
    faculty.location && !faculty.location.includes("to be confirmed")
      ? `<span class="faculty-meta-item">${esc(faculty.location)}</span>`
      : "",
  ].filter(Boolean);
  const metaHtml =
    metaParts.length > 0
      ? `<p class="faculty-affiliation">${metaParts.join('<span class="meta-sep" aria-hidden="true"> · </span>')}</p>`
      : "";

  const lastName = faculty.name.split(" ").pop() ?? "this faculty member";

  const content = `
    <div class="faculty-profile-header">
      <div class="faculty-avatar-lg" aria-hidden="true">${esc(initials)}</div>
      <div class="faculty-meta">
        <div class="faculty-badge">Faculty</div>
        <h1 class="page-title" style="margin-bottom:0.25rem;">${esc(faculty.name)}</h1>
        <p class="faculty-role" style="font-size:1rem;margin-bottom:0.5rem;">${esc(faculty.role)}</p>
        ${metaHtml}
        ${faculty.expertise.length > 0 ? `<div class="tag-list" style="margin-top:0.75rem;">${expertiseTags}</div>` : ""}
      </div>
    </div>

    ${
      faculty.modules.length > 0
        ? `<section aria-label="Modules taught">
      <h2>Modules at MIAW</h2>
      <div class="module-list">
        ${moduleLinks}
      </div>
    </section>`
        : ""
    }

    <section aria-label="Biography">
      <h2>Biography</h2>
      ${bioParagraphs}
    </section>

    ${publicationsList}

    <div class="cta-block">
      <h2>Study with ${esc(lastName)}</h2>
      <p>Apply to MIAW — the 18-week postgraduate program for architects and AI engineers. First cohort Q4 2026.</p>
      <a href="/" class="btn">Start the conversation →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Explore further</h2>
      <div class="related-links">
        <a href="/faculty" class="related-link">→ All Faculty</a>
        ${otherFacultyLinks}
        <a href="/curriculum" class="related-link">→ Curriculum</a>
        <a href="/about" class="related-link">→ About MIAW</a>
      </div>
    </section>`;

  return pageShell({
    title: `${faculty.name} — MIAW Faculty`,
    description: `${faculty.role} at MIAW. ${bioFirstParagraph.replace(/\n/g, " ").slice(0, 155)}`,
    canonical,
    ogTitle: `${faculty.name} — ${faculty.role} at MIAW`,
    jsonLdBlocks: [
      JSON.stringify(personSchema, null, 2),
      JSON.stringify(profilePageSchema, null, 2),
    ],
    navCurrent: "faculty",
    content,
    breadcrumbItems: [
      { name: "Faculty", url: `${CANONICAL_BASE}/faculty` },
      { name: faculty.name, url: canonical },
    ],
  });
}

// ---------------------------------------------------------------------------
// Sitemap extension — appends new URL entries to the existing sitemap.xml
// ---------------------------------------------------------------------------

function extendSitemap(modules: Module[], facultyMembers: FacultyMember[]): void {
  const sitemapPath = join(PUBLIC_DIR, "sitemap.xml");
  if (!existsSync(sitemapPath)) {
    console.warn("  ⚠  sitemap.xml not found — run seo-inject first. Skipping sitemap extension.");
    return;
  }

  let existing = readFileSync(sitemapPath, "utf-8");

  // Idempotent: strip any existing P3-A entries before re-appending so that
  // running generate-seo-pages.ts multiple times never duplicates entries.
  // Matches <url> blocks whose <loc> contains /curriculum/f, /topics/, /faq, or /faculty.
  existing = existing.replace(
    /\s*<url>\s*<loc>[^<]*\/(curriculum\/f|topics[/\w-]*|faq|faculty[/\w-]*)[^<]*<\/loc>[\s\S]*?<\/url>/g,
    "",
  );

  const newUrls: Array<{ loc: string; changefreq: string; priority: string }> = [
    // Topics index page
    { loc: `${CANONICAL_BASE}/topics`, changefreq: "monthly", priority: "0.82" },
    // Module detail pages (F0–F8)
    ...modules.map(m => ({
      loc: `${CANONICAL_BASE}/curriculum/${m.id.toLowerCase()}`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    // Topic concept pages
    ...TOPICS.map(t => ({
      loc: `${CANONICAL_BASE}/topics/${t.slug}`,
      changefreq: "monthly",
      priority: "0.75",
    })),
    // FAQ page
    { loc: `${CANONICAL_BASE}/faq`, changefreq: "monthly", priority: "0.7" },
    // Faculty index page
    ...(facultyMembers.length > 0
      ? [{ loc: `${CANONICAL_BASE}/faculty`, changefreq: "monthly", priority: "0.85" }]
      : []),
    // Individual faculty profile pages
    ...facultyMembers.map(f => ({
      loc: `${CANONICAL_BASE}/faculty/${f.slug}`,
      changefreq: "monthly",
      priority: "0.78",
    })),
  ];

  const newEntries = newUrls
    .map(u => `  <url>
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
  </url>`)
    .join("\n");

  const extended = existing.replace("</urlset>", `${newEntries}\n</urlset>`);
  writeFileSync(sitemapPath, extended, "utf-8");
  console.log(`  ✓ sitemap.xml extended with ${newUrls.length} new URL entries (idempotent)`);
}

// ---------------------------------------------------------------------------
// Topics index page — /topics/
// ---------------------------------------------------------------------------

function generateTopicsIndexPage(): string {
  const canonical = `${CANONICAL_BASE}/topics`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: "AI Topics in Architecture — MIAW",
    description: "Concept pages covering key AI technologies and methods in architectural and AEC practice: Gaussian Splatting, BIM+AI, Spatial AI, Digital Twins, MCP, and more.",
    isPartOf: { "@id": WEBSITE_ID },
    about: [
      ...TOPICS.slice(0, 8).map(t => ({
        "@type": "DefinedTerm",
        name: t.title,
        url: `${CANONICAL_BASE}/topics/${t.slug}`,
      })),
    ],
    datePublished: "2026-01-01",
    dateModified: BUILD_DATE,
    inLanguage: "en",
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
    potentialAction: { "@type": "ReadAction", target: [canonical] },
  };

  const topicCards = TOPICS.map(t => `
    <article class="card" aria-labelledby="topic-${t.slug}">
      <div class="topic-badge">${esc(t.badge)}</div>
      <h2 class="module-title" id="topic-${t.slug}">
        <a href="/topics/${t.slug}" style="color:inherit;text-decoration:none;">${esc(t.title)}</a>
      </h2>
      <p>${esc(t.description.slice(0, 180))}…</p>
      <a href="/topics/${t.slug}" class="related-link" style="margin-top:0.75rem;">
        Read about ${esc(t.title)} →
      </a>
    </article>`).join("\n");

  const content = `
    <h1 class="page-title">Topics</h1>
    <p class="page-subtitle">Concept pages covering the key technologies and methods at the intersection of AI and architectural practice — the intellectual territory MIAW teaches.</p>

    <div class="module-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
      ${topicCards}
    </div>

    <div class="cta-block">
      <h2>Learn all of this in MIAW</h2>
      <p>The 18-week postgraduate program covers each of these topics as a professional skill — applied to your own real project. First cohort Q4 2026.</p>
      <a href="/" class="btn">Talk to MIAW AI →</a>
    </div>

    <section class="related-pages" aria-label="Related pages">
      <h2>Explore the Program</h2>
      <div class="related-links">
        <a href="/curriculum" class="related-link">→ Full Curriculum (9 Modules)</a>
        <a href="/about" class="related-link">→ About MIAW</a>
        <a href="/faq" class="related-link">→ FAQ</a>
        <a href="/apply" class="related-link">→ Apply</a>
      </div>
    </section>`;

  return pageShell({
    title: "AI Topics in Architecture — MIAW",
    description: "Concept pages covering key AI technologies and methods in architectural and AEC practice: Gaussian Splatting, BIM+AI, Spatial AI, Digital Twins, Model Context Protocol, Neural Rendering, World Models, and more.",
    canonical,
    ogTitle: "AI Topics in Architecture — MIAW Concept Encyclopedia",
    jsonLdBlocks: [JSON.stringify(collectionSchema, null, 2)],
    navCurrent: "curriculum",
    content,
    breadcrumbItems: [{ name: "Topics", url: canonical }],
  });
}

// ---------------------------------------------------------------------------
// File writing utility
// ---------------------------------------------------------------------------

function writePublicFile(relativePath: string, content: string): void {
  const fullPath = join(PUBLIC_DIR, relativePath);
  const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
  if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
  console.log(`  ✓ ${relativePath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("🔍 Generate SEO Pages (P3-A) — reading knowledge base…\n");

  const currMd = readKnowledge("curriculum.md");
  const faqMd = readKnowledge("faq.md");
  const facultyMd = readKnowledge("faculty.md");

  const modules = extractModules(currMd);
  const faqItems = extractFaqItems(faqMd);
  const facultyMembers = extractFacultyMembers(facultyMd);

  if (modules.length === 0) {
    throw new Error("No modules extracted from curriculum.md — check parsing logic.");
  }
  if (faqItems.length === 0) {
    throw new Error("No FAQ items extracted from faq.md — check parsing logic.");
  }

  console.log(
    `  → ${modules.length} modules, ${faqItems.length} FAQ items, ${TOPICS.length} topic pages, ${facultyMembers.length} faculty`,
  );

  // 1. Generate module detail pages (with prev/next <link> tags)
  console.log("\n📚 Generating module detail pages…");
  for (const module of modules) {
    const slug = module.id.toLowerCase();
    writePublicFile(`curriculum/${slug}/index.html`, generateModulePage(module, modules));
  }

  // 2. Generate topics index page (/topics/)
  console.log("\n🗂  Generating topics index page…");
  writePublicFile("topics/index.html", generateTopicsIndexPage());

  // 3. Generate topic / concept pages
  console.log("\n🏷  Generating topic concept pages…");
  for (const topic of TOPICS) {
    writePublicFile(`topics/${topic.slug}/index.html`, generateTopicPage(topic));
  }

  // 4. Generate FAQ page
  console.log("\n❓ Generating FAQ page…");
  writePublicFile("faq/index.html", generateFaqPage(faqItems));

  // 5. Generate faculty index + profile pages
  if (facultyMembers.length > 0) {
    console.log("\n👤 Generating faculty pages…");
    writePublicFile("faculty/index.html", generateFacultyIndexPage(facultyMembers));
    for (const member of facultyMembers) {
      writePublicFile(
        `faculty/${member.slug}/index.html`,
        generateFacultyProfilePage(member, facultyMembers),
      );
    }
  } else {
    console.log("\n👤 No faculty profiles found in faculty.md — skipping faculty pages.");
  }

  // 6. Extend sitemap.xml with all new page URLs (idempotent)
  console.log("\n🗺  Extending sitemap.xml…");
  extendSitemap(modules, facultyMembers);

  const facultyPageCount = facultyMembers.length > 0 ? 1 + facultyMembers.length : 0;
  const total = modules.length + 1 + TOPICS.length + 1 + facultyPageCount;
  console.log(`\n✅ P3-A complete — ${total} pages generated.`);
  console.log(`   → ${modules.length} module pages (/curriculum/f0–f8)`);
  console.log(`   → 1 topics index page (/topics/)`);
  console.log(`   → ${TOPICS.length} topic pages (/topics/*)`);
  console.log(`   → 1 FAQ page (/faq)`);
  if (facultyMembers.length > 0) {
    console.log(`   → 1 faculty index page (/faculty/)`);
    console.log(`   → ${facultyMembers.length} faculty profile pages (/faculty/*)`);
  }
}

main();
