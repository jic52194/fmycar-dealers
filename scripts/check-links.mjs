// Every internal link and asset in dist/ must point at a file the build wrote. External links are not fetched.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
function walk(dir, out = []) { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; }
const pages = walk(dist).filter((f) => extname(f) === ".html");
const ids = new Map();
const missing = [], badFrag = [];
const resolves = (p) => { const clean = p.split("?")[0]; const cands = [join(dist, clean), join(dist, clean, "index.html"), join(dist, clean.replace(/\/$/, "") + ".html")]; return cands.some((c) => existsSync(c) && (!statSync(c).isDirectory() || existsSync(join(c, "index.html")))); };
for (const f of pages) ids.set("/" + relative(dist, f).replace(/\\/g, "/"), new Set([...readFileSync(f, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
for (const f of pages) {
  const rel = "/" + relative(dist, f).replace(/\\/g, "/");
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|sms:|javascript:|data:|#)/.test(h)) { if (h.startsWith("#") && h.length > 1 && !ids.get(rel)?.has(h.slice(1))) badFrag.push(`${rel} → ${h}`); continue; }
    const [path, frag] = h.split("#");
    if (!resolves(path)) missing.push(`${rel} → ${h}`);
  }
}
console.log(`links: ${pages.length} pages, ${missing.length} missing targets, ${badFrag.length} fragments without an id`);
for (const m of missing.slice(0, 20)) console.error("  missing", m);
for (const m of badFrag.slice(0, 20)) console.warn("  fragment", m);
if (missing.length) process.exit(1);
