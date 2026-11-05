// Launch gate config for dealers.fmycar.com (scripts/content-guard.mjs, the same script as fmycar.com, cars.fmycar.com and app.fmycar.com).
// Dealer copy says "plan", never "tier"; inventory "updates automatically", never "feed/sync/CSV"; the software is "CarSalesSoftware".
const BOILERPLATE = /where to check before you buy, sell, trade or lease a car/i;
export default {
  minPages: 8,
  extraForbidden: [
    { id: "members", re: /\b(Hub|Knowledge Hub) members?\b|\bmembers?-only\b|\bfor members\b|\bmembers (get|read|see|unlock)\b|· Members\b|\bmembership (plan|fee|price|renews|unlocks?)\b|members read in full/i, html: true, js: false },
    { id: "feed-sync", re: /\binventory feeds?\b|\bfeeds? (of|from)\b|\blive feed\b|\bsync(ed|ing|s)?\b|\bCSV\b/i, html: true, js: false },
    { id: "portal", re: /\b(your|the|our|a|member|customer|dealer|client) portal\b/i, html: true, js: true },
    { id: "crm", re: /\bCRM\b/, html: true, js: true },
    { id: "product-alias", re: /CarSales AI/, html: true, js: true },
    { id: "coming-soon", re: /coming (soon|online)/i, html: true, js: true },
    { id: "raw-status", re: /\b(past_due|intake_received|waiting_on_you|needs_docs|in_review)\b/, html: true, js: false },
    { id: "tier", re: /\b(dealer|dealership|listing|monthly|pricing|subscription|FMYCAR) tiers?\b|\btiers?: \$|\btier (97|199|299)\b/i, html: true, js: true },
    { id: "old-pitch", re: /Dealership Growth Platform|Turn Every Service Visit|service.survey|Book My Demo|Schedule Live Demo/i, html: true, js: true },   // the retired GoHighLevel site
  ],
  allow: [],
  required: [
    { path: "index.html", all: [/\$97/, /\$199/, /\$299/, /No commission/, /not a dealer/i, /List your dealership/] },
    { path: "index.html", raw: true, all: [BOILERPLATE, /FMYCAR LLC/] },
    { path: "pricing/index.html", all: [/\$97/, /\$199/, /\$299/, /never changes an existing subscription on its own/] },
    { path: "signup/index.html", all: [/does not charge a card/i, /\$97/] },
    { path: "llms.txt", raw: true, all: [BOILERPLATE, /\$97/, /\$299/] },
  ],
};
