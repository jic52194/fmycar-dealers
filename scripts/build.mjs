// Builds dealers.fmycar.com into dist/: the dealer side of FMYCAR (what a dealership gets, pricing, how it works, the sign-up,
// the independent-dealer directory). node scripts/build.mjs — no dependencies. GitHub Pages serves dist/ (CNAME inside).
import { rmSync, mkdirSync, cpSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { OUT, SITE, HOME, CARS, write, urls, redirect, TODAY, BRAND, PRICE, SIGNUP, VERIFY, DIRECTORY, PHONE, EMAIL } from "./lib.mjs";
import { home } from "../content/home.mjs";
import { pricing, howItWorks, contact, notFound } from "../content/pages.mjs";
import { dealerSignup, dealerVerify, loadMarketStats, SIGNUP_PATH } from "../content/signup.mjs";
import { dealersIndex, dealerStatePages, DEALERS, DEALER_STATES } from "../content/directory.mjs";

rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
cpSync(fileURLToPath(new URL("../static/", import.meta.url)), OUT, { recursive: true });
await loadMarketStats();

write("/", home()); write("/pricing/", pricing()); write("/how-it-works/", howItWorks()); write("/contact/", contact());
write(SIGNUP_PATH, dealerSignup()); write(VERIFY, dealerVerify());
write(DIRECTORY, dealersIndex());
const states = dealerStatePages(); for (const s of states) write(s.path, s.html);
writeFileSync(join(OUT, "404.html"), notFound());

// The legal pages live on fmycar.com (one policy for every FMYCAR property); these stubs keep old links working.
const LEGAL = { "/privacy/": `${HOME}/privacy`, "/terms/": `${HOME}/terms`, "/privacy": `${HOME}/privacy`, "/terms": `${HOME}/terms` };
// Pages of the old GoHighLevel site that lived at this host until November 2026 ("Dealership Growth Platform"). Each old
// address lands on the page that answers the same question today. GitHub Pages cannot 301, so: canonical + meta refresh + noindex.
const OLD = {
  "/platform": "/how-it-works/", "/marketing": "/", "/compliance": "/how-it-works/", "/compliant": "/how-it-works/", "/service-logic": "/", "/workflows-service-survey": "/", "/workflows/service-survey": "/",
  "/buying-workflow": "/how-it-works/", "/selling-workflow": "/how-it-works/", "/follow-up": "/how-it-works/#leads", "/dealer-assessment": SIGNUP, "/resources/assessment": SIGNUP, "/resources/white-papers": `${HOME}/guides/`,
  "/demo": SIGNUP, "/personas": "/", "/software-pricing": "/pricing/", "/how-it-works-6534": "/how-it-works/", "/dealership-service-survey1-2659": "/", "/helping-car-dealerships-stay-compliant-9484": "/how-it-works/",
  // the fmycar.com paths these pages replaced, in case someone types them here
  "/dealers": DIRECTORY, "/dealers/signup": SIGNUP, "/for-dealerships": "/",
};
for (const [from, to] of Object.entries({ ...LEGAL, ...OLD })) write(from, redirect(from, to));

// sitemap / robots / llms.txt / CNAME
const PRI = { "/": "1.0", "/pricing/": "0.9", [SIGNUP]: "0.9", "/how-it-works/": "0.8", [DIRECTORY]: "0.7" };
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, m]) => `<url><loc>${SITE}${p}</loc><lastmod>${m}</lastmod><changefreq>weekly</changefreq><priority>${PRI[p] ?? "0.5"}</priority></url>`).join("\n")}\n</urlset>\n`);
const BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bingbot"];
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\n# AI answer engines and search crawlers welcome\n${BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n")}\n\nSitemap: ${SITE}/sitemap.xml\nSitemap: ${HOME}/sitemap.xml\nSitemap: ${CARS}/sitemap.xml\n`);
writeFileSync(join(OUT, "llms.txt"), `# FMYCAR for dealers (dealers.fmycar.com)

> ${BRAND.boilerplate.short} This site is the dealership side: a dealership lists its in-stock inventory on cars.fmycar.com for ${PRICE.dealer.map((t) => `$${t.price} a month (${t.name})`).join(", ")}, authorized by the dealership before anything publishes. No commission, no setup fee. Shopper questions go straight to the store. FMYCAR is not a dealer.

- Home: ${SITE}/ (what a dealership gets, prices, how it starts)
- Pricing: ${SITE}/pricing/
- How it works: ${SITE}/how-it-works/ (the four steps, which cars list, what a lead looks like)
- Sign-up: ${SITE}${SIGNUP} (no card; the monthly charge is authorized later in the dealer's CarSalesSoftware account)
- Dealer directory: ${SITE}${DIRECTORY} (${DEALERS.length} independent dealerships in ${DEALER_STATES.length} states that can claim their card)
- Contact: ${PHONE} · ${EMAIL}
- Shoppers: ${HOME}/ (guides, deal help) and ${CARS}/ (the marketplace)
`);
writeFileSync(join(OUT, "CNAME"), "dealers.fmycar.com\n");
writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`built ${urls.length} indexable pages + ${states.length} state pages (noindex) + ${Object.keys({ ...LEGAL, ...OLD }).length} redirects at ${TODAY}; directory: ${DEALERS.length} dealers`);
