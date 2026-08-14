# CLAUDE.md

## What this is

Post.Supply: a WhatsApp-first RFQ-to-order platform for buyers/suppliers of
building materials trading San Juan, Miami, and Santo Domingo. This repo is
the static front end: a marketing/intake landing page, an internal sales
desk dashboard, and a landed-cost comparison calculator. Full narrative and
rationale for every non-obvious decision lives in `DECISIONS.md`; read it
before making architectural changes, don't duplicate it here.

## Architecture

Three independent static HTML surfaces sharing one layer. No bundler, no
npm, no `package.json`, no build step: what's on disk is what ships.

```
index.html + landing.js + landing.css   landing / RFQ intake
dashboard/                              internal sales desk (reads leads)
calculator/                             landed-cost quote comparison
shared/                                 tokens.css, base.css, app.js (hooks/
                                         utils used by all 3), strings.js
                                         (PS_T i18n dict), theme-init.js,
                                         config.js, vendor/ (React UMD prod
                                         builds + self-hosted fonts)
```

Each surface renders via plain `React.createElement` calls (no JSX at
runtime; if you ever see JSX-like syntax shipped raw, it needs to be
hand-compiled before commit, not loaded through in-browser Babel). No
component framework, no router, no CSS-in-JS.

**Data is local-first, no backend.** Leads live in `localStorage` under
`ps_leads_v3`, analytics events under `ps_events_v3`, theme/lang under
`ps3_theme`/`ps3_lang`. The dashboard reads what the landing page's RFQ
composer writes: same key, same shape, no API. `shared/config.js` holds
two placeholders (`whatsappNumber`, `formspreeId`) that need real values
before real leads can go anywhere off-device; ask the operator before
inventing a backend or integration credentials.

## Critical commands

```bash
./scripts/verify.sh              # everything CI checks, run before every push
node scripts/validate-i18n.js    # PS_T key parity across en/es/pt/zh/ja
bash scripts/check-no-em-dash.sh # no em-dash (U+2014) anywhere in shipped source
python3 -m http.server 8000      # local preview, no build needed
```

CI (`.github/workflows/deploy-pages.yml`) runs the same two checks on every
push to `main`, then deploys to GitHub Pages. It does not run on pull
requests: a PR can look green with no checks run at all. Always run
`./scripts/verify.sh` yourself before pushing.

## Always / never

- **Never** use an em-dash anywhere in shipped HTML/CSS/JS: copy, titles,
  or comments. CI fails the build; there is no exception list.
- **Never** add a locale's key without adding it to the other four; `PS_T`
  in `shared/strings.js` must carry identical key sets across all 5
  locales, CI-enforced.
- **Never** add an inline `<script>`, inline `<style>` block, dynamically
  injected `<style>` element, or anything needing `unsafe-eval`/
  `unsafe-inline`. CSP (`default-src 'self'`, no `unsafe-*`) is enforced
  via `<meta http-equiv>` on every page and is intentionally strict. The
  `style` prop / inline `style=""` attribute is fine: CSP's `style-src`
  only governs `<style>` tags and stylesheets, not the attribute.
- **Never** commit a real WhatsApp number or Formspree ID to
  `shared/config.js`; those are operator-owned values, placeholders only.
- **Never** rely on the `_headers` file for security headers in
  production; GitHub Pages does not honor it (that's a Cloudflare
  Pages/Netlify convention). Headers that must reach the browser on Pages
  go in a `<meta http-equiv>` tag instead; `X-Content-Type-Options` and
  `frame-ancestors` cannot be set that way and are not currently enforced
  in production.

## Definition of done

`./scripts/verify.sh` passes. If you touched anything CSP-relevant (new
inline styles/scripts, new external resource), open the page and confirm
zero console CSP violations. If you touched copy, confirm all 5 locales
still read naturally, not just that the key exists.

## Repo/branch state (read this before assuming `main` is current)

`main` currently holds only the original landing-page-only commit. All
dashboard/calculator/shared work lives on `claude/post-supply-weekend-build-rpx5v2`
(and branches built on top of it), none of it merged. There are also
several bot-authored PRs (`devin/...`) open against that branch: security
headers, error-handling, a refactor, a test suite, none merged either.
Before starting new work, check `git log --oneline --all` and open PRs
rather than assuming the branch you're on is the latest state of truth.
