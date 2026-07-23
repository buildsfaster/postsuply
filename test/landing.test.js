const test = require("node:test");
const assert = require("node:assert/strict");
const { installEnv, freshRequire } = require("./helpers/env");

installEnv();

const landing = freshRequire("landing.js");
const t = global.PS_T.en;

test("rfqRows: buyer request with contact row", () => {
  const rows = landing.rfqRows(t, "buyer", {
    request: "3 containers of plywood",
    destination: "San Juan",
    quantity: "2x40ft",
    method: "whatsapp",
    country: "+1",
    phone: "5551234",
  });
  assert.deepEqual(rows, [
    ["Request", "3 containers of plywood"],
    ["Destination", "San Juan"],
    ["Quantity", "2x40ft"],
    ["Contact", "WhatsApp \u00B7 +1 5551234"],
  ]);
});

test("rfqRows: supplier uses the products label and origin/markets", () => {
  const rows = landing.rfqRows(t, "supplier", {
    sells: "pine plywood",
    origin: "Brazil",
    markets: "Caribbean",
    method: "sms",
    country: "+55",
    phone: "999",
  });
  assert.deepEqual(rows, [
    ["Products", "pine plywood"],
    ["Origin", "Brazil"],
    ["Target markets", "Caribbean"],
    ["Contact", "SMS \u00B7 +55 999"],
  ]);
});

test("rfqRows: network uses the handles label and territory/brings", () => {
  const rows = landing.rfqRows(t, "network", {
    categories: "three mills",
    territory: "PR, DR",
    brings: "buyers",
    method: "call",
    phone: "111",
  });
  assert.deepEqual(rows, [
    ["Handles", "three mills"],
    ["Territory", "PR, DR"],
    ["You bring", "buyers"],
    ["Contact", "Call \u00B7 +1 111"],
  ]);
});

test("rfqRows: email contact renders the address", () => {
  const rows = landing.rfqRows(t, "buyer", {
    request: "roofing panels",
    method: "email",
    email: "buyer@example.com",
  });
  assert.deepEqual(rows, [
    ["Request", "roofing panels"],
    ["Contact", "Email \u00B7 buyer@example.com"],
  ]);
});

test("rfqRows: default WhatsApp method and default country code", () => {
  const rows = landing.rfqRows(t, "buyer", { request: "x", phone: "42" });
  assert.deepEqual(rows[rows.length - 1], ["Contact", "WhatsApp \u00B7 +1 42"]);
});

test("rfqRows: appends an attachment row when a file is attached", () => {
  const rows = landing.rfqRows(t, "buyer", { request: "x", phone: "42", attach: true });
  assert.deepEqual(rows[rows.length - 1], ["Attachment", "To follow when we confirm"]);
});

test("rfqRows: omits the body row when empty", () => {
  const rows = landing.rfqRows(t, "buyer", { phone: "42" });
  assert.equal(rows[0][0], "Contact");
});

test("buildWhatsAppUrl: strips the number and encodes the RFQ text", () => {
  const url = landing.buildWhatsAppUrl(t, "buyer", { request: "need lumber", phone: "42" });
  assert.ok(url.startsWith("https://wa.me/18095551234?text="));
  const text = decodeURIComponent(url.split("?text=")[1]);
  assert.equal(text.split("\n")[0], "Post.Supply RFQ");
  assert.ok(text.includes("Request: need lumber"));
  assert.ok(text.includes("Contact: WhatsApp \u00B7 +1 42"));
});

test("sendFormspreeFallback: POSTs the lead as JSON when configured", async () => {
  const calls = [];
  const prevFetch = global.fetch;
  global.fetch = (url, opts) => {
    calls.push({ url, opts });
    return Promise.resolve({ ok: true });
  };
  try {
    landing.sendFormspreeFallback("buyer", { request: "hi" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://formspree.io/f/abc123");
    assert.equal(calls[0].opts.method, "POST");
    assert.deepEqual(JSON.parse(calls[0].opts.body), { role: "buyer", request: "hi" });
  } finally {
    global.fetch = prevFetch;
  }
});

test("sendFormspreeFallback: does nothing when no form id is configured", () => {
  const calls = [];
  const prevFetch = global.fetch;
  const prevCfg = global.PS_CONFIG;
  global.fetch = () => { calls.push(1); return Promise.resolve({}); };
  global.PS_CONFIG = { whatsappNumber: "+1", formspreeId: "" };
  try {
    landing.sendFormspreeFallback("buyer", { request: "hi" });
    assert.equal(calls.length, 0);
  } finally {
    global.fetch = prevFetch;
    global.PS_CONFIG = prevCfg;
  }
});
