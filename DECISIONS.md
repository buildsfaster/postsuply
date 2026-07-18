# DECISIONS.md

## Context

The `buildsfaster/postsuply` repository was empty at session start (zero
commits, zero branches). The weekend directive described an existing v4.2
landing page, dashboard, and calculator to harden; none of that existed.
Confirmed with the operator, who chose to build v1 from scratch and carry
the directive's non-negotiable defaults and objectives forward as the spec
for that build. Everything below is a ground-up build, not a hardening pass
on prior work.

## What shipped

- **Landing page** (`index.html`): hero, materials overview, desk process,
  and a live contact form that writes leads to a shared local-first store.
- **Sales desk dashboard** (`dashboard/`): local-first, multilingual view of
  incoming leads with search, status filter, status updates, and delete.
- **Pricing calculator** (`calculator/`): five material category tabs
  feeding one running quote, session persistence, and a print-ready quote
  sheet carrying post.supply identity.
- **Shared tokens/strings layer** (`shared/`): `tokens.css` (color, type
  scale, spacing, light/dark), `base.css` (shared primitives), `strings.js`
  (i18n dictionary, es/pt/en/zh/ja), `app.js` (locale, validation, leads
  store). All three surfaces import from this single source; no surface
  defines its own copy of a token or a translated string.
- **React 18 production UMD vendored locally** (`shared/vendor/`, pulled via
  npm since the CDN host was not reachable from this environment) so every
  surface runs under `script-src 'self'` with no external script origin.
- **CSP hardening**: strict `<meta>` CSP on every page (no `unsafe-inline`,
  no external origins) plus a `_headers` file carrying the full policy,
  including `frame-ancestors`, for hosts that honor HTTP response headers
  (a directive that a `<meta>` tag cannot enforce).
- **Day/night**: automatic via `prefers-color-scheme`, with
  `color-scheme: only light` / `only dark` set per branch to prevent iOS
  webview forced-darkening.
- **Verification performed** (Playwright + vendored Chromium, this
  environment has no other browser engine available): zero console errors
  and zero CSP violations across all three surfaces, at 1280px desktop and
  380px mobile viewports, in both light and dark, in all five locales.
  Functional checks: malformed contact-form input rejected with localized
  inline errors (verified in Spanish; all five locales share the same
  validation code path and dictionary); a valid submission lands in the
  dashboard live, without a manual refresh, via a `storage` event plus a
  2-second poll fallback; calculator line items across two categories
  compute the correct subtotal, survive a page reload, and the print sheet
  (a separate DOM tree shown only under `@media print`) renders the correct
  total on what CSS constrains to one page.

## What is blocked

- **Safari verification.** This environment has Chromium only; installing
  WebKit failed because the sandbox's network policy blocks the Playwright
  browser download host. Chrome and 380px mobile are fully verified; Safari
  coverage is code-review only (standard CSS/JS throughout, no
  vendor-specific APIs, `prefers-color-scheme` and `color-scheme` are
  supported since Safari 13). Flagging rather than claiming a pass I could
  not run.
- **Real lead delivery.** No backend, email service, or CRM was specified,
  so leads are captured local-first in the browser (shared across
  same-origin tabs via `localStorage`). Nothing is sent anywhere until an
  operator names a real destination, per the directive's instruction to
  queue anything touching lead routing.

## Decisions for the operator

1. Leads are local-first only right now; nothing is emailed or posted
   anywhere when a quote request comes in. **Recommended default:** keep it
   local-first until a specific inbox, webhook, or CRM target is named,
   rather than guessing at integration credentials.
2. React is vendored into the repo (`shared/vendor/`) instead of loaded
   from a public CDN, which is what let every surface run under a strict
   same-origin CSP. **Recommended default:** keep it vendored for the CSP
   and offline-reliability win, rather than switching to a CDN reference
   with subresource-integrity hashes.
3. Calculator fields use industry-standard material codes (SPF, 2x6, OSB,
   20ga, R-13) as-is in every locale rather than translated descriptive
   labels, matching how these terms are actually used in the trade.
   **Recommended default:** keep the codes untranslated, rather than
   inventing localized terminology for grading/sizing conventions that are
   used internationally in their standard form.
