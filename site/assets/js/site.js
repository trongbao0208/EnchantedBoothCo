// Enchanted Booth Co. — interactions
(function () {
  "use strict";
  var doc = document;

  // ---- mobile nav ----
  var toggle = doc.querySelector(".nav__toggle");
  var list = doc.getElementById("nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) { list.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // ---- More dropdown (desktop hover/click) ----
  var more = doc.querySelector(".nav__more");
  var moreBtn = doc.querySelector(".nav__more-btn");
  if (more && moreBtn) {
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = more.toggleAttribute("data-open");
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    doc.addEventListener("click", function (e) {
      if (!more.contains(e.target)) { more.removeAttribute("data-open"); moreBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  // ---- one Order/CTA button on screen at a time ----
  var headerCta = doc.querySelector("[data-header-cta]");
  var pageCtas = doc.querySelectorAll(".js-cta");
  if (headerCta && pageCtas.length && "IntersectionObserver" in window) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      });
      headerCta.classList.toggle("is-cta-hidden", visible.size > 0);
    }, { threshold: 0.2 });
    pageCtas.forEach(function (el) { io.observe(el); });
  }

  // ---- gallery filter ----
  var filters = doc.querySelectorAll(".gfilter");
  var items = doc.querySelectorAll("#gallery-grid .ph");
  if (filters.length && items.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        items.forEach(function (it) {
          it.classList.toggle("is-hidden", f !== "all" && it.getAttribute("data-cat") !== f);
        });
        masonry();
      });
    });
  }

  // ---- promo modal (first visit, remembers dismissal) ----
  var promo = doc.getElementById("promo");
  if (promo) {
    var KEY = "ebc_promo_dismissed_v1";
    var dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === "1"; } catch (e) {}
    var closeBtn = promo.querySelector(".promo__close");
    function closePromo() {
      promo.setAttribute("hidden", "");
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
    }
    if (!dismissed) {
      setTimeout(function () { promo.removeAttribute("hidden"); }, 2600);
    }
    if (closeBtn) closeBtn.addEventListener("click", closePromo);
    promo.addEventListener("click", function (e) { if (e.target === promo) closePromo(); });
    promo.addEventListener("click", function (e) { if (e.target.closest(".js-cta")) closePromo(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && !promo.hasAttribute("hidden")) closePromo(); });
  }

  // ---- balanced masonry: place each tile in the currently shortest column ----
  function masonry() {
    doc.querySelectorAll(".masonry").forEach(function (grid) {
      if (!grid._phItems) grid._phItems = [].slice.call(grid.querySelectorAll(".ph"));
      var items = grid._phItems;
      if (!items.length) return;
      var w = grid.clientWidth;
      var cols = w > 980 ? 4 : (w > 600 ? 3 : 2);
      grid.classList.add("masonry--cols");
      grid.innerHTML = "";
      var colEls = [], colH = [], c;
      for (c = 0; c < cols; c++) { var d = doc.createElement("div"); d.className = "masonry__col"; grid.appendChild(d); colEls.push(d); colH.push(0); }
      items.forEach(function (ph) {
        var m = 0;
        for (var i = 1; i < cols; i++) if (colH[i] < colH[m]) m = i;
        colEls[m].appendChild(ph);
        var img = ph.querySelector("img");
        var aw = (img && parseFloat(img.getAttribute("width"))) || 1;
        var ah = (img && parseFloat(img.getAttribute("height"))) || 1;
        colH[m] += ah / aw + 0.08; // relative height (cols share a width) + gap allowance
      });
    });
  }
  if (doc.querySelector(".masonry")) {
    masonry();
    window.addEventListener("load", masonry);
    var _rt, _lastW = innerWidth;
    window.addEventListener("resize", function () { clearTimeout(_rt); _rt = setTimeout(masonry, 150); });
  }

  // ---- lightbox (click any gallery photo to enlarge, arrow-key / swipe nav) ----
  var phNodes = [].slice.call(doc.querySelectorAll(".ph"));
  if (phNodes.length) {
    var lb, lbImg, lbCount, lbIndex = 0, lbList = [];
    function buildLb() {
      lb = doc.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML =
        '<button class="lightbox__btn lightbox__close" aria-label="Close">×</button>' +
        '<button class="lightbox__btn lightbox__nav lightbox__prev" aria-label="Previous photo">‹</button>' +
        '<img class="lightbox__img" alt="">' +
        '<button class="lightbox__btn lightbox__nav lightbox__next" aria-label="Next photo">›</button>' +
        '<div class="lightbox__count"></div>';
      doc.body.appendChild(lb);
      lbImg = lb.querySelector(".lightbox__img");
      lbCount = lb.querySelector(".lightbox__count");
      lb.querySelector(".lightbox__close").addEventListener("click", closeLb);
      lb.querySelector(".lightbox__prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
      lb.querySelector(".lightbox__next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    }
    function visibleList() { return phNodes.filter(function (p) { return !p.classList.contains("is-hidden"); }); }
    function show(i) {
      var img = lbList[i] && lbList[i].querySelector("img");
      if (!img) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbCount.textContent = (i + 1) + " / " + lbList.length;
      lbIndex = i;
    }
    function step(d) { show((lbIndex + d + lbList.length) % lbList.length); }
    function openLb(ph) {
      if (!lb) buildLb();
      lbList = visibleList();
      var i = lbList.indexOf(ph);
      show(i < 0 ? 0 : i);
      lb.classList.add("is-open");
      doc.body.style.overflow = "hidden";
    }
    function closeLb() { if (lb) { lb.classList.remove("is-open"); doc.body.style.overflow = ""; } }
    phNodes.forEach(function (ph) { ph.addEventListener("click", function () { openLb(ph); }); });
    doc.addEventListener("keydown", function (e) {
      if (!lb || !lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  // ---- fan / wheel hero carousel ----
  var fanWheel = doc.getElementById("fanhero-wheel");
  if (fanWheel) {
    var fanStage = doc.getElementById("fanhero-stage");
    var SLOTS = 22, CARD_ASPECT = 0.7, RADIUS_VW = 0.6, RADIUS_MINK = 3.4, TOP_OFFSET = 0.42;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var AUTO_SPIN = reduce ? 0 : 0.05, DRAG = 0.16, INERTIA = 0.94;
    var IMAGES = [];
    try { IMAGES = JSON.parse(fanWheel.getAttribute("data-images")) || []; } catch (e) {}
    if (IMAGES.length && fanStage) {
      var fanCards = [], fanCurVi = -1, fstep = 360 / SLOTS;
      for (var fi = 0; fi < SLOTS; fi++) {
        var fcard = doc.createElement("div");
        fcard.className = "fancard";
        fcard.style.setProperty("--a", (fi * fstep) + "deg");
        var fimg = doc.createElement("img");
        fimg.src = IMAGES[fi % IMAGES.length];
        fimg.alt = ""; fimg.draggable = false;
        fimg.loading = fi < IMAGES.length ? "eager" : "lazy";
        fcard.appendChild(fimg);
        fanWheel.appendChild(fcard);
        fanCards.push({ base: fi * fstep, vi: fi % IMAGES.length });
      }
      function fanLayout() {
        var vw = fanStage.clientWidth, vh = fanStage.clientHeight;
        var narrow = vw < 640;
        var ch = Math.max(150, Math.min(vh * (narrow ? 0.48 : 0.6), vw * (narrow ? 0.4 : 0.24), narrow ? 210 : 360));
        var cw = ch * CARD_ASPECT;
        // radius tied to card width → same fan density at every screen size (cards just touch, slight overlap).
        var r = cw * 3.7;
        fanWheel.style.setProperty("--cw", cw + "px");
        fanWheel.style.setProperty("--ch", ch + "px");
        fanWheel.style.setProperty("--r", r + "px");
        fanWheel.style.setProperty("--cy", (TOP_OFFSET * vh + r) + "px");
      }
      var frot = 0, fvel = 0, fdrag = false, flastX = 0;
      function fanApply() { fanWheel.style.setProperty("--rot", frot + "deg"); }
      fanStage.addEventListener("pointerdown", function (e) {
        if (e.target.closest("a,button")) return; // let CTAs click through
        fdrag = true; flastX = e.clientX; fvel = 0; fanStage.classList.add("-drag");
        try { fanStage.setPointerCapture(e.pointerId); } catch (_) {}
      });
      fanStage.addEventListener("pointermove", function (e) {
        if (!fdrag) return;
        var dx = e.clientX - flastX; flastX = e.clientX;
        var d = dx * DRAG; frot += d; fvel = d; fanApply();
      });
      var fanStop = function () { fdrag = false; fanStage.classList.remove("-drag"); };
      fanStage.addEventListener("pointerup", fanStop);
      fanStage.addEventListener("pointercancel", fanStop);
      var fanIdxEl = doc.getElementById("fan-idx"), fanTotEl = doc.getElementById("fan-total");
      if (fanTotEl) fanTotEl.textContent = String(IMAGES.length).padStart(2, "0");
      function fanCounter() {
        var best = 1e9, bestVi = 0;
        for (var k = 0; k < fanCards.length; k++) {
          var a = (fanCards[k].base + frot) % 360;
          if (a > 180) a -= 360; if (a < -180) a += 360;
          if (Math.abs(a) < best) { best = Math.abs(a); bestVi = fanCards[k].vi; }
        }
        if (bestVi !== fanCurVi) { fanCurVi = bestVi; if (fanIdxEl) fanIdxEl.textContent = String(bestVi + 1).padStart(2, "0"); }
      }
      var fanFrame = 0;
      function fanTick() {
        if (!fdrag) { frot += fvel + AUTO_SPIN; fvel *= INERTIA; fanApply(); }
        if ((fanFrame++ & 7) === 0) fanCounter();
        requestAnimationFrame(fanTick);
      }
      fanLayout(); fanApply(); fanCounter();
      window.addEventListener("resize", fanLayout);
      window.addEventListener("load", fanLayout);
      fanTick();
    }
  }

  // ---- cards-cascade scroll-driven 3D deck ----
  var cascSection = doc.getElementById("cascade");
  if (cascSection) {
    var cascStage = doc.getElementById("casc-stage");
    var cascDeck = doc.getElementById("casc-deck");
    var cascCards = [].slice.call(cascDeck.querySelectorAll(".casc-card"));
    var cascTicks = [].slice.call(cascSection.querySelectorAll(".casc-rail__tick"));
    var cascFill = doc.getElementById("casc-fill"), cascThumb = doc.getElementById("casc-thumb");
    var cascCur = doc.getElementById("casc-cur"), cascLabel = doc.getElementById("casc-label"), cascLive = doc.getElementById("casc-live");
    var cascTrack = doc.getElementById("casc-track");
    var CN = cascCards.length;
    var CTITLES = cascCards.map(function (c) { var t = c.querySelector(".casc-card__title"); return t ? t.textContent : ""; });
    var CFG = { aspect: 1.16, cardVW: 0.26, cardMin: 210, cardMax: 400, ease: 0.14, perCardVh: 20,
      g: { crestTilt: -18, crestY: 0.20, crestZ: 0.02, backDecay: 0.80, backTilt: 50, backRise: 1.02, backDepth: 1.05, backShrink: 0.16, frontDrop: 0.86, frontFold: 120, frontFwd: 0.30, fadeStart: 1.30, fadeEnd: 2.20, backFade: 9.0 } };
    var creduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var CCW = 380, CCH = 440;
    var cclamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
    function cascLayout() {
      var vw = innerWidth, vh = innerHeight;
      CCW = Math.round(Math.min(CFG.cardMax, Math.max(CFG.cardMin, vw * CFG.cardVW)));
      CCH = Math.round(CCW * CFG.aspect);
      var maxCH = vh * 0.5;
      if (CCH > maxCH) { CCH = Math.round(maxCH); CCW = Math.round(CCH / CFG.aspect); }
      cascStage.style.setProperty("--cw", CCW + "px");
      cascStage.style.setProperty("--ch", CCH + "px");
      cascStage.style.setProperty("--persp", Math.max(1200, Math.min(vw, vh) * 2.5) + "px");
      cascStage.style.setProperty("--vanish", "38%");
      var wide = vw > 880;
      cascStage.style.setProperty("--deckX", wide ? "68%" : "50%");
      cascStage.style.setProperty("--vanishX", wide ? "66%" : "50%");
      cascStage.style.setProperty("--deckY", wide ? "50%" : "72%");
      cascSection.style.height = (100 + (CN - 1) * CFG.perCardVh) + "vh";
    }
    function cascPlace(el, p) {
      var G = CFG.g, H = CCH, tilt, ty, tz, scale, opacity, sheen, z;
      if (p >= 0) {
        var a = 1 - Math.exp(-p * G.backDecay);
        tilt = G.crestTilt - G.backTilt * a; ty = H * (G.crestY - G.backRise * a); tz = H * (G.crestZ - G.backDepth * a);
        scale = 1 - G.backShrink * a; sheen = 0.5 + 0.4 * a; opacity = cclamp(1 - (p - G.backFade) * 0.5, 0, 1); z = 1000 - Math.round(p * 10);
      } else {
        var q = -p; tilt = G.crestTilt + G.frontFold * q; ty = H * (G.crestY + G.frontDrop * q);
        var fwd = Math.sin(cclamp(q, 0, 1) * Math.PI * 0.5); tz = H * (G.crestZ + G.frontFwd * fwd);
        scale = 1 + 0.05 * fwd; sheen = 0.5 - 0.3 * cclamp(q, 0, 1); opacity = 1 - cclamp((q - G.fadeStart) / (G.fadeEnd - G.fadeStart), 0, 1); z = 2000 + Math.round(q * 10);
      }
      el.style.opacity = opacity; el.style.zIndex = z; el.style.setProperty("--sheen", sheen.toFixed(3));
      el.style.transform = "translateY(" + ty.toFixed(1) + "px) translateZ(" + tz.toFixed(1) + "px) rotateX(" + tilt.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
    }
    var cprog = 0, ctarget = 0, clast = -1;
    function cascRender() {
      var travel = cascSection.offsetHeight - innerHeight;
      var scrolled = cclamp(-cascSection.getBoundingClientRect().top, 0, Math.max(1, travel));
      ctarget = travel > 0 ? (scrolled / travel) * (CN - 1) : 0;
      var e = creduce ? 1 : CFG.ease;
      cprog += (ctarget - cprog) * e;
      if (Math.abs(ctarget - cprog) < 0.0005) cprog = ctarget;
      for (var i = 0; i < CN; i++) cascPlace(cascCards[i], i - cprog);
      var frac = CN > 1 ? cclamp(cprog / (CN - 1), 0, 1) : 0;
      cascFill.style.height = (frac * 100) + "%"; cascThumb.style.top = (frac * 100) + "%";
      var active = cclamp(Math.round(cprog), 0, CN - 1);
      if (active !== clast) {
        clast = active;
        cascTicks.forEach(function (d, i) { d.setAttribute("aria-current", i === active ? "true" : "false"); });
        cascCur.textContent = String(active + 1).padStart(2, "0");
        if (cascLabel) cascLabel.textContent = CTITLES[active];
        if (cascLive) cascLive.textContent = "Photo " + (active + 1) + " of " + CN + ": " + CTITLES[active];
      }
      requestAnimationFrame(cascRender);
    }
    var cclamp01 = function (x) { return Math.min(1, Math.max(0, x)); };
    var csecTop = function () { return cascSection.getBoundingClientRect().top + scrollY; };
    function cscrollTo(raw, smooth) { var travel = Math.max(0, cascSection.offsetHeight - innerHeight); scrollTo({ top: csecTop() + cclamp01(raw) * travel, behavior: (smooth && !creduce) ? "smooth" : "auto" }); }
    var railDrag = false;
    var railTo = function (cy) { var r = cascTrack.getBoundingClientRect(); cscrollTo((cy - r.top) / r.height, false); };
    cascTrack.addEventListener("pointerdown", function (e) { if (e.target.classList.contains("casc-rail__tick")) return; railDrag = true; try { cascTrack.setPointerCapture(e.pointerId); } catch (_) {} railTo(e.clientY); });
    cascTrack.addEventListener("pointermove", function (e) { if (railDrag) railTo(e.clientY); });
    var railEnd = function () { railDrag = false; };
    cascTrack.addEventListener("pointerup", railEnd); cascTrack.addEventListener("pointercancel", railEnd);
    cascTicks.forEach(function (d, i) { d.addEventListener("click", function () { cscrollTo(CN > 1 ? i / (CN - 1) : 0, true); }); });
    addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var r = cascSection.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var cur = cclamp(Math.round(cprog), 0, CN - 1);
      cscrollTo(CN > 1 ? cclamp(cur + (e.key === "ArrowRight" ? 1 : -1), 0, CN - 1) / (CN - 1) : 0, true); e.preventDefault();
    });
    cascLayout(); addEventListener("resize", cascLayout); cascRender();
  }

  // ---- coverflow gallery showcase ----
  var cfStage = doc.getElementById("cf-stage");
  if (cfStage) {
    var cfSection = doc.getElementById("coverflow");
    var cfDeck = doc.getElementById("cf-deck");
    var cfCards = [].slice.call(cfDeck.querySelectorAll(".cf-card"));
    var cfHalo = cfSection.querySelector(".cf-halo");
    var cfLive = doc.getElementById("cf-live");
    var cfGlows = cfCards.map(function (c) { return c.getAttribute("data-glow") || "#B98A3E"; });
    var cfReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var CFN = cfCards.length;
    var CFG2 = { gap: 150, rotate: 38, depth: 150, drop: 24, shrink: 0.14, fade: 0.26, dim: 0.2, visible: 3 };
    var CF_W = 230, CF_H = 330, CF_PERSP = 1680, CF_AUTO = 3600, CF_EASE = 0.14, CF_SENS = 0.0072, CF_START = Math.floor(CFN / 2);
    var cfScale = 1;
    function cfLayout() {
      var f = Math.max(0.56, Math.min(1, innerWidth / 1180));
      cfSection.style.setProperty("--cf-cw", Math.round(CF_W * f) + "px");
      cfSection.style.setProperty("--cf-ch", Math.round(CF_H * f) + "px");
      cfSection.style.setProperty("--cf-persp", Math.max(1050, CF_PERSP * f) + "px");
      cfScale = f;
    }
    addEventListener("resize", cfLayout); cfLayout();
    var cfPos = CF_START, cfTarget = CF_START;
    var cfWrap = function (o) { o = ((o % CFN) + CFN) % CFN; return o > CFN / 2 ? o - CFN : o; };
    function cfPaint() {
      for (var i = 0; i < CFN; i++) {
        var o = cfWrap(i - cfPos), ao = Math.abs(o), el = cfCards[i];
        if (ao > CFG2.visible + 0.5) { el.style.opacity = "0"; el.style.pointerEvents = "none"; continue; }
        var sc = Math.max(0.4, 1 - ao * CFG2.shrink);
        el.style.transform = "translateX(" + (o * CFG2.gap * cfScale) + "px) translateY(" + (ao * CFG2.drop * cfScale) + "px) translateZ(" + (-ao * CFG2.depth * cfScale) + "px) rotateY(" + (-o * CFG2.rotate) + "deg) scale(" + sc + ")";
        el.style.opacity = String(Math.max(0, 1 - ao * CFG2.fade));
        el.style.filter = "brightness(" + Math.max(0.3, 1 - ao * CFG2.dim) + ") saturate(" + (1 + (1 - Math.min(1, ao)) * 0.25) + ")";
        el.style.zIndex = String(Math.round(100 - ao * 10));
        el.style.pointerEvents = "auto";
      }
      var active = ((Math.round(cfPos) % CFN) + CFN) % CFN;
      cfHalo.style.setProperty("--cf-halo", cfGlows[active]);
      cfSection.style.setProperty("--cf-halo", cfGlows[active]);
    }
    var cfLast = -1, cfDragging = false, cfMoved = false, cfLastX = 0, cfStartX = 0, cfVel = 0;
    function cfFrame() {
      if (!cfDragging) { if (cfReduce) cfPos = cfTarget; else { cfPos += (cfTarget - cfPos) * CF_EASE; if (Math.abs(cfTarget - cfPos) < 0.001) cfPos = cfTarget; } }
      cfPaint();
      var active = ((Math.round(cfPos) % CFN) + CFN) % CFN;
      if (active !== cfLast) { cfLast = active; if (cfLive) cfLive.textContent = "Photo " + (active + 1) + " of " + CFN; }
      requestAnimationFrame(cfFrame);
    }
    function cfGo(i) { var cur = Math.round(cfTarget); cfTarget = cur + cfWrap(i - cur); }
    var cfNext = function () { cfTarget += 1; }, cfPrev = function () { cfTarget -= 1; };
    var cfHover = false, cfTimer = null;
    var cfAutoActive = function () { return CF_AUTO > 0 && !cfReduce && !cfHover && !cfDragging && !document.hidden; };
    function cfSyncAuto() { clearInterval(cfTimer); cfTimer = null; if (cfAutoActive()) cfTimer = setInterval(cfNext, CF_AUTO); }
    cfCards.forEach(function (el, i) { el.addEventListener("click", function () { if (!cfMoved) cfGo(i); }); });
    cfStage.addEventListener("pointerdown", function (e) { cfDragging = true; cfMoved = false; cfLastX = cfStartX = e.clientX; cfVel = 0; cfStage.classList.add("-drag"); try { cfStage.setPointerCapture(e.pointerId); } catch (_) {} cfSyncAuto(); });
    cfStage.addEventListener("pointermove", function (e) { if (!cfDragging) return; var dx = e.clientX - cfLastX; cfLastX = e.clientX; if (Math.abs(e.clientX - cfStartX) > 5) cfMoved = true; var d = -dx * CF_SENS; cfPos += d; cfVel = d; cfPaint(); });
    var cfRelease = function () { if (!cfDragging) return; cfDragging = false; cfStage.classList.remove("-drag"); cfTarget = Math.round(cfPos + cfVel * 8); cfVel = 0; cfSyncAuto(); };
    cfStage.addEventListener("pointerup", cfRelease); cfStage.addEventListener("pointercancel", cfRelease);
    cfSection.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { cfNext(); e.preventDefault(); } else if (e.key === "ArrowLeft") { cfPrev(); e.preventDefault(); } });
    cfStage.addEventListener("mouseenter", function () { cfHover = true; cfSyncAuto(); });
    cfStage.addEventListener("mouseleave", function () { cfHover = false; cfSyncAuto(); });
    document.addEventListener("visibilitychange", cfSyncAuto);
    cfGo(CF_START); cfPos = CF_START; cfFrame(); cfSyncAuto();
  }
})();
