// Minimal browser-global shim so the Post.Supply front-end modules can be
// required and unit-tested under plain Node, with no third-party deps.
//
// The shipped scripts are plain <script> files that assign helpers to `window`
// and mount React at load. Each source module now exposes its pure helpers via
// a guarded `module.exports` (only when `module` exists, i.e. under Node), and
// skips the ReactDOM mount in that same branch, so requiring them here is safe.

const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

// A small in-memory localStorage that matches the Web Storage API surface the
// source actually uses (getItem / setItem / removeItem / clear).
class FakeStorage {
  constructor() {
    this._m = new Map();
  }
  getItem(k) {
    return this._m.has(k) ? this._m.get(k) : null;
  }
  setItem(k, v) {
    this._m.set(String(k), String(v));
  }
  removeItem(k) {
    this._m.delete(k);
  }
  clear() {
    this._m.clear();
  }
}

// React/ReactDOM are only referenced inside component bodies (never executed in
// these tests) and destructured at module top. Stubs are enough to load.
const React = {
  Fragment: Symbol("Fragment"),
  createElement: () => ({}),
  useState: (init) => [typeof init === "function" ? init() : init, () => {}],
  useEffect: () => {},
  useRef: () => ({ current: null }),
};
const ReactDOM = { createRoot: () => ({ render() {} }) };

function setGlobal(name, value) {
  try {
    global[name] = value;
  } catch (e) {
    Object.defineProperty(global, name, { value, configurable: true, writable: true });
  }
}

function installEnv() {
  // Make `window` the global object so both `window.x` assignments and bare
  // global reads (`initTheme`, `PS_T`, ...) resolve the same way as in a browser.
  setGlobal("window", global);
  setGlobal("React", React);
  setGlobal("ReactDOM", ReactDOM);
  setGlobal("localStorage", new FakeStorage());
  setGlobal("navigator", { userAgent: "node-test", language: "en-US" });
  setGlobal("location", { pathname: "/test", search: "" });
  setGlobal("matchMedia", () => ({ matches: false }));

  const documentElement = {
    lang: "en",
    style: {},
    _attrs: {},
    getAttribute(k) {
      return this._attrs[k] != null ? this._attrs[k] : null;
    },
    setAttribute(k, v) {
      this._attrs[k] = v;
    },
  };
  setGlobal("document", {
    documentElement,
    getElementById: () => null,
    addEventListener() {},
    removeEventListener() {},
  });

  // Lead-delivery config used by landing.js#buildWhatsAppUrl.
  setGlobal("PS_CONFIG", { whatsappNumber: "+18095551234", formspreeId: "abc123" });

  // Load the real five-language dictionary (window.PS_T / window.PS_LANGS).
  freshRequire("shared/strings.js");
}

// Require a source file fresh (bypassing the module cache) so per-test state
// such as calculator's SessionStore singleton is rebuilt from current storage.
function freshRequire(relPath) {
  const full = path.join(ROOT, relPath);
  delete require.cache[require.resolve(full)];
  return require(full);
}

function resetStorage() {
  global.localStorage = new FakeStorage();
}

module.exports = { installEnv, freshRequire, resetStorage, FakeStorage, ROOT };
