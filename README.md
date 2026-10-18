# Enchanted Booth Co. — website

Luxury photo booth rental, Des Moines metro. Static multi-page site, data-driven.

- `data.mjs` — all content (business facts, packages, events, service areas, FAQ, gallery).
- `build.mjs` — generator. `node build.mjs` writes everything into `./site`.
- `site/` — the built output Vercel serves (`vercel.json`: buildCommand `node build.mjs`, output `site`, cleanUrls + trailingSlash).
- Images: real event photos from the current site, enhanced through Higgsfield (identity-preserving) and saved as WebP in `site/assets/img/` (`manifest.json` holds dimensions). Branded photo strips are kept as authentic product samples.
- `raw/` — download/edit scratch (gitignored).

## Build & preview
```
node build.mjs
npx serve site -l 8130
```

## Launch checklist
- Set `site.indexable` / `site.domain` in `data.mjs` (already the real domain).
- Contact form posts to FormSubmit; the owner must click the one-time confirmation email, then it delivers to enchantedboothco@gmail.com.
- Submit `sitemap.xml` in Google Search Console; update Google Business Profile website URL.
