// Post.Supply sales desk: local-first view onto RFQ requests.

(() => {
  const { useState: useStateD, useEffect: useEffectD } = React;
  const LEADS_KEY = "ps_leads_v3";
  const STATUS_ORDER = ["new", "structured", "quoted", "approved", "reorder", "lost"];
  const POLL_MS = 2e3;
  function statusLabel(t, status) {
    const idx = { structured: 1, quoted: 2, approved: 3, reorder: 4 }[status];
    if (status === "new") return t.wf_chips[0];
    if (status === "lost") return t.dash_status_lost;
    return idx != null ? t.wf_chips[idx] : status;
  }
  function roleLabel(t, role) {
    return role === "supplier" ? t.dash_role_supplier : role === "network" ? t.dash_role_network : t.dash_role_buyer;
  }
  function bodyOf(lead) {
    return lead.request || lead.sells || lead.categories || "";
  }
  function contextOf(lead) {
    const pairs = lead.role === "buyer" ? [["destination", lead.destination], ["quantity", lead.quantity]] : lead.role === "supplier" ? [["origin", lead.origin], ["markets", lead.markets]] : [["territory", lead.territory], ["brings", lead.brings]];
    return pairs.filter((p) => p[1]).map((p) => p[1]).join(" \xB7 ");
  }
  function contactOf(lead) {
    if ((lead.method || "whatsapp") === "email") return lead.email || "";
    const m = lead.method === "call" ? "Call" : lead.method === "sms" ? "SMS" : "WhatsApp";
    return `${m} \xB7 ${lead.country || "+1"} ${lead.phone || ""}`;
  }
  function readLeads() {
    try {
      return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    } catch (e) {
      logError("dashboard: could not read leads from localStorage", e);
      return [];
    }
  }
  function writeLeads(list) {
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      logError("dashboard: could not persist leads to localStorage; change not saved", e);
      return false;
    }
  }
  function LeadRow({ t, lang, lead, expanded, onToggle, onStatusChange, onDelete }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("tr", { className: "lead-row", onClick: onToggle }, /* @__PURE__ */ React.createElement("td", { className: "mono lead-contact" }, new Date(lead.ts).toLocaleString(lang)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip" }, roleLabel(t, lead.role))), /* @__PURE__ */ React.createElement("td", { className: "lead-body" }, bodyOf(lead)), /* @__PURE__ */ React.createElement("td", { className: "lead-contact" }, contactOf(lead)), /* @__PURE__ */ React.createElement("td", { className: "lead-contact" }, contextOf(lead)), /* @__PURE__ */ React.createElement("td", { onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("select", { className: "status-select", value: lead.status || "new", onChange: (e) => onStatusChange(lead.ts, e.target.value) }, STATUS_ORDER.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, statusLabel(t, s))))), /* @__PURE__ */ React.createElement("td", { onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost lead-delete", onClick: () => {
      if (window.confirm(t.dash_action_delete_confirm)) onDelete(lead.ts);
    } }, t.dash_action_delete))), expanded && /* @__PURE__ */ React.createElement("tr", { className: "lead-detail-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: 7 }, /* @__PURE__ */ React.createElement("div", { className: "lead-detail" }, /* @__PURE__ */ React.createElement("p", null, bodyOf(lead)), /* @__PURE__ */ React.createElement("div", { className: "lead-detail__meta" }, lead.attach && /* @__PURE__ */ React.createElement("span", { className: "tag" }, t.attached), /* @__PURE__ */ React.createElement("span", { className: "tag mono" }, lead.lang), /* @__PURE__ */ React.createElement("span", { className: "tag mono" }, lead.mode), /* @__PURE__ */ React.createElement("span", { className: "tag mono" }, lead.device))))));
  }
  function App() {
    const [theme, setTheme] = useStateD(initTheme);
    const [lang, setLang] = useStateD(initLang);
    const t = PS_T[lang] || PS_T.en;
    const [leads, setLeads] = useStateD(readLeads);
    const [search, setSearch] = useStateD("");
    const [roleFilter, setRoleFilter] = useStateD("");
    const [statusFilter, setStatusFilter] = useStateD("");
    const [expanded, setExpanded] = useStateD(null);
    useEffectD(() => {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      try {
        localStorage.setItem("ps3_theme", theme);
      } catch (e) {
        logError("dashboard: could not persist theme preference", e);
      }
    }, [theme]);
    useEffectD(() => {
      document.documentElement.setAttribute("lang", lang);
      try {
        localStorage.setItem("ps3_lang", lang);
      } catch (e) {
        logError("dashboard: could not persist language preference", e);
      }
    }, [lang]);
    useEffectD(() => {
      const refresh = () => setLeads(readLeads());
      function onStorage(e) {
        if (!e.key || e.key === LEADS_KEY) refresh();
      }
      window.addEventListener("storage", onStorage);
      const intervalId = window.setInterval(refresh, POLL_MS);
      const onVisible = () => {
        if (document.visibilityState === "visible") refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", refresh);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.clearInterval(intervalId);
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", refresh);
      };
    }, []);
    function onStatusChange(ts, status) {
      const next = leads.map((l) => l.ts === ts ? Object.assign({}, l, { status }) : l);
      setLeads(writeLeads(next) ? next : readLeads());
    }
    function onDelete(ts) {
      const next = leads.filter((l) => l.ts !== ts);
      setLeads(writeLeads(next) ? next : readLeads());
    }
    const sorted = leads.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const visible = sorted.filter((l) => {
      if (roleFilter && l.role !== roleFilter) return false;
      if (statusFilter && (l.status || "new") !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return bodyOf(l).toLowerCase().includes(q) || contactOf(l).toLowerCase().includes(q) || contextOf(l).toLowerCase().includes(q);
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wrap top-bar" }, /* @__PURE__ */ React.createElement("a", { href: "../", style: { textDecoration: "none" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 20 })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "live-badge" }, /* @__PURE__ */ React.createElement("span", { className: "live-dot" }), t.dash_live), /* @__PURE__ */ React.createElement(ModeToggle, { theme, setTheme }), /* @__PURE__ */ React.createElement(LangMenu, { lang, setLang }))), /* @__PURE__ */ React.createElement("main", { className: "wrap page-main" }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "clamp(28px,3.2vw,40px)" } }, t.dash_title), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 10, fontSize: 17 } }, t.dash_subtitle), /* @__PURE__ */ React.createElement("div", { className: "dash-toolbar" }, /* @__PURE__ */ React.createElement("input", { type: "search", placeholder: t.dash_search, value: search, onChange: (e) => setSearch(e.target.value), "aria-label": t.dash_search }), /* @__PURE__ */ React.createElement("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), "aria-label": t.dash_filter_role_all }, /* @__PURE__ */ React.createElement("option", { value: "" }, t.dash_filter_role_all), /* @__PURE__ */ React.createElement("option", { value: "buyer" }, t.dash_role_buyer), /* @__PURE__ */ React.createElement("option", { value: "supplier" }, t.dash_role_supplier), /* @__PURE__ */ React.createElement("option", { value: "network" }, t.dash_role_network)), /* @__PURE__ */ React.createElement("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), "aria-label": t.dash_filter_status_all }, /* @__PURE__ */ React.createElement("option", { value: "" }, t.dash_filter_status_all), STATUS_ORDER.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, statusLabel(t, s)))), /* @__PURE__ */ React.createElement("span", { className: "mono dash-count" }, visible.length === 1 ? t.dash_count_one : t.dash_count.replace("{n}", visible.length))), visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "surface dash-empty" }, /* @__PURE__ */ React.createElement("p", null, t.dash_empty), leads.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "mono", style: { marginTop: 8 } }, t.dash_seed_hint)) : /* @__PURE__ */ React.createElement("div", { className: "surface dash-table-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dash-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, t.dash_col_received), /* @__PURE__ */ React.createElement("th", null, t.dash_col_role), /* @__PURE__ */ React.createElement("th", null, t.dash_col_request), /* @__PURE__ */ React.createElement("th", null, t.dash_col_contact), /* @__PURE__ */ React.createElement("th", null, t.dash_col_context), /* @__PURE__ */ React.createElement("th", null, t.dash_col_status), /* @__PURE__ */ React.createElement("th", null, t.dash_col_actions))), /* @__PURE__ */ React.createElement("tbody", null, visible.map((lead) => /* @__PURE__ */ React.createElement(
      LeadRow,
      {
        key: lead.ts,
        t,
        lang,
        lead,
        expanded: expanded === lead.ts,
        onToggle: () => setExpanded(expanded === lead.ts ? null : lead.ts),
        onStatusChange,
        onDelete
      }
    )))))), /* @__PURE__ */ React.createElement("footer", { style: { borderTop: "1px solid var(--rule)", padding: "38px 0 46px" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap", style: { fontSize: 15, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 16 }), " ", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12 } }, "\xA9 2026 \xB7 ", t.foot_corridors))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
