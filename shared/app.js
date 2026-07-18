/* post.supply shared runtime: locale resolution, translation lookup,
   validation helpers, and the local-first leads store shared by the
   landing page contact form and the sales desk dashboard. */
(function (global) {
  "use strict";

  var PS = global.PS = global.PS || {};
  var LOCALE_KEY = "ps.locale";
  var LEADS_KEY = "ps.leads";

  function detectLocale() {
    var stored = null;
    try {
      stored = localStorage.getItem(LOCALE_KEY);
    } catch (e) {
      stored = null;
    }
    if (stored && PS.SUPPORTED_LOCALES.indexOf(stored) !== -1) {
      return stored;
    }
    var nav = (global.navigator && (global.navigator.language || global.navigator.userLanguage)) || "";
    nav = nav.toLowerCase();
    for (var i = 0; i < PS.SUPPORTED_LOCALES.length; i++) {
      if (nav.indexOf(PS.SUPPORTED_LOCALES[i]) === 0) {
        return PS.SUPPORTED_LOCALES[i];
      }
    }
    return PS.DEFAULT_LOCALE;
  }

  PS.getLocale = detectLocale;

  PS.setLocale = function (locale) {
    if (PS.SUPPORTED_LOCALES.indexOf(locale) === -1) {
      return;
    }
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch (e) {
      /* storage unavailable, locale stays session-only */
    }
  };

  PS.t = function (locale, path, vars) {
    var dict = PS.strings[locale] || PS.strings[PS.DEFAULT_LOCALE];
    var parts = path.split(".");
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) break;
      node = node[parts[i]];
    }
    if (node == null) {
      node = path;
    }
    if (vars && typeof node === "string") {
      Object.keys(vars).forEach(function (key) {
        node = node.replace("{" + key + "}", vars[key]);
      });
    }
    return node;
  };

  PS.isValidEmail = function (value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  };

  PS.isValidPhone = function (value) {
    var v = String(value || "").trim();
    if (v === "") return true;
    return /^[0-9+()\-.\s]{7,20}$/.test(v);
  };

  /* leads store: local-first, shared across same-origin tabs via
     localStorage and the native "storage" event. */
  var leads = {};

  function readAll() {
    try {
      var raw = localStorage.getItem(LEADS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(list));
    } catch (e) {
      /* storage unavailable, changes stay in memory for this call only */
    }
  }

  function makeId() {
    return "ld_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  leads.all = function () {
    return readAll().sort(function (a, b) {
      return b.receivedAt - a.receivedAt;
    });
  };

  leads.add = function (lead) {
    var list = readAll();
    var record = {
      id: makeId(),
      receivedAt: Date.now(),
      status: "new",
      name: lead.name,
      company: lead.company || "",
      email: lead.email,
      phone: lead.phone || "",
      material: lead.material,
      volume: lead.volume || "",
      message: lead.message || ""
    };
    list.push(record);
    writeAll(list);
    return record;
  };

  leads.update = function (id, patch) {
    var list = readAll();
    var next = list.map(function (item) {
      return item.id === id ? Object.assign({}, item, patch) : item;
    });
    writeAll(next);
  };

  leads.remove = function (id) {
    var list = readAll().filter(function (item) {
      return item.id !== id;
    });
    writeAll(list);
  };

  leads.subscribe = function (callback) {
    function onStorage(evt) {
      if (!evt.key || evt.key === LEADS_KEY) {
        callback();
      }
    }
    global.addEventListener("storage", onStorage);
    return function unsubscribe() {
      global.removeEventListener("storage", onStorage);
    };
  };

  PS.leads = leads;

  /* tiny React.createElement alias shared by every surface's app script */
  PS.mount = function (render) {
    document.addEventListener("DOMContentLoaded", render);
  };
})(window);
