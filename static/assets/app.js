// fmycar.com — tiny progressive enhancements: mobile drawer, live cars strip from cars.fmycar.com. (Forms + booking: forms.js.)
(function () {
  var CARS = "https://cars.fmycar.com";
  var root = document.documentElement;
  // ── header dropdowns (disclosure pattern): the group label is a link to its hub page; the chevron button opens the panel.
  // Mouse: opens on hover (with a short close delay). Touch/click: the button toggles. Keyboard: Enter/Space toggle,
  // ArrowDown opens and moves into the panel, ArrowUp/ArrowDown/Home/End move between items, Esc closes and returns focus.
  var dds = Array.prototype.slice.call(document.querySelectorAll("[data-dd]"));
  var items = function (dd) { return Array.prototype.slice.call(dd.querySelectorAll("[data-dd-panel] a")); };
  var setOpen = function (dd, open) {
    if (open) dds.forEach(function (o) { if (o !== dd) setOpen(o, false); });
    dd.classList.toggle("open", open); if (!open) dd.removeAttribute("data-hover");
    dd.querySelector("[data-dd-btn]").setAttribute("aria-expanded", open ? "true" : "false");
  };
  dds.forEach(function (dd) {
    var btn = dd.querySelector("[data-dd-btn]"), timer = null;
    // a click on a panel the mouse just opened by hovering keeps it open (pinned) instead of closing it again
    btn.addEventListener("click", function () { if (dd.hasAttribute("data-hover")) { dd.removeAttribute("data-hover"); setOpen(dd, true); return; } setOpen(dd, !dd.classList.contains("open")); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setOpen(dd, true); var a = items(dd); if (a[0]) a[0].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(dd, true); var b = items(dd); if (b.length) b[b.length - 1].focus(); }
    });
    dd.addEventListener("keydown", function (e) {
      dd.removeAttribute("data-hover");
      var a = items(dd), i = a.indexOf(document.activeElement);
      if (e.key === "Escape" && dd.classList.contains("open")) { e.preventDefault(); setOpen(dd, false); btn.focus(); return; }
      if (i < 0) return;
      var j = e.key === "ArrowDown" ? (i + 1) % a.length : e.key === "ArrowUp" ? (i - 1 + a.length) % a.length : e.key === "Home" ? 0 : e.key === "End" ? a.length - 1 : -1;
      if (j >= 0) { e.preventDefault(); a[j].focus(); }
    });
    dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) setOpen(dd, false); });
    dd.addEventListener("pointerenter", function (e) { if (e.pointerType !== "mouse") return; clearTimeout(timer); if (!dd.classList.contains("open")) { setOpen(dd, true); dd.setAttribute("data-hover", ""); } });
    dd.addEventListener("pointerleave", function (e) { if (e.pointerType !== "mouse") return; clearTimeout(timer); if (!dd.hasAttribute("data-hover")) return; timer = setTimeout(function () { if (!dd.contains(document.activeElement) || dd.hasAttribute("data-hover")) setOpen(dd, false); }, 180); });
  });
  document.addEventListener("click", function (e) { dds.forEach(function (dd) { if (!dd.contains(e.target)) setOpen(dd, false); }); });

  // ── mobile drawer: full-height dialog. Focus moves in and is trapped; Esc, the × button and any link close it;
  // the page behind does not scroll. Without JS the burger is a #menu link and the drawer opens with :target.
  var burger = document.querySelector("[data-burger]"), drawer = document.querySelector("[data-drawer]");
  if (burger && drawer) {
    var closeBtn = drawer.querySelector("[data-drawer-close]"), lastFocus = null;
    var focusables = function () { return Array.prototype.slice.call(drawer.querySelectorAll("a[href], button:not([disabled])")).filter(function (el) { return el.offsetParent !== null || el === closeBtn; }); };
    var isOpen = function () { return drawer.classList.contains("open"); };
    var openDrawer = function () {
      lastFocus = document.activeElement; drawer.classList.add("open"); root.classList.add("menu-open");
      burger.setAttribute("aria-expanded", "true"); (closeBtn || focusables()[0]).focus();
    };
    var closeDrawer = function (restore) {
      if (!isOpen()) return;
      drawer.classList.remove("open"); root.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false");
      if (restore !== false) (lastFocus && lastFocus.focus ? lastFocus : burger).focus();
    };
    burger.addEventListener("click", function (e) { e.preventDefault(); isOpen() ? closeDrawer() : openDrawer(); });
    burger.addEventListener("keydown", function (e) { if (e.key === " ") { e.preventDefault(); openDrawer(); } });
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) { e.preventDefault(); closeDrawer(); });
      closeBtn.addEventListener("keydown", function (e) { if (e.key === " ") { e.preventDefault(); closeDrawer(); } });
    }
    drawer.addEventListener("click", function (e) { var a = e.target.closest("a[href]"); if (a && a !== closeBtn) closeDrawer(false); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== "Tab") return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var mq = window.matchMedia("(min-width: 981px)");
    var onMq = function () { if (mq.matches) closeDrawer(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
    if (location.hash === "#menu") history.replaceState(null, "", location.pathname + location.search);
  }

  // Newest cars from the marketplace feed (static JSON rebuilt every 4h). Fails silently: the strip still has its links.
  var grids = document.querySelectorAll("[data-cars]");
  if (grids.length) fetch(CARS + "/listings.json", { mode: "cors" }).then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
    if (!Array.isArray(list) || !list.length) return;
    var cars = list.slice().sort(function (a, b) { return (b.a || "").localeCompare(a.a || ""); }).filter(function (c) { return c.ph; }).slice(0, 16);
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var html = cars.map(function (c) {
      return '<a class="car" href="' + CARS + esc(c.u) + '"><img src="' + esc(c.ph) + '" alt="' + esc(c.t + " " + (c.r || "")) + '" width="640" height="480" loading="lazy" decoding="async"><div><b>' + esc(c.t) + '</b><small>' + esc(c.r || "") + '</small><span class="p">' + (c.p ? "$" + Number(c.p).toLocaleString("en-US") : "Call for price") + '</span><small>' + (c.mi ? Number(c.mi).toLocaleString("en-US") + " mi · " : "") + esc((c.c ? c.c + ", " : "") + (c.s || "")) + '</small></div></a>';
    }).join("");
    // Show 8 cars. A dealer's photo host can be down or block hotlinking (Nov 3: images.dealersync.com), which left blank
    // cards: render 16, keep 8 visible, and when a photo fails, drop that card and reveal the next spare.
    grids.forEach(function (g) {
      g.innerHTML = html;
      var cards = Array.prototype.slice.call(g.querySelectorAll(".car"));
      cards.forEach(function (card, i) {
        if (i >= 8) card.hidden = true;
        var img = card.querySelector("img");
        var drop = function () { if (!card.parentNode) return; var spare = g.querySelector(".car[hidden]"); card.parentNode.removeChild(card); if (spare) spare.hidden = false; };
        img.addEventListener("error", drop);
        if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) drop();
      });
      // a photo host that never answers (no error event): treat a still-empty visible photo after 8 s as failed
      setTimeout(function () { Array.prototype.slice.call(g.querySelectorAll(".car:not([hidden]) img")).forEach(function (img) { if (!img.complete || img.naturalWidth === 0) img.dispatchEvent(new Event("error")); }); }, 8000);
    });
  }).catch(function () {});

})();
// Share bars: native share when available, copy link; sticky CTA appears after scrolling past the hero.
(function () {
  document.querySelectorAll("[data-share]").forEach(function (box) {
    var url = box.getAttribute("data-url"), title = box.getAttribute("data-title");
    var nat = box.querySelector("[data-share-native]"), copy = box.querySelector("[data-share-copy]");
    if (nat && navigator.share) { nat.hidden = false; nat.addEventListener("click", function () { navigator.share({ url: url, title: title, text: title }).catch(function () {}); }); }
    if (copy) copy.addEventListener("click", function () { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy link"; }, 1500); }, function () { prompt("Copy this link", url); }); });
  });
  var sticky = document.querySelector("[data-sticky]");
  if (sticky) { var onScroll = function () { sticky.classList.toggle("show", window.scrollY > 700 && (window.innerHeight + window.scrollY) < document.body.scrollHeight - 900); }; window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
})();
// The FML Files: copy buttons (captions, taglines, pull quotes) and the dealership bingo card (tap to mark, shuffle, print).
(function () {
  var canon = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
  var copy = function (btn, text) {
    var done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1400); };
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done, function () { prompt("Copy this", text); });
  };
  document.querySelectorAll("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copy(b, b.getAttribute("data-copy")); }); });
  document.querySelectorAll("[data-copy-quote]").forEach(function (b) {
    b.addEventListener("click", function () { var q = b.closest("figure").querySelector("blockquote").textContent.trim(); copy(b, q + " — FMYCAR " + canon); });
  });
  var box = document.querySelector("[data-bingo]");
  if (!box) return;
  var cells = function () { return Array.prototype.slice.call(box.querySelectorAll("[data-cell]")); };
  cells().forEach(function (c) { c.addEventListener("click", function () { var on = c.classList.toggle("hit"); c.setAttribute("aria-pressed", on ? "true" : "false"); }); });
  var shuffle = box.querySelector("[data-bingo-shuffle]");
  if (shuffle) shuffle.addEventListener("click", function () {
    var cs = cells(), texts = cs.map(function (c) { return c.innerHTML; });
    for (var i = texts.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = texts[i]; texts[i] = texts[j]; texts[j] = t; }
    cs.forEach(function (c, k) { c.innerHTML = texts[k]; c.classList.remove("hit"); c.setAttribute("aria-pressed", "false"); });
  });
  var pr = box.querySelector("[data-print]");
  if (pr) pr.addEventListener("click", function () { window.print(); });
})();
