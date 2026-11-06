// Pricing, how it works, contact and the not-found page for dealers.fmycar.com.
import { page, hero, section, cards, steps, bullets, defs, faq, esc, billingNoteAll, CARS, HOME, APP, SIGNUP, DIRECTORY, PRICE, PLAN_CONSENT, AFFILIATION, SOFTWARE_NAME, PHONE, PHONE_TEL, EMAIL } from "../scripts/lib.mjs";
import { DEALER_FAQ, offersSchema } from "./home.mjs";

/** One card per price: the vehicle band, the amount, what every plan includes, one button. The first card is the usual start. */
const planCard = (t, i) => `<div class="plan${i === 0 ? " featured" : ""}"><p class="kicker">${i === 0 ? "Most dealerships start here" : "Dealership listing"}</p><h3>${esc(t.name)}</h3><p class="price"><b>$${t.price}</b><span> per month</span></p>${bullets(["Your in-stock cars on cars.fmycar.com", "Every shopper question emailed to the store", "A public dealership page", "Inventory that updates on its own, every few hours"])}<p class="ctas"><a class="btn${i === 0 ? "" : " ghost"}" href="${SIGNUP}" data-track="pricing-signup-${t.key}">List your dealership</a></p></div>`;

export function pricing() {
  const f = faq([
    ["Are there commissions or setup fees?", "No. A dealership pays the monthly listing price only. FMYCAR earns nothing when a car sells, whatever it sells for."],
    ["Who authorizes the charge?", `You do, in your ${SOFTWARE_NAME} account, after FMYCAR shows the vehicle count and the plan. The amount is the number in the table, the interval is monthly, and the plan renews until you cancel. Nothing is charged before you authorize it.`],
    ["How is the vehicle count decided?", "FMYCAR counts the vehicles that can list: in stock, with a price above zero and at least two photos, each VIN once. The count is checked daily."],
    ["Can inventory growth raise our price automatically?", PLAN_CONSENT],
    ["How do we cancel?", `From your ${SOFTWARE_NAME} account (Manage billing), or by email to ${EMAIL} before the next renewal. Canceling stops future renewals; your cars come off cars.fmycar.com at the end of the paid month. Monthly fees already charged are not prorated.`],
    ["What do shoppers and private sellers pay?", `Shoppers pay nothing. Private sellers list for $${PRICE.seller} a month. Buyers who want a person to check a deal can pay for a $${PRICE.review} Deal Review or a $${PRICE.full} Full Concierge. Every price is on <a href="${HOME}/pricing/" rel="noopener">fmycar.com/pricing</a>.`],
  ], "Questions about the price", "questions");
  const body = hero({ eyebrow: "Dealer pricing · no commissions · no setup fees", h1: "Three prices. One rule: the more cars you list, the higher the plan.", dark: false,
    lede: "A dealership pays a flat monthly listing price by vehicle count, authorized by the dealership before anything publishes. That is the only money between a dealership and FMYCAR.",
    primary: ["List your dealership", SIGNUP], secondary: ["How it works", "/how-it-works/"] })
    + section("Monthly price by inventory", `<div class="plans">${PRICE.dealer.map(planCard).join("")}</div>${billingNoteAll()}`, { id: "plans", lead: "The plan is the number of vehicles you have listed, not a feature bundle. Every plan includes the same things." })
    + section("If your inventory grows", `<p>${esc(PLAN_CONSENT)}</p><p>If it shrinks, tell us and we move you down from the next invoice. FMYCAR never changes a price on its own, in either direction.</p>`, { soft: true, id: "growth" })
    + section("What the price does not include", bullets([
      `${SOFTWARE_NAME}, the dealer management software, is a separate product with its own price. You can list on FMYCAR without it.`,
      "Nothing per lead, nothing per sale, nothing at sign-up.",
      "No placement fees: no dealership can pay to rank higher or to be recommended, and a dealership's fee never affects what a Deal Review says about its paperwork.",
    ]), { id: "not-included" })
    + section("FMYCAR and CarSalesSoftware", `<p>${AFFILIATION}</p>`, { soft: true, id: "affiliation" })
    + f.html;
  return page({ path: "/pricing/", title: "Dealer Pricing: $97, $199 or $299 a Month | FMYCAR", desc: "FMYCAR dealership listing is $97 a month for 0–30 vehicles, $199 for 31–100 and $299 for 101 or more. No commission, no setup fee, authorized by you.",
    body, crumbs: [["For dealers", "/"], ["Pricing", "/pricing/"]], kicker: "Dealer pricing", schema: [f.schema, offersSchema()] });
}

export function howItWorks() {
  const f = faq(DEALER_FAQ, "Questions dealers ask", "questions");
  const body = hero({ eyebrow: "How it works", h1: "From sign-up to live listings in four steps.", dark: false,
    lede: "Nothing publishes until you have confirmed your email, connected your inventory and approved the monthly price. Here is each step, what it needs from you, and how long it takes.",
    primary: ["List your dealership", SIGNUP], secondary: ["Pricing", "/pricing/"] })
    + section("The four steps", steps([
      ["Sign up (two minutes)", `Dealership name, website, city and state, then the person who will sign in. No card. <a href="${SIGNUP}">The form is here.</a>`],
      ["Confirm your work email", "We email a link. If your address is on your dealership's website domain, confirming it is enough. Otherwise our team checks the store first, usually within one business day. This keeps anyone from listing cars under a dealership that is not theirs."],
      ["Connect your inventory", `Sign in to your ${SOFTWARE_NAME} account and connect your website or inventory provider, or upload a spreadsheet, or type vehicles in. FMYCAR reads it every few hours from then on.`],
      ["Approve the price, then you are live", "FMYCAR shows how many vehicles can list and the matching plan ($97, $199 or $299). You authorize the monthly charge. Your cars appear on cars.fmycar.com within four hours."],
    ]), { id: "steps" })
    + section("Which cars list", defs([
      ["In stock", "Status Available. Pending, hold, wholesale and sold units do not list."],
      ["Priced", "A price above zero. Call-for-price cars do not list."],
      ["Two or more photos", "Shoppers skip cars without photos, so FMYCAR does too."],
      ["Each VIN once", "A duplicate VIN counts once and the second copy is flagged in your import status."],
    ]), { soft: true, id: "rules", lead: "The vehicle count that sets your plan is the number of cars that meet all four. It is checked daily." })
    + section("What a lead looks like", `<p>A shopper fills in the message form on one of your cars (name, phone or email, a message) and ticks a box agreeing to be contacted by you and by FMYCAR. Within a minute your store gets an email with the car, the shopper's details and the message, and the lead appears in your app with the car attached. FMYCAR keeps a copy. You reply to the shopper directly; FMYCAR does not sit in the middle.</p><p>A shopper can also ask FMYCAR for a car like one that already sold; those requests come to FMYCAR, not to a dealership.</p>`, { id: "leads" })
    + section("What happens on its own", bullets([
      "Price changes on your side show on FMYCAR at the next update, within four hours.",
      "A sold or removed car comes off cars.fmycar.com; its page stays up for a while as a sold notice that points shoppers to similar cars.",
      "An update that fails or arrives late does not delete anything. The last good listings stay up until the next good update.",
      "Your vehicle count is checked daily. If it sits in a higher band for seven days in a row, we email you about the higher plan; nothing changes until you agree.",
    ]), { soft: true, id: "automatic" })
    + section("Where you manage it", `<p>Everything a dealership does after sign-up happens in its ${SOFTWARE_NAME} account at <a href="${APP}/" rel="noopener">app.carsalessoftware.com</a>: connect inventory, see leads, authorize or cancel the listing plan, update the card. FMYCAR and ${SOFTWARE_NAME} are separate products; the listing plan is the only FMYCAR charge.</p>`, { id: "manage" })
    + f.html
    + section("Ready?", `<p class="ctas"><a class="btn" href="${SIGNUP}" data-track="how-signup">List your dealership</a> <a class="btn ghost" href="${DIRECTORY}">Find your store in the directory</a></p><p class="fine">Questions first? Call <a href="tel:${PHONE_TEL}">${PHONE}</a>.</p>`, { cls: "next-step" });
  return page({ path: "/how-it-works/", title: "How Dealer Listings Work on FMYCAR", desc: "Sign up, confirm your email, connect your inventory, approve the monthly price: your cars are live on cars.fmycar.com within four hours. Which cars list, what a lead looks like, what updates on its own.",
    body, crumbs: [["For dealers", "/"], ["How it works", "/how-it-works/"]], kicker: "How it works", schema: [f.schema] });
}

export function contact() {
  const body = hero({ eyebrow: "Contact · dealers", h1: "A person answers.", dark: false,
    lede: "Questions before you sign up, help connecting inventory, or anything about your listing plan.",
    primary: [`Call ${PHONE}`, `tel:${PHONE_TEL}`], secondary: ["Email " + EMAIL, `mailto:${EMAIL}`] })
    + section("Before you call", cards([
      ["Signing up", `The sign-up takes two minutes and does not charge a card. <a href="${SIGNUP}">Start here.</a>`],
      ["Inventory and leads", `Both live in your ${SOFTWARE_NAME} account. <a href="${APP}/" rel="noopener">Sign in</a>, or call us and we will walk through it with you.`],
      ["Billing", `The listing plan is authorized, changed and canceled in your ${SOFTWARE_NAME} account under Manage billing. Email us before the next renewal if you prefer; the next charge will not run.`],
    ], 3), { soft: true })
    + section("Not a dealership?", `<p>Shoppers, private sellers and anyone with a question about a car deal: <a href="${HOME}/contact" rel="noopener">fmycar.com/contact</a> has the form. Cars for sale are on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a>.</p>`);
  return page({ path: "/contact/", title: "Contact FMYCAR for Dealers", desc: `Questions about listing your dealership on FMYCAR: call ${PHONE} or email ${EMAIL}. A person answers.`,
    body, crumbs: [["For dealers", "/"], ["Contact", "/contact/"]], kicker: "Contact", schema: [{ "@context": "https://schema.org", "@type": "ContactPage", url: "https://dealers.fmycar.com/contact/", name: "Contact FMYCAR for dealers" }] });
}

export const notFound = () => page({ path: "/404.html", title: "Page not found | FMYCAR", desc: "That page isn’t here.", noindex: true,
  body: hero({ eyebrow: "Not found", h1: "That page isn’t here.", lede: "The dealer site moved to its own home in November 2026, and a few old links did not come along.", primary: ["Start at the beginning", "/"], secondary: ["Pricing", "/pricing/"] }) });
