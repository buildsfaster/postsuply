# DECISIONS.md

## Context

The `buildsfaster/postsuply` repository was empty at session start (zero
commits, zero branches). The weekend directive described an existing v4.2
landing page, dashboard, and calculator to harden; none of that existed in
the repo. With the operator's sign-off, the first pass built a v1 from
scratch, invented from the directive's generic "building materials trade
desk" framing.

That was wrong. Partway through, the operator supplied
`Post.Supply_MVP_v3_Standalone.html`: a real, working, professionally
designed artifact export of the actual product. Post.Supply is not a
generic lumber trade desk. It is a WhatsApp-first RFQ-to-order platform
for buyers and suppliers of building materials, trading San Juan, Miami,
and Santo Domingo, with a request-to-landed-quote-to-purchase-order-to-
reorder lifecycle and a landed-cost comparison as its core value prop. The
uploaded file contained genuine copy, a complete five-language dictionary,
real component code, and real design tokens, bundled inside a
Claude-Artifact-style self-unpacking HTML wrapper (in-browser Babel, dev
builds of React, base64-embedded fonts and libraries).

Everything below reflects the second pass: extracting the real design out
of that wrapper and hardening it into the production repo, then adapting
the dashboard and calculator to fit the real business model, as agreed
with the operator. The first pass's invented landing page, dashboard, and
calculator were replaced outright, not patched.

## What shipped

- **Landing page** (`index.html`, `landing.js`, `landing.css`): the real
  Post.Supply design, extracted from the uploaded artifact bundle
  (decompressed its manifest, pulled the authored JSX out of three
  Babel-loaded source files, and the full five-language string table out
  of a fourth), then hardened for production:
  - Compiled JSX to plain `React.createElement` calls with esbuild at
    build time, ahead of shipping, instead of shipping raw JSX with an
    in-browser Babel transformer (the original approach, which needs
    `unsafe-eval` and is explicitly flagged by React's own dev-build
    console warning as unfit for production).
  - Swapped React/ReactDOM development builds for the production UMDs
    already vendored locally from the first pass.
  - Moved nine small responsive `<style>` blocks that the original
    components injected via JSX out into a static `landing.css` file:
    a strict `style-src` with no `unsafe-inline` blocks dynamically
    created `<style>` elements (this does not affect the `style` prop /
    inline `style` attribute, which CSP does not govern) so the original
    approach would have thrown real CSP violations in production.
  - Self-hosted the three Latin font families actually used by the brand
    (Inter, Inter Tight, JetBrains Mono; ~20 woff2 files, ~500KB total)
    under `shared/vendor/fonts/`, dropping the Google Fonts preconnect
    hints and the Noto Sans SC/JP CJK face declarations (multi-megabyte
    per family; Chinese and Japanese already render correctly through the
    existing system-font fallback in the stack, confirmed visually).
  - Fixed one real bug found while porting: a duplicated `fontSize` key in
    a style object in the original source (dead code, last-key-wins, no
    visible effect, removed for cleanliness).
  - Replaced the original's inline pre-paint theme script with an
    external file (`shared/theme-init.js`) since inline `<script>` tags
    are blocked by the same strict CSP; behavior (no flash of wrong theme)
    is unchanged.
  - Upgraded `color-scheme` handling from the original's plain
    `light`/`dark` value to `only light` / `only dark` per the session's
    non-negotiable defaults.
- **Shared layer** (`shared/`): `tokens.css` and `base.css` now carry the
  real design's actual tokens and component styles (verbatim, not
  reinvented), `strings.js` carries the real five-language dictionary
  (`PS_T`) extended with new `dash_*` and `calc_*` keys for the two
  internal tools, and `app.js` is the real shared component/utility layer
  (reveal-on-scroll, brand mark, icons, day/night toggle, language menu,
  the local-first lead store, theme/locale init) extracted verbatim from
  the original bundle — used by all three surfaces, which is what makes
  them one visual system rather than three.
- **Sales desk dashboard** (`dashboard/`): rebuilt against the real lead
  shape the landing page's composer actually writes (`localStorage` key
  `ps_leads_v3`; role is buyer/supplier/network, not a single generic
  contact form), with search, role and status filters, editable status
  (reusing the landing page's own translated workflow-stage labels:
  Received/Structured/Quoted/Approved/Reorder, plus Lost), delete, and
  live updates (storage event plus a 2s poll fallback) with no manual
  refresh.
- **Calculator, reconceived as a landed cost comparison tool**
  (`calculator/`): the original directive's "five-tab lumber pricing
  calculator" did not fit a material-agnostic RFQ platform. Per the
  operator's direction to adapt it to the real business model, it now
  mirrors the landing page's own landed-cost section: add supplier quotes
  (product, freight, port + delivery, lead time, or mark not comparable),
  auto-highlights the lowest total landed cost, persists locally across
  reload, and prints a one-page comparison sheet carrying Post.Supply
  identity. Found and fixed a real bug while building this: the print-only
  React root was reading session state once at mount with no
  subscription, so edits made after page load would not appear on a
  printed sheet; fixed with a small pub/sub store shared between the
  on-screen and print-only trees, plus a `ps:langchange` event so a
  language switch also reaches the print tree.
- **Verification** (Playwright + vendored Chromium): zero console errors,
  zero CSP violations, correct `color-scheme` and `data-theme`, at 1280px
  and 380px, in light and dark, across all three surfaces and all five
  locales, with no unresolved i18n keys. Functionally verified: malformed
  RFQ submissions (empty body, missing contact method) are rejected with
  the real validation copy and create no lead; a valid submission appears
  on the dashboard live with no manual refresh; status changes and delete
  persist; the landed-cost calculator computes correct totals, correctly
  flags the lower-cost supplier, survives a reload, and the printed sheet
  shows the right totals and both supplier rows. No page-level horizontal
  overflow at either viewport (the dashboard's wide table scrolls inside
  its own container, by design).

## What is blocked

- **Safari verification.** Unchanged from the first pass: this sandboxed
  environment has Chromium only, and installing WebKit fails because the
  network policy blocks the Playwright browser download host. Code review
  only (standard CSS/JS, no vendor-specific APIs, `prefers-color-scheme`
  and `color-scheme` supported since Safari 13).
- **Real lead delivery and analytics.** The extracted source already
  flags this itself, verbatim in a code comment: `P0: replace with real
  backend before launch`. Leads and analytics events are local-first only
  (`localStorage`, no network call). Nothing is queued here beyond what
  the original design already called out — it is still true, and still an
  operator decision, not mine to make.

## Decisions for the operator

1. This session extracted and hardened the design from the uploaded
   artifact rather than treating it as a rough mockup to loosely reference.
   **Recommended default:** treat the extracted source as authoritative
   for the landing page going forward (it is real, tested, working product
   copy and design), rather than a placeholder to redesign later.
2. Leads (`ps_leads_v3`) and analytics events are local-first only, per
   the original design's own `P0` comment. **Recommended default:** keep
   it local-first until a specific inbox, WhatsApp Business API, or CRM
   target is named, rather than guessing at integration credentials.
3. The calculator was reconceived as a landed-cost comparison tool instead
   of the originally directed five-tab lumber pricing calculator, since
   the real product is material-agnostic and centers on landed cost, not
   dimensional lumber pricing. **Recommended default:** keep the
   landed-cost framing (it mirrors the landing page's own value prop and
   uses the same comparison pattern buyers already see there), rather than
   reintroducing a lumber-specific calculator that doesn't match the real
   business.
