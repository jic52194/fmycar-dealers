// Search checks for dealers.fmycar.com (scripts/seo-check.mjs, the same script as fmycar.com and cars.fmycar.com).
import { SOCIAL, ORG_ID } from "./lib.mjs";

export default {
  titleMax: 60, descMin: 50, descMax: 160, brand: "FMYCAR", minPages: 6,
  skip: [/^\/404\.html$/],
  extra(pages, { findType, readFileSync, existsSync, join, dist }) {
    const hits = [];
    const home = pages.find((p) => p.rel === "/index.html");
    const org = home && findType(home.ld, "Organization").find((o) => o["@id"] === ORG_ID);
    if (!org) hits.push({ file: "/index.html", rule: "org:missing" });
    else for (const u of SOCIAL.map((s) => s.url)) if (!(org.sameAs ?? []).includes(u)) hits.push({ file: "/index.html", rule: "org:sameAs", snippet: u });
    // state pages are for the claim flow, not for search: noindex and out of the sitemap
    for (const p of pages) if (/^\/directory\/[a-z]{2}\/index\.html$/.test(p.rel) && !p.noindex) hits.push({ file: p.rel, rule: "directory:state-indexed" });
    const sm = join(dist, "sitemap.xml");
    if (existsSync(sm)) for (const m of readFileSync(sm, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) if (/\/directory\/[a-z]{2}\/$/.test(m[1])) hits.push({ file: "/sitemap.xml", rule: "sitemap:state-page", snippet: m[1] });
    // every old GoHighLevel address answers with a redirect stub (noindex + canonical), never a 404
    for (const old of ["platform", "marketing", "compliance", "dealer-assessment", "demo", "personas", "software-pricing", "resources/white-papers"]) {
      const f = join(dist, old, "index.html");
      if (!existsSync(f)) { hits.push({ file: `/${old}`, rule: "old-url:missing" }); continue; }
      const html = readFileSync(f, "utf8");
      if (!/name="robots" content="noindex"/.test(html) || !/rel="canonical"/.test(html) || !/http-equiv="refresh"/.test(html)) hits.push({ file: `/${old}`, rule: "old-url:not-a-redirect" });
    }
    return hits;
  },
};
