# post.supply website

A static, bilingual site built for search: English at `/` and Puerto Rico Spanish at `/es/`. Every page is plain HTML with its content readable without JavaScript.

## What's in the box

```
public/          the site: this is what gets served
functions/       /api/lead, which receives the phone-first form (Cloudflare Pages Function)
wrangler.toml    Cloudflare Pages settings (output folder: public)
src/             copy (content.py), template (build.py), styles, script, image renderer
assets/          brand files (drawn wordmark, icon) and self-hosted Geist fonts (OFL)
```

Pages (English and Spanish):

| English | Spanish |
| --- | --- |
| `/` | `/es/` |
| `/how-it-works/` | `/es/como-funciona/` |
| `/suppliers/` | `/es/suplidores/` |
| `/materials/` | `/es/materiales/` |
| `/materials/plywood/` | `/es/materiales/plywood/` |
| `/materials/panels/` | `/es/materiales/paneles/` |
| `/materials/decking-flooring-trim/` | `/es/materiales/decking-pisos-molduras/` |
| `/materials/wood-poles/` | `/es/materiales/postes-de-madera/` |
| `/contact/` | `/es/contacto/` |
| `/privacy/` | `/es/privacidad/` |

Plus `/thanks/`, `/es/gracias/` and `404.html`, all set to noindex.

SEO built in: a unique title and description on every page, canonical URLs, reciprocal hreflang (en, es, x-default), JSON-LD (Organization, WebSite, WebPage, BreadcrumbList, FAQPage, Service), a sitemap with language alternates, a robots.txt that allows search engines and AI assistants, an Open Graph image for every page, self-hosted fonts, inline critical CSS, a strict CSP and security headers. Local Lighthouse score: 100 on performance, accessibility, best practices and SEO.

## Deploy on Cloudflare Pages (recommended, free)

1. Create a Cloudflare account and add the site `post.supply`. Cloudflare will show two nameservers.
2. In Squarespace, go to Domains > post.supply > DNS > Nameservers, and switch to the two Cloudflare nameservers. Turn off the Squarespace "Coming Soon" page, or simply leave it: once DNS points to Cloudflare, Squarespace stops serving the domain.
3. Deploy, either way:
   - Git: Workers & Pages > Create > Pages > Connect to Git, pick this repository and the `website` branch, leave the build command empty, set the output directory to `public`.
   - Command line, from this folder: `npx wrangler pages deploy public --project-name post-supply`
   Cloudflare picks up `functions/` automatically, because it sits next to `public/`.
4. In Cloudflare: Workers & Pages > post-supply > Custom domains. Add `post.supply` and `www.post.supply`, then add a redirect rule from `www.post.supply/*` to `https://post.supply/$1` (301).
5. Set where leads go: Settings > Environment variables > `LEAD_WEBHOOK_URL`, using any URL that accepts a JSON POST (your CRM, Zapier, Make, n8n or a Slack workflow). Each form step posts `{id, step, phone, name, company, categories, role, lang, page, received_at, country}`. All steps share one `id`. Redeploy after you set the variable.
   Until this is set, the form tells visitors to email team@post.supply instead, so no lead is lost silently.

## After launch day

1. Google Search Console: add a Domain property for `post.supply`, verify it with the DNS TXT record (in Cloudflare DNS), and submit `https://post.supply/sitemap.xml`.
2. Bing Webmaster Tools: import the site from Search Console.
3. Request indexing for `/` and `/es/` with URL Inspection.
4. Optional: turn on Cloudflare Web Analytics. It is cookieless, so the privacy notice stays accurate.

## Editing

All copy lives in `src/content.py`. Then:

```
cd src
python3 build.py      # pages, sitemap, robots, headers
python3 images.py     # icons and Open Graph images (needs Playwright)
```

Rules the copy follows: post.supply in lowercase, no em-dashes, every capability carries a status (Live, Prototype, Manual, Roadmap, Hypothesis), no invented numbers, the desk fee is never shown, channels are always plural.
