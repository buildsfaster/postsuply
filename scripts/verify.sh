#!/usr/bin/env bash
# Runs the same checks as .github/workflows/deploy-pages.yml, locally.
# There is no build step and no package.json (static HTML/CSS/JS, no
# bundler, no npm deps): this is the whole verification surface.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "-> i18n key parity"
node scripts/validate-i18n.js

echo "-> em-dash check"
bash scripts/check-no-em-dash.sh

echo "-> node --check on every .js file"
find . -name '*.js' -not -path './shared/vendor/*' -print0 | xargs -0 -n1 node --check

echo "All checks passed."
