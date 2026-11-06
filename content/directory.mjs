// Independent dealer directory (/directory/ and /directory/<state>/). Moved here from fmycar.com on 2026-11-05.
// State pages stay noindex: they exist for the claim flow, not as search landing pages (28 states have under 10 dealers).
// Public cards show name, city, state, website, phone, and a claim link.
// Emails, notes, ratings, maps, social, and inventory fields stay in data/dealers.json and are not rendered.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { page, hero, section, cards, steps, faq, keepReading, esc, dates, CARS, HOME, SITE, SIGNUP, DIRECTORY } from "../scripts/lib.mjs";

const START = SIGNUP; // the dealer sign-up (content/signup.mjs): listing, CarSalesSoftware software, or both
const REF = "fmycar-directory";
const LASTMOD = dates("data/dealers.json")[1];
const PRICING = "https://carsalessoftware.com/pricing";
const PUBLISH = "https://carsalessoftware.com/fmycar-marketplace";

export const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

const RAW = JSON.parse(readFileSync(fileURLToPath(new URL("../data/dealers.json", import.meta.url)), "utf8"));
if (!Array.isArray(RAW) || RAW.length < 400) throw new Error("data/dealers.json: expected the independent-dealer directory");

function httpUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? url : "";
  } catch { return ""; }
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./i, "").toLowerCase(); } catch { return ""; }
}
export function claimUrl(d) {
  const q = new URLSearchParams();
  q.set("name", d.dealer_name);
  if (d.website) q.set("website", d.website);
  if (d.city) q.set("city", d.city);
  if (d.state) q.set("state", d.state);
  q.set("ref", REF);
  return `${START}?${q.toString()}`;
}
const blank = claimUrl({ dealer_name: "A B", city: "", state: "TX", website: "" });
if (blank !== `${START}?name=A+B&state=TX&ref=${REF}`) throw new Error(`claimUrl dropped or kept an empty param: ${blank}`);

export const DEALERS = RAW.map((d) => {
  const state = String(d.state || "").toUpperCase();
  const website = httpUrl(d.website);
  if (!d.dealer_name || !d.city || !STATE_NAMES[state] || !website) throw new Error(`bad dealer row: ${d.dealer_name || "(no name)"}`);
  if (d.dealer_name.length > 120 || d.city.length > 60 || website.length > 200) throw new Error(`prefill field too long: ${d.dealer_name}`);
  return { ...d, state, website };
});

const byState = new Map();
for (const d of DEALERS) {
  if (!byState.has(d.state)) byState.set(d.state, []);
  byState.get(d.state).push(d);
}
export const DEALER_STATES = [...byState.keys()].sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));
const statePath = (code) => `${DIRECTORY}${code.toLowerCase()}/`;

function telHref(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length === 10) return `tel:+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `tel:+${d}`;
  return "";
}

const SHOW = 6; // cards shown per state before "Show all"
function card(d, more = false) {
  const tel = telHref(d.phone);
  const q = [d.dealer_name, d.city, d.state, STATE_NAMES[d.state], hostOf(d.website)].join(" ").toLowerCase();
  const phone = tel ? `<a class="dir-phone" href="${tel}">${esc(d.phone)}</a>` : "";
  return `<article class="dir-card${more ? " dir-more" : ""}" data-q="${esc(q)}"${more ? " hidden" : ""}>
<h3>${esc(d.dealer_name)}</h3>
<p class="dir-meta">${esc(d.city)}, ${esc(d.state)}</p>
<div class="dir-links"><a class="dir-site" href="${esc(d.website)}" rel="noopener" target="_blank">${esc(hostOf(d.website))}</a>${phone}</div>
<a class="dir-claim" href="${esc(claimUrl(d))}" data-track="dir-claim" aria-label="${esc(`Claim ${d.dealer_name}`)}">Claim →</a>
</article>`;
}

function dealerJson(d) {
  const tel = telHref(d.phone);
  return {
    "@type": "AutoDealer",
    name: d.dealer_name,
    url: d.website,
    address: { "@type": "PostalAddress", addressLocality: d.city, addressRegion: d.state, addressCountry: "US" },
    ...(tel ? { telephone: tel.replace("tel:", "") } : {}),
  };
}

const DIR_JS = `(()=>{const q=document.getElementById("dirq"),sel=document.getElementById("dirstate"),clear=document.getElementById("dirclear");if(sel)sel.addEventListener("change",()=>{const v=sel.value;if(!v)return;const path=location.pathname.replace(/\\/+$/,"")||"/";if(v.replace(/\\/+$/,"")!==path)location.href=v;});if(!q)return;const cards=[...document.querySelectorAll(".dir-card")],groups=[...document.querySelectorAll(".dir-state")],count=document.getElementById("dircount"),none=document.getElementById("dirnone"),open=new Set();const collapse=()=>{groups.forEach((g)=>{const on=open.has(g.id);g.querySelectorAll(".dir-more").forEach((c)=>{c.hidden=!on;});const b=g.querySelector(".dir-showall");if(b){b.hidden=on;}});};document.querySelectorAll(".dir-showall").forEach((b)=>{b.addEventListener("click",()=>{open.add(b.getAttribute("data-showall"));b.setAttribute("aria-expanded","true");collapse();});});const run=()=>{const v=q.value.trim().toLowerCase();let n=0;if(!v){cards.forEach((el)=>{el.hidden=false;});groups.forEach((g)=>{g.hidden=false;});collapse();if(count)count.textContent="";if(none)none.hidden=true;return;}cards.forEach((el)=>{const hit=(el.getAttribute("data-q")||"").includes(v);el.hidden=!hit;if(hit)n++;});groups.forEach((g)=>{g.hidden=!g.querySelector(".dir-card:not([hidden])");const b=g.querySelector(".dir-showall");if(b)b.hidden=true;});if(count)count.textContent=n===1?"1 match":n+" matches";if(none)none.hidden=n>0;};q.addEventListener("input",run);if(clear)clear.addEventListener("click",()=>{q.value="";q.focus();run();});try{const s=new URLSearchParams(location.search).get("q");if(s)q.value=s;}catch(e){}if(q.value)run();})();`;

function tools(current) {
  const opts = [`<option value="${DIRECTORY}"${current === DIRECTORY ? " selected" : ""}>All states</option>`]
    .concat(DEALER_STATES.map((code) => `<option value="${statePath(code)}"${current === statePath(code) ? " selected" : ""}>${esc(STATE_NAMES[code])}</option>`));
  return `<div class="dir-panel"><div class="dir-tools"><div class="gl-search dir-search"><label for="dirq">Dealership or city</label><input id="dirq" type="search" placeholder="${current === DIRECTORY ? "Name, city, or state" : "Name or city"}" autocomplete="off" spellcheck="false" enterkeyhint="search"></div>
<div class="dir-jump"><label for="dirstate">State</label><select id="dirstate">${opts.join("")}</select></div></div>
<p class="dir-status" id="dircount" aria-live="polite"></p></div>`;
}
function stateNav(current) {
  const all = `<a href="${DIRECTORY}"${current === DIRECTORY ? ' aria-current="page"' : ""}>All states</a>`;
  const rest = DEALER_STATES.map((code) => {
    const path = statePath(code);
    return `<a href="${path}"${current === path ? ' aria-current="page"' : ""}>${esc(STATE_NAMES[code])}</a>`;
  });
  return `<nav class="chips dir-states" aria-label="States">${all}${rest.join("")}</nav>`;
}
function pager(code) {
  const i = DEALER_STATES.indexOf(code);
  const prev = DEALER_STATES[i - 1];
  const next = DEALER_STATES[i + 1];
  const link = (c, cls, kicker) => c ? `<a class="${cls}" href="${statePath(c)}"><span>${kicker}</span><b>${esc(STATE_NAMES[c])}</b></a>` : `<span></span>`;
  return `<nav class="dir-pager" aria-label="Other states">${link(prev, "prev", "Previous")}<a class="dir-pager-all" href="${DIRECTORY}"><span>Directory</span><b>All states</b></a>${link(next, "next", "Next")}</nav>`;
}

function assertPublic(html, list) {
  const claims = html.match(/\/signup\/\?[^"]+/g) || [];
  if (claims.length < list.length) throw new Error(`dealer directory: expected at least ${list.length} claim links, found ${claims.length}`);
  for (const href of claims) {
    const q = new URL(href.replace(/&amp;/g, "&"), SITE).searchParams;
    if (q.get("ref") !== REF) throw new Error("dealer directory: claim link missing ref=fmycar-directory");
    if (q.has("email")) throw new Error("dealer directory: claim link includes email");
    const specific = ["name", "website", "city", "state"].some((key) => q.has(key));
    if (specific && (!String(q.get("name") || "").trim() || !String(q.get("state") || "").trim())) throw new Error("dealer directory: claim link missing name or state");
    for (const key of ["name", "website", "city", "state"]) if (q.has(key) && !String(q.get(key) || "").trim()) throw new Error(`empty ${key} on a claim link`);
  }
  // FMYCAR's own profiles sit in every footer (scripts/lib.mjs SOCIAL); the ban below is about dealers' social links, not ours.
  const lower = html.replace(/https:\/\/(www\.)?(facebook|instagram)\.com\/fmycar\/?/g, "").toLowerCase();
  const banned = ["niada", "ican public", "google.com/maps", "facebook.com", "instagram.com", "aggregaterating", "reviewcount", "google reviews", "cars listed publicly", "dir-inv", "dir-flag", "not in stock", "inventory_count", "google_rating", "marketplace_listings"];
  for (const b of banned) if (lower.includes(b)) throw new Error(`dealer directory rendered forbidden text: ${b}`);
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  for (const b of ["ref=", "niada", "scrape", " csv", "rpc", "integrations", "sync cadence"]) if (visible.includes(b)) throw new Error(`dealer directory visible copy contains ${b.trim()}`);
  const publicUrls = new Set(DEALERS.map((d) => d.website.toLowerCase()));
  for (const d of DEALERS) {
    if (d.email && lower.includes(String(d.email).toLowerCase())) throw new Error(`dealer email rendered for ${d.dealer_name}`);
    for (const key of ["facebook_url", "google_maps_url", "other_social"]) {
      const v = String(d[key] || "").trim();
      if (v.length > 8 && lower.includes(v.toLowerCase())) throw new Error(`${key} rendered for ${d.dealer_name}`);
    }
    for (const key of ["inventory_source_url", "source_url"]) {
      const v = String(d[key] || "").trim().toLowerCase();
      // A research URL may match another store’s public website. Only a URL we never show as a website is a leak.
      if (!v || publicUrls.has(v) || [...publicUrls].some((u) => u.includes(v))) continue;
      if (lower.includes(v)) throw new Error(`${key} rendered for ${d.dealer_name}`);
    }
    const note = String(d.notes || "").trim().toLowerCase();
    if (note && lower.includes(note)) throw new Error(`notes rendered for ${d.dealer_name}`);
  }
  for (const d of list) if (!html.includes(esc(claimUrl(d)))) throw new Error(`claim link missing for ${d.dealer_name}`);
  if (!html.includes(">Claim →<")) throw new Error("dealer directory: claim link missing");
}

const trial = `${START}?ref=${REF}`;
const more = [
  ["What dealerships get", "Your cars on cars.fmycar.com, leads straight to you, no commission.", "/"],
  ["Pricing", "$97, $199 or $299 a month by vehicle count. No commission. No setup fee.", "/pricing/"],
  ["Contact", "A question before you sign up. A person answers.", "/contact/"],
];

function fit(kind, title, desc) {
  if (title.length > 65) throw new Error(`${kind} title ${title.length}: ${title}`);
  if (desc.length > 155) throw new Error(`${kind} desc ${desc.length}: ${desc}`);
}

function shopperPaths() {
  return cards([
    ["Shopping for a car?", `This page lists dealerships. Cars for sale, with prices and photos, are on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a>. The <a href="${HOME}/guides/" rel="noopener">car buying guides</a> are free.`],
    ["Don’t see your store?", `<a href="${trial}" data-track="dir-trial">Sign up</a> and enter it yourself, or <a href="/contact/">contact us</a> and we’ll help you find the right page.`],
  ], 2);
}

function claimBlock() {
  return steps([
    ["Your store, filled in", "The sign-up opens with this dealership’s name, website, city, and state. FMYCAR and CarSalesSoftware are separate. You can list here without the software."],
    ["You see the price before a charge", "Dealership listings are $97, $199, or $299 a month by vehicle count. This step does not charge a card. A higher plan later needs your explicit consent."],
    ["Listings publish after you approve the charge", `A card on this directory does not publish vehicles. After you confirm your email, import inventory, and authorize the monthly price, in-stock cars can show on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a>.`],
  ]) + `<p class="ctas"><a class="btn" href="${trial}" data-track="dir-trial">Sign up your dealership</a> <a class="btn ghost" href="/pricing/#plans">Dealer pricing</a></p><p><a href="https://carsalessoftware.com/" rel="noopener">CarSalesSoftware</a> is a separate product. <a href="${PUBLISH}" rel="noopener">How cars show up for shoppers</a> if you opt in. <a href="${PRICING}" rel="noopener">CarSalesSoftware pricing</a> is not an FMYCAR charge.</p>`;
}

function directoryBlock(list, current) {
  const grouped = current === DIRECTORY;
  const code = grouped ? "" : current.slice(current.lastIndexOf("/") + 1).toUpperCase();
  const body = grouped
    ? DEALER_STATES.map((st) => { const list = byState.get(st), id = st.toLowerCase(); return `<div class="dir-state" id="${id}"><h3><a href="${statePath(st)}">${esc(STATE_NAMES[st])}</a><small>${list.length} dealership${list.length === 1 ? "" : "s"}</small></h3><div class="dir-grid">${list.map((d, i) => card(d, i >= SHOW)).join("")}</div>${list.length > SHOW ? `<button type="button" class="dir-showall" data-showall="${id}" aria-expanded="false" aria-controls="${id}">Show all ${list.length} in ${esc(STATE_NAMES[st])}</button>` : ""}</div>`; }).join("")
    : `<div class="dir-grid">${list.map(card).join("")}</div>${pager(code)}`;
  return `${tools(current)}${stateNav(current)}<div class="dir-all">${body}</div><div class="dir-empty" id="dirnone" hidden><h3>No match</h3><p>Try a shorter name, or a city. You can also sign up and enter your store.</p><p class="ctas"><button type="button" class="btn ghost" id="dirclear">Clear search</button><a class="btn" href="${esc(trial)}" data-track="dir-trial">Sign up your dealership</a></p></div><script>${DIR_JS}</script>`;
}

const lede = (place) => `${place} Your name, website, city, and state are filled in. <a href="${CARS}/" rel="noopener">Shopping for a car?</a> Live listings are on cars.fmycar.com.`;

export function dealersIndex() {
  const title = "Claim Your Independent Dealership | FMYCAR";
  const desc = "Find your dealership and claim it. FMYCAR listings are $97 to $299 a month by vehicle count. Your name, city, and state come filled in.";
  fit("dealers", title, desc);
  const f = faq([
    ["Are these cars for sale?", `No. Each card is a dealership: the name, the city, the website, and the phone number when it is listed. Cars for sale, with prices and photos, are on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a>, and only from stores that choose to publish them.`],
    ["How do I claim my dealership?", "Choose “Claim” on your card. The sign-up opens with your dealership name, website, city, and state filled in. This step does not charge a card. After inventory is counted, you authorize $97, $199, or $299 a month."],
    ["What does it cost to show my cars?", "$97 a month for up to 30 vehicles, $199 for 31–100, and $299 for 101 or more. No commission and no setup fee. A higher plan is charged only after you agree. A card on this page does not publish cars by itself."],
    ["Who receives a shopper’s question?", "When one of your cars is published, the shopper’s question comes to your store by email and in CarSalesSoftware, tied to that car."],
    ["How do published cars stay current?", "They follow the cars you have in CarSalesSoftware and update every few hours. A sold car comes off the listings. Nothing moves from this directory onto the marketplace on its own."],
    ["I can’t find my dealership.", `<a href="${trial}">Sign up</a> and enter your store, or <a href="/contact/">contact us</a> and we’ll help.`],
  ], "Questions", "questions");
  const body = hero({
    eyebrow: "For independent dealers",
    h1: "Claim your dealership.",
    lede: lede("Find your store and claim it."),
    primary: ["List your dealership", trial],
    secondary: ["Find your store", "#directory"],
  })
    + section("Find your dealership", directoryBlock(DEALERS, DIRECTORY), {
      id: "directory",
      soft: true,
      lead: "Type your name or city, or pick a state. Each state shows its first six stores; Show all opens the rest. Claim the card that is yours.",
    })
    + section("What happens when you claim", claimBlock(), {
      id: "claim",
      lead: "Claiming sets up your dealer account. Your cars show on FMYCAR after you confirm your email and connect inventory.",
    })
    + section("Shopping, or not on the list?", shopperPaths(), { soft: true })
    + f.html
    + keepReading(more);
  const html = page({
    path: DIRECTORY,
    title,
    desc,
    body,
    crumbs: [["For dealers", "/"], ["Dealer directory", DIRECTORY]],
    kicker: "For dealers",
    lastmod: LASTMOD,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Independent dealer directory",
        url: SITE + DIRECTORY,
        description: desc,
        mainEntity: {
          "@type": "ItemList",
          name: "Dealers by state",
          numberOfItems: DEALER_STATES.length,
          itemListElement: DEALER_STATES.map((code, i) => ({ "@type": "ListItem", position: i + 1, name: STATE_NAMES[code], url: `${SITE}${statePath(code)}` })),
        },
      },
      f.schema,
    ],
  });
  assertPublic(html, DEALERS);
  return html;
}

export function dealerStatePages() {
  return DEALER_STATES.map((code) => {
    const name = STATE_NAMES[code];
    const list = byState.get(code);
    const path = statePath(code);
    const title = `Claim a Dealership in ${name} | FMYCAR`;
    const desc = `Find your dealership in ${name} and claim it. FMYCAR listings are $97–$299 a month by vehicle count.`;
    fit(name, title, desc);
    const body = hero({
      eyebrow: name,
      h1: `Claim your dealership in ${name}.`,
      lede: lede(`Find your store in ${name} and claim it.`),
      primary: ["List your dealership", trial],
      secondary: ["Find your store", "#directory"],
    })
      + section(`Dealerships in ${name}`, directoryBlock(list, path), {
        id: "directory",
        soft: true,
        lead: "Search by name or city, or switch states. Claim the card that is yours.",
      })
      + section("What happens when you claim", claimBlock() + `<p class="fine"><a href="${DIRECTORY}#questions">Questions about claiming</a> · <a href="${HOME}/about" rel="noopener">About FMYCAR</a></p>`, { id: "claim", lead: "The button on your card opens the sign-up with that store filled in." })
      + section("Shopping, or not on the list?", shopperPaths(), { soft: true })
      + keepReading(more);
    const html = page({
      path,
      title,
      desc,
      body,
      noindex: true,
      crumbs: [["For dealers", "/"], ["Dealer directory", DIRECTORY], [name, path]],
      kicker: "For dealers",
      lastmod: LASTMOD,
      schema: [{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Independent dealers in ${name}`,
        numberOfItems: list.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: list.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: dealerJson(d) })),
      }],
    });
    assertPublic(html, list);
    return { path, name, html };
  });
}
