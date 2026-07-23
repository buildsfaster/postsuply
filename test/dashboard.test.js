const test = require("node:test");
const assert = require("node:assert/strict");
const { installEnv, freshRequire, resetStorage } = require("./helpers/env");

installEnv();

const dash = freshRequire("dashboard/dashboard.js");
const t = global.PS_T.en;

test("STATUS_ORDER lists the six workflow stages in order", () => {
  assert.deepEqual(dash.STATUS_ORDER, ["new", "structured", "quoted", "approved", "reorder", "lost"]);
});

test("statusLabel: maps every status onto its translated stage label", () => {
  assert.equal(dash.statusLabel(t, "new"), "Received");
  assert.equal(dash.statusLabel(t, "structured"), "Structured");
  assert.equal(dash.statusLabel(t, "quoted"), "Quoted");
  assert.equal(dash.statusLabel(t, "approved"), "Approved");
  assert.equal(dash.statusLabel(t, "reorder"), "Reorder");
  assert.equal(dash.statusLabel(t, "lost"), "Lost");
});

test("statusLabel: passes an unknown status through unchanged", () => {
  assert.equal(dash.statusLabel(t, "mystery"), "mystery");
});

test("roleLabel: translates each role, defaulting to buyer", () => {
  assert.equal(dash.roleLabel(t, "buyer"), "Buyer");
  assert.equal(dash.roleLabel(t, "supplier"), "Supplier");
  assert.equal(dash.roleLabel(t, "network"), "Network");
  assert.equal(dash.roleLabel(t, undefined), "Buyer");
});

test("bodyOf: picks the first populated body field", () => {
  assert.equal(dash.bodyOf({ request: "need lumber" }), "need lumber");
  assert.equal(dash.bodyOf({ sells: "plywood" }), "plywood");
  assert.equal(dash.bodyOf({ categories: "roofing" }), "roofing");
  assert.equal(dash.bodyOf({}), "");
});

test("contextOf: joins the role-specific fields with a middot", () => {
  assert.equal(dash.contextOf({ role: "buyer", destination: "San Juan", quantity: "2x40ft" }), "San Juan \u00B7 2x40ft");
  assert.equal(dash.contextOf({ role: "supplier", origin: "Brazil", markets: "Caribbean" }), "Brazil \u00B7 Caribbean");
  assert.equal(dash.contextOf({ role: "network", territory: "PR", brings: "Buyers" }), "PR \u00B7 Buyers");
});

test("contextOf: skips empty fields", () => {
  assert.equal(dash.contextOf({ role: "buyer", destination: "San Juan" }), "San Juan");
  assert.equal(dash.contextOf({ role: "buyer" }), "");
});

test("contactOf: formats WhatsApp/SMS/Call contacts with country and phone", () => {
  assert.equal(dash.contactOf({ method: "whatsapp", country: "+1", phone: "5551234" }), "WhatsApp \u00B7 +1 5551234");
  assert.equal(dash.contactOf({ method: "sms", country: "+52", phone: "999" }), "SMS \u00B7 +52 999");
  assert.equal(dash.contactOf({ method: "call", phone: "111" }), "Call \u00B7 +1 111");
});

test("contactOf: defaults the method to WhatsApp", () => {
  assert.equal(dash.contactOf({ phone: "42" }), "WhatsApp \u00B7 +1 42");
});

test("contactOf: returns the email address for email contacts", () => {
  assert.equal(dash.contactOf({ method: "email", email: "buyer@example.com" }), "buyer@example.com");
  assert.equal(dash.contactOf({ method: "email" }), "");
});

test("readLeads: returns an empty list when storage is empty", () => {
  resetStorage();
  assert.deepEqual(dash.readLeads(), []);
});

test("readLeads: returns an empty list on malformed JSON", () => {
  resetStorage();
  localStorage.setItem("ps_leads_v3", "{not json");
  assert.deepEqual(dash.readLeads(), []);
});

test("writeLeads then readLeads round-trips the list", () => {
  resetStorage();
  const leads = [{ ts: "2026-01-01T00:00:00Z", role: "buyer" }];
  dash.writeLeads(leads);
  assert.deepEqual(dash.readLeads(), leads);
});
