const test = require("node:test");
const assert = require("node:assert/strict");
const { installEnv, freshRequire, resetStorage } = require("./helpers/env");

installEnv();

const SESSION_KEY = "ps_landed_v1";

function load() {
  return freshRequire("calculator/calculator.js");
}

test("defaultSession: returns a fresh empty session", () => {
  const calc = load();
  assert.deepEqual(calc.defaultSession(), { lines: [], preparedFor: "", ref: null, date: null });
  // A fresh object each call, not a shared reference.
  assert.notEqual(calc.defaultSession(), calc.defaultSession());
});

test("money: formats numbers with the locale grouping and a $ prefix", () => {
  const { money } = load();
  assert.equal(money(1000), "$" + (1000).toLocaleString());
  assert.equal(money(0), "$0");
  assert.equal(money(12.5), "$" + (12.5).toLocaleString());
});

test("money: coerces non-numeric input to zero", () => {
  const { money } = load();
  assert.equal(money(""), "$0");
  assert.equal(money("abc"), "$0");
  assert.equal(money(null), "$0");
  assert.equal(money(undefined), "$0");
});

test("money: parses numeric strings", () => {
  const { money } = load();
  assert.equal(money("2500"), "$" + (2500).toLocaleString());
});

test("totalOf: sums product, freight and port", () => {
  const { totalOf } = load();
  assert.equal(totalOf({ product: 100, freight: 20, port: 5 }), 125);
  assert.equal(totalOf({ product: "100", freight: "20", port: "5" }), 125);
});

test("totalOf: treats missing or invalid components as zero", () => {
  const { totalOf } = load();
  assert.equal(totalOf({}), 0);
  assert.equal(totalOf({ product: 50 }), 50);
  assert.equal(totalOf({ product: "x", freight: 10, port: null }), 10);
});

test("makeRef: builds a dated PS reference code", () => {
  const { makeRef } = load();
  assert.match(makeRef(), /^PS-\d{8}-[0-9A-Z]{1,4}$/);
});

test("makeLineId: produces unique prefixed ids", () => {
  const { makeLineId } = load();
  const a = makeLineId();
  const b = makeLineId();
  assert.match(a, /^ld_[0-9a-z]+_[0-9a-z]{1,6}$/);
  assert.notEqual(a, b);
});

test("loadSession: returns the default session when storage is empty", () => {
  resetStorage();
  const calc = load();
  assert.deepEqual(calc.loadSession(), calc.defaultSession());
});

test("loadSession: merges stored fields over the defaults", () => {
  resetStorage();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ preparedFor: "Acme", lines: [{ id: "x" }] }));
  const calc = load();
  const s = calc.loadSession();
  assert.equal(s.preparedFor, "Acme");
  assert.deepEqual(s.lines, [{ id: "x" }]);
  assert.equal(s.ref, null);
});

test("loadSession: falls back to default on malformed JSON", () => {
  resetStorage();
  localStorage.setItem(SESSION_KEY, "not-json");
  const calc = load();
  assert.deepEqual(calc.loadSession(), calc.defaultSession());
});

test("SessionStore: initializes from stored state", () => {
  resetStorage();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ preparedFor: "Initial" }));
  const calc = load();
  assert.equal(calc.SessionStore.get().preparedFor, "Initial");
});

test("SessionStore.set: merges patches, persists and notifies subscribers", () => {
  resetStorage();
  const calc = load();
  const seen = [];
  const unsub = calc.SessionStore.subscribe((s) => seen.push(s));

  calc.SessionStore.set({ preparedFor: "Buyer Co" });
  assert.equal(calc.SessionStore.get().preparedFor, "Buyer Co");
  assert.equal(seen.length, 1);
  assert.equal(JSON.parse(localStorage.getItem(SESSION_KEY)).preparedFor, "Buyer Co");

  calc.SessionStore.set({ lines: [{ id: "a" }] });
  // Earlier fields are preserved across patches.
  assert.equal(calc.SessionStore.get().preparedFor, "Buyer Co");
  assert.deepEqual(calc.SessionStore.get().lines, [{ id: "a" }]);
  assert.equal(seen.length, 2);

  unsub();
  calc.SessionStore.set({ preparedFor: "changed" });
  assert.equal(seen.length, 2, "unsubscribed listener no longer fires");
});
