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

  // ---- balanced grid masonry (packs tiles tight, no empty columns) ----
  function masonry() {
    doc.querySelectorAll(".masonry").forEach(function (grid) {
      grid.classList.add("masonry--js");
      var cs = getComputedStyle(grid);
      var rows = parseFloat(cs.gridAutoRows) || 8;
      var gap = parseFloat(cs.rowGap || cs.gap) || 16;
      grid.querySelectorAll(".ph").forEach(function (ph) {
        if (ph.classList.contains("is-hidden")) { ph.style.gridRowEnd = ""; return; }
        var img = ph.querySelector("img");
        if (!img) return;
        var w = ph.getBoundingClientRect().width;
        var aw = parseFloat(img.getAttribute("width")) || img.naturalWidth || 1;
        var ah = parseFloat(img.getAttribute("height")) || img.naturalHeight || 1;
        var h = w * (ah / aw);
        ph.style.gridRowEnd = "span " + Math.max(1, Math.ceil((h + gap) / (rows + gap)));
      });
    });
  }
  if (doc.querySelector(".masonry")) {
    masonry();
    window.addEventListener("load", masonry);
    var _rt;
    window.addEventListener("resize", function () { clearTimeout(_rt); _rt = setTimeout(masonry, 120); });
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
        var ch = Math.max(160, Math.min(vh * 0.52, vw * 0.4, 330));
        var cw = ch * CARD_ASPECT;
        var r = Math.max(vw * RADIUS_VW, cw * RADIUS_MINK);
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
})();
