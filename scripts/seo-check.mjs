// seo-check.mjs — search-facing checks on a built static site (run after the build, next to content-guard.mjs).
//   node scripts/seo-check.mjs [dist] [config]      (defaults: dist, scripts/seo-check.config.mjs)
// Copied verbatim into fmycar-site, fmycar-cars and fmycar-dealers (each has its own config) — keep the copies identical.
// Every indexable page is checked (noindex pages are skipped; an `x.html` / `x/index.html` pair counts once):
//   • <title>: present, at most cfg.titleMax characters, names the brand;
//   • meta description: present, between cfg.descMin and cfg.descMax characters;
//   • a canonical link and exactly one <h1>;
//   • FAQPage structured data: every question and every answer is visible on the page (search engines reject hidden FAQ text);
//   • valid JSON in every JSON-LD block;
//   • cfg.extra(pages, helpers): site-specific checks returning [{ file, rule, snippet }].
// A hit prints file, rule and a snippet; the process exits 1.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { pathToFileURL } from "node:url";

const dist = process.argv[2] || "dist";
const cfgPath = process.argv[3] || "scripts/seo-check.config.mjs";
const cfg = (await import(pathToFileURL(cfgPath).href)).default;
const titleMax = cfg.titleMax ?? 60, descMin = cfg.descMin ?? 50, descMax = cfg.descMax ?? 160, brand = cfg.brand ?? "FMYCAR";

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
/** Plain-text form of a schema string (answers may carry <a> tags and entities). Spaces that only exist because a tag
 *  boundary sat next to punctuation (glossary autolinks: "value</a>, buy") are dropped on both sides of the comparison. */
export const norm = (s) => decode(String(s ?? "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").replace(/\s+([,.;:!?”’)\]])/g, "$1").replace(/([“‘(\[])\s+/g, "$1").trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i")); return m ? decode(m[1] ?? m[2]) : null; };
export function meta(html, name) { const m = html.match(new RegExp(`<meta\\s[^>]*name=["']${name}["'][^>]*>`, "i")); return m ? attr(m[0], "content") : null; }
export function ldBlocks(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { out.push(JSON.parse(m[1])); } catch { out.push({ "@type": "__invalid", raw: m[1].slice(0, 80) }); }
  }
  return out;
}
/** Every node of a schema.org type anywhere in a JSON-LD tree (handles @graph, nested mainEntity, arrays). */
export function findType(node, type, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { for (const n of node) findType(n, type, out); return out; }
  const t = node["@type"];
  if (t === type || (Array.isArray(t) && t.includes(type))) out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === "object") findType(v, type, out);
  return out;
}
const words = (s) => norm(s).split(" ").filter(Boolean).length;

const hits = [];
const hit = (file, rule, snippet = "") => hits.push({ file, rule, snippet: String(snippet).replace(/\s+/g, " ").slice(0, 120) });
const seen = new Set();
const pages = [];
for (const f of walk(dist).filter((p) => extname(p) === ".html").sort()) {
  const rel = "/" + relative(dist, f).replace(/\\/g, "/");
  const key = rel.replace(/\/index\.html$/, "").replace(/\.html$/, "") || "/";
  if (seen.has(key)) continue; seen.add(key);
  if ((cfg.skip ?? []).some((re) => re.test(rel))) continue;
  const html = readFileSync(f, "utf8");
  const robots = meta(html, "robots") ?? "";
  const noindex = /noindex/i.test(robots);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const desc = meta(html, "description");
  const canonical = html.match(/<link\s[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? null;
  const ld = ldBlocks(html);
  const page = { rel, html, text: textOf(html), title: decode(title).trim(), desc, canonical: canonical ? attr(canonical, "href") : null, ld, noindex, words: words(textOf(html)) };
  pages.push(page);
  if (noindex) continue;
  if (!page.title) hit(rel, "title:missing");
  else {
    if (page.title.length > titleMax) hit(rel, "title:long", `${page.title.length} chars: ${page.title}`);
    if (!page.title.includes(brand) && page.title.length <= titleMax - brand.length - 3) hit(rel, "title:no-brand", page.title);   // " | FMYCAR" fits, so it should be there
  }
  if (desc == null) hit(rel, "description:missing");
  else if (desc.length < descMin || desc.length > descMax) hit(rel, "description:length", `${desc.length} chars: ${desc}`);
  if (!page.canonical) hit(rel, "canonical:missing");
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1s !== 1) hit(rel, "h1:count", `${h1s} h1 elements`);
  for (const b of ld) if (b["@type"] === "__invalid") hit(rel, "jsonld:invalid", b.raw);
  for (const faq of findType(ld, "FAQPage")) {
    const qs = [].concat(faq.mainEntity ?? []);
    if (!qs.length) hit(rel, "faq:empty");
    for (const q of qs) {
      const name = norm(q?.name), ans = norm(q?.acceptedAnswer?.text);
      if (!name || !ans) { hit(rel, "faq:shape", JSON.stringify(q).slice(0, 80)); continue; }
      const visible = norm(page.text);
      if (!visible.includes(name)) hit(rel, "faq:question-hidden", name);
      if (!visible.includes(ans)) hit(rel, "faq:answer-hidden", ans);
    }
  }
}
if (typeof cfg.extra === "function") {
  const extra = cfg.extra(pages, { findType, textOf, norm, meta, ldBlocks, words, dist, readFileSync, existsSync, join });
  for (const h of extra ?? []) hit(h.file, h.rule, h.snippet);
}
const indexable = pages.filter((p) => !p.noindex).length;
if (indexable < (cfg.minPages ?? 1)) hit("/", "min-pages", `${indexable} indexable pages, need ${cfg.minPages}`);

if (hits.length) {
  console.error(`seo check: ${hits.length} problem${hits.length === 1 ? "" : "s"} in ${dist} (${indexable} indexable pages)`);
  const byRule = {};
  for (const h of hits) byRule[h.rule] = (byRule[h.rule] ?? 0) + 1;
  for (const [r, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.error(`  ${String(n).padStart(4)}  ${r}`);
  for (const h of hits.slice(0, 120)) console.error(`  ${h.rule}  ${h.file}  …${h.snippet}…`);
  if (hits.length > 120) console.error(`  …and ${hits.length - 120} more`);
  process.exit(1);
}
console.log(`seo check: ${indexable} indexable pages, 0 problems`);
