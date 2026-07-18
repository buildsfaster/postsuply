#!/usr/bin/env node
// Fails the build if PS_T locales don't all carry the exact same key set.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'shared', 'strings.js');
global.window = {};
require(file);

const t = global.window.PS_T;
const expectedLocales = ['en', 'es', 'pt', 'zh', 'ja'];
const actualLocales = Object.keys(t);

let failed = false;

for (const loc of expectedLocales) {
  if (!t[loc]) {
    console.error(`missing locale: ${loc}`);
    failed = true;
  }
}
for (const loc of actualLocales) {
  if (!expectedLocales.includes(loc)) {
    console.error(`unexpected locale: ${loc}`);
    failed = true;
  }
}

if (!failed) {
  const referenceKeys = new Set(Object.keys(t.en));
  for (const loc of expectedLocales) {
    const keys = new Set(Object.keys(t[loc]));
    const missing = [...referenceKeys].filter(k => !keys.has(k));
    const extra = [...keys].filter(k => !referenceKeys.has(k));
    if (missing.length || extra.length) {
      failed = true;
      console.error(`locale "${loc}" key mismatch against "en":`);
      if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
      if (extra.length) console.error(`  extra: ${extra.join(', ')}`);
    }
  }
  if (!failed) {
    console.log(`OK: ${expectedLocales.length} locales, ${referenceKeys.size} keys each, all matching.`);
  }
}

process.exit(failed ? 1 : 0);
