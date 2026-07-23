// Post.Supply landed cost calculator.

(() => {
  const { useState: useStateC, useEffect: useEffectC } = React;
  const SESSION_KEY = "ps_landed_v1";
  function defaultSession() {
    return { lines: [], preparedFor: "", ref: null, date: null };
  }
  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? Object.assign(defaultSession(), JSON.parse(raw)) : defaultSession();
    } catch (e) {
      logError("calculator: could not load saved session; starting fresh", e);
      return defaultSession();
    }
  }
  const SessionStore = (function() {
    let state = loadSession();
    let listeners = [];
    function persist() {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(state));
      } catch (e) {
        logError("calculator: could not persist session; changes will not survive reload", e);
      }
    }
    return {
      get() {
        return state;
      },
      set(patch) {
        state = Object.assign({}, state, patch);
        persist();
        listeners.forEach((fn) => fn(state));
      },
      subscribe(fn) {
        listeners.push(fn);
        return () => {
          listeners = listeners.filter((l) => l !== fn);
        };
      }
    };
  })();
  function useSessionState() {
    const [s, setS] = useStateC(SessionStore.get());
    useEffectC(() => SessionStore.subscribe(setS), []);
    return s;
  }
  function makeRef() {
    const d = /* @__PURE__ */ new Date();
    const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    return "PS-" + stamp + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function makeLineId() {
    return "ld_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }
  function money(n) {
    return "$" + (Number(n) || 0).toLocaleString();
  }
  function totalOf(line) {
    return (Number(line.product) || 0) + (Number(line.freight) || 0) + (Number(line.port) || 0);
  }
  function QuoteForm({ t, onAdd }) {
    const empty = { supplier: "", product: "", freight: "", port: "", lead: "", nc: false };
    const [f, setF] = useStateC(empty);
    function up(k) {
      return (e) => {
        const v = k === "nc" ? e.target.checked : e.target.value;
        setF((s) => Object.assign({}, s, { [k]: v }));
      };
    }
    function submit(e) {
      e.preventDefault();
      if (!f.supplier.trim()) return;
      if (!f.nc && (f.product === "" || f.freight === "" || f.port === "" || f.lead === "")) return;
      onAdd(Object.assign({ id: makeLineId() }, f));
      setF(empty);
    }
    return /* @__PURE__ */ React.createElement("form", { className: "surface calc-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "calc-form__grid" }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_field_supplier), /* @__PURE__ */ React.createElement("input", { value: f.supplier, onChange: up("supplier"), required: true })), !f.nc && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_field_product), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "0.01", value: f.product, onChange: up("product") })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_field_freight), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "0.01", value: f.freight, onChange: up("freight") })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_field_port), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "0.01", value: f.port, onChange: up("port") })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_field_lead), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "1", value: f.lead, onChange: up("lead") })))), /* @__PURE__ */ React.createElement("label", { className: "calc-nc-toggle" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: f.nc, onChange: up("nc") }), " ", t.calc_field_nc), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-accent" }, t.calc_action_add));
  }
  function QuoteCard({ t, line, best, onRemove }) {
    return /* @__PURE__ */ React.createElement("div", { className: "surface lc-card", "data-best": best ? "true" : "false" }, /* @__PURE__ */ React.createElement("div", { className: "lc-card__head" }, /* @__PURE__ */ React.createElement("span", { className: "lc-card__name" }, line.supplier), best && /* @__PURE__ */ React.createElement("span", { className: "chip lc-card__badge" }, t.lc_best)), line.nc ? /* @__PURE__ */ React.createElement("div", { className: "lc-card__nc" }, /* @__PURE__ */ React.createElement("span", null, t.lc_missing), /* @__PURE__ */ React.createElement("span", { className: "mono" }, t.lc_nc)) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "lc-card__rows" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, t.lc_product), /* @__PURE__ */ React.createElement("span", { className: "mono" }, money(line.product))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, t.lc_freight), /* @__PURE__ */ React.createElement("span", { className: "mono" }, money(line.freight))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, t.lc_port), /* @__PURE__ */ React.createElement("span", { className: "mono" }, money(line.port))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, t.lc_lead), /* @__PURE__ */ React.createElement("span", { className: "mono" }, line.lead, " ", t.lc_days))), /* @__PURE__ */ React.createElement("div", { className: "lc-card__total" }, /* @__PURE__ */ React.createElement("span", null, t.lc_total), /* @__PURE__ */ React.createElement("span", { className: "mono" }, money(totalOf(line))))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost lc-card__remove", onClick: () => onRemove(line.id) }, t.calc_remove));
  }
  function App() {
    const [theme, setTheme] = useStateC(initTheme);
    const [lang, setLang] = useStateC(initLang);
    const t = PS_T[lang] || PS_T.en;
    const session = useSessionState();
    useEffectC(() => {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      try {
        localStorage.setItem("ps3_theme", theme);
      } catch (e) {
        logError("calculator: could not persist theme preference", e);
      }
    }, [theme]);
    useEffectC(() => {
      document.documentElement.setAttribute("lang", lang);
      try {
        localStorage.setItem("ps3_lang", lang);
      } catch (e) {
        logError("calculator: could not persist language preference", e);
      }
      window.dispatchEvent(new CustomEvent("ps:langchange", { detail: lang }));
    }, [lang]);
    function onAdd(line) {
      const patch = { lines: session.lines.concat([line]) };
      if (!session.ref) {
        patch.ref = makeRef();
        patch.date = Date.now();
      }
      SessionStore.set(patch);
    }
    function onRemove(id) {
      SessionStore.set({ lines: session.lines.filter((l) => l.id !== id) });
    }
    function onClear() {
      if (window.confirm(t.dash_action_delete_confirm)) SessionStore.set(defaultSession());
    }
    const comparable = session.lines.filter((l) => !l.nc);
    const bestId = comparable.length ? comparable.reduce((a, b) => totalOf(b) < totalOf(a) ? b : a).id : null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wrap top-bar" }, /* @__PURE__ */ React.createElement("a", { href: "../", style: { textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 20 })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(ModeToggle, { theme, setTheme }), /* @__PURE__ */ React.createElement(LangMenu, { lang, setLang }))), /* @__PURE__ */ React.createElement("main", { className: "wrap page-main" }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "clamp(28px,3.2vw,40px)" } }, t.calc_title), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 10, fontSize: 17, maxWidth: "56ch" } }, t.calc_subtitle), /* @__PURE__ */ React.createElement("div", { className: "calc-meta" }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_ref), /* @__PURE__ */ React.createElement("span", { className: "mono" }, session.ref || "-")), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, t.calc_date), /* @__PURE__ */ React.createElement("span", { className: "mono" }, session.date ? new Date(session.date).toLocaleDateString(lang) : "-")), /* @__PURE__ */ React.createElement("div", { className: "field calc-meta__full" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "prepared-for" }, t.calc_prepared_for), /* @__PURE__ */ React.createElement("input", { id: "prepared-for", type: "text", placeholder: t.calc_prepared_for_ph, value: session.preparedFor, onChange: (e) => SessionStore.set({ preparedFor: e.target.value }) }))), /* @__PURE__ */ React.createElement(QuoteForm, { t, onAdd }), session.lines.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "calc-empty" }, t.calc_empty) : /* @__PURE__ */ React.createElement("div", { className: "lc-grid" }, session.lines.map((line) => /* @__PURE__ */ React.createElement(QuoteCard, { key: line.id, t, line, best: line.id === bestId, onRemove }))), /* @__PURE__ */ React.createElement("div", { className: "calc-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost", disabled: session.lines.length === 0, onClick: onClear }, t.calc_clear), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-accent", disabled: session.lines.length === 0, onClick: () => window.print() }, t.calc_print)), session.lines.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "calc-saved-note" }, t.calc_saved_note)), /* @__PURE__ */ React.createElement("footer", { style: { borderTop: "1px solid var(--rule)", padding: "38px 0 46px" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap", style: { fontSize: 15, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 16 }), " ", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12 } }, "\xA9 2026 \xB7 ", t.foot_corridors))));
  }
  function PrintSheet() {
    const [lang, setLang] = useStateC(initLang);
    useEffectC(() => {
      const onLang = (e) => setLang(e.detail);
      window.addEventListener("ps:langchange", onLang);
      return () => window.removeEventListener("ps:langchange", onLang);
    }, []);
    const t = PS_T[lang] || PS_T.en;
    const session = useSessionState();
    const comparable = session.lines.filter((l) => !l.nc);
    const bestId = comparable.length ? comparable.reduce((a, b) => totalOf(b) < totalOf(a) ? b : a).id : null;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "print-brand" }, "Post.Supply"), /* @__PURE__ */ React.createElement("div", { className: "print-meta" }, /* @__PURE__ */ React.createElement("span", null, t.calc_ref, ": ", session.ref || "-"), /* @__PURE__ */ React.createElement("span", null, t.calc_date, ": ", session.date ? new Date(session.date).toLocaleDateString(lang) : "-"), session.preparedFor && /* @__PURE__ */ React.createElement("span", null, t.calc_prepared_for, ": ", session.preparedFor)), /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, t.calc_field_supplier), /* @__PURE__ */ React.createElement("th", { className: "mono" }, t.lc_product), /* @__PURE__ */ React.createElement("th", { className: "mono" }, t.lc_freight), /* @__PURE__ */ React.createElement("th", { className: "mono" }, t.lc_port), /* @__PURE__ */ React.createElement("th", { className: "mono" }, t.lc_lead), /* @__PURE__ */ React.createElement("th", { className: "mono" }, t.lc_total))), /* @__PURE__ */ React.createElement("tbody", null, session.lines.map((l) => /* @__PURE__ */ React.createElement("tr", { key: l.id }, /* @__PURE__ */ React.createElement("td", null, l.supplier, l.id === bestId ? " \u2605" : ""), l.nc ? /* @__PURE__ */ React.createElement("td", { colSpan: 5 }, t.lc_missing, ": ", t.lc_nc) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("td", { className: "mono" }, money(l.product)), /* @__PURE__ */ React.createElement("td", { className: "mono" }, money(l.freight)), /* @__PURE__ */ React.createElement("td", { className: "mono" }, money(l.port)), /* @__PURE__ */ React.createElement("td", { className: "mono" }, l.lead, " ", t.lc_days), /* @__PURE__ */ React.createElement("td", { className: "mono" }, money(totalOf(l)))))))), /* @__PURE__ */ React.createElement("div", { className: "print-footer" }, "Post.Supply \xB7 ", t.foot_corridors));
  }
  ReactDOM.createRoot(document.getElementById("app-shell")).render(/* @__PURE__ */ React.createElement(App, null));
  ReactDOM.createRoot(document.getElementById("print-sheet")).render(/* @__PURE__ */ React.createElement(PrintSheet, null));
})();
