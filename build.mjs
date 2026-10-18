// Static site generator for Enchanted Booth Co.
// Usage: node build.mjs  → writes every page + llms.txt / robots.txt / sitemap.xml into ./site
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  site, nav, navMore, alwaysIncluded, packages, addOns, travel, steps,
  customization, booking, events, areas, faqs, gallery, galleryCats, reviews,
} from "./data.mjs";

const OUT = path.resolve("site");
const D = site.domain;
const warnings = [];
const imgDims = JSON.parse(fs.readFileSync(path.join(OUT, "assets/img/manifest.json"), "utf8"));

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (html) => html.replace(/<[^>]+>/g, "");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const money = (n) => `$${n}`;
const ver = (p) => crypto.createHash("sha1").update(fs.readFileSync(path.join(OUT, p))).digest("hex").slice(0, 10);
const asset = (p) => `/${p}?v=${ver(p)}`;

const img = (key, alt, { sizes = "(max-width: 760px) 100vw, 50vw", cls = "", eager = false } = {}) => {
  const d = imgDims[key];
  if (!d) { warnings.push(`missing image key: ${key}`); return ""; }
  const [w, h] = d.lg.split("x").map(Number);
  return `<img src="/assets/img/${key}-lg.webp" srcset="/assets/img/${key}-sm.webp ${d.sw}w, /assets/img/${key}-lg.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""} ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
};
const altFor = (key) => gallery.find((g) => g.key === key)?.alt || `${site.name} photo booth in ${site.metro}`;

// Collage: several photos as a loose, tilted, overlapping pile of prints
// (deliberately not a tidy grid).
const collage = (keys) => {
  const slot = ["a", "b", "c", "d", "e", "f"];
  return `<div class="collage">${keys.slice(0, 6).map((k, i) => `<figure class="collage__ph collage__ph--${slot[i]}">${img(k, altFor(k), { sizes: "(max-width: 760px) 40vw, 18vw", cls: "collage__img" })}</figure>`).join("")}</div>`;
};

// primary call to action (quote). js-cta drives the "one CTA on screen" logic.
const quoteBtn = (label = "Get a quote", cls = "") =>
  `<a class="btn btn--primary js-cta ${cls}" href="/contact/">${esc(label)}</a>`;
const ghostBtn = (label, href, cls = "") =>
  `<a class="btn btn--ghost ${cls}" href="${href}">${esc(label)}</a>`;

// ---------- schema ----------
const bizId = `${D}/#business`;
function businessSchema() {
  const s = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": bizId,
    name: site.name,
    legalName: site.legalName,
    description:
      "Luxury photo booth rental for weddings, corporate events and parties across the Des Moines, Iowa metro. DSLR studio quality, instant prints, custom strip designs and a friendly on-site attendant.",
    url: `${D}/`,
    telephone: site.tel,
    email: site.email,
    image: [`${D}/assets/img/og-image.jpg`, `${D}/assets/img/hero-lg.webp`, `${D}/assets/img/wedding-kiss-lg.webp`],
    logo: `${D}/assets/img/favicon-256.png`,
    priceRange: "$$$",
    currenciesAccepted: "USD",
    paymentAccepted: ["Cash", "Credit Card"],
    slogan: site.tagline,
    knowsAbout: ["Photo booth rental", "Wedding photo booth", "Corporate event photo booth", "Party photo booth"],
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng },
    areaServed: areas.map((a) => ({ "@type": "City", name: a.city, containedInPlace: { "@type": "State", name: site.regionName } })),
    sameAs: [site.instagram, site.facebook, site.tiktok].filter(Boolean),
    makesOffer: packages.map((p) => ({
      "@type": "Offer",
      name: `${p.name} — ${p.hours} photo booth rental`,
      price: String(p.price),
      priceCurrency: "USD",
      url: `${D}/packages/#${p.slug}`,
      itemOffered: { "@type": "Service", name: p.name, serviceType: "Photo booth rental", description: p.blurb },
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Photo booth packages",
      itemListElement: packages.map((p) => ({
        "@type": "Offer",
        price: String(p.price),
        priceCurrency: "USD",
        itemOffered: { "@type": "Service", name: p.name, serviceType: "Photo booth rental" },
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      name: "Get a quote",
      target: { "@type": "EntryPoint", urlTemplate: `${D}/contact/` },
    },
  };
  if (site.googleRating >= 4.6) {
    s.aggregateRating = { "@type": "AggregateRating", ratingValue: site.googleRating.toFixed(1), reviewCount: String(site.googleReviewCount), bestRating: "5", worstRating: "1" };
    s.review = reviews.items.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: String(r.stars), bestRating: "5" },
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.quote,
      publisher: { "@type": "Organization", name: reviews.source },
    }));
  }
  return s;
}
const breadcrumb = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${D}${t.href}` })),
});
const faqSchema = (list) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
});
const serviceSchema = (e) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: e.h1,
  serviceType: e.kicker,
  description: e.description,
  provider: { "@id": bizId },
  areaServed: areas.map((a) => ({ "@type": "City", name: a.city })),
  url: `${D}/${e.slug}/`,
});
const areaServiceSchema = (a) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: `Photo booth rental in ${a.city}, ${site.region}`,
  serviceType: "Photo booth rental",
  provider: { "@id": bizId },
  areaServed: { "@type": "City", name: a.city, containedInPlace: { "@type": "State", name: site.regionName } },
  url: `${D}/service-areas/${a.slug}/`,
});
const siteNavSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Primary navigation",
  itemListElement: [...nav, ...navMore, { label: "Contact", href: "/contact/" }].map((n, i) => ({
    "@type": "SiteNavigationElement",
    position: i + 1,
    name: n.label,
    url: `${D}${n.href}`,
  })),
});

// ---------- layout ----------
function head({ title, description, pathName, ogImage = "/assets/img/og-image.jpg", schema = [] }) {
  if (title.length > 60) warnings.push(`title > 60 (${title.length}): ${pathName}`);
  if (description.length > 160 || description.length < 70) warnings.push(`description ${description.length} chars: ${pathName}`);
  const url = `${D}${pathName}`;
  const robots = site.indexable ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, nofollow";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(site.name)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#284f3f">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=yes">
<meta name="geo.region" content="US-${site.region}">
<meta name="geo.placename" content="${site.city}, ${site.regionName}">
<meta name="geo.position" content="${site.lat};${site.lng}">
<meta name="ICBM" content="${site.lat}, ${site.lng}">
<meta property="og:type" content="business.business">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${D}${ogImage}">
<meta property="og:image:alt" content="${esc(site.name)} luxury photo booth in the Des Moines metro">
<meta property="business:contact_data:locality" content="${site.city}">
<meta property="business:contact_data:region" content="${site.region}">
<meta property="business:contact_data:country_name" content="United States">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${D}${ogImage}">
<meta name="apple-mobile-web-app-title" content="Enchanted Booth">
<meta name="mobile-web-app-capable" content="yes">
<meta name="application-name" content="${esc(site.name)}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="/assets/img/favicon-256.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${asset("assets/css/site.css")}">
${schema.map(ld).join("\n")}
<script src="${asset("assets/js/site.js")}" defer></script>
</head>`;
}

function header(current) {
  const link = (n) => `<li><a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr" data-header>
  <div class="wrap hdr__inner">
    <a class="brand" href="/" aria-label="${esc(site.name)}, home">
      <img class="brand__logo" src="/assets/img/logo-wordmark.png" width="680" height="150" alt="" fetchpriority="high">
    </a>
    <nav class="nav" aria-label="Main">
      <button class="nav__toggle" aria-expanded="false" aria-controls="nav-list"><span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span></button>
      <ul id="nav-list" class="nav__list">
        ${nav.map(link).join("")}
        <li class="nav__more">
          <button class="nav__more-btn" aria-expanded="false">More <span aria-hidden="true">▾</span></button>
          <ul class="nav__sub">${navMore.map(link).join("")}</ul>
        </li>
        <li class="nav__cta-mobile">${quoteBtn("Get a quote")}</li>
      </ul>
    </nav>
    <a class="btn btn--primary btn--sm hdr__cta" data-header-cta href="/contact/">Get a quote</a>
  </div>
</header>`;
}

function footer() {
  const col = (title, links) =>
    `<div><h2 class="foot__h">${title}</h2><ul class="foot__links">${links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul></div>`;
  return `<footer class="foot">
  <div class="wrap foot__cta">
    <div>
      <p class="eyebrow eyebrow--gold">Let's make it enchanted</p>
      <p class="foot__cta-title">Tell us your date. We will hold it with a quote.</p>
    </div>
    <div class="cta-row">${quoteBtn("Get a quote")}<a class="btn btn--ghost btn--ghost-light" href="tel:${site.tel}">${esc(site.phone)}</a></div>
  </div>
  <div class="wrap foot__grid">
    <div class="foot__brand">
      <a class="brand--foot" href="/" aria-label="${esc(site.name)}, home"><img class="foot__logo-img" src="/assets/img/logo-full.png" width="560" height="568" alt="" loading="lazy"></a>
      <p>Luxury photo booth rental for weddings, corporate events and parties across the ${site.metro}. DSLR quality, instant prints, real attendants.</p>
      <p class="foot__socials"><a href="${site.instagram}" target="_blank" rel="noopener">Instagram</a> · <a href="${site.facebook}" target="_blank" rel="noopener">Facebook</a> · <a href="${site.tiktok}" target="_blank" rel="noopener">TikTok</a></p>
    </div>
    ${col("Explore", [...nav, ...navMore])}
    ${col("Events", events.map((e) => ({ label: e.navLabel, href: `/${e.slug}/` })))}
    <div>
      <h2 class="foot__h">Get in touch</h2>
      <ul class="foot__links">
        <li><a href="tel:${site.tel}">${esc(site.phone)}</a></li>
        <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
        <li>${esc(site.hoursLine)}</li>
        <li>Based in ${esc(site.base)}</li>
      </ul>
    </div>
  </div>
  <div class="wrap foot__bottom">
    <small class="foot__copyright">&copy; ${new Date().getFullYear()} ${esc(site.legalName)}. &middot; <a href="/privacy/">Privacy &amp; cookies</a></small>
  </div>
</footer>`;
}

function promo() {
  if (!site.promo.enabled) return "";
  const p = site.promo;
  return `<div class="promo" id="promo" role="dialog" aria-modal="true" aria-labelledby="promo-title" hidden>
  <div class="promo__card">
    <button class="promo__close" aria-label="Close">&times;</button>
    <div class="promo__media">${img("bride-squad", altFor("bride-squad"), { sizes: "(max-width: 760px) 100vw, 320px" })}</div>
    <div class="promo__body">
      <p class="eyebrow eyebrow--gold">${esc(p.eyebrow)}</p>
      <p class="promo__title" id="promo-title">${esc(p.title)}</p>
      <p>${esc(p.text)}</p>
      <a class="btn btn--primary js-cta" href="/contact/">${esc(p.cta)}</a>
    </div>
  </div>
</div>`;
}

function page({ pathName, title, description, schema = [], body, current, ogImage }) {
  const html = `${head({ title, description, pathName, schema: [businessSchema(), ...schema], ogImage })}
<body>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
${promo()}
</body>
</html>`;
  const dir = pathName === "/" ? OUT : path.join(OUT, pathName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

// ---------- shared section builders ----------
const eyebrow = (idx, text, gold = false) =>
  `<span class="eyebrow${gold ? " eyebrow--gold" : ""}">${idx ? `<span class="idx">${idx}</span>` : ""}${esc(text)}</span>`;

function packageCard(p, { compact = false } = {}) {
  const list = (compact ? p.includes.slice(0, 4) : p.includes)
    .map(([h, d]) => `<li><span class="pkg__li-h">${esc(h)}</span>${compact ? "" : `<span class="pkg__li-d">${esc(d)}</span>`}</li>`).join("");
  return `<article class="pkg${p.featured ? " pkg--featured" : ""}" id="${p.slug}">
    ${p.featured ? '<span class="pkg__badge">Most popular</span>' : ""}
    <p class="pkg__tier">${esc(p.tier)}</p>
    <h3 class="pkg__name">${esc(p.name)}</h3>
    <p class="pkg__price">${money(p.price)}<span class="pkg__hours">${esc(p.hours)} of service</span></p>
    <p class="pkg__blurb">${esc(p.blurb)}</p>
    ${p.plus ? `<p class="pkg__plus">${esc(p.plus)}</p>` : '<p class="pkg__plus">What\'s included</p>'}
    <ul class="pkg__list">${list}</ul>
    ${quoteBtn("Check availability", "btn--block")}
  </article>`;
}

function stepsBlock() {
  return `<ol class="steps">${steps.map((s) => `<li class="step"><span class="step__n">${s.n}</span><h3 class="step__t">${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>`;
}

function faqBlock(list) {
  return `<div class="faqs">${list.map((f, i) => `<details class="faq"${i === 0 ? " open" : ""}><summary><span>${esc(f.q)}</span><span class="faq__i" aria-hidden="true"></span></summary><div class="faq__a">${f.a}</div></details>`).join("")}</div>`;
}

const pageHead = (trail, kicker, h1, lede) => `<section class="band band--head">
  <div class="wrap">
    <ol class="crumbs">${trail.map((t, i) => i < trail.length - 1 ? `<li><a href="${t.href}">${esc(t.name)}</a></li>` : `<li aria-current="page">${esc(t.name)}</li>`).join('<li class="crumbs__sep" aria-hidden="true">›</li>')}</ol>
    ${kicker ? eyebrow("", kicker, true) : ""}
    <h1 class="page-h1">${esc(h1)}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ""}
  </div>
</section>`;

const finalCta = (title = "Ready to make it enchanted?", text = "Send your date and event type. We will come back with a package that fits and hold your spot.") =>
  `<section class="band band--cta">
    <div class="wrap cta-band">
      <div><p class="eyebrow eyebrow--gold">Get a quote</p><h2>${esc(title)}</h2><p class="lede">${esc(text)}</p></div>
      <div class="cta-row">${quoteBtn("Get a quote")}<a class="btn btn--ghost btn--ghost-light" href="tel:${site.tel}">${esc(site.phone)}</a></div>
    </div>
  </section>`;

// ---------- reviews ----------
const starRow = (n = 5) => `<span class="stars" aria-hidden="true">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
function reviewCard(r) {
  return `<figure class="review">
    <div class="review__top">${starRow(r.stars)}<span class="review__src">Google</span></div>
    <blockquote class="review__q">${esc(r.quote)}</blockquote>
    <figcaption class="review__by"><span class="review__name">${esc(r.author)}</span><span class="review__date">${esc(r.dateText)}</span></figcaption>
  </figure>`;
}
const chevSvg = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dir === "left" ? '<path d="m15 18-6-6 6-6"/>' : '<path d="m9 18 6-6-6-6"/>'}</svg>`;
function reviewsBand({ heading = "Loved across the Des Moines metro", soft = true } = {}) {
  if (!(site.googleRating >= 4.6) || !reviews.items.length) return "";
  const rr = site.googleRating.toFixed(1);
  return `<section class="band${soft ? " band--soft" : ""} band--tight reviews">
  <div class="wrap">
    <div class="section-head reviews__head">
      <div>${eyebrow("", "Reviews", true)}<h2 class="section-h">${esc(heading)}</h2></div>
      <a class="reviews__score" href="${site.googleReviewsUrl}" target="_blank" rel="noopener" aria-label="${rr} out of 5 stars from ${site.googleReviewCount} Google reviews">
        <span class="reviews__num">${rr}</span>${starRow(5)}<span class="reviews__count">${site.googleReviewCount} Google reviews</span>
      </a>
    </div>
    <div class="revcar" data-revcar>
      <div class="revcar__viewport"><div class="revcar__track">${reviews.items.map(reviewCard).join("")}</div></div>
      <div class="revcar__foot">
        <div class="revcar__nav">
          <button class="revcar__arrow" type="button" data-rev-prev aria-label="Previous reviews">${chevSvg("left")}</button>
          <span class="revcar__count" data-rev-count aria-live="polite"></span>
          <button class="revcar__arrow" type="button" data-rev-next aria-label="Next reviews">${chevSvg("right")}</button>
        </div>
        <a class="btn btn--ghost" href="${site.googleReviewsUrl}" target="_blank" rel="noopener">Read all ${site.googleReviewCount} reviews on Google</a>
      </div>
    </div>
  </div>
</section>`;
}

// ---------- cards-cascade gallery (scroll-driven 3D deck) ----------
const cascadeCards = [
  { key: "groomsmen", kicker: "Weddings", tag: "Wedding", title: "The Party", meta: "Groomsmen, sharp and ready for the dance floor." },
  { key: "nye-group", kicker: "Celebrations", tag: "New Year", title: "Midnight", meta: "Ringing it in at the sequin backdrop." },
  { key: "bride-squad", kicker: "Weddings", tag: "Wedding", title: "Bride Squad", meta: "The crew, matched to the moment." },
  { key: "gala-trio", kicker: "Galas", tag: "Gala", title: "Golden Hour", meta: "Props, champagne and a little sparkle." },
  { key: "holiday-couple", kicker: "Holidays", tag: "Holiday", title: "Festive", meta: "Gold fringe and good company." },
  { key: "friends-laugh", kicker: "Weddings", tag: "Wedding", title: "All Smiles", meta: "The laugh you only get in a booth." },
  { key: "wedding-kiss", kicker: "Weddings", tag: "Wedding", title: "The Toast", meta: "Draped backdrop, timeless prints." },
  { key: "group-women", kicker: "Corporate", tag: "Event", title: "The Team", meta: "Dressed up for the company party." },
  { key: "bridesmaids", kicker: "Weddings", tag: "Wedding", title: "The Line-Up", meta: "Bridesmaids in black, drinks in hand." },
  { key: "booth-candid", kicker: "The Prints", tag: "Strips", title: "The Strip", meta: "Guests with their fresh photo strips." },
  { key: "couple-bw", kicker: "Weddings", tag: "Wedding", title: "Just Us", meta: "A clean portrait on a white backdrop." },
];
function cascadeSection() {
  const N = cascadeCards.length;
  const cards = cascadeCards.map((c, i) => {
    const idx = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    return `<article class="casc-card">
      <div class="casc-card__face">
        <img class="casc-card__img" src="/assets/img/${c.key}-lg.webp" alt="${esc(altFor(c.key))}" draggable="false" decoding="async" loading="lazy">
        <div class="casc-card__scrim"></div>
        <div class="casc-card__body">
          <div class="casc-card__top"><span class="casc-card__idx">${idx}</span><span class="casc-card__tag">${esc(c.tag)}</span></div>
          <div class="casc-card__foot"><p class="casc-card__kicker">${esc(c.kicker)}</p><h3 class="casc-card__title">${esc(c.title)}</h3><p class="casc-card__meta">${esc(c.meta)}</p></div>
        </div>
      </div>
    </article>`;
  }).join("");
  const ticks = cascadeCards.map((c, i) => `<button class="casc-rail__tick" type="button" role="tab" aria-label="Card ${i + 1}: ${esc(c.title)}" data-i="${i}" style="top:${N > 1 ? (i / (N - 1)) * 100 : 0}%"></button>`).join("");
  return `<section id="cascade" class="cascade" aria-roledescription="carousel" aria-label="Photo booth gallery deck">
  <div class="casc-sticky">
    <div class="casc-stage" id="casc-stage"><div class="casc-deck" id="casc-deck">${cards}</div></div>
    <div class="casc-hero">
      <span class="casc-hero__eyebrow">The Gallery · ${esc(site.metro)}</span>
      <h2 class="casc-hero__title">Real<br><em>moments</em></h2>
      <p class="casc-hero__sub">Real weddings, parties and corporate events across the metro. Scroll through a few of our favorite nights, then see the whole gallery.</p>
      <a class="casc-cta" href="/gallery/"><span>See the full gallery</span><span class="casc-cta__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span></a>
    </div>
    <div class="casc-rail">
      <div class="casc-rail__count"><span class="casc-rail__cur" id="casc-cur">01</span><span class="casc-rail__tot">/${String(N).padStart(2, "0")}</span></div>
      <div class="casc-rail__track" id="casc-track" role="tablist" aria-label="Jump to photo">
        <div class="casc-rail__fill" id="casc-fill"></div><div class="casc-rail__thumb" id="casc-thumb"></div>${ticks}
      </div>
      <div class="casc-rail__label" id="casc-label">${esc(cascadeCards[0].title)}</div>
    </div>
    <div class="sr-only" id="casc-live" aria-live="polite"></div>
  </div>
</section>`;
}

// ---------- pages ----------
function buildHome() {
  const featChips = ["DSLR camera quality", "Instant pro prints", "Studio lighting", "Friendly on-site attendants"];
  const body = `
<section class="fanhero" id="fanhero">
  <h1 class="sr-only">Des Moines' most enchanted photo booth — luxury photo booth rental for weddings, parties and corporate events</h1>
  <div class="fanhero__stage" id="fanhero-stage">
    <div class="fanwheel" id="fanhero-wheel" data-images='${JSON.stringify(["groomsmen", "bride-squad", "nye-group", "gala-trio", "holiday-couple", "friends-laugh", "wedding-kiss", "group-women"].map((k) => `/assets/img/${k}-lg.webp`))}'></div>
    <div class="fanhero__scrim" aria-hidden="true"></div>
    <div class="fanhero__tl" aria-hidden="true">
      <div class="fanbrand"><span class="fanbrand__mark"></span>${esc(site.metro)}</div>
    </div>
  </div>
  <div class="fanhero__content">
    <div class="wrap">
      <p class="eyebrow eyebrow--gold">Luxury photo booth · ${esc(site.metro)}</p>
      <div class="fantype fantype--bottom" aria-hidden="true"><span>The most <em>enchanted</em></span><span>photo booth</span></div>
      <p class="fanhero__lede">Studio-quality photos, instant prints and a friendly attendant for weddings, parties and corporate events across the ${esc(site.metro)}. Grab the fan above and give it a spin.</p>
      <div class="cta-row">${quoteBtn("Get a quote")}${ghostBtn("View packages", "/packages/")}</div>
    </div>
  </div>
</section>

<section class="band band--soft designed">
  <div class="wrap split">
    <div class="designed__media">${img("booth-unit", "The custom-built Enchanted Booth Co. photo booth with studio lighting", { sizes: "(max-width: 760px) 100vw, 40vw" })}</div>
    <div class="designed__text">
      ${eyebrow("", "The Enchanted Booth", true)}
      <h2 class="section-h">Not rented. <em>Designed.</em></h2>
      <p>Every detail of our booth is intentional, from the studio lighting to the backdrop to the strip in your hand. It is built to look like it belongs at your event, not like equipment that got hauled in.</p>
      <ul class="ticks">${alwaysIncluded.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      ${ghostBtn("See how it works", "/how-it-works/")}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "How it works", true)}<h2 class="section-h">Three simple steps</h2><p class="lede">No complicated setup, no confusing tech. Just step up and smile.</p></div>
    ${stepsBlock()}
  </div>
</section>

<section class="band band--soft">
  <div class="wrap">
    <div class="section-head"><div>${eyebrow("", "Packages & pricing", true)}<h2 class="section-h">Choose your experience</h2></div><p class="lede">Every booking includes the DSLR studio setup, free setup and breakdown, and a friendly on-site attendant.</p></div>
    <div class="pkg-grid">${packages.map((p) => packageCard(p, { compact: true })).join("")}</div>
    <div class="section-foot">${ghostBtn("Compare full packages", "/packages/")}</div>
  </div>
</section>

<section class="band custom">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Customization", true)}<h2 class="section-h">Make it yours</h2><p class="lede">Choose from our collection of backdrops and photo strip designs to match your event perfectly.</p></div>
    <div class="custom-grid">
      <article class="custom-card custom-card--collage">${collage(customization.backdrops.imgs)}<div class="custom-card__body"><h3>${esc(customization.backdrops.title)}</h3><p>${esc(customization.backdrops.text)}</p></div></article>
      <article class="custom-card">${img(customization.strips.img, altFor(customization.strips.img), { sizes: "(max-width: 760px) 100vw, 45vw" })}<div class="custom-card__body"><h3>${esc(customization.strips.title)}</h3><p>${esc(customization.strips.text)}</p></div></article>
    </div>
  </div>
</section>

<section class="band band--soft">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Every occasion", true)}<h2 class="section-h">Built for your event</h2></div>
    <div class="events-grid">
      ${events.map((e) => `<a class="event-card" href="/${e.slug}/"><div class="event-card__media">${img(e.hero, altFor(e.hero), { sizes: "(max-width: 760px) 100vw, 33vw" })}</div><div class="event-card__body"><h3>${esc(e.name)}</h3><p>${esc(e.intro.split(". ")[0])}.</p><span class="arrow">Explore ${esc(e.navLabel.toLowerCase())} →</span></div></a>`).join("")}
    </div>
  </div>
</section>

${cascadeSection()}

${reviewsBand({ heading: "Loved across the Des Moines metro", soft: false })}

<section class="band band--soft">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Where we go", true)}<h2 class="section-h">Serving the Des Moines metro</h2><p class="lede">Based in ${esc(site.base)}, with complimentary travel across the metro. Travel fees for farther events are confirmed before you book.</p></div>
    <ul class="area-chips">${areas.map((a) => `<li><a href="/service-areas/${a.slug}/">Photo booth rental in ${esc(a.city)}</a></li>`).join("")}</ul>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="section-head"><div>${eyebrow("", "Good to know", true)}<h2 class="section-h">Your questions, answered</h2></div>${ghostBtn("All FAQs", "/faq/")}</div>
    ${faqBlock(faqs.slice(0, 5))}
  </div>
</section>

${finalCta()}`;
  page({
    pathName: "/",
    title: "Enchanted Booth Co. | Photo Booth Rental in Des Moines, IA",
    description: "Luxury photo booth rental for weddings, parties and corporate events in the Des Moines, Iowa metro. DSLR quality, instant prints and a friendly attendant.",
    schema: [faqSchema(faqs.slice(0, 5)), siteNavSchema()],
    body,
    current: "/",
  });
}

function buildPackages() {
  const trail = [{ name: "Home", href: "/" }, { name: "Packages", href: "/packages/" }];
  const body = `
${pageHead(trail, "Packages & pricing", "Photo booth packages & pricing in Des Moines", "Every booking features our professional DSLR studio setup, free setup and breakdown, and a friendly on-site attendant. Pick the experience that fits your event.")}

<section class="band band--tight">
  <div class="wrap"><div class="pkg-grid pkg-grid--full">${packages.map((p) => packageCard(p)).join("")}</div></div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap split">
    <div>
      ${eyebrow("", "Add-ons", true)}
      <h2 class="section-h">Make it exactly yours</h2>
      <ul class="addons">${addOns.map((a) => `<li><span class="addon__name">${esc(a.name)}</span><span class="addon__price">${esc(a.price)}</span><span class="addon__note">${esc(a.note)}</span></li>`).join("")}</ul>
    </div>
    <div>
      ${eyebrow("", "Travel", true)}
      <h2 class="section-h">Complimentary travel included</h2>
      <p>${esc(travel.note)} <a href="/photo-booth-cost/">See the full pricing guide →</a></p>
      <table class="rate-table"><tbody>${travel.tiers.map(([r, p]) => `<tr><th scope="row">${esc(r)}</th><td>${esc(p)}</td></tr>`).join("")}</tbody></table>
    </div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Good to know", true)}<h2 class="section-h">Booking basics</h2></div>
    <div class="info-grid">
      <div class="info-card"><h3>Deposit</h3><p>${esc(booking.deposit)}</p></div>
      <div class="info-card"><h3>Reschedules</h3><p>${esc(booking.reschedule)}</p></div>
      <div class="info-card"><h3>Setup</h3><p>${esc(booking.setup)}</p></div>
      <div class="info-card"><h3>Insured</h3><p>${esc(booking.insured)}</p></div>
    </div>
  </div>
</section>

${finalCta()}`;
  page({
    pathName: "/packages/",
    title: "Photo Booth Packages & Pricing | Enchanted Booth Co.",
    description: "Photo booth packages in Des Moines start at $499. Compare Classic, Signature and Premium: DSLR quality, unlimited prints, custom designs and add-ons.",
    schema: [breadcrumb(trail)],
    body,
    current: "/packages/",
  });
}

function coverflowSection() {
  const cfc = [
    { key: "bride-squad", glow: "#B98A3E" }, { key: "nye-group", glow: "#6E8C7A" },
    { key: "gala-trio", glow: "#C8923D" }, { key: "groomsmen", glow: "#3E6B54" },
    { key: "wed-08", glow: "#9D6F25" }, { key: "holiday-couple", glow: "#D1A24E" },
    { key: "wed-13", glow: "#5A7A6B" }, { key: "friends-laugh", glow: "#B98A3E" },
    { key: "party-07", glow: "#C8923D" },
  ];
  const N = cfc.length;
  const items = cfc.map((c, i) => `<button type="button" class="cf-card" aria-label="${esc(altFor(c.key))}, photo ${i + 1} of ${N}" data-glow="${c.glow}"><span class="cf-card__inner"><span class="cf-card__media"><img src="/assets/img/${c.key}-lg.webp" alt="${esc(altFor(c.key))}" draggable="false" loading="lazy"></span></span></button>`).join("");
  return `<section id="coverflow" class="coverflow" aria-roledescription="carousel" aria-label="Gallery showcase">
  <div class="cf-halo" aria-hidden="true"></div>
  <div class="cf-stage" id="cf-stage" role="group" aria-label="Drag, swipe or use arrow keys to browse photos"><div class="cf-deck" id="cf-deck">${items}</div></div>
  <h2 class="cf-caption">Moments that stand out</h2>
  <a class="cf-cta js-cta" href="/contact/"><span>Get a quote</span><span class="cf-cta__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span></a>
  <p class="sr-only" aria-live="polite" id="cf-live"></p>
</section>`;
}
function buildGallery() {
  const trail = [{ name: "Home", href: "/" }, { name: "Gallery", href: "/gallery/" }];
  const filters = galleryCats.map((c, i) => `<button class="gfilter${i === 0 ? " is-active" : ""}" data-filter="${c.id}">${esc(c.label)}</button>`).join("");
  const items = gallery.map((g) => `<figure class="ph" data-cat="${g.cat}">${img(g.key, g.alt, { sizes: "(max-width: 760px) 50vw, 25vw" })}</figure>`).join("");
  const body = `
${pageHead(trail, "The gallery", "Photo booth gallery from Des Moines events", "Real weddings, parties and corporate events across the metro. This is what your guests get, studio-quality photos and custom strips they actually keep.")}
<section class="band band--tight">
  <div class="wrap wrap--narrow prose">
    <p>Every photo in this gallery was taken at a real event across the ${esc(site.metro)} on our professional DSLR open-air booth. It is the clearest preview of what your own guests walk away with: sharp, well-lit portraits and custom photo strips they actually keep.</p>
    <p><strong>Weddings.</strong> Bridal parties, grandparents and the whole dance floor, printed on a strip matched to your colors and your date. See more on our <a href="/weddings/">wedding photo booth</a> page.</p>
    <p><strong>Parties &amp; celebrations.</strong> Birthdays, graduations, holiday parties and New Year's, with a prop kit that keeps the booth busy all night. Explore <a href="/parties/">parties and celebrations</a>.</p>
    <p><strong>Corporate events.</strong> Branded strips, a logo on the rear screen and instant sharing for company parties and activations. See <a href="/corporate-events/">corporate events</a>.</p>
    <p><strong>The photo strips.</strong> Every design below is a real custom layout we printed on the night. Ready to plan yours? <a href="/packages/">Compare packages</a> or <a href="/contact/">get a quote</a>.</p>
  </div>
</section>
${coverflowSection()}
<section class="band band--tight">
  <div class="wrap">
    <div class="section-head" style="margin-bottom:1.6rem">${eyebrow("", "Browse everything", true)}<h2 class="section-h">The full gallery</h2></div>
    <div class="masonry" id="gallery-grid">${items}</div>
  </div>
</section>
${finalCta("Want your event in here?", "Tell us the date and we will put together a package that fits.")}`;
  page({
    pathName: "/gallery/",
    title: "Photo Booth Gallery | Enchanted Booth Co. Des Moines",
    description: "Real photo booth moments from weddings, parties and corporate events across the Des Moines metro, plus the custom photo strip designs we print on the night.",
    schema: [breadcrumb(trail)],
    body,
    current: "/gallery/",
  });
}

function buildHowItWorks() {
  const trail = [{ name: "Home", href: "/" }, { name: "How It Works", href: "/how-it-works/" }];
  const body = `
${pageHead(trail, "How it works", "How our photo booth rental works", "No complicated setup, no confusing tech. Here is exactly what booking and event day look like.")}
<section class="band band--tight"><div class="wrap">${stepsBlock()}</div></section>

<section class="band band--soft band--tight">
  <div class="wrap split">
    <div class="designed__media">${img("booth-candid", altFor("booth-candid"), { sizes: "(max-width: 760px) 100vw, 45vw" })}</div>
    <div>
      ${eyebrow("", "On the day", true)}
      <h2 class="section-h">We handle everything</h2>
      <p>${esc(booking.setup)}</p>
      <ul class="ticks">${alwaysIncluded.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "The details", true)}<h2 class="section-h">Deposit, reschedules & insurance</h2></div>
    <div class="info-grid">
      <div class="info-card"><h3>Securing your date</h3><p>${esc(booking.deposit)}</p></div>
      <div class="info-card"><h3>If plans change</h3><p>${esc(booking.reschedule)}</p></div>
      <div class="info-card"><h3>Fully insured</h3><p>${esc(booking.insured)}</p></div>
    </div>
  </div>
</section>

${finalCta()}`;
  page({
    pathName: "/how-it-works/",
    title: "How It Works | Enchanted Booth Co. Photo Booth Rental",
    description: "Booking a photo booth with Enchanted Booth Co. is three simple steps. See what setup, event day, deposits and rescheduling look like before you book.",
    schema: [breadcrumb(trail)],
    body,
    current: "/how-it-works/",
  });
}

function buildFaq() {
  const trail = [{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq/" }];
  const body = `
${pageHead(trail, "Good to know", "Photo booth rental FAQ", "Everything couples, planners and party hosts ask us before booking. Still have a question? Just reach out.")}
<section class="band band--tight"><div class="wrap wrap--narrow">${faqBlock(faqs)}</div></section>
${finalCta()}`;
  page({
    pathName: "/faq/",
    title: "Photo Booth Rental FAQ | Enchanted Booth Co.",
    description: "Answers on pricing, what is included, travel, deposits, insurance and setup for photo booth rental in the Des Moines metro. Packages from $499.",
    schema: [breadcrumb(trail), faqSchema(faqs)],
    body,
    current: "/faq/",
  });
}

function buildPricingGuide() {
  const trail = [{ name: "Home", href: "/" }, { name: "Photo Booth Cost", href: "/photo-booth-cost/" }];
  const bestFor = {
    classic: "Graduation open houses, cocktail hours and intimate gatherings.",
    signature: "Weddings and corporate parties that want unlimited custom prints.",
    premium: "Large galas, full weddings and brand activations.",
  };
  const costFaqs = [
    {
      id: "per-hour",
      q: "How much does a photo booth cost per hour in Des Moines?",
      a: 'Our packages are priced by the event rather than strictly by the hour, starting at $499 for two hours. If you want to keep the booth running longer, extra hours are a flat $100 each. Everything — the DSLR setup, studio lighting, unlimited prints and a friendly attendant — is already included in that price. See the full <a href="/packages/">packages</a>.',
    },
    {
      id: "why-less",
      q: "Why do some photo booths cost less?",
      a: "Budget rentals are usually a tablet on a stand with no attendant and no prints. Every Enchanted Booth package is a professional DSLR booth with studio lighting, your choice of backdrop, unlimited custom photo strips and a real attendant from setup to breakdown — a different experience and a different photo.",
    },
    {
      id: "deposit",
      q: "Is a deposit required?",
      a: "Yes. A 50% deposit secures your date and the balance is due before the event. Deposits are non-refundable but may be applied to a rescheduled date, subject to availability.",
    },
  ];
  const body = `
${pageHead(trail, "Pricing guide", "How much does a photo booth cost in Des Moines?", "Short answer: from $499. Here is the full, no-surprises breakdown — what each package includes, the price per extra hour, travel fees and the deposit — so you can budget your event with confidence.")}

<section class="band band--tight">
  <div class="wrap wrap--narrow prose">
    <p>Photo booth rental in the ${esc(site.metro)} typically runs from about $400 to $1,200 depending on hours, prints and whether a real attendant is included. At Enchanted Booth Co. our pricing is public and flat: <strong>${money(packages[0].price)} to ${money(packages[packages.length - 1].price)}</strong>, with no hidden setup or breakdown fees. Here is exactly what goes into it.</p>
  </div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Package pricing", true)}<h2 class="section-h">What each package costs</h2></div>
    <table class="rate-table rate-table--wide">
      <thead><tr><th scope="col">Package</th><th scope="col">Price</th><th scope="col">Service time</th><th scope="col">Best for</th></tr></thead>
      <tbody>${packages.map((p) => `<tr><th scope="row"><a href="/packages/#${p.slug}">${esc(p.name)}</a></th><td>${money(p.price)}</td><td>${esc(p.hours)}</td><td>${esc(bestFor[p.slug] || p.blurb)}</td></tr>`).join("")}</tbody>
    </table>
    <p class="prose"><a class="arrow" href="/packages/">Compare everything each package includes →</a></p>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap split">
    <div>
      ${eyebrow("", "Add-ons", true)}
      <h2 class="section-h">What changes the price</h2>
      <ul class="addons">${addOns.map((a) => `<li><span class="addon__name">${esc(a.name)}</span><span class="addon__price">${esc(a.price)}</span><span class="addon__note">${esc(a.note)}</span></li>`).join("")}</ul>
    </div>
    <div>
      ${eyebrow("", "Travel", true)}
      <h2 class="section-h">Travel fees</h2>
      <p>${esc(travel.note)}</p>
      <table class="rate-table"><tbody>${travel.tiers.map(([r, p]) => `<tr><th scope="row">${esc(r)}</th><td>${esc(p)}</td></tr>`).join("")}</tbody></table>
    </div>
  </div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap wrap--narrow">
    <div class="section-head">${eyebrow("", "Included at every price", true)}<h2 class="section-h">No surprise line items</h2></div>
    <ul class="ticks">${alwaysIncluded.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <p class="prose">${esc(booking.deposit)}</p>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap"><div class="section-head">${eyebrow("", "Cost questions", true)}<h2 class="section-h">Photo booth pricing FAQ</h2></div>${faqBlock(costFaqs)}</div>
</section>

${finalCta("Want an exact quote for your date?", "Send your event date, city and guest count and we will come back with a flat, all-in price.")}`;
  page({
    pathName: "/photo-booth-cost/",
    title: "Photo Booth Rental Cost in Des Moines, IA | Pricing Guide",
    description: "How much does a photo booth cost in Des Moines? A transparent pricing guide: packages from $499, $100 per extra hour, travel fees, deposits and what's included.",
    schema: [breadcrumb(trail), faqSchema(costFaqs)],
    body,
    current: "",
  });
}

function buildReviews() {
  const trail = [{ name: "Home", href: "/" }, { name: "Reviews", href: "/reviews/" }];
  const rr = site.googleRating.toFixed(1);
  const body = `
${pageHead(trail, "Reviews", "Photo booth reviews in the Des Moines metro", `Enchanted Booth Co. is rated ${rr} stars from ${site.googleReviewCount} Google reviews. Here is what couples, planners and party hosts across the metro say after their event.`)}
${reviewsBand({ heading: "What our clients say", soft: false })}
${finalCta("Ready to be our next five-star event?", "Send your date and we will put together a package that fits and hold your spot.")}`;
  page({
    pathName: "/reviews/",
    title: "Photo Booth Reviews | Enchanted Booth Co. Des Moines",
    description: `Enchanted Booth Co. is rated ${rr}/5 from ${site.googleReviewCount} Google reviews. Read what Des Moines couples, planners and hosts say about our DSLR photo booth.`,
    schema: [breadcrumb(trail)],
    body,
    current: "/reviews/",
  });
}

function buildEvent(e) {
  const trail = [{ name: "Home", href: "/" }, { name: e.navLabel, href: `/${e.slug}/` }];
  const recs = packages.filter((p) => e.recommend.includes(p.slug));
  const evFaqs = faqs.filter((f) => e.faqRefs.includes(f.id));
  const body = `
<section class="band band--head band--head-photo">
  <div class="wrap split split--hero">
    <div>
      <ol class="crumbs">${trail.map((t, i) => i < trail.length - 1 ? `<li><a href="${t.href}">${esc(t.name)}</a></li>` : `<li aria-current="page">${esc(t.name)}</li>`).join('<li class="crumbs__sep" aria-hidden="true">›</li>')}</ol>
      ${eyebrow("", e.kicker, true)}
      <h1 class="page-h1">${esc(e.h1)}</h1>
      <p class="lede">${esc(e.intro)}</p>
      <div class="cta-row">${quoteBtn("Get a quote")}${ghostBtn("View packages", "/packages/")}</div>
    </div>
    <div class="hero__media">${img(e.hero, altFor(e.hero), { sizes: "(max-width: 900px) 100vw, 46vw", eager: true })}</div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="feat-grid">${e.highlights.map(([h, d]) => `<div class="feat"><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap wrap--narrow prose">
    ${e.paras.map((p) => `<p>${esc(p)}</p>`).join("")}
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "From the booth", true)}<h2 class="section-h">${esc(e.name)} we have lit up</h2></div>
    <div class="masonry">${e.gallery.map((k) => `<figure class="ph">${img(k, altFor(k), { sizes: "(max-width: 760px) 50vw, 25vw" })}</figure>`).join("")}</div>
  </div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Recommended", true)}<h2 class="section-h">Packages for ${esc(e.navLabel.toLowerCase())}</h2></div>
    <div class="pkg-grid">${recs.map((p) => packageCard(p, { compact: true })).join("")}</div>
    <div class="section-foot">${ghostBtn("Compare all packages", "/packages/")}</div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap"><div class="section-head">${eyebrow("", "Good to know", true)}<h2 class="section-h">Common questions</h2></div>${faqBlock(evFaqs)}</div>
</section>

${finalCta()}`;
  page({
    pathName: `/${e.slug}/`,
    title: e.title,
    description: e.description,
    schema: [breadcrumb(trail), serviceSchema(e), faqSchema(evFaqs)],
    body,
    current: `/${e.slug}/`,
    ogImage: `/assets/img/${e.hero}-lg.webp`,
  });
}

function buildAreasIndex() {
  const trail = [{ name: "Home", href: "/" }, { name: "Service Areas", href: "/service-areas/" }];
  const body = `
${pageHead(trail, "Where we go", "Photo booth rental across the Des Moines metro", `Enchanted Booth Co. is based in ${site.base} and serves the entire Des Moines metro. Complimentary travel is included with every package; farther events get a travel quote confirmed before you book.`)}
<section class="band band--tight">
  <div class="wrap">
    <div class="area-grid">
      ${areas.map((a) => `<a class="area-card" href="/service-areas/${a.slug}/"><h2>${esc(a.city)}</h2><p>${esc(a.blurb.split(", ")[0])}.</p><span class="arrow">Photo booth rental in ${esc(a.city)} →</span></a>`).join("")}
    </div>
  </div>
</section>
${finalCta()}`;
  page({
    pathName: "/service-areas/",
    title: "Service Areas | Photo Booth Rental in the Des Moines Metro",
    description: "We serve West Des Moines, Des Moines, Ankeny, Waukee, Urbandale, Clive, Johnston, Grimes and the whole metro, with complimentary travel on every package.",
    schema: [breadcrumb(trail)],
    body,
    current: "/service-areas/",
  });
}

function buildArea(a) {
  const trail = [{ name: "Home", href: "/" }, { name: "Service Areas", href: "/service-areas/" }, { name: a.city, href: `/service-areas/${a.slug}/` }];
  const body = `
${pageHead(trail, "Service area", `Photo booth rental in ${a.city}, ${site.region}`, esc(a.blurb))}
<section class="band band--tight">
  <div class="wrap split split--hero">
    <div class="prose">
      <h2 class="section-h">A luxury photo booth, ${esc(a.distance)}</h2>
      <p>We bring the full Enchanted Booth experience to ${esc(a.city)}: a professional DSLR booth, studio lighting, your choice of backdrop, unlimited custom prints and a friendly attendant from setup to breakdown. Popular spots we love nearby include ${esc(a.landmarks)}.</p>
      <p>Every package includes free delivery, setup and breakdown. ${a.travelLine ? esc(a.travelLine) : `${esc(a.city)} sits within our complimentary travel range, so there are no surprise fees, and any travel beyond is confirmed up front.`}</p>
      <div class="cta-row">${quoteBtn("Get a quote")}${ghostBtn("View packages", "/packages/")}</div>
    </div>
    <div class="hero__media">${img("nye-group", altFor("nye-group"), { sizes: "(max-width: 900px) 100vw, 42vw" })}</div>
  </div>
</section>

<section class="band band--soft band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Packages", true)}<h2 class="section-h">Photo booth packages in ${esc(a.city)}</h2></div>
    <div class="pkg-grid">${packages.map((p) => packageCard(p, { compact: true })).join("")}</div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="section-head">${eyebrow("", "Every occasion", true)}<h2 class="section-h">${esc(a.city)} events we cover</h2></div>
    <ul class="area-chips">${events.map((e) => `<li><a href="/${e.slug}/">${esc(e.navLabel)} in ${esc(a.city)}</a></li>`).join("")}<li><a href="/gallery/">See the gallery</a></li></ul>
  </div>
</section>

${finalCta(`Planning something in ${a.city}?`)}`;
  page({
    pathName: `/service-areas/${a.slug}/`,
    title: `Photo Booth Rental in ${a.city}, ${site.region} | Enchanted Booth`,
    description: `Photo booth rental in ${a.city}, ${site.regionName} for weddings, parties and corporate events. DSLR quality, custom prints and complimentary travel. From $499.`,
    schema: [breadcrumb(trail), areaServiceSchema(a)],
    body,
    current: "/service-areas/",
  });
}

function buildContact() {
  const trail = [{ name: "Home", href: "/" }, { name: "Get a Quote", href: "/contact/" }];
  const eventOptions = ["Wedding", "Corporate event", "Birthday", "Graduation", "Holiday party", "Other celebration"];
  const pkgOptions = ["Classic — $499 / 2 hrs", "Signature — $699 / 3 hrs", "Premium — $899 / 4 hrs", "Not sure yet"];
  const body = `
${pageHead(trail, "Get a quote", "Get your photo booth quote", "Tell us about your event and we will come back with a package that fits and hold your date. Most inquiries hear back the same day.")}
<section class="band band--tight">
  <div class="wrap split split--top">
    <div class="contact-aside">
      <h2 class="section-h">Let's talk</h2>
      <p>Prefer to call or text? We are here seven days a week.</p>
      <ul class="contact-list">
        <li><span>Call or text</span><a href="tel:${site.tel}">${esc(site.phone)}</a></li>
        <li><span>Email</span><a href="mailto:${site.email}">${esc(site.email)}</a></li>
        <li><span>Based in</span>${esc(site.base)}</li>
        <li><span>Hours</span>${esc(site.hoursLine)}</li>
      </ul>
      <p class="foot__socials"><a href="${site.instagram}" target="_blank" rel="noopener">Instagram</a> · <a href="${site.facebook}" target="_blank" rel="noopener">Facebook</a> · <a href="${site.tiktok}" target="_blank" rel="noopener">TikTok</a></p>
      <div class="contact-steps"><p class="eyebrow eyebrow--gold">What happens next</p><ol class="mini-steps"><li>Send your details</li><li>We reply with a quote and hold your date</li><li>Pay the deposit to lock it in</li></ol></div>
    </div>
    <form class="card quote-form" action="${site.formEndpoint}" method="POST">
      <input type="hidden" name="_subject" value="New quote request — Enchanted Booth Co.">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="${D}/thank-you/">
      <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="field"><label for="name">Your name</label><input id="name" name="Name" required></div>
      <div class="field-row">
        <div class="field"><label for="email">Email</label><input id="email" type="email" name="Email" required></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" type="tel" name="Phone" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="date">Event date</label><input id="date" type="date" name="Event date"></div>
        <div class="field"><label for="type">Event type</label><select id="type" name="Event type">${eventOptions.map((o) => `<option>${o}</option>`).join("")}</select></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="location">Event city / venue</label><input id="location" name="Location" placeholder="e.g. West Des Moines"></div>
        <div class="field"><label for="guests">Approx. guests</label><input id="guests" type="number" min="1" name="Guest count"></div>
      </div>
      <div class="field"><label for="pkg">Package you are eyeing</label><select id="pkg" name="Package">${pkgOptions.map((o) => `<option>${o}</option>`).join("")}</select></div>
      <div class="field"><label for="msg">Anything else?</label><textarea id="msg" name="Message" rows="4" placeholder="Theme, colors, timing, questions…"></textarea></div>
      <button class="btn btn--primary btn--block" type="submit">Send my request</button>
      <p class="form-note">By sending, you agree to be contacted about your event. No spam, ever.</p>
    </form>
  </div>
</section>`;
  page({
    pathName: "/contact/",
    title: "Get a Quote | Enchanted Booth Co. Photo Booth Rental",
    description: "Get a photo booth quote for your Des Moines wedding, party or corporate event. Send your date and we will hold your spot. Same-day replies, packages from $499.",
    schema: [breadcrumb(trail)],
    body,
    current: "/contact/",
  });
}

function buildThankYou() {
  const body = `
<section class="band band--head" style="min-height:60vh;display:flex;align-items:center">
  <div class="wrap wrap--narrow" style="text-align:center">
    ${eyebrow("", "Request received", true)}
    <h1 class="page-h1">Thank you. Your date is on our radar.</h1>
    <p class="lede">We have your request and will get back to you shortly, usually the same day, with a quote and your availability. In the meantime, feel free to text us at <a href="tel:${site.tel}">${esc(site.phone)}</a>.</p>
    <div class="cta-row" style="justify-content:center">${ghostBtn("Back to home", "/")}${ghostBtn("Browse the gallery", "/gallery/")}</div>
  </div>
</section>`;
  page({
    pathName: "/thank-you/",
    title: "Thank You | Enchanted Booth Co.",
    description: "Your photo booth quote request has been received. We will get back to you shortly with pricing and availability for your Des Moines area event.",
    body,
    current: "",
  });
  // noindex the thank-you page
  const p = path.join(OUT, "thank-you", "index.html");
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace('content="index, follow', 'content="noindex, follow'));
}

function buildPrivacy() {
  const trail = [{ name: "Home", href: "/" }, { name: "Privacy", href: "/privacy/" }];
  const body = `
${pageHead(trail, "Privacy", "Privacy & cookies", "")}
<section class="band band--tight"><div class="wrap wrap--narrow prose">
  <p>Enchanted Booth Co. (operated by ${esc(site.legalName)}) respects your privacy. This page explains what we collect and why.</p>
  <h2>What we collect</h2>
  <p>When you submit a quote request, we collect the details you give us (name, email, phone, event date, location and any message) so we can respond to your inquiry and plan your event. We do not sell your information.</p>
  <h2>Event photos</h2>
  <p>Photos taken at your event belong to you and your guests. We may share selected photos in our gallery and on social media to showcase our work. If you would prefer we not feature your event, just let us know.</p>
  <h2>Cookies & analytics</h2>
  <p>This site uses minimal cookies for basic functionality and may use privacy-friendly analytics to understand how the site is used. No advertising trackers are used.</p>
  <h2>Contact</h2>
  <p>Questions about your data? Email <a href="mailto:${site.email}">${esc(site.email)}</a> or call <a href="tel:${site.tel}">${esc(site.phone)}</a>.</p>
</div></section>`;
  page({
    pathName: "/privacy/",
    title: "Privacy & Cookies | Enchanted Booth Co.",
    description: "How Enchanted Booth Co. collects, uses and protects the information you share when you request a photo booth quote for your Des Moines area event.",
    schema: [breadcrumb(trail)],
    body,
    current: "",
  });
}

function build404() {
  const body = `
<section class="band band--head" style="min-height:55vh;display:flex;align-items:center">
  <div class="wrap wrap--narrow" style="text-align:center">
    ${eyebrow("", "Page not found", true)}
    <h1 class="page-h1">That page wandered off.</h1>
    <p class="lede">The link may be old or mistyped. Try the gallery, packages, or just get a quote.</p>
    <div class="cta-row" style="justify-content:center">${ghostBtn("Home", "/")}${ghostBtn("Packages", "/packages/")}${quoteBtn("Get a quote")}</div>
  </div>
</section>`;
  const html = `${head({ title: "Page Not Found | Enchanted Booth Co.", description: "The page you were looking for could not be found. Browse our photo booth packages, gallery, or get a quote for your Des Moines area event.", pathName: "/404.html", schema: [businessSchema()] })}
<body>${header("")}<main id="main">${body}</main>${footer()}</body></html>`;
  fs.writeFileSync(path.join(OUT, "404.html"), html.replace('content="index, follow', 'content="noindex, follow'));
}

// ---------- SEO files ----------
function buildRobots() {
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${D}/sitemap.xml\n`);
}
function allRoutes() {
  return [
    "/", "/packages/", "/gallery/", "/how-it-works/", "/faq/", "/photo-booth-cost/", "/reviews/", "/contact/", "/privacy/",
    ...events.map((e) => `/${e.slug}/`),
    "/service-areas/",
    ...areas.map((a) => `/service-areas/${a.slug}/`),
  ];
}
function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = allRoutes().map((r) => `  <url><loc>${D}${r}</loc><lastmod>${today}</lastmod><changefreq>${r === "/" ? "weekly" : "monthly"}</changefreq><priority>${r === "/" ? "1.0" : r === "/packages/" || r === "/contact/" ? "0.9" : "0.7"}</priority></url>`).join("\n");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}
function buildLlms() {
  const pkgLines = packages.map((p) => `- ${p.name}: ${money(p.price)} for ${p.hours}. ${p.blurb}`).join("\n");
  const areaLines = areas.map((a) => `- ${a.city}, ${site.regionName}`).join("\n");
  const faqLines = faqs.map((f) => `### ${f.q}\n${strip(f.a)}`).join("\n\n");
  const reviewsBlock = site.googleRating >= 4.6
    ? `\n## Reviews\nRated ${site.googleRating.toFixed(1)} out of 5 stars from ${site.googleReviewCount} Google reviews. A few recent ones:\n${reviews.items.slice(0, 4).map((r) => `- "${r.quote}" — ${r.author}, ${r.dateText} (Google)`).join("\n")}\nSee all reviews: ${site.googleReviewsUrl}\n`
    : "";
  const txt = `# ${site.name}

> ${site.tagline}. Luxury photo booth rental for weddings, corporate events and parties across the ${site.metro}, based in ${site.base}.

## Current Status (2026)
Open and booking weddings, parties and corporate events across the Des Moines, Iowa metro. By appointment, seven days a week. Operated by ${site.legalName}.

## About
Enchanted Booth Co. is a luxury photo booth rental serving the Des Moines metro. Every booking includes a professional DSLR studio setup, studio lighting, your choice of backdrop, a curated prop collection, a friendly on-site attendant, free setup and breakdown, instant sharing by QR / text / email, and a full online gallery. The booth is designed to look like it belongs at your event, not like hauled-in equipment.
${reviewsBlock}
## Contact
- Phone: ${site.phone}
- Email: ${site.email}
- Website: ${D}/
- Based in: ${site.base} (serves the ${site.metro})
- Hours: ${site.hoursLine}
- Instagram: ${site.instagram}
- Facebook: ${site.facebook}
- TikTok: ${site.tiktok}

## Packages & Pricing
${pkgLines}
Add-ons: additional hours ${addOns[0].price}; ${addOns[1].name} ${addOns[1].price}. Minimum rental is 2 hours.
Full pricing guide: ${D}/photo-booth-cost/

## Travel
Complimentary travel is included with every package (30 miles from ${site.base}; 40 miles on Premium). Beyond that: 30-60 miles $100, 60-120 miles $200, 120+ miles custom quote. All fees confirmed before booking.

## Events
- Weddings: ${D}/weddings/
- Corporate events: ${D}/corporate-events/
- Parties & celebrations: ${D}/parties/

## Service Areas
${areaLines}

## Booking
A 50% deposit secures your date (non-refundable, applicable to a reschedule subject to availability). Enchanted Booth Co. carries general liability insurance; a certificate of insurance is available on request.

## FAQ
${faqLines}
`;
  fs.writeFileSync(path.join(OUT, "llms.txt"), txt);
}

// ---------- run ----------
buildHome();
buildPackages();
buildGallery();
buildHowItWorks();
buildFaq();
buildPricingGuide();
buildReviews();
events.forEach(buildEvent);
buildAreasIndex();
areas.forEach(buildArea);
buildContact();
buildThankYou();
buildPrivacy();
build404();
buildRobots();
buildSitemap();
buildLlms();

console.log(`Built ${allRoutes().length} routes + thank-you + privacy + 404 + llms/robots/sitemap.`);
if (warnings.length) {
  console.log("\nWARNINGS:");
  warnings.forEach((w) => console.log("  - " + w));
} else {
  console.log("No warnings.");
}
