#!/usr/bin/env bash
# Fails if an em-dash (U+2014) appears anywhere in the deployed source
# (HTML, CSS, JS), across copy, comments, and titles. Font binaries are
# excluded since they are not text.
set -euo pipefail
cd "$(dirname "$0")/.."

MATCHES=$(grep -rn --include='*.html' --include='*.css' --include='*.js' "—" . || true)

if [ -n "$MATCHES" ]; then
  echo "em-dash found:"
  echo "$MATCHES"
  exit 1
fi

echo "OK: no em-dashes found."
