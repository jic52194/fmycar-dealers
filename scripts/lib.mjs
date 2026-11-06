// Shared layout + helpers for dealers.fmycar.com (static build). The dealer side of FMYCAR: what a dealership gets, what it
// costs, the sign-up, the independent-dealer directory. Shoppers never land here on purpose; every shopper link goes to
// fmycar.com or cars.fmycar.com. Brand: FMYCAR red #B50000 on black/white, the same CSS as fmycar.com (static/assets/site.css).
// Facts below (prices, boilerplate, profiles, phone) mirror fmycar-site/scripts/lib.mjs; change them there first.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const SITE = "https://dealers.fmycar.com";
export const HOME = "https://fmycar.com";
export const CARS = "https://cars.fmycar.com";
export const APP = "https://app.carsalessoftware.com";   // where a dealership signs in, connects inventory and authorizes the charge
export const PHONE = "+1 (970) 436-9227";
export const PHONE_TEL = "+19704369227";
export const EMAIL = "Contact@Fmycar.com";
export const LOGO = "https://storage.googleapis.com/msgsndr/l7KbjCQtG9Dqbyct84Ps/media/67f479764f87ea3da6da991a.png";
export const GSC = "TUjPs1G5VdEO-rjzNjhBG1rcSWEQh7JIeQHopUyPcIA";
export const SOFTWARE_NAME = "CarSalesSoftware";
export const SOFTWARE_URL = "https://carsalessoftware.com/";
export const SIGNUP = "/signup/";
export const VERIFY = "/verify/";
export const DIRECTORY = "/directory/";
/** The dealer prices (owner, 2026-11-04). Shoppers pay nothing. This site does not charge a card. */
export const PRICE = { review: 249, full: 499, seller: 49, dealer: [{ key: "dealer_97", name: "0–30 vehicles", min: 0, max: 30, price: 97 }, { key: "dealer_199", name: "31–100 vehicles", min: 31, max: 100, price: 199 }, { key: "dealer_299", name: "101+ vehicles", min: 101, max: null, price: 299 }] };
export const BRAND = {
  line: "Before you buy. Before you sell. Before you trade. Before you lease. FMYCAR.",
  boilerplate: {
    short: "FMYCAR is where to check before you buy, sell, trade or lease a car: free used-car listings, free buying guides and independent deal help. Not a dealer.",
    long: "FMYCAR is where to check before you buy, sell, trade or lease a car. Shoppers browse used cars from dealerships and private sellers on cars.fmycar.com for free and read free guides on buying, selling, trading, leasing and financing. Buyers who want a second set of eyes before they sign can pay for a Deal Review ($249) or a Full Concierge ($499). FMYCAR is not a dealer: it sells no cars, arranges no financing and takes no commission. Private sellers list for $49 a month; dealerships pay $97 to $299 a month depending on inventory size. FMYCAR LLC is based in Massachusetts and was founded by Jared Casper, who spent nearly a decade in dealership sales.",
  },
};
export const COMPANY = { legalName: "FMYCAR LLC", addressRegion: "MA", addressCountry: "US" };
/** The two profiles FMYCAR has (owner, 2026-11-06). Same list on every FMYCAR site. */
export const SOCIAL = [
  { name: "Facebook", url: "https://www.facebook.com/fmycar" },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/fmycar/" },
];
export const FOUNDER = { name: "Jared Casper", title: "Founder", line: "Nearly a decade in dealership sales, finance and leadership on Massachusetts’ North Shore before building CarSalesSoftware for the store and FMYCAR for the buyer." };
export const ORG_ID = `${HOME}/#org`;
/** The same company record fmycar.com publishes, so every property agrees on who FMYCAR is. */
export const ORG = { "@type": "Organization", "@id": ORG_ID, name: "FMYCAR", legalName: COMPANY.legalName, url: HOME + "/", logo: LOGO, email: EMAIL, telephone: PHONE_TEL,
  description: BRAND.boilerplate.long, slogan: BRAND.line, areaServed: "US", address: { "@type": "PostalAddress", addressRegion: COMPANY.addressRegion, addressCountry: COMPANY.addressCountry },
  founder: { "@type": "Person", "@id": `${HOME}/about#jared-casper`, name: FOUNDER.name, url: HOME + "/about" },
  contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: PHONE_TEL, email: EMAIL, areaServed: "US", availableLanguage: "English" }],
  sameAs: [CARS + "/", SITE + "/", ...SOCIAL.map((s) => s.url)] };
/** The promise every dealer page repeats (the legal consent text itself lives in the billing code and is quoted at authorization). */
export const PLAN_CONSENT = "FMYCAR never changes an existing subscription on its own. If the number of vehicles a dealership has listed grows into a higher price band, FMYCAR emails the new amount and the reason. The higher price is charged only after the dealership explicitly agrees. Until then, the current price stays.";
export const AFFILIATION = `FMYCAR and <a href="${SOFTWARE_URL}" rel="noopener">${SOFTWARE_NAME}</a> are separate products. Neither one requires the other. A dealership can list on FMYCAR without ${SOFTWARE_NAME}, and can use ${SOFTWARE_NAME} without listing on FMYCAR. Dealers who use both can choose to share inventory and leads between the two automatically, so the same vehicle is not entered twice.`;
export const ADVICE_LINE = "FMYCAR is where shoppers go before they buy, sell, trade, or lease a car: a vehicle marketplace, free car-buying guides, and paid deal help that only the buyer pays for. It does not buy, sell, or negotiate vehicles, arrange financing, or hold funds.";
export const TRUST = "FMYCAR is a marketplace, not a dealer. It takes no commission on your sales, and shoppers browse free.";

export const OUT = fileURLToPath(new URL("../dist/", import.meta.url));
export const BUILT = new Date().toISOString();
export const TODAY = BUILT.slice(0, 10);
const ASSET_V = new Map();
export function assetUrl(path) {
  if (!ASSET_V.has(path)) {
    let h = TODAY;
    try { h = createHash("sha256").update(readFileSync(fileURLToPath(new URL("../static" + path, import.meta.url)))).digest("hex").slice(0, 10); } catch { /* keep the date */ }
    ASSET_V.set(path, h);
  }
  return `${path}?v=${ASSET_V.get(path)}`;
}
/** fmycar.com dates content from git; here the directory data is the only dated thing and it changes with the build. */
export const dates = () => [TODAY, TODAY];

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
export const money = (n) => `$${Number(n).toLocaleString("en-US")}`;
export const urls = []; // [path, lastmod]
export function write(path, html) {
  const file = join(OUT, path === "/" ? "index.html" : path.endsWith("/") ? path + "index.html" : path + (path.includes(".") ? "" : "/index.html"));
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html);
  if (path !== "/" && !path.endsWith("/") && !path.includes(".")) writeFileSync(join(OUT, path + ".html"), html);
}

const rel = (h) => (/^https?:/.test(h) ? ' rel="noopener"' : "");
/** <title> rule: at most 60 characters, " | FMYCAR" appended when it fits (same rule as fmycar.com). */
export function fitTitle(t) {
  const SUF = " | FMYCAR", MAX = 60;
  let base = String(t).replace(/\s*\|\s*FMYCAR\s*$/, "").trim();
  if (base.length > MAX) { const cut = Math.max(base.lastIndexOf(": ", MAX), base.lastIndexOf(" — ", MAX), base.lastIndexOf(", ", MAX)); base = (cut > 20 ? base.slice(0, cut) : base.slice(0, MAX).replace(/\s+\S*$/, "")).replace(/[\s:,–—-]+$/, ""); }
  if (/FMYCAR/.test(base)) return base;
  return base.length + SUF.length <= MAX ? base + SUF : base;
}
export function fitDesc(d) {
  const s = String(d).replace(/\s+/g, " ").trim(); if (s.length <= 160) return s;
  const cut = s.lastIndexOf(". ", 156); return cut > 80 ? s.slice(0, cut + 1) : s.slice(0, 157).replace(/\s+\S*$/, "") + "…";
}

// ── the shared FMYCAR header and footer (2026-11-06): the same items, order and social links on fmycar.com, cars.fmycar.com,
// app.fmycar.com and here. Two things differ on this site, on purpose: the primary button is "List your dealership" and the
// sign-in link is the dealer sign-in. The dealer pages (how it works, pricing, directory) sit in a sub-nav under the header.
export const LABEL = { cars: "Find My Car", sellCar: "Sell My Car", help: "FMYCAR My Deal", learn: "Learn", guides: "Car buying guides", hub: "Consumer Insider",
  tools: "Calculators", glossary: "Glossary", first: "First-time buyer guide", seniors: "Seniors & families guide", laughs: "The FML Files",
  review: "Deal Review", full: "Full Concierge", compare: "Compare both", start: "Start free", pricing: "Pricing" };
export const NAV_GROUPS = {
  help: { label: LABEL.help, href: HOME + "/buy", id: "nav-help", items: [
    [LABEL.review + " · $" + PRICE.review, HOME + "/buy#review", "A human-reviewed report on the dealer’s numbers before you sign"],
    [LABEL.full + " · $" + PRICE.full, HOME + "/buy#full", "Help through the whole thing: buying, selling, trading or leasing"],
    [LABEL.compare, HOME + "/buy", "What each includes, what it costs, what it doesn’t promise"],
    [LABEL.start, HOME + "/start", "Tell us what you’re trying to do. No card"] ] },
  learn: { label: LABEL.learn, href: HOME + "/guides/", id: "nav-learn", items: [
    [LABEL.guides, HOME + "/guides/", "Long guides from the dealership side of the desk"],
    [LABEL.hub, HOME + "/hub/", "Short reads on every car-deal topic, free"],
    [LABEL.tools, HOME + "/tools/", "Out-the-door, loan, lease, trade equity and more"],
    [LABEL.glossary, HOME + "/glossary/", "Dealer and finance terms in plain English"] ] },
};
export const NAV = [[LABEL.cars, CARS + "/"], "help", [LABEL.sellCar, HOME + "/sell-your-car/"], "learn"];
/** The dealer pages: a sub-nav under the shared header, and the first group of the phone menu. */
export const DEALER_NAV = [["How it works", "/how-it-works/"], ["Pricing", "/pricing/"], ["Dealer directory", DIRECTORY], ["List your dealership", SIGNUP], ["Dealer sign in", APP + "/"]];
const SIGNIN = APP + "/";
const CHEVRON = `<svg class="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const cur = (h, path) => (h === path ? ' aria-current="page"' : "");
const mainNav = (path) => `<nav class="mainnav" aria-label="Main"><ul class="nav-list">${NAV.map((x) => {
  if (typeof x !== "string") { const [n, h] = x; return `<li><a class="nav-a" href="${h}"${rel(h)}>${esc(n)}</a></li>`; }
  const g = NAV_GROUPS[x];
  return `<li class="dd" data-dd><a class="nav-a dd-a" href="${g.href}" rel="noopener">${esc(g.label)}</a><button type="button" class="dd-btn" aria-expanded="false" aria-controls="${g.id}" data-dd-btn><span class="sr">${esc(g.label)}: show menu</span>${CHEVRON}</button>
<div class="dd-panel dd-one" id="${g.id}" data-dd-panel><div class="dd-sec"><ul>${g.items.map(([n, h, d]) => `<li><a href="${h}" rel="noopener"><b>${esc(n)}</b><span>${esc(d)}</span></a></li>`).join("")}</ul></div></div></li>`;
}).join("")}</ul></nav>`;
const drawer = (path) => `<div class="drawer" id="menu" data-drawer role="dialog" aria-modal="true" aria-labelledby="menu-title">
<div class="drawer-head"><p class="logo" id="menu-title">FMY<span>CAR</span><span class="sr"> menu</span></p><a class="drawer-x" href="#" role="button" data-drawer-close aria-label="Close menu"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></a></div>
<nav class="drawer-nav" aria-label="Menu">
<p class="drawer-h" id="nav-dealers-m">For dealerships</p><ul class="drawer-list drawer-main" aria-labelledby="nav-dealers-m">${DEALER_NAV.map(([n, h]) => `<li><a href="${h}"${rel(h)}${cur(h, path)}>${esc(n)}</a></li>`).join("")}</ul>
<p class="drawer-h" id="nav-shop-m">For shoppers</p><ul class="drawer-list" aria-labelledby="nav-shop-m">${NAV.filter((x) => typeof x !== "string").map(([n, h]) => `<li><a href="${h}"${rel(h)}>${esc(n)}</a></li>`).join("")}</ul>
${Object.values(NAV_GROUPS).map((g) => `<p class="drawer-h" id="${g.id}-m">${esc(g.label)}</p><ul class="drawer-list" aria-labelledby="${g.id}-m">${g.items.map(([n, h]) => `<li><a href="${h}" rel="noopener">${esc(n)}</a></li>`).join("")}</ul>`).join("\n")}
</nav>
<div class="drawer-foot"><a class="btn" href="${SIGNUP}" data-track="cta-drawer-signup">List your dealership</a><p class="start-def">${esc(BRAND.line)}</p></div>
</div>`;
const subNav = (path) => `<nav class="subnav" aria-label="Dealer pages"><div class="wrap"><span class="subnav-k">For dealerships</span>${DEALER_NAV.filter(([, h]) => h !== SIGNUP).map(([n, h]) => `<a href="${h}"${rel(h)}${cur(h, path)}>${esc(n)}</a>`).join("")}</div></nav>`;
const header = (path, focus) => focus
  ? `<header class="top focus"><div class="wrap row"><a class="logo" href="/" aria-label="FMYCAR for dealers, home">FMY<span>CAR</span></a><span class="focus-tag">For dealers</span>
<div class="topcta"><a class="focus-call" href="tel:${PHONE_TEL}" data-track="focus-call"><span>Questions?</span> ${PHONE}</a><a class="btn sm" href="${SIGNUP}" data-track="nav-signup">List your dealership</a></div></div></header>`
  : `<header class="top"><div class="wrap row"><a class="logo" href="/" aria-label="FMYCAR for dealers, home">FMY<span>CAR</span></a>
${mainNav(path)}
<div class="topcta"><a class="login" href="${SIGNIN}" rel="noopener">Dealer sign in</a><a class="btn sm" href="${SIGNUP}"${cur(SIGNUP, path)} data-track="nav-signup">List your dealership</a></div>
<a class="burger" href="#menu" role="button" data-burger aria-controls="menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Menu</span></a></div>
${drawer(path)}</header>${subNav(path)}`;
const footLinks = (h, items) => `<div><p class="foot-h">${esc(h)}</p><ul class="foot-list">${items.map(([n, u]) => `<li><a href="${u}"${rel(u)}>${esc(n)}</a></li>`).join("")}</ul></div>`;
/** The shared footer columns (same on every FMYCAR site). */
export const FOOT_COLS = [
  [LABEL.help, [[LABEL.review, HOME + "/buy#review"], [LABEL.full, HOME + "/buy#full"], [LABEL.compare, HOME + "/buy"], [LABEL.start, HOME + "/start"], [LABEL.pricing, HOME + "/pricing/"], ["Refunds & cancellations", HOME + "/refunds"]]],
  [LABEL.cars, [["All cars", CARS + "/"], ["By owner", CARS + "/by-owner/"], ["Makes", CARS + "/makes/"], ["Cities", CARS + "/cities/"], ["Recently sold", CARS + "/sold/"], [LABEL.sellCar, HOME + "/sell-your-car/"]]],
  [LABEL.learn, [[LABEL.guides, HOME + "/guides/"], [LABEL.hub, HOME + "/hub/"], [LABEL.tools, HOME + "/tools/"], [LABEL.glossary, HOME + "/glossary/"], [LABEL.first, HOME + "/first-time-car-buyer"], [LABEL.seniors, HOME + "/car-buying-help-for-seniors"], [LABEL.laughs, HOME + "/laughs/"]]],
  ["For dealerships", [["For dealerships", "/"], ["List your dealership", SIGNUP], ["Dealer pricing", "/pricing/"], ["How dealer listings work", "/how-it-works/"], ["Dealer directory", DIRECTORY], ["Dealer sign in", APP + "/"]]],
  ["Company", [["About", HOME + "/about"], ["Press & facts", HOME + "/press"], ["CarSalesSoftware affiliation", HOME + "/about#affiliation"], ["Careers", HOME + "/careers"], ["Contact", "/contact/"], ["Privacy", HOME + "/privacy"], ["Terms", HOME + "/terms"]]],
];

/** The page shell. Same parameters as fmycar.com's page() so ported content works unchanged; `photo` is ignored (no photo library here). */
export function page({ path, title, desc, body, schema = [], image, noindex = false, crumbs, ogType = "website", lastmod = TODAY, speak = ["h1", ".lede"], kicker = "FMYCAR for dealers", ogTitle, shareTitle, shareDesc, focus = false }) {
  title = fitTitle(title); desc = fitDesc(desc);
  const url = SITE + path;
  const socialTitle = shareTitle || ogTitle || title, socialDesc = shareDesc || desc, og = image || LOGO;
  const schemas = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: title, description: desc, inLanguage: "en-US", dateModified: lastmod,
    isPartOf: { "@type": "WebSite", "@id": `${SITE}/#site`, name: "FMYCAR for dealers", url: SITE + "/", publisher: { "@id": ORG_ID } }, publisher: { "@id": ORG_ID }, about: { "@id": ORG_ID },
    speakable: { "@type": "SpeakableSpecification", cssSelector: speak } }, ...schema];
  if (path === "/") schemas.push({ "@context": "https://schema.org", ...ORG });
  if (crumbs && crumbs.length > 1) schemas.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: SITE + (p || "/") })) });
  if (!noindex) urls.push([path, lastmod]);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<meta name="google-site-verification" content="${GSC}">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="FMYCAR"><meta property="og:locale" content="en_US"><meta property="og:title" content="${esc(socialTitle)}"><meta property="og:description" content="${esc(socialDesc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${esc(og)}"><meta property="og:image:alt" content="FMYCAR">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(socialTitle)}"><meta name="twitter:description" content="${esc(socialDesc)}"><meta name="twitter:image" content="${esc(og)}"><meta name="theme-color" content="#B50000">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="sitemap" type="application/xml" href="/sitemap.xml"><link rel="stylesheet" href="${assetUrl("/assets/site.css")}"><script>document.documentElement.classList.add("js")</script>
${schemas.map(ld).join("")}
</head><body>
<a class="skip" href="#main">Skip to content</a>
${header(path, focus)}<main id="main">${crumbs && crumbs.length > 1 ? `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([n, p], i) => (i < crumbs.length - 1 ? `<a href="${p || "/"}">${esc(n)}</a>` : `<span>${esc(n)}</span>`)).join(" › ")}</nav></div>` : ""}${body}</main>
<footer class="foot"><div class="wrap">
<div class="cols">
<div><p class="logo">FMY<span>CAR</span></p><p class="tagline">${esc(BRAND.line)}</p><p>${esc(BRAND.boilerplate.short)}</p>
<p class="trust">${esc(TRUST)}</p>
<p><a href="tel:${PHONE_TEL}">${PHONE}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p><ul class="social" aria-label="FMYCAR elsewhere">${SOCIAL.map((s) => `<li><a href="${s.url}" rel="me noopener" target="_blank">${esc(s.name)}</a></li>`).join("")}</ul></div>
${FOOT_COLS.map(([h, items]) => footLinks(h, items)).join("\n")}
</div>
<p class="fine">${esc(ADVICE_LINE)} Prices, availability and details of every listing are set by the dealership or seller. © ${TODAY.slice(0, 4)} ${COMPANY.legalName}. <a href="#" onclick="window.dispatchEvent(new Event('cso:consent-open'));return false">Cookie settings</a></p>
</div></footer>
<script src="${assetUrl("/assets/app.js")}" defer></script><script src="${assetUrl("/assets/t.js")}" data-site="dealers" data-banner="1" data-ga4="G-HST3TTXRB6" defer></script>
</body></html>`;
}

// ── building blocks (same markup as fmycar.com, so static/assets/site.css styles them) ──
export const hero = ({ eyebrow, h1, lede, primary, secondary, dark = true }) => `<section class="hero${dark ? "" : " light"}"><div class="wrap"><div>
${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${h1}</h1><p class="lede">${lede}</p>
<p class="ctas">${primary ? `<a class="btn" href="${primary[1]}"${rel(String(primary[1]))}>${esc(primary[0])}</a>` : ""}${secondary ? `<a class="btn ghost" href="${secondary[1]}"${rel(String(secondary[1]))}>${esc(secondary[0])}</a>` : ""}</p>
</div></div></section>`;
export const section = (h2, inner, { lead = "", id = "", soft = false, cls = "" } = {}) => `<section class="sec${soft ? " soft" : ""}${cls ? " " + cls : ""}"${id ? ` id="${id}"` : ""}><div class="wrap">${h2 ? `<h2>${h2}</h2>` : ""}${lead ? `<p class="lead-in">${lead}</p>` : ""}${inner}</div></section>`;
export const cards = (items, cols = 4) => `<div class="cards c${cols}">${items.map(([t, d, href]) => `<div class="card"><h3>${href ? `<a class="stretch" href="${href}"${rel(href)}>${esc(t)}</a>` : esc(t)}</h3><p>${d}</p></div>`).join("")}</div>`;
export const keepReading = (items, h2 = "Keep reading", opts = {}) => section(h2, cards(items.slice(0, 3), 3), { soft: true, ...opts });
export const steps = (items) => `<ol class="steps c${Math.min(items.length, 4)}">${items.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${d}</p></li>`).join("")}</ol>`;
export const bullets = (items) => `<ul class="checks">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
export const defs = (items) => `<dl class="defs">${items.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${d}</dd>`).join("")}</dl>`;
/** FAQ: native details/summary, and the same text as FAQPage schema (search engines reject hidden answers). */
export const faq = (items, h2 = "Questions", id = "") => ({
  html: section(h2, `<div class="faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")}</div>`, { soft: true, id }),
  schema: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) },
});
/** Recurring-billing disclosure, shown next to every dealer price. The dealer authorizes the charge in the app; this site never charges a card. */
export function billingNote(amount) {
  return `<p class="bill"><b>$${amount} per month.</b> Billed monthly. Renews each month until you cancel. You authorize the charge in your ${SOFTWARE_NAME} account before it runs, and you can cancel there any time; canceling stops future renewals. No setup fee. No commission. If your inventory grows into a higher price band, we tell you first and the price changes only after you agree.</p>`;
}
/** One recurring-billing disclosure for the three prices (the amount sits on each price card). */
export function billingNoteAll() {
  return `<p class="bill"><b>${PRICE.dealer.map((t) => "$" + t.price).join(", ")} per month by vehicle count.</b> Billed monthly. Renews each month until you cancel. You authorize the charge in your ${SOFTWARE_NAME} account before it runs, and you can cancel there any time; canceling stops future renewals. No setup fee. No commission. If your inventory grows into a higher price band, we tell you first and the price changes only after you agree.</p>`;
}
/** Redirect page (GitHub Pages serves it with a 200, so: canonical + meta refresh + noindex). `keepQuery` carries ?t=… along (the verify link). */
export const redirect = (from, to, { keepQuery = false } = {}) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${to.startsWith("http") ? to : SITE + to}"><meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)}${keepQuery ? " + location.search" : ""})</script></head><body><p>This page moved to <a href="${to}">${to}</a>.</p></body></html>`;
