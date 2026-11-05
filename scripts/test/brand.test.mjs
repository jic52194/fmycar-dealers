// Price and promise guard for the built dealer site (run after `npm run build`). Fails when a price, the consent promise,
// the "not a dealer" line or the sign-up path disappears, or when a retired offer or the old GoHighLevel pitch leaks back in.
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const dist = new URL("../../dist/", import.meta.url);
const read = (p) => readFileSync(new URL(p, dist), "utf8");
assert.ok(existsSync(new URL("index.html", dist)), "build first: npm run build");
const home = read("index.html"), pricing = read("pricing/index.html"), how = read("how-it-works/index.html"), signup = read("signup/index.html"), verify = read("verify/index.html"), dir = read("directory/index.html");
const must = (html, s, where) => assert.ok(html.includes(s), `${where} is missing: ${s}`);
const never = (html, re, where) => { const m = html.match(re); assert.ok(!m, `${where} contains retired or forbidden copy: ${m && m[0]}`); };
let n = 0;
for (const [w, h] of [["home", home], ["pricing", pricing]]) for (const s of ["$97", "$199", "$299", "No commission", "No setup fee", "never changes an existing subscription on its own"]) { must(h, s, w); n++; }
must(home, 'href="/signup/"', "home"); must(how, 'href="/signup/"', "how it works"); must(home, "not a dealer", "home"); n += 3;
must(signup, "does not charge a card", "signup"); must(signup, 'data-ds="signup"', "signup form"); must(verify, 'data-ds="verify"', "verify page"); n += 3;
must(dir, ">Claim this dealership<", "directory"); must(dir, "/signup/?name=", "directory claim link"); n += 2;
for (const h of [home, pricing, how, signup]) { must(h, "FMYCAR LLC", "footer"); must(h, 'href="https://www.linkedin.com/company/fmycar/"', "footer social"); n += 2; }
const RETIRED = /Knowledge Hub membership|strategy session|7-day AI|FMYCAR Insider|salesperson plan|Dealership Growth Platform|Turn Every Service Visit|Book My Demo|CarSales AI|\btiers?\b/i;
for (const [w, h] of [["home", home], ["pricing", pricing], ["how", how], ["signup", signup], ["directory", dir]]) { never(h, RETIRED, w); never(h, /TODO|FIXME|LOREM IPSUM|INTERNAL NOTE|DEVELOPER NOTE/, w); n += 2; }   // case-sensitive: the sign-up page has a "ds-todo" list class
// the verify page reads ?t= from the address through the sign-up script (fmycar.com's old /dealers/verify stub carries ?t= along)
must(verify, "/assets/dealer-signup.js", "verify page script"); must(read("assets/dealer-signup.js"), 'get("t")', "sign-up script"); n += 2;
const verifyScript = read("assets/dealer-signup.js");
must(verifyScript, "authorize the displayed monthly listing price", "email verification does not unlock paid listing");
never(verifyScript, /Your in-stock cars can now show on FMYCAR/, "verification must not promise live cars before billing"); n += 2;
console.log(`brand: ${n} checks ok`);
