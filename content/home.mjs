// dealers.fmycar.com home: what a dealership gets, what it costs, how it starts. Every claim is something the product does today.
import { page, hero, section, cards, steps, bullets, faq, esc, billingNoteAll, CARS, HOME, SITE, SIGNUP, DIRECTORY, PRICE, PLAN_CONSENT, AFFILIATION, ADVICE_LINE, SOFTWARE_NAME, SOFTWARE_URL, PHONE, PHONE_TEL, EMAIL } from "../scripts/lib.mjs";
import { DEALERS } from "./directory.mjs";
import { marketStats } from "./signup.mjs";

/** An example of the email a store gets (made-up shopper and car, labelled as such). The real one has the same fields. */
const leadExample = () => `<div class="lead-card" aria-label="Example lead"><p class="lead-tag">Example lead · made-up details</p><p class="lead-subj">New lead: 2019 Honda CR-V EX · $18,990</p><p class="lead-meta">Arrived 11:42 am · by email and in your app, with the car attached</p><p class="lead-msg">“Hi, is this still available? I’d like to see it Saturday morning. Does it come with a second key?”</p><dl><dt>Name</dt><dd>Alex R.</dd><dt>Email</dt><dd>alex@example.com</dd><dt>Consent</dt><dd>Agreed to be contacted by you and by FMYCAR</dd></dl></div>`;

export function offersSchema() {
  return {
    "@context": "https://schema.org", "@type": "OfferCatalog", name: "FMYCAR dealership listing",
    itemListElement: PRICE.dealer.map((t) => ({
      "@type": "Offer", name: `Dealership listing, ${t.name}`, price: String(t.price), priceCurrency: "USD", url: SITE + "/pricing/",
      availability: "https://schema.org/InStock",
      description: `$${t.price} per month for a dealership with ${t.name.toLowerCase()} listed. Renews until cancelled. The dealership authorizes each charge. No setup fee. No commission.`,
      priceSpecification: { "@type": "UnitPriceSpecification", price: String(t.price), priceCurrency: "USD", billingDuration: "P1M", unitText: "month" },
    })),
  };
}

export const DEALER_FAQ = [
  ["What does a dealership pay?", "$97 a month for 0–30 vehicles, $199 for 31–100, and $299 for 101 or more. No setup fee. No commission on the sale."],
  ["When is the card charged?", `After the account, the business details, email verification and the inventory connection. FMYCAR shows the vehicle count and the plan. Listings publish after you authorize that monthly charge in your ${SOFTWARE_NAME} account. This website does not run the charge.`],
  ["What if we add cars later?", PLAN_CONSENT],
  ["How do my cars get on FMYCAR?", `Sign in and connect your inventory: your website, your inventory provider, or a spreadsheet. Your in-stock cars show on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a> and update every few hours. Sold cars come off on their own.`],
  ["What if an update fails?", "A failed or delayed update does not delete listings. Price and sold updates apply at the next automatic update. Duplicate VINs are flagged, and you get a validation report and an import status."],
  ["Does FMYCAR send us a number of leads?", "No promise of a number. FMYCAR is a listing marketplace: your inventory, more exposure, and every inquiry on your cars emailed to the store. How many shoppers write depends on your cars and your prices."],
  ["Who gets the shopper’s question?", "You do. Each question comes to your store with the car attached, by email and in the app. FMYCAR does not sell the car, hold money or sit between you and the buyer."],
  ["Do we have to use CarSalesSoftware?", `No. ${AFFILIATION.replace(/<[^>]+>/g, "")}`],
  ["Can we stop?", "Yes. Cancel the listing plan in your account any time; canceling stops future renewals and your cars come off cars.fmycar.com at the end of the paid month. Monthly fees already charged are not prorated."],
];

export function home() {
  const plans = PRICE.dealer.map((t) => [t.name, `$${t.price} per month for a dealership with ${t.name.toLowerCase()} listed. You authorize the charge after the vehicle count is shown.`, "/pricing/"]);
  const f = faq(DEALER_FAQ, "Questions dealers ask", "questions");
  const body = hero({ eyebrow: "For dealerships · priced by vehicle count", h1: "Your inventory. More exposure. No sales commission.",
    lede: `FMYCAR is a listing marketplace. Your in-stock cars show on cars.fmycar.com with your store's name, and every shopper question comes straight to you. $97, $199 or $299 a month by vehicle count. No commission. No setup fee. You approve the charge before anything publishes.`,
    primary: ["List your dealership", SIGNUP], secondary: ["How it works", "/how-it-works/"] })
    + section("What a lead looks like", `<div class="lead-ex">${leadExample()}<div>${(() => { const s = marketStats(); return s && s.cars > 0 ? `<p class="lead-in">Right now at least ${s.cars} cars from dealerships and private sellers are listed on <a href="${CARS}/" rel="noopener">cars.fmycar.com</a>. Your in-stock cars can sit next to them.</p>` : ""; })()}<p>A shopper fills in the message form on one of your cars (name, phone or email, a message) and ticks a box agreeing to be contacted by you and by FMYCAR. Within a minute your store gets an email like this one, and the lead appears in your app with the car attached. You reply to the shopper directly; FMYCAR does not sit in the middle.</p><p class="fine">The example is made up. FMYCAR promises no number of leads: how many shoppers write depends on your cars and your prices.</p></div></div>`, { id: "lead", soft: true })
    + section("What you get", cards([
      ["Your cars on cars.fmycar.com", `Every in-stock vehicle gets its own page with price, mileage, photos and your store's name, next to cars from other dealerships and private sellers. <a href="${CARS}/" rel="noopener">See the marketplace</a>.`],
      ["Leads straight to you", "A shopper's question arrives by email and in your app with the car attached, within a minute. The shopper agreed to be contacted. FMYCAR keeps a copy and never sits between you and the buyer."],
      ["Inventory that updates itself", "Connect your website or inventory provider once, or upload a spreadsheet. Prices change and sold cars come off on their own, every few hours."],
      ["A public dealership page", "Your store's page lists every car you have on FMYCAR with a message form, and shoppers can filter by dealer."],
    ], 4), { id: "get" })
    + section("Monthly price by inventory", cards(plans, 3) + billingNoteAll() + `<p class="fine">${esc(PLAN_CONSENT)}</p>`, { id: "plans", lead: "The plan is the number of vehicles you have listed, not a feature bundle. Every plan includes automatic inventory updates, the lead email and a public dealership page." })
    + section("How it starts", steps([
      ["Create the account", "Dealership name, website, city and state, then the person who will sign in. Two minutes. No card on this form."],
      ["Confirm your work email", "So a store cannot be listed by someone who does not represent it. If the email is on your dealership's domain, that is enough."],
      ["Connect your inventory", "Your website, your inventory provider, or a spreadsheet. FMYCAR counts the vehicles that can list: in stock, priced, with at least two photos."],
      ["Approve the monthly price", `You see the count and the plan, and you authorize the charge in your ${SOFTWARE_NAME} account. Your cars are live on cars.fmycar.com within four hours.`],
    ]) + `<p class="ctas"><a class="btn" href="${SIGNUP}" data-track="home-signup">List your dealership</a> <a class="btn ghost" href="/how-it-works/">Every step in detail</a></p>`, { id: "how" })
    + section("Updates never wipe the lot", bullets([
      "Automatic price and sold-car updates, every few hours",
      "Duplicate-VIN detection, so one car is never listed twice",
      "A validation report and an import status in your account",
      "An update that fails temporarily does not delete listings",
    ]), { soft: true })
    + section("Already in our directory?", `<p>FMYCAR keeps an independent directory of ${DEALERS.length} dealerships. If your store is in it, claim the card and the sign-up opens with your name, website, city and state filled in.</p><p class="ctas"><a class="btn ghost" href="${DIRECTORY}">Find your dealership</a></p>`, { id: "directory" })
    + section("FMYCAR and CarSalesSoftware", `<p>${AFFILIATION}</p><p class="ctas"><a class="btn ghost" href="${SOFTWARE_URL}" rel="noopener">${SOFTWARE_NAME}</a> <a class="btn ghost" href="${SOFTWARE_URL}pricing" rel="noopener">${SOFTWARE_NAME} pricing</a></p><p class="advice">${esc(ADVICE_LINE)}</p>`, { id: "affiliation", soft: true })
    + f.html
    + section("Questions before you sign up?", `<p>Call <a href="tel:${PHONE_TEL}">${PHONE}</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>. A person answers. Shopping for a car yourself? That side of FMYCAR is at <a href="${HOME}/" rel="noopener">fmycar.com</a>.</p><p class="ctas"><a class="btn" href="${SIGNUP}" data-track="home-final-signup">List your dealership</a></p>`, { cls: "next-step" });
  return page({ path: "/", title: "List Your Dealership on FMYCAR: $97 to $299 a Month", desc: "Dealerships list their inventory on cars.fmycar.com for $97, $199 or $299 a month by vehicle count. Leads come straight to the store. No commission, no setup fee.",
    body, kicker: "For dealers", schema: [f.schema, offersSchema()] });
}
