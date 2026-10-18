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
})();
