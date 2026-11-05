// /signup/ — the one link to send a dealership (moved here from fmycar.com/dealers/signup on 2026-11-05). Creates a regular CarSalesSoftware dealership account
// (rpc fmycar_dealer_signup → dealer_signup) with the products the dealer picks:
//   listing  = FMYCAR marketplace. The form does not charge a card. The monthly plan is authorized after inventory is counted.
//   software = CarSalesSoftware, a separate product. Optional.
//   both     = FMYCAR plus CarSalesSoftware, with sync only if the dealer opts in.
// /verify/ — the link in the confirmation email (rpc fmycar_verify_email; fmycar-onboard VERIFY_URL points here).
// Both pages are driven by /assets/dealer-signup.js. Field names are dealer_signup's keys; keep them in sync.
// Every dealer we send the link to lands here, so: the form is in the first screen, the header has no shopper offers
// (page({ focus })), and every claim is something the product does today. No invented numbers: the live-inventory line
// is read from cars.fmycar.com/listings.json at build time and left out if the feed can't be read.
import { page, section, faq, esc, CARS, HOME, assetUrl, PHONE, PHONE_TEL, EMAIL, FOUNDER, SIGNUP, VERIFY, DIRECTORY } from "../scripts/lib.mjs";

export const SIGNUP_PATH = SIGNUP;
const APP = "https://app.carsalessoftware.com";   // where the dealer signs in after sign-up
const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export const PRODUCTS = [
  // Labels and the one-line description must each fit on one line at 320px (the CSS keeps them nowrap).
  ["listing", "Listing", "From $97/mo", "Priced by car count. You approve it."],
  ["software", "Software", "Separate", "Optional. Neither needs the other."],
  ["both", "Both", "Shared if you choose", "Inventory and leads shared automatically if you choose. No duplicates."],
];

// Live marketplace size, read once per build. Rounded down so the line stays true until the next build.
let STATS = null;
export async function loadMarketStats() {
  try {
    const r = await fetch(CARS + "/listings.json", { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const list = await r.json();
    if (!Array.isArray(list) || list.length < 50) return (STATS = null);
    const states = new Set(list.map((c) => c.s).filter(Boolean)).size;
    // dealerships with a real stock on the marketplace (public on cars.fmycar.com already), biggest first
    const by = new Map();
    for (const c of list) {
      if (!c.d) continue; const x = by.get(c.d) || { name: c.d, n: 0, at: new Map() }; x.n++;
      const k = [c.c, c.s].filter(Boolean).join(", "); if (k) x.at.set(k, (x.at.get(k) || 0) + 1); by.set(c.d, x);
    }
    const dealers = [...by.values()].filter((x) => x.n >= 20).sort((a, b) => b.n - a.n).slice(0, 6)
      .map((x) => ({ name: x.name, place: [...x.at.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "" }));
    STATS = { cars: list.length >= 100 ? Math.floor(list.length / 50) * 50 : list.length, states, dealers };
  } catch (e) { console.warn(`dealer sign-up: no live stats (${e.message})`); STATS = null; }
  return STATS;
}

const f = (name, label, o = {}) => {
  const id = `ds-${name}`, req = o.req ? " required" : "";
  const ctl = o.opts
    ? `<select id="${id}" name="${name}"${req}>${o.opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</select>`
    : `<input id="${id}" name="${name}" type="${o.type || "text"}"${o.auto ? ` autocomplete="${o.auto}"` : ""}${o.ph ? ` placeholder="${esc(o.ph)}"` : ""}${o.min ? ` minlength="${o.min}"` : ""}${o.max ? ` maxlength="${o.max}"` : ""}${o.type === "tel" ? ' inputmode="tel"' : ""}${o.extra || ""}${req}>`;
  return `<div class="fm-f${o.full ? " full" : ""}"${o.hidden ? " hidden" : ""} data-f="${name}"><label for="${id}">${esc(label)}</label>${o.wrap ? o.wrap(ctl) : ctl}${o.hint || o.hintId ? `<small${o.hintId ? ` id="${o.hintId}" aria-live="polite"` : ""}>${o.hint || ""}</small>` : ""}</div>`;
};

const pick = `<fieldset class="fm-f full ds-pick"><legend>What do you want?</legend><div>${PRODUCTS.map(([v, t, d, long], i) =>
  `<label><input type="radio" name="products" value="${v}"${i === 0 ? " checked" : ""} data-desc="${esc(long)}" required><span><b>${esc(t)}</b><small>${esc(d)}</small></span></label>`).join("")}</div><p class="ds-pickdesc" data-out="pickdesc" aria-live="polite">${esc(PRODUCTS[0][3])}</p></fieldset>`;

export function signupForm() {
  const eye = (ctl) => `<div class="ds-pw">${ctl}<button type="button" class="ds-eye" data-eye aria-label="Show password" aria-pressed="false">Show</button></div>`;
  return `<div class="ds-card" id="signup-form">
<p class="ds-claim" data-out="claim" hidden></p>
<div class="ds-steps" aria-hidden="true"><span class="on" data-dot="1">1 · Dealership</span><span data-dot="2">2 · Login</span><em>About 2 min</em></div>
<form class="fm ds" data-ds="signup" novalidate>
<input name="company_fax" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
<fieldset class="ds-step" data-step="1"><legend class="sr">Step 1 of 2: your dealership</legend><div class="fm-grid">${pick}
${f("dealership_name", "Dealership name", { req: true, auto: "organization", max: 100, full: true })}
${f("website", "Website", { auto: "url", ph: "yourdealership.com", max: 200, full: true, extra: ' inputmode="url" autocapitalize="none" spellcheck="false"' })}
${f("city", "City", { req: true, auto: "address-level2", max: 60 })}
${f("state", "State", { req: true, opts: [["", "State"], ...STATES.map((s) => [s, s])] })}
${f("vehicle_count", "Vehicles in stock", { type: "number", ph: "e.g. 45", max: 6, full: true, extra: ' inputmode="numeric" min="0" max="100000" step="1"', hintId: "ds-plan", hint: "Your plan: 0–30 vehicles · $97 a month. Billed monthly after you authorize it in the app; renews until you cancel; no commission; a higher plan only after you agree." })}
</div>
<div class="fm-actions"><button class="btn ds-go" type="button" data-next data-track="dealer-signup-step1">Continue</button></div>
</fieldset>
<fieldset class="ds-step" data-step="2" hidden><legend class="sr">Step 2 of 2: your login</legend><div class="fm-grid">
${f("full_name", "Full name", { req: true, auto: "name", max: 80, full: true })}
${f("email", "Work email", { type: "email", req: true, auto: "email", max: 120, full: true, hint: "", hintId: "ds-email-tip" })}
${f("phone", "Mobile", { type: "tel", req: true, auto: "tel", max: 20 })}
${f("password", "Password", { type: "password", req: true, auto: "new-password", min: 12, max: 200, hint: "12+ characters", wrap: eye })}
${f("username", "Username", { req: true, auto: "username", max: 40, full: true, hidden: true, hint: "You sign in with this.", extra: ' autocapitalize="none" spellcheck="false"' })}
<p class="ds-user full" data-out="userline" hidden>Username: <b data-out="user"></b> · <button type="button" class="linkish" data-user-edit>Change</button></p>
</div>
<p class="fm-err" role="alert" hidden></p>
<div class="fm-actions"><button class="btn ds-go" type="submit" data-track="dealer-signup">Create my account</button></div>
<p class="ds-back"><button type="button" class="linkish" data-back>Back</button></p>
</fieldset>
<p class="fm-err" role="alert" data-err1 hidden></p>
<p class="ds-fine ds-legal">You agree to the <a href="https://carsalessoftware.com/terms" rel="noopener">Terms</a> and <a href="https://carsalessoftware.com/privacy" rel="noopener">Privacy Policy</a>.</p>
<p class="ds-fine ds-legal">Have an account? <a href="${APP}/" rel="noopener">Sign in</a></p>
</form>
<div class="ds-done" tabindex="-1" hidden>
<p class="ds-done-h">You’re in.</p>
<p class="ds-done-sub">Username: <b data-out="username"></b></p>
<ol class="ds-todo">
<li><b>Confirm your email.</b> We sent a link to <span data-out="email"></span>. <span data-out="verify"></span></li>
<li><b>Connect your inventory.</b> Sign in and connect your website or inventory provider, or upload a spreadsheet.</li>
<li><b data-out="third-h">Then you authorize the monthly price.</b> <span data-out="third"></span></li>
</ol>
<p><a class="btn ds-go" href="${APP}/" rel="noopener" data-track="dealer-signup-signin">Add my cars</a></p>
<p class="ds-fine">No email? Check spam or call <a href="tel:${PHONE_TEL}">${PHONE}</a>.</p>
</div>
</div>`;
}

const check = (t) => `<li>${t}</li>`;

export function dealerSignup() {
  const title = "Dealer Sign-Up | List Cars on FMYCAR";
  const desc = "Create a dealership account. This form does not charge a card. After inventory is counted you authorize $97, $199, or $299 a month.";
  const onNow = STATS && STATS.dealers.length >= 3 ? `<div class="ds-onnow"><p>Dealers on FMYCAR now</p><ul>${STATS.dealers.map((d) => `<li><b>${esc(d.name)}</b><small>${esc(d.place)}</small></li>`).join("")}</ul></div>` : "";
  const live = STATS ? `<p class="ds-live"><span class="dot" aria-hidden="true"></span><b>${STATS.cars}+ cars</b> live in ${STATS.states} states · <a href="${CARS}/" rel="noopener" data-track="dealer-signup-live">See them</a></p>` : "";
  const q = faq([
    ["What does it cost?", "This form does not charge a card. After you verify your email and import inventory, FMYCAR shows the vehicle count and the plan: $97 a month for 0–30 vehicles, $199 for 31–100, and $299 for 101 or more. You authorize that charge before listings publish. No commission. No setup fee. A higher plan later is charged only after you agree. CarSalesSoftware is a separate product and is not an FMYCAR charge."],
    ["How do my cars get on FMYCAR?", `Sign in and connect your inventory: your website, your inventory provider, or a spreadsheet. Your in-stock cars show on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a> and update every few hours. Sold cars come off on their own.`],
    ["Do you copy cars off my website without asking?", "No. We only import inventory from sources you own or are authorized to use, after you connect them."],
    ["Who gets the shopper’s question?", "You do. Each question comes to your store with the car attached, by email and in the app. FMYCAR does not sell the car, hold money or sit between you and the buyer."],
    ["Why do you check my email?", "So nobody can list cars under a dealership that isn’t theirs. If your email is on your dealership’s website domain, confirming it is enough. Otherwise our team checks the store first, usually within one business day."],
    ["Do I need CarSalesSoftware?", "No. FMYCAR and CarSalesSoftware are separate. Neither requires the other. If you use both, you can share inventory and leads between the two automatically so the same vehicle is not stored twice."],
    ["Can I stop?", "Yes. Turn FMYCAR publishing off in the app whenever you want, and your cars come off the marketplace."],
  ], "Questions dealers ask", "questions");

  const heroBlock = `<section class="hero ds-hero"><div class="wrap ds-split"><div class="ds-pitch">
<p class="eyebrow">Dealers · You approve the charge</p>
<h1>List your dealership.</h1>
<p class="lede">Create the account here. This form does not charge a card. After your inventory is counted, you authorize $97, $199, or $299 a month. Then listings can publish.</p></div>
${signupForm()}
<div class="ds-more"><ul class="ds-checks">${[
    "<b>$97–$299</b> a month, by car count.",
    "<b>No card</b> on this form.",
    "<b>Leads</b> go straight to you.",
    "<b>No commission.</b> No setup fee.",
  ].map(check).join("")}</ul>
${live}${onNow}</div>
</div></section>`;

  const how = section("Live in three steps", `<ol class="ds-how">
<li><span>1</span><h3>Sign up</h3><p>Two minutes, no card.</p></li>
<li><span>2</span><h3>Connect inventory</h3><p>From your website, your inventory provider, or a spreadsheet.</p></li>
<li><span>3</span><h3>Get leads</h3><p>Shoppers reach you.</p></li>
</ol>`, { id: "how" });

  const plans = section("Pick what fits", `<div class="ds-plans">
<div class="ds-plan best"><p class="ds-plan-tag">FMYCAR</p><p class="ds-plan-k">Marketplace listing</p><p class="ds-plan-p">$97–$299</p><p class="ds-plan-s">per month, by vehicle count</p><ul>${["Cars on cars.fmycar.com", "Website, spreadsheet or typed in", "Leads by email", "You approve the charge"].map(check).join("")}</ul><button type="button" class="btn" data-choose="listing">Choose listing</button></div>
<div class="ds-plan"><p class="ds-plan-k">CarSalesSoftware</p><p class="ds-plan-p">Separate</p><p class="ds-plan-s">not required</p><ul>${["Dealer software", "Not an FMYCAR charge", "Works without FMYCAR", "Optional"].map(check).join("")}</ul><button type="button" class="btn ghost" data-choose="software">Software only</button></div>
<div class="ds-plan"><p class="ds-plan-k">Both</p><p class="ds-plan-p">Shared if you choose</p><p class="ds-plan-s">no duplicate vehicles</p><ul>${["Listing plus software", "Shared only if you choose", "One vehicle record", "Either can be dropped"].map(check).join("")}</ul><button type="button" class="btn ghost" data-choose="both">Opt into both</button></div>
</div>`, { soft: true, id: "plans" });

  const cars = section("What shoppers see", `<div class="grid" data-cars></div><p class="center"><a class="btn ghost" href="${CARS}/" rel="noopener" data-track="dealer-signup-browse">Browse the marketplace</a></p>`, {
    lead: "Real cars on FMYCAR right now. Yours show the same way, with your store’s name.", id: "cars" });

  // Mirrors the real alert (carsales-desktop supabase/functions/marketplace-lead/dealer_notify.ts → alertEmail).
  // Made-up shopper (555 number, example.com), always labeled "Example".
  const leadMail = section("What a lead looks like", `<div class="ds-mail" aria-label="Example lead email">
<div class="ds-mail-top"><span class="ds-ex">Example</span><span class="ds-mail-from">FMYCAR → you</span></div>
<p class="ds-mail-subj">New FMYCAR lead: Jordan asked about the 2021 Toyota RAV4 XLE</p>
<div class="ds-mail-body"><p><b>Jordan</b> asked about the 2021 Toyota RAV4 XLE · $24,990 on cars.fmycar.com.</p>
<dl><dt>Phone</dt><dd>(555) 010-0199</dd><dt>Email</dt><dd>jordan@example.com</dd><dt>Message</dt><dd>Is it still available? Can I see it Saturday?</dd></dl>
<p>Reply fast — the shopper is expecting <b>your dealership</b> to reach out.</p>
<p class="ds-mail-btns"><span class="ds-mail-btn">Open the lead</span><span class="ds-mail-link">See the listing</span></p></div>
</div><ul class="ds-mail-notes">${["Sent to managers and salespeople", "Also in Leads in the app, car attached", "Shopper agreed to be contacted"].map(check).join("")}</ul>`, { soft: true, id: "lead" });

  const who = section("Built by car people", `<div class="ds-who"><div><p><a href="${HOME}/about" rel="noopener">${esc(FOUNDER.name)}</a> spent ${esc(FOUNDER.line.replace(/^Nearly a decade/i, "nearly a decade").replace(/\.$/, ""))}. FMYCAR and CarSalesSoftware come from that same desk: tools a dealer actually uses, with no fine print about who owns the customer.</p>
<p>Questions before you sign up? Call <a href="tel:${PHONE_TEL}" data-track="dealer-signup-call">${PHONE}</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>. A person answers.</p></div></div>`, { id: "who" });

  const final = `<section class="sec ds-final"><div class="wrap"><h2>Create the account.</h2><p class="lead-in">No card on this form. About two minutes. The monthly charge comes after your inventory is counted.</p><p><a class="btn" href="#signup-form" data-track="dealer-signup-final">Start dealer sign-up</a></p><p class="ds-fine"><a href="${CARS}/" rel="noopener">Find cars</a> · <a href="/pricing/">Pricing</a> · <a href="${DIRECTORY}">Dealer directory</a></p></div></section>`;

  const sticky = `<div class="ds-sticky" data-ds-sticky hidden><a class="btn" href="#signup-form" data-track="dealer-signup-sticky">Create my account</a></div>`;

  const body = heroBlock + how + plans + cars + leadMail + who + q.html + final + sticky + `<script src="${assetUrl("/assets/dealer-signup.js")}" defer></script>`;
  return page({
    path: SIGNUP_PATH, title, desc, body, kicker: "For dealers", photo: false, focus: "For dealers",
    ogTitle: "List your dealership on FMYCAR",
    schema: [q.schema],
  });
}

export function dealerVerify() {
  const body = `<section class="sec"><div class="wrap narrow"><div class="ds-verify" data-ds="verify" aria-live="polite">
<h1>Confirming your email…</h1><p class="lede" data-out="msg">One moment.</p>
<noscript><p>Turn on JavaScript to confirm your email, or call ${PHONE}.</p></noscript>
<p class="ctas" data-out="cta" hidden><a class="btn" href="${APP}/" rel="noopener">Sign in and add my cars</a> <a class="btn ghost" href="${CARS}/" rel="noopener">See the marketplace</a></p>
</div></div></section><script src="${assetUrl("/assets/dealer-signup.js")}" defer></script>`;
  return page({ path: VERIFY, title: "Confirm Your Dealer Email | FMYCAR", desc: "Confirm the email for your FMYCAR dealer account.", body, noindex: true, photo: false, kicker: "For dealers", focus: "For dealers" });
}
