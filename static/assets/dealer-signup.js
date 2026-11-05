// /signup/ and /verify/ on dealers.fmycar.com (see content/signup.mjs). Copied from fmycar-site on 2026-11-05 when the dealer pages moved here.
// Keep the server's people-facing validation text (it names the field: email, phone, dealership, website, city and state);
// a database hint, a code or nothing at all becomes one plain sentence with a way forward.
function friendlyError(m) { m = String(m || ""); return /\b(email|phone|name|dealership|website|city|state|password|username|taken|minute|hour|too many|again later|already)\b/i.test(m) ? m : "Something went wrong on our side. Try again in a minute, or call +1 (970) 436-9227 and we will set you up by phone."; }
// Sign-up → rpc fmycar_dealer_signup (creates a regular CarSalesSoftware dealership; the database emails the confirm link).
// Verify  → rpc fmycar_verify_email with the token from ?t=.
(function () {
  var RPC = "https://suooupofqybiojouttxe.supabase.co/rest/v1/rpc/";
  var KEY = "sb_publishable_kQrB2hPMjcjuYI1N8mb0Ww_wEf0SzFC"; // public (publishable) key
  var t0 = Date.now();
  var FREE = /^(gmail|googlemail|yahoo|ymail|rocketmail|outlook|hotmail|live|msn|aol|icloud|me|mac|comcast|att|sbcglobal|verizon|cox|charter|bellsouth|protonmail|proton|gmx|mail|zoho|yandex)\./;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function rpc(fn, body) {
    return fetch(RPC + fn, { method: "POST", headers: { apikey: KEY, "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { console.error("signup", r.status, j); throw new Error(friendlyError(j && (j.message || j.hint))); }
          return j;
        });
      }, function () { throw new Error("We couldn’t reach the server. Check your connection and try again."); });
  }
  // The collector (functions/track) only keeps known event types, so the funnel uses signup_start / signup_step /
  // signup_complete with flow "fmycar-dealer" (read by rpc fmycar_signup_funnel). Never send what the dealer typed.
  var FLOW = "fmycar-dealer";
  function ev(type, label, props) { try { window.csoTrack && window.csoTrack.event(type, label, props || {}); } catch (e) {} }
  function step(label, props) { var x = props || {}; x.flow = FLOW; ev("signup_step", label, x); }
  var started = false;
  function start(props) { if (started) return; started = true; ev("signup_start", FLOW, props); }
  // same rule as the app's sign-up (components/funnel/signup.ts): from the name, else the email
  function suggest(name, email) {
    var from = function (s) { return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 30); };
    var u = from(name) || from(String(email || "").split("@")[0]);
    return u.length >= 3 ? u : "";
  }
  function hostOf(w) {
    w = String(w || "").trim(); if (!w) return "";
    try { return new URL(/^https?:\/\//i.test(w) ? w : "https://" + w).hostname.replace(/^www\./, "").toLowerCase(); } catch (e) { return ""; }
  }
  function sameSite(mailDomain, host) { return !!host && (mailDomain === host || mailDomain.slice(-host.length - 1) === "." + host || host.slice(-mailDomain.length - 1) === "." + mailDomain); }

  var form = $('form[data-ds="signup"]');
  if (form) {
    var card = $("#signup-form"), q = new URLSearchParams(location.search);
    var el = function (n) { return form.elements[n]; };
    var steps = $$(".ds-step", form), dots = $$("[data-dot]", card);
    var err1 = $("[data-err1]", form), err2 = $(".ds-step[data-step='2'] .fm-err", form);
    var show = function (box, m) { box.textContent = m || ""; box.hidden = !m; };

    // prefill from a claim link (/signup/?name=…&website=…&city=…&state=…&products=…)
    var claimName = (q.get("name") || "").slice(0, 100);
    if (claimName) {
      el("dealership_name").value = claimName;
      var c = $('[data-out="claim"]', card); c.textContent = "Claiming " + claimName + ". Check the details, then continue."; c.hidden = false;
    }
    ["website", "city"].forEach(function (k) { if (q.get(k)) el(k).value = q.get(k).slice(0, 200); });
    var st = (q.get("state") || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (st && el("state").querySelector('option[value="' + st + '"]')) el("state").value = st;
    var setProduct = function (p) { var r = form.querySelector('input[name="products"][value="' + p + '"]'); if (r) r.checked = true; };
    if (/^(listing|software|both)$/.test(q.get("products") || "")) setProduct(q.get("products"));
    var ref = (q.get("ref") || "fmycar-signup").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30);
    var DRAFT = "fmycar-dealer-signup", KEEP = ["dealership_name", "website", "city", "state", "vehicle_count", "full_name", "email", "phone"];
    var save = function () { try { var d = { products: product() }; KEEP.forEach(function (n) { d[n] = el(n).value; }); localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (e) {} };
    if (!claimName) try {
      var d0 = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (d0) { KEEP.forEach(function (n) { if (d0[n] && !el(n).value) el(n).value = String(d0[n]).slice(0, 200); }); if (/^(listing|software|both)$/.test(d0.products || "") && !q.get("products")) setProduct(d0.products); }
    } catch (e) {}
    form.addEventListener("input", function (e) { if (e.target.name !== "password" && e.target.name !== "username") save(); });
    form.addEventListener("focusin", function () { start({ products: product(), claimed: !!claimName }); });
    var product = function () { return (form.querySelector('input[name="products"]:checked') || {}).value || "listing"; };

    // plan cards lower on the page pick a product and bring the dealer back to the form
    $$("[data-choose]").forEach(function (b) {
      b.addEventListener("click", function () {
        setProduct(b.getAttribute("data-choose")); descNow(); tipNow(); save(); go(1); card.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(function () { el("dealership_name").focus({ preventScroll: true }); }, 450);
        step("choose", { products: b.getAttribute("data-choose") });
      });
    });

    function go(n) {
      steps.forEach(function (s) { s.hidden = s.getAttribute("data-step") !== String(n); });
      dots.forEach(function (d) { d.classList.toggle("on", +d.getAttribute("data-dot") <= n); });
      show(err1, ""); show(err2, "");
    }
    function valid(step) {
      var bad = null;
      $$("input,select", step).forEach(function (i) { if (!bad && !i.closest("[hidden]") && !i.checkValidity()) bad = i; });
      if (!bad) return true;
      var label = (form.querySelector('label[for="' + bad.id + '"]') || {}).textContent || "this field";
      var msg = bad.name === "password" ? "Use a password of 12 characters or more."
        : bad.validity.valueMissing ? "Fill in " + label.toLowerCase() + "."
        : bad.type === "email" ? "Check the email address." : "Check " + label.toLowerCase() + ".";
      show(step.getAttribute("data-step") === "1" ? err1 : err2, msg);
      bad.focus();
      return false;
    }

    $("[data-next]", form).addEventListener("click", function () {
      if (!valid(steps[0])) return;
      go(2); start({ products: product(), claimed: !!claimName }); step("login", { products: product(), claimed: !!claimName });
      el("full_name").focus();
    });
    $("[data-back]", form).addEventListener("click", function () { go(1); el("dealership_name").focus(); });
    // Enter on step 1 moves on instead of submitting
    steps[0].addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName !== "BUTTON") { e.preventDefault(); $("[data-next]", form).click(); } });

    // username: suggested from the name, shown as one line; a box only if they ask (or it's taken / can't be suggested)
    var userEdited = false, userBox = form.querySelector('[data-f="username"]'), userLine = $('[data-out="userline"]', form);
    var openUser = function () { userBox.hidden = false; userLine.hidden = true; userEdited = true; };
    var syncUser = function () {
      if (userEdited) return;
      var u = suggest(el("full_name").value, el("email").value); el("username").value = u;
      $('[data-out="user"]', form).textContent = u; userLine.hidden = !u;
    };
    el("username").addEventListener("input", function () { userEdited = true; this.value = this.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""); });
    $("[data-user-edit]", form).addEventListener("click", function () { openUser(); el("username").focus(); el("username").select(); });
    ["full_name", "email"].forEach(function (n) { el(n).addEventListener("input", syncUser); });

    // email tip: a work email on the dealership's domain goes live without waiting for a person
    var tip = $("#ds-email-tip");
    var tipNow = function () {
      var host = hostOf(el("website").value), em = el("email").value.trim().toLowerCase(), dom = em.split("@")[1] || "";
      tip.classList.remove("warn");
      if (product() === "software") { tip.textContent = ""; return; }
      if (!host) { tip.textContent = ""; return; }
      if (!/\.[a-z]{2,}$/.test(dom)) { tip.textContent = "Use your @" + host + " email to go live fastest."; return; }
      if (sameSite(dom, host)) { tip.textContent = "✓ Goes live as soon as you confirm."; return; }
      tip.classList.add("warn");
      tip.textContent = "An @" + host + " email skips our 1-day check.";
    };
    el("email").addEventListener("input", tipNow); el("website").addEventListener("change", tipNow);
    // vehicle count → the plan the dealer will authorize in the app ($97 / $199 / $299 a month). Hidden for software-only.
    var tierBox = $("#ds-plan"), countWrap = form.querySelector('[data-f="vehicle_count"]');
    var PLANS = [[30, "0–30 vehicles", "$97"], [100, "31–100 vehicles", "$199"], [Infinity, "101+ vehicles", "$299"]];
    var tierOf = function (n) { for (var i = 0; i < PLANS.length; i++) if (n <= PLANS[i][0]) return PLANS[i]; return PLANS[2]; };
    var tierNow = function () {
      if (countWrap) countWrap.hidden = product() === "software";
      if (!tierBox) return;
      var raw = el("vehicle_count").value.replace(/\D/g, ""), n = raw === "" ? 0 : Math.min(100000, +raw), t = tierOf(n);
      tierBox.textContent = (raw === "" ? "Your plan: " : "With " + n + " vehicle" + (n === 1 ? "" : "s") + ", your plan: ") + t[1] + " · " + t[2] + " a month. Billed monthly after you authorize it in the app; renews until you cancel; no commission; a higher plan only after you agree.";
    };
    el("vehicle_count").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 6); tierNow(); });
    var pickDesc = $('[data-out="pickdesc"]', form);
    var descNow = function () { var r = form.querySelector('input[name="products"]:checked'); if (r && pickDesc) pickDesc.textContent = r.getAttribute("data-desc") || ""; };
    $$('input[name="products"]', form).forEach(function (r) { r.addEventListener("change", function () { tipNow(); descNow(); tierNow(); save(); }); });

    // phone: (555) 555-0100 as they type (the server keeps only the digits)
    el("phone").addEventListener("input", function () {
      var d = this.value.replace(/\D/g, ""); if (d.length === 11 && d[0] === "1") d = d.slice(1); if (d.length > 10) return;
      this.value = d.length > 6 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : d.length > 3 ? "(" + d.slice(0, 3) + ") " + d.slice(3) : d;
    });

    // show / hide password
    var eye = $("[data-eye]", form);
    eye.addEventListener("click", function () {
      var on = el("password").type === "password"; el("password").type = on ? "text" : "password";
      eye.textContent = on ? "Hide" : "Show"; eye.setAttribute("aria-pressed", on ? "true" : "false"); eye.setAttribute("aria-label", on ? "Hide password" : "Show password");
    });

    var btn = $('button[type="submit"]', form), busy = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      if (steps[1].hidden) { $("[data-next]", form).click(); return; } // Enter pressed on step 1
      if (!valid(steps[1])) return;
      if (!el("username").value) { openUser(); show(err2, "Pick a username to sign in with."); el("username").focus(); return; }
      var p = { ref: ref, ms: String(Date.now() - t0), products: product() };
      ["dealership_name", "website", "city", "state", "vehicle_count", "full_name", "phone", "email", "username", "company_fax"].forEach(function (n) { p[n] = String(el(n).value || "").trim(); });
      p.password = el("password").value; // exactly as typed
      busy = true; btn.disabled = true; btn.textContent = "Creating your account…"; show(err2, "");
      step("submit", { products: p.products });
      rpc("fmycar_dealer_signup", { p: p }).then(function (res) {
        ev("signup_complete", FLOW, { products: p.products, ref: ref, claimed: !!claimName });
        try { localStorage.removeItem(DRAFT); } catch (e) {}
        var done = $(".ds-done", card), host = hostOf(p.website), dom = (p.email.split("@")[1] || "").toLowerCase();
        $('[data-out="username"]', done).textContent = res.username || p.username;
        $('[data-out="email"]', done).textContent = p.email;
        var verify = $('[data-out="verify"]', done), third = $('[data-out="third"]', done);
        if (p.products === "software") {
          verify.textContent = "";
          $('[data-out="third-h"]', done).textContent = "CarSalesSoftware is separate.";
          third.textContent = "This choice does not start an FMYCAR listing charge. You can opt into FMYCAR later. Sync is optional, and it does not duplicate a vehicle.";
        } else {
          verify.textContent = sameSite(dom, host) ? "It’s on " + host + "." : "Our team will also check the store, usually within one business day.";
          var tt = tierOf(+(p.vehicle_count || 0));
          third.textContent = "Import inventory next. FMYCAR counts your listable cars and shows the plan" + (p.vehicle_count ? " (about " + tt[1] + ", " + tt[2] + " a month from what you entered)" : "") + ". Listings publish after you authorize that monthly charge in the app. This signup did not charge a card.";
        }
        form.hidden = true; $(".ds-steps", card).hidden = true; $('[data-out="claim"]', card).hidden = true; done.hidden = false;
        card.scrollIntoView({ behavior: "smooth", block: "start" }); done.focus({ preventScroll: true });
      }).catch(function (x) {
        busy = false; btn.disabled = false; btn.textContent = "Create my account";
        var m = x.message || "";
        step("error", { msg: friendlyError(m).slice(0, 160) });
        // the server checks the dealership fields too; send them back to step 1 if one of those is wrong
        if (/dealership|city and state|website/i.test(m) && !/username|password|email|phone|name and/i.test(m)) { go(1); show(err1, m); return; }
        show(err2, m);
        if (/username/i.test(m)) { openUser(); el("username").focus(); }
        else if (/email/i.test(m)) el("email").focus();
        else if (/phone/i.test(m)) el("phone").focus();
        else if (/password/i.test(m)) el("password").focus();
        else if (/name/i.test(m)) el("full_name").focus();
      });
    });

    // phones: a "Sign up free" bar once the form has scrolled away
    var sticky = $("[data-ds-sticky]");
    if (sticky && "IntersectionObserver" in window) {
      sticky.hidden = false; sticky.style.display = "none";
      var seen = true, past = false;
      var upd = function () { var finished = !$(".ds-done", card).hidden; sticky.style.display = !seen && past && !finished ? "" : "none"; };
      new IntersectionObserver(function (es) { es.forEach(function (x) { seen = x.isIntersecting; past = x.boundingClientRect.top < 0; }); upd(); }).observe(card);
      var fin = $(".ds-final");
      if (fin) new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) sticky.style.display = "none"; else upd(); }); }).observe(fin);
    }
    tipNow(); descNow(); tierNow();
  }

  var v = $('[data-ds="verify"]');
  if (v) {
    var msg = $('[data-out="msg"]', v), h1 = $("h1", v), cta = $('[data-out="cta"]', v);
    var t = new URLSearchParams(location.search).get("t") || "";
    var end = function (h, m) { h1.textContent = h; msg.textContent = m; cta.hidden = false; };
    if (!t) { end("This link is missing its code", "Open the newest email we sent you and press the button again."); return; }
    history.replaceState(null, "", location.pathname); // keep the token out of the address bar and analytics
    rpc("fmycar_verify_email", { p_token: t }).then(function (r) {
      step("email_verified", { status: r.status });
      if (r.status === "verified") end("Email confirmed", (r.dealer ? r.dealer + " is verified. " : "") + "Your in-stock cars can now show on FMYCAR. Sign in to connect your inventory if you haven’t yet.");
      else if (r.status === "rejected") end("Email confirmed", "We couldn’t verify this dealership. Call or email us and we’ll sort it out.");
      else end("Email confirmed", "Thanks. Our team checks the dealership before your cars go live, usually within one business day. You can sign in and set up your inventory now.");
    }).catch(function (x) { end("We couldn’t confirm that link", x.message); });
  }
})();
