# dealers.fmycar.com — the dealer side of FMYCAR

What a dealership gets, what it costs, how it works, the sign-up, and the independent-dealer directory. Shoppers are sent to
fmycar.com and cars.fmycar.com; nothing here sells to a buyer. Static build (`node scripts/build.mjs`), no dependencies,
published by GitHub Pages at the custom domain `dealers.fmycar.com` (CNAME in `static/`). Replaced the GoHighLevel site that
lived at this host until November 2026; every old address redirects to the page that answers the same question today.

## Pages
- `/` what a dealership gets, prices, how it starts, FAQ · `/pricing/` · `/how-it-works/` · `/contact/`
- `/signup/` the two-minute sign-up (no card; creates the dealership account through rpc `fmycar_dealer_signup`) and `/verify/`
  (the email confirmation link; the backend's `fmycar-onboard` function points here)
- `/directory/` 436 independent dealerships that can claim their card; `/directory/<state>/` pages are noindex (claim flow only)

## Facts live in one place
Prices, the boilerplate, the legal name, the social profiles and the phone number mirror `fmycar-site/scripts/lib.mjs`.
Change them there first, then here (`scripts/lib.mjs`). `data/dealers.json` holds only name, city, state, website and phone.

## Build, check, test
```bash
npm run build && npm run check && npm test
```
`npm test` = `scripts/test/brand.test.mjs` (prices and promises) + `scripts/content-guard.mjs` (plain words, nothing internal,
no secrets; identical copy of the script in the other FMYCAR repos) + `scripts/seo-check.mjs` (titles, descriptions, FAQ answers
visible, Organization record, state pages noindex, old addresses redirect).

## Backend
The dealership account, inventory connection, leads and the listing charge ($97 / $199 / $299 a month by vehicle count,
authorized by the dealer) live in jic52194/carsales-desktop (Supabase project `suooupofqybiojouttxe`, functions `fmycar-onboard`,
`billing`, `stripe-webhook`, `sync-inventory`). This site never charges a card.
