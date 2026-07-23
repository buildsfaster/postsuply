const test = require("node:test");
const assert = require("node:assert/strict");
const { installEnv, freshRequire, resetStorage } = require("./helpers/env");

installEnv();

function load() {
  return freshRequire("shared/app.js");
}

test("saveLead: fills defaults and returns the stored lead", () => {
  resetStorage();
  const { saveLead } = load();
  const lead = saveLead({ role: "buyer", request: "3 containers" });
  assert.equal(lead.role, "buyer");
  assert.equal(lead.request, "3 containers");
  assert.equal(lead.status, "new");
  assert.equal(lead.source, "/test");
  assert.equal(lead.device, "desktop");
  assert.equal(lead.lang, "en");
  assert.equal(lead.mode, "light");
  assert.match(lead.ts, /^\d{4}-\d{2}-\d{2}T/);
});

test("saveLead: caller fields override the defaults", () => {
  resetStorage();
  const { saveLead } = load();
  const lead = saveLead({ status: "quoted", role: "supplier" });
  assert.equal(lead.status, "quoted");
});

test("saveLead: persists and appends to ps_leads_v3", () => {
  resetStorage();
  const { saveLead } = load();
  saveLead({ role: "buyer", request: "a" });
  saveLead({ role: "supplier", sells: "b" });
  const stored = JSON.parse(localStorage.getItem("ps_leads_v3"));
  assert.equal(stored.length, 2);
  assert.equal(stored[0].request, "a");
  assert.equal(stored[1].sells, "b");
});

test("saveLead: derives mobile device from the user agent", () => {
  resetStorage();
  const prev = global.navigator;
  global.navigator = { userAgent: "Mozilla/5.0 (Linux; Android 13)", language: "en-US" };
  try {
    const { saveLead } = load();
    assert.equal(saveLead({}).device, "mobile");
  } finally {
    global.navigator = prev;
  }
});

test("saveLead: swallows a broken localStorage without throwing", () => {
  resetStorage();
  const prev = global.localStorage;
  global.localStorage = {
    getItem() { throw new Error("boom"); },
    setItem() { throw new Error("boom"); },
  };
  try {
    const { saveLead } = load();
    const lead = saveLead({ role: "buyer" });
    assert.equal(lead.role, "buyer");
  } finally {
    global.localStorage = prev;
  }
});

test("track: records an event with a null default payload", () => {
  resetStorage();
  const { track } = load();
  track("mode_changed", "dark");
  track("hero_cta");
  const events = JSON.parse(localStorage.getItem("ps_events_v3"));
  assert.equal(events.length, 2);
  assert.equal(events[0].e, "mode_changed");
  assert.equal(events[0].d, "dark");
  assert.equal(events[1].d, null);
  assert.equal(typeof events[1].ts, "number");
});

test("track: keeps only the most recent 600 events", () => {
  resetStorage();
  const { track } = load();
  for (let i = 0; i < 650; i++) track("e", i);
  const events = JSON.parse(localStorage.getItem("ps_events_v3"));
  assert.equal(events.length, 600);
  assert.equal(events[0].d, 50);
  assert.equal(events[599].d, 649);
});

test("initTheme: stored theme wins over system preference", () => {
  resetStorage();
  localStorage.setItem("ps3_theme", "dark");
  const { initTheme } = load();
  assert.equal(initTheme(), "dark");
});

test("initTheme: falls back to the system dark preference", () => {
  resetStorage();
  const prev = global.matchMedia;
  global.matchMedia = () => ({ matches: true });
  try {
    const { initTheme } = load();
    assert.equal(initTheme(), "dark");
  } finally {
    global.matchMedia = prev;
  }
});

test("initTheme: defaults to light with no signal", () => {
  resetStorage();
  const { initTheme } = load();
  assert.equal(initTheme(), "light");
});

test("initLang: stored locale wins when valid", () => {
  resetStorage();
  localStorage.setItem("ps3_lang", "pt");
  const { initLang } = load();
  assert.equal(initLang(), "pt");
});

test("initLang: ignores a stored locale not in the dictionary", () => {
  resetStorage();
  localStorage.setItem("ps3_lang", "xx");
  const prev = global.navigator;
  global.navigator = { userAgent: "node", language: "es-ES" };
  try {
    const { initLang } = load();
    assert.equal(initLang(), "es");
  } finally {
    global.navigator = prev;
  }
});

test("initLang: matches the browser language prefix", () => {
  resetStorage();
  const prev = global.navigator;
  global.navigator = { userAgent: "node", language: "ja-JP" };
  try {
    const { initLang } = load();
    assert.equal(initLang(), "ja");
  } finally {
    global.navigator = prev;
  }
});

test("initLang: defaults to English", () => {
  resetStorage();
  const prev = global.navigator;
  global.navigator = { userAgent: "node", language: "fr-FR" };
  try {
    const { initLang } = load();
    assert.equal(initLang(), "en");
  } finally {
    global.navigator = prev;
  }
});
