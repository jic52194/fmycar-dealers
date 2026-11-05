// content-guard.mjs — launch gate for a built static site: nothing internal, retired or secret ships.
//   node scripts/content-guard.mjs [dist] [config]      (defaults: dist, scripts/content-guard.config.mjs)
// Copied verbatim into fmycar-site, fmycar-cars and fmycar-app (each has its own config) — keep the three copies identical.
// What it checks:
//   • every .html file's visible text (scripts, styles, comments and tags removed) against the forbidden list: internal
//     words (tooling, backend names, dev markers), retired offers, savings claims, fake urgency, guarantees;
//   • every .js / .json / .txt / .xml / .css file against the secret patterns, and .js files against the subset of phrases
//     that would mean customer-facing copy regressed (retired offers, urgency, internal notes);
//   • required phrases on named pages (the hero line, the primary CTAs, the prices);
//   • a minimum page count, so an empty or half-built dist can never pass.
// A hit prints file, rule and a snippet; the process exits 1. Allowances are per rule and per path pattern, in the config.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { pathToFileURL } from "node:url";

const dist = process.argv[2] || "dist";
const cfgPath = process.argv[3] || "scripts/content-guard.config.mjs";
const cfg = (await import(pathToFileURL(cfgPath).href)).default;

/** Rules every site shares. A config adds `extraForbidden`, `allow` (per rule), `required`, `minPages`. */
export const FORBIDDEN = [
  // internal / tooling / backend names that must never be in customer-facing text
  { id: "lorem", re: /\blorem ipsum\b/i, html: true, js: true },
  { id: "todo", re: /\b(TODO|FIXME|HACK|XXX)\b:?/, html: true, js: false },
  { id: "internal-note", re: /\b(internal|dev|developer|builder) (note|notes|prompt|prompts|instructions?)\b/i, html: true, js: true },
  { id: "do-not-publish", re: /do not publish|not for publication|draft copy/i, html: true, js: true },
  { id: "ai-vendor", re: /\b(Claude|Anthropic|OpenAI|ChatGPT|GPT-?[45])\b/, html: true, js: false },
  { id: "backend", re: /\b(Supabase|edge function|row.level security|service.role|GoHighLevel|\bGHL\b|carsales-desktop|platform_secrets|migration)\b/i, html: true, js: false },
  { id: "backend-js", re: /carsales-desktop|platform_secrets|service_role|INTERNAL NOTE/i, html: false, js: true },
  { id: "webhook", re: /\bwebhooks?\b/i, html: true, js: false },
  { id: "dev-hosts", re: /\blocalhost\b|127\.0\.0\.1|\bstaging\b|ngrok/i, html: true, js: true },
  { id: "console", re: /console\.(log|error)\(/, html: true, js: false },
  // retired offers (owner decisions 2026-11-04)
  { id: "retired-hub", re: /Join the Knowledge Hub|Knowledge Hub[^.]{0,60}\$49(?![0-9])|\$49(?![0-9])[^.]{0,60}Knowledge Hub|Hub membership[^.]{0,40}\$/i, html: true, js: true },
  { id: "retired-sessions", re: /strategy session/i, html: true, js: true },
  { id: "retired-insider", re: /FMYCAR Insider|Insider membership/i, html: true, js: true },
  { id: "retired-trial", re: /free (for )?7 days|7-day (free |AI )?(trial|concierge)|free trial|try the AI concierge/i, html: true, js: true },
  { id: "retired-salesperson", re: /salesperson plan|for salespeople · coming soon|\$49\/mo salesperson/i, html: true, js: true },
  // claims the brief forbids: invented savings, guarantees, fake urgency
  { id: "savings-claim", re: /\$800[^.]{0,20}\$3,000|save (you )?(up to |between )?\$[0-9,]{3,}|savings of \$[0-9,]{3,}|average savings/i, html: true, js: true },
  { id: "guarantee", re: /guarantee(d|s)? (the )?(best|lowest|savings|a (better|lower))|guaranteed (price|savings|approval)/i, html: true, js: true },
  { id: "urgency", re: /\bonly \d+ (spots?|seats?) left|offer ends (today|tonight|soon)|limited.time offer|\bact now\b|\bhurry\b/i, html: true, js: true },
  { id: "fake-stats", re: /\b(thousands|millions) of (happy |satisfied )?(customers|buyers|members)\b|\d{1,3}% of (our )?(customers|buyers) save/i, html: true, js: true },
];
export const SECRETS = [
  { id: "stripe-key", re: /\b[sr]k_(live|test)_[A-Za-z0-9]{8,}/ },
  { id: "stripe-whsec", re: /\bwhsec_[A-Za-z0-9]{8,}/ },
  { id: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { id: "github-token", re: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
  { id: "ghl-token", re: /\bpit-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i },
  { id: "aws-key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "jwt", re: /\beyJhbGciOiJIUzI1NiI[A-Za-z0-9._-]{40,}/ },
  { id: "anthropic-key", re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
];

const TEXT_EXT = new Set([".js", ".mjs", ".json", ".txt", ".xml", ".css", ".webmanifest"]);
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name); const st = statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#8217;|&rsquo;/g, "’").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”");
/** Visible text of an HTML page: no scripts, styles, comments, tags or JSON-LD; attributes are not text. */
export function textOf(html) {
  return decode(html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
}
const allowed = (ruleId, rel) => (cfg.allow ?? []).some((a) => a.rule === ruleId && a.path.test(rel));
const snippet = (text, m) => { const i = Math.max(0, m.index - 40); return text.slice(i, m.index + m[0].length + 40).replace(/\s+/g, " "); };

const files = walk(dist);
const pages = files.filter((f) => extname(f) === ".html");
const hits = [];
const rules = [...FORBIDDEN, ...(cfg.extraForbidden ?? [])];
for (const f of pages) {
  const rel = "/" + relative(dist, f).replace(/\\/g, "/");
  const text = textOf(readFileSync(f, "utf8"));
  for (const r of rules) {
    if (!r.html || allowed(r.id, rel)) continue;
    const re = new RegExp(r.re.source, r.re.flags.includes("g") ? r.re.flags : r.re.flags + "g");
    const m = re.exec(text);
    if (m) hits.push({ file: rel, rule: r.id, snippet: snippet(text, m) });
  }
}
for (const f of files) {
  const ext = extname(f); if (!TEXT_EXT.has(ext) && ext !== ".html") continue;
  const rel = "/" + relative(dist, f).replace(/\\/g, "/");
  const raw = readFileSync(f, "utf8");
  for (const s of SECRETS) { const m = s.re.exec(raw); if (m && !allowed(s.id, rel)) hits.push({ file: rel, rule: `secret:${s.id}`, snippet: m[0].slice(0, 12) + "…" }); }
  if (ext === ".js" || ext === ".mjs") for (const r of rules) {
    if (!r.js || allowed(r.id, rel)) continue;
    const m = r.re.exec(raw); if (m) hits.push({ file: rel, rule: r.id, snippet: snippet(raw, m) });
  }
}
for (const req of cfg.required ?? []) {
  const f = join(dist, req.path);
  let body = ""; try { body = readFileSync(f, "utf8"); } catch { hits.push({ file: "/" + req.path, rule: "required:missing-page", snippet: "" }); continue; }
  const text = req.raw ? body : textOf(body);
  for (const re of req.all) if (!re.test(text)) hits.push({ file: "/" + req.path, rule: "required", snippet: `missing ${re}` });
}
if (pages.length < (cfg.minPages ?? 1)) hits.push({ file: "/", rule: "min-pages", snippet: `${pages.length} pages, need ${cfg.minPages}` });

if (hits.length) {
  console.error(`content guard: ${hits.length} problem${hits.length === 1 ? "" : "s"} in ${dist}`);
  for (const h of hits.slice(0, 80)) console.error(`  ${h.rule}  ${h.file}  …${h.snippet}…`);
  if (hits.length > 80) console.error(`  …and ${hits.length - 80} more`);
  process.exit(1);
}
console.log(`content guard: ${pages.length} pages, ${files.length} files, 0 problems`);
