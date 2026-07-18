// post.supply landing page: RFQ composer and page sections.

(() => {
  const { useState: useStateI, useEffect: useEffectI, useRef: useRefI } = React;
  const V3_COUNTRIES = [["+1", "US/PR"], ["+1", "CA"], ["+52", "MX"], ["+55", "BR"], ["+86", "CN"], ["+81", "JP"], ["+34", "ES"], ["+809", "DO"]];
  const ROLES = ["buyer", "supplier", "network"];
  const fld = {
    width: "100%",
    border: "1px solid var(--rule)",
    borderRadius: 12,
    background: "var(--surface)",
    padding: "13px 15px",
    font: "inherit",
    fontSize: 16,
    color: "var(--ink)",
    outline: "none",
    transition: "border-color .25s ease, background-color .25s ease"
  };
  const lbl = { fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 7, display: "block" };
  function FieldV3({ label, children }) {
    return /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("label", { style: lbl }, label), children);
  }
  function useRotatingPlaceholder(examples, active) {
    const [i, setI] = useStateI(0);
    useEffectI(() => {
      if (!active || examples.length < 2) return;
      const id = setInterval(() => setI((x) => (x + 1) % examples.length), 6e3);
      return () => clearInterval(id);
    }, [active, examples.length]);
    return examples[i % examples.length];
  }
  function Composer({ t }) {
    const [role, setRole] = useStateI("buyer");
    const [f, setF] = useStateI({});
    const [attach, setAttach] = useStateI(false);
    const [focused, setFocused] = useStateI(false);
    const [error, setError] = useStateI(null);
    const [sending, setSending] = useStateI(false);
    const [done, setDone] = useStateI(null);
    const started = useRefI(false);
    useEffectI(() => {
      function onRole(e) {
        if (ROLES.includes(e.detail)) {
          setRole(e.detail);
          setDone(null);
          setError(null);
        }
      }
      window.addEventListener("ps:setrole", onRole);
      return () => window.removeEventListener("ps:setrole", onRole);
    }, []);
    const body = role === "buyer" ? f.request || "" : role === "supplier" ? f.sells || "" : f.categories || "";
    const rotPh = useRotatingPlaceholder(t.ph_buyer, role === "buyer" && !focused && !body);
    const mainPh = role === "buyer" ? rotPh : role === "supplier" ? t.ph_supplier : t.ph_network;
    const mainKey = role === "buyer" ? "request" : role === "supplier" ? "sells" : "categories";
    const mainLabel = role === "buyer" ? t.q_buyer : role === "supplier" ? t.q_supplier : t.q_network;
    const phoneOk = (f.method || "whatsapp") === "email" ? /@.+\./.test(f.email || "") : (f.phone || "").replace(/\D/g, "").length >= 6;
    function up(k) {
      return (e) => {
        if (!started.current) {
          started.current = true;
          track("rfq_started", role);
        }
        setF((s) => ({ ...s, [k]: e.target.value }));
        setError(null);
      };
    }
    function submit() {
      if (sending) return;
      if (!body.trim()) {
        setError(t.err_body);
        return;
      }
      if (!phoneOk) {
        setError(t.err_phone);
        return;
      }
      setSending(true);
      const lead = saveLead(Object.assign({ role, attach }, f));
      track("rfq_submitted", role);
      setTimeout(() => {
        setSending(false);
        setDone(lead);
      }, 700);
    }
    if (done) return /* @__PURE__ */ React.createElement(ComposerDone, { t, role, lead: done, onReset: () => {
      setDone(null);
      setF({});
      setAttach(false);
      started.current = false;
    } });
    const sub = role === "buyer" ? [["destination", t.f_destination, t.ph_destination], ["quantity", t.f_quantity, t.ph_quantity]] : role === "supplier" ? [["origin", t.f_origin, t.ph_origin], ["markets", t.f_markets, t.ph_markets]] : [["territory", t.f_territory, t.ph_territory], ["brings", t.f_brings, t.ph_brings]];
    return /* @__PURE__ */ React.createElement("div", { className: "surface", id: "rfq", style: { border: "1px solid var(--rule)", borderRadius: 20, background: "var(--surface)", boxShadow: "var(--shadow)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", borderBottom: "1px solid var(--rule)", background: "var(--surface-2)" } }, ROLES.map((r, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: r,
        onClick: () => {
          setRole(r);
          setError(null);
          track("role_selected", r);
        },
        style: { flex: 1, padding: "15px 6px", border: "none", borderBottom: role === r ? "2px solid var(--accent)" : "2px solid transparent", background: role === r ? "var(--surface)" : "transparent", color: role === r ? "var(--ink)" : "var(--ink-2)", font: "inherit", fontSize: 15, fontWeight: 500, cursor: "pointer", transition: "background-color .2s ease, color .2s ease" }
      },
      t.tabs[i]
    ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 24px 22px", display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement(FieldV3, { label: mainLabel }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 3,
        value: body,
        onChange: up(mainKey),
        placeholder: mainPh,
        onFocus: () => {
          setFocused(true);
          track("rfq_field_focused");
        },
        onBlur: () => setFocused(false),
        style: {
          ...fld,
          resize: "vertical",
          lineHeight: 1.55,
          minHeight: 96,
          borderColor: focused ? "var(--accent)" : "var(--rule)",
          boxShadow: focused ? "0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)" : "none"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { "aria-live": "polite", style: { fontSize: 15, color: "var(--ink-2)", marginTop: 8, minHeight: 22, opacity: focused ? 1 : 0, transition: "opacity .3s ease" } }, t.in_sub)), /* @__PURE__ */ React.createElement("div", { className: "composer-cols", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: -10 } }, sub.map(([k, label, ph]) => /* @__PURE__ */ React.createElement(FieldV3, { key: k, label }, /* @__PURE__ */ React.createElement("input", { style: fld, placeholder: ph, value: f[k] || "", onChange: up(k) })))), /* @__PURE__ */ React.createElement("div", { className: "composer-cols", style: { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" } }, /* @__PURE__ */ React.createElement(FieldV3, { label: t.f_phone }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "stretch", border: "1px solid var(--rule)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, padding: "0 10px 0 14px", borderRight: "1px solid var(--rule)" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: f.method || "whatsapp",
        onChange: up("method"),
        "aria-label": "Contact method",
        style: { appearance: "none", background: "transparent", border: "none", font: "inherit", fontSize: 15.5, color: "var(--ink)", cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("option", { value: "whatsapp" }, "WhatsApp"),
      /* @__PURE__ */ React.createElement("option", { value: "sms" }, "SMS"),
      /* @__PURE__ */ React.createElement("option", { value: "email" }, "Email"),
      /* @__PURE__ */ React.createElement("option", { value: "call" }, t.m_call)
    ), /* @__PURE__ */ React.createElement("svg", { width: "10", height: "10", viewBox: "0 0 10 10", style: { color: "var(--ink-2)", pointerEvents: "none" }, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M2 3.5l3 3 3-3", stroke: "currentColor", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }))), (f.method || "whatsapp") === "email" ? /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        inputMode: "email",
        autoComplete: "email",
        placeholder: t.f_email_ph,
        value: f.email || "",
        onChange: up("email"),
        onKeyDown: (e) => {
          if (e.key === "Enter") submit();
        },
        style: { flex: 1, border: "none", background: "transparent", padding: "13px 15px", font: "inherit", fontSize: 16, color: "var(--ink)", outline: "none", minWidth: 0 }
      }
    ) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, padding: "0 8px 0 12px", borderRight: "1px solid var(--rule)" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: f.country || "+1",
        onChange: up("country"),
        "aria-label": "Country code",
        style: { appearance: "none", background: "transparent", border: "none", font: "inherit", fontSize: 15.5, color: "var(--ink)", cursor: "pointer" }
      },
      V3_COUNTRIES.map((x, i) => /* @__PURE__ */ React.createElement("option", { key: i, value: x[0] }, x[1], " ", x[0]))
    ), /* @__PURE__ */ React.createElement("svg", { width: "10", height: "10", viewBox: "0 0 10 10", style: { color: "var(--ink-2)", pointerEvents: "none" }, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M2 3.5l3 3 3-3", stroke: "currentColor", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel",
        placeholder: t.f_phone_ph,
        value: f.phone || "",
        onChange: up("phone"),
        onKeyDown: (e) => {
          if (e.key === "Enter") submit();
        },
        style: { flex: 1, border: "none", background: "transparent", padding: "13px 15px", font: "inherit", fontSize: 16, color: "var(--ink)", outline: "none", minWidth: 0 }
      }
    )))), attach ? /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 9, height: 50, padding: "0 16px", borderRadius: 12, border: "1px solid color-mix(in srgb, var(--accent) 45%, var(--rule))", background: "color-mix(in srgb, var(--accent) 8%, var(--surface))", color: "var(--ink)", fontSize: 15, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Check, { s: 14 })), " ", t.attached, /* @__PURE__ */ React.createElement("button", { onClick: () => setAttach(false), "aria-label": "Remove attachment", style: { border: "none", background: "none", color: "var(--ink-2)", cursor: "pointer", padding: 2, display: "grid", placeItems: "center" } }, /* @__PURE__ */ React.createElement(Cross, { s: 12 }))) : /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setAttach(true);
          track("file_attached");
        },
        style: { display: "inline-flex", alignItems: "center", gap: 8, height: 50, padding: "0 16px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink-2)", font: "inherit", fontSize: 15, cursor: "pointer", whiteSpace: "nowrap", transition: "border-color .25s ease, color .25s ease" }
      },
      /* @__PURE__ */ React.createElement(Paperclip, null),
      " ",
      t.attach
    )), attach && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, color: "var(--ink-2)", marginTop: -6 } }, t.attach_hint), error && /* @__PURE__ */ React.createElement("p", { role: "alert", style: { fontSize: 15.5, color: "var(--accent)", margin: 0 } }, error), /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent", style: { height: 56, fontSize: 17 }, onClick: submit, disabled: sending }, sending ? t.sending : role === "buyer" ? t.send_buyer : role === "supplier" ? t.send_supplier : t.send_network, !sending && /* @__PURE__ */ React.createElement(Arrow, null)), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, color: "var(--ink-2)", textAlign: "center", margin: 0 } }, t.helper)));
  }
  function ComposerDone({ t, role, lead, onReset }) {
    const title = role === "buyer" ? t.cf_buyer : role === "supplier" ? t.cf_supplier : t.cf_network;
    const next = role === "buyer" ? t.next_buyer : role === "supplier" ? t.next_supplier : t.next_network;
    const rows = [];
    const bodyLabel = role === "buyer" ? t.s_request : role === "supplier" ? t.s_products : t.s_handles;
    const body = lead.request || lead.sells || lead.categories;
    if (body) rows.push([bodyLabel, body]);
    [["destination", t.f_destination], ["quantity", t.f_quantity], ["origin", t.f_origin], ["markets", t.f_markets], ["territory", t.f_territory], ["brings", t.f_brings]].forEach(([k, label]) => {
      if (lead[k]) rows.push([label, lead[k]]);
    });
    const method = lead.method || "whatsapp";
    const methodLabel = method === "call" ? t.m_call : method === "sms" ? "SMS" : method === "email" ? "Email" : "WhatsApp";
    rows.push([t.s_contact, method === "email" ? `Email \xB7 ${lead.email}` : `${methodLabel} \xB7 ${lead.country || "+1"} ${lead.phone}`]);
    if (lead.attach) rows.push([t.s_attachment, t.s_attach_note]);
    return /* @__PURE__ */ React.createElement("div", { className: "surface", id: "rfq", style: { border: "1px solid var(--rule)", borderRadius: 20, background: "var(--surface)", boxShadow: "var(--shadow)", padding: 26 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 15, marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 42, height: 42, borderRadius: 999, background: "var(--accent)", color: "#FFFDF8", display: "grid", placeItems: "center", flex: "0 0 auto" } }, /* @__PURE__ */ React.createElement(Check, { s: 18 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.25, color: "var(--ink)" } }, title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15.5, marginTop: 5 } }, t.cf_person)), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto" } }, /* @__PURE__ */ React.createElement(Stamp, { size: 36 }))), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--rule)", borderRadius: 12, overflow: "hidden" } }, rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "cf-row", style: { display: "grid", gridTemplateColumns: "150px 1fr", borderTop: i ? "1px solid var(--rule)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "11px 14px", background: "var(--surface-2)", color: "var(--ink-2)", fontSize: 14, fontWeight: 500 } }, r[0]), /* @__PURE__ */ React.createElement("div", { style: { padding: "11px 14px", fontSize: 15.5, color: "var(--ink)" } }, r[1])))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 9 } }, t.cf_next), /* @__PURE__ */ React.createElement("ol", { style: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 } }, next.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i, style: { display: "flex", gap: 11, fontSize: 15.5, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: 12.5, color: "var(--accent)", width: 22, flex: "0 0 auto", paddingTop: 2 } }, String(i + 1).padStart(2, "0")), s)))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", style: { height: 48, marginTop: 20, fontSize: 15.5 }, onClick: onReset }, t.again));
  }
  Object.assign(window, { Composer });
})();
(() => {
  const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;
  function NavV3({ t, theme, setTheme, lang, setLang }) {
    const [scrolled, setScrolled] = useStateS(false);
    useEffectS(() => {
      const on = () => setScrolled(window.scrollY > 24);
      on();
      window.addEventListener("scroll", on, { passive: true });
      return () => window.removeEventListener("scroll", on);
    }, []);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, zIndex: 40, background: "color-mix(in srgb, var(--bg) 82%, transparent)", backdropFilter: "saturate(140%) blur(12px)", WebkitBackdropFilter: "saturate(140%) blur(12px)", borderBottom: `1px solid ${scrolled ? "var(--rule)" : "transparent"}`, transition: "border-color .3s ease" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap", style: { display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 60 : 72, gap: 16, transition: "height .3s ease" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 21 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { className: "nav-links", style: { display: "flex", alignItems: "center", gap: 2, marginRight: 8 } }, /* @__PURE__ */ React.createElement("a", { href: "#roles", style: navA }, t.nav_buyers), /* @__PURE__ */ React.createElement("a", { href: "#roles", style: navA }, t.nav_suppliers), /* @__PURE__ */ React.createElement("a", { href: "#how", style: navA }, t.nav_how)), /* @__PURE__ */ React.createElement(ModeToggle, { theme, setTheme }), /* @__PURE__ */ React.createElement(LangMenu, { lang, setLang }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent nav-cta", style: { height: 42, padding: "0 18px", fontSize: 15.5, marginLeft: 6 }, onClick: () => {
      scrollToIntake("buyer");
      track("hero_cta", "nav");
    } }, t.nav_cta))));
  }
  const navA = { padding: "9px 12px", borderRadius: 9, fontSize: 15.5, color: "var(--ink-2)" };
  function PreviewCard({ t }) {
    const Row = ({ label, chip: chip2, children }) => /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px", borderTop: "1px solid var(--rule)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500, color: "var(--ink-2)", letterSpacing: "0.02em", textTransform: "uppercase", fontFamily: "var(--f-mono)", fontSize: 11.5 } }, label), chip2), children);
    const chip = (txt, on) => /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 500, color: on ? "var(--accent)" : "var(--ink-2)", border: `1px solid ${on ? "color-mix(in srgb, var(--accent) 45%, var(--rule))" : "var(--rule)"}`, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" } }, txt);
    return /* @__PURE__ */ React.createElement("div", { className: "surface", style: { border: "1px solid var(--rule)", borderRadius: 20, background: "var(--surface)", boxShadow: "var(--shadow)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-2)", letterSpacing: "0.05em" } }, "PS-7421 \xB7 CIF SAN JUAN"), /* @__PURE__ */ React.createElement(Stamp, { size: 28 })), /* @__PURE__ */ React.createElement(Row, { label: t.pv_request, chip: chip("WhatsApp") }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: "12px 12px 12px 4px", padding: "10px 13px", fontSize: 15, color: "var(--ink)", lineHeight: 1.5, maxWidth: "92%" } }, t.pv_msg)), /* @__PURE__ */ React.createElement(Row, { label: t.pv_spec, chip: chip(t.pv_status, true) }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" } }, t.pv_rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14.5, borderBottom: "1px dashed var(--rule)", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, r[0]), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink)", fontWeight: 500, textAlign: "right" } }, r[1]))))), /* @__PURE__ */ React.createElement(Row, { label: t.pv_quote, chip: chip(t.pv_valid) }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, color: "var(--ink-2)" } }, t.pv_total), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 27, letterSpacing: "-0.02em", color: "var(--accent)" } }, "$24,300")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, color: "var(--ink-2)" } }, t.pv_lead), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 20, color: "var(--ink)" } }, t.pv_days)))), /* @__PURE__ */ React.createElement("div", { className: "pv-bottom", style: { display: "grid", gridTemplateColumns: "1fr 1.4fr", borderTop: "1px solid var(--rule)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px", borderRight: "1px solid var(--rule)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-2)", marginBottom: 8 } }, t.pv_po.toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--ink)", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, /* @__PURE__ */ React.createElement(Check, { s: 14 })), " ", t.pv_approved)), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-2)", marginBottom: 8 } }, t.pv_reorder.toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, color: "var(--ink)", lineHeight: 1.45 } }, "\u201C", t.pv_reorder_msg, "\u201D"))));
  }
  function HeroV3({ t }) {
    return /* @__PURE__ */ React.createElement("section", { className: "no-border", style: { paddingTop: 56, paddingBottom: 84 } }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement("div", { className: "hero-grid", style: { display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", gap: 60, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 28 } }, /* @__PURE__ */ React.createElement(Reveal, { delay: 40 }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "clamp(42px,5.2vw,72px)", lineHeight: 1, maxWidth: "13ch" } }, t.hero_h1)), /* @__PURE__ */ React.createElement(Reveal, { delay: 110 }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "clamp(18px,1.5vw,21px)", maxWidth: "44ch" } }, t.hero_sub)), /* @__PURE__ */ React.createElement(Reveal, { delay: 170 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent", style: { height: 56, padding: "0 26px", fontSize: 17 }, onClick: () => {
      scrollToIntake("buyer");
      track("hero_cta", "primary");
    } }, t.cta_quote, " ", /* @__PURE__ */ React.createElement(Arrow, null)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", style: { height: 56, padding: "0 24px", fontSize: 16.5 }, onClick: () => {
      scrollToIntake("network");
      track("hero_cta", "secondary");
    } }, t.cta_bring))), /* @__PURE__ */ React.createElement(Reveal, { delay: 230 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, t.chips.map((c, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "chip" }, c))))), /* @__PURE__ */ React.createElement(Reveal, { delay: 150 }, /* @__PURE__ */ React.createElement(PreviewCard, { t })))));
  }
  function IntakeSection({ t }) {
    return /* @__PURE__ */ React.createElement("section", { id: "intake", style: { background: "var(--surface-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement("div", { className: "intake-grid", style: { display: "grid", gridTemplateColumns: "minmax(0,0.75fr) minmax(0,1.25fr)", gap: 56, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 110 } }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(34px,3.8vw,52px)", maxWidth: "12ch" } }, t.in_title)), /* @__PURE__ */ React.createElement(Reveal, { delay: 80 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 16, fontSize: 18, maxWidth: "30ch" } }, t.in_sub)), /* @__PURE__ */ React.createElement(Reveal, { delay: 140 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 20, fontFamily: "var(--f-display)", fontSize: "clamp(19px,2vw,23px)", letterSpacing: "-0.02em", color: "var(--ink)", maxWidth: "24ch" } }, t.in_key))), /* @__PURE__ */ React.createElement(Reveal, { delay: 120 }, /* @__PURE__ */ React.createElement(Composer, { t })))));
  }
  function WorkflowV3({ t }) {
    return /* @__PURE__ */ React.createElement("section", { id: "how" }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(34px,3.8vw,52px)" } }, t.wf_title)), /* @__PURE__ */ React.createElement("div", { className: "wf-grid", style: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 40 } }, t.wf.map((s, i) => /* @__PURE__ */ React.createElement(Reveal, { key: i, delay: i * 70 }, /* @__PURE__ */ React.createElement("div", { className: "surface wf-card", style: { border: "1px solid var(--rule)", borderRadius: 16, background: "var(--surface)", padding: "22px 20px", height: "100%", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, fontFamily: "var(--f-mono)", color: i === 4 ? "var(--accent)" : "var(--ink-2)", border: `1px solid ${i === 4 ? "color-mix(in srgb, var(--accent) 45%, var(--rule))" : "var(--rule)"}`, borderRadius: 999, padding: "4px 11px" } }, t.wf_chips[i]), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1.2 } }, s[0]), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15.5 } }, s[1])))))));
  }
  function RolesV3({ t }) {
    const targets = ["buyer", "supplier", "network"];
    return /* @__PURE__ */ React.createElement("section", { id: "roles" }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(34px,3.8vw,52px)", maxWidth: "18ch" } }, t.rl_title)), /* @__PURE__ */ React.createElement(Reveal, { delay: 80 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 16, fontSize: 18, maxWidth: "52ch" } }, t.rl_sub)), /* @__PURE__ */ React.createElement("div", { className: "roles-grid", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 40 } }, t.roles.map((r, i) => /* @__PURE__ */ React.createElement(Reveal, { key: i, delay: i * 70 }, /* @__PURE__ */ React.createElement("div", { className: "surface role-card", style: { border: "1px solid var(--rule)", borderRadius: 18, background: "var(--surface)", padding: "26px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 24, letterSpacing: "-0.02em", color: "var(--ink)" } }, r[0]), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16.5 } }, r[1]), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      scrollToIntake(targets[i]);
      track("role_path", targets[i]);
    }, className: "btn btn-ghost", style: { height: 50, marginTop: "auto", fontSize: 16, justifyContent: "space-between" } }, r[2], " ", /* @__PURE__ */ React.createElement(Arrow, null)))))), /* @__PURE__ */ React.createElement(Reveal, { delay: 140 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 36, fontFamily: "var(--f-display)", fontSize: "clamp(22px,2.6vw,30px)", letterSpacing: "-0.02em", color: "var(--ink)" } }, t.rl_key))));
  }
  function CountUp({ value, active }) {
    const [v, setV] = useStateS(active ? value : 0);
    useEffectS(() => {
      if (!active) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setV(value);
        return;
      }
      const t0 = performance.now();
      const dur = 750;
      let raf;
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [active, value]);
    return /* @__PURE__ */ React.createElement("span", null, "$", v.toLocaleString());
  }
  function LandedV3({ t }) {
    const ref = useRefS(null);
    const [seen, setSeen] = useStateS(false);
    useEffectS(() => {
      const el = ref.current;
      if (!el) return;
      if (!("IntersectionObserver" in window)) {
        setSeen(true);
        return;
      }
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      }), { threshold: 0.25 });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    const sup = [
      { name: "Supplier A", product: 18400, freight: 4900, port: 2100, lead: 21, total: 25400, best: false },
      { name: "Supplier B", product: 19100, freight: 3200, port: 2e3, lead: 14, total: 24300, best: true },
      { name: "Supplier C", nc: true }
    ];
    return /* @__PURE__ */ React.createElement("section", { id: "landed" }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(34px,3.8vw,52px)", maxWidth: "16ch" } }, t.lc_title)), /* @__PURE__ */ React.createElement(Reveal, { delay: 80 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 16, fontSize: 18, maxWidth: "50ch" } }, t.lc_sub)), /* @__PURE__ */ React.createElement("div", { ref, className: "lc-grid", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 40 } }, sup.map((s, i) => /* @__PURE__ */ React.createElement(Reveal, { key: s.name, delay: i * 90 }, /* @__PURE__ */ React.createElement("div", { className: "surface", style: { border: `1px solid ${s.best ? "color-mix(in srgb, var(--accent) 40%, var(--rule))" : "var(--rule)"}`, borderRadius: 18, background: "var(--surface)", padding: "24px 22px", height: "100%", display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontSize: 21, color: "var(--ink)" } }, s.name), s.best && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: 500, color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 45%, var(--rule))", borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap" } }, t.lc_best)), s.nc ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, margin: "auto 0", paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16.5, color: "var(--ink)", fontWeight: 500 } }, t.lc_missing), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15.5, color: "var(--ink-2)" } }, t.lc_nc)) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, fontSize: 15.5 } }, [[t.lc_product, s.product], [t.lc_freight, s.freight], [t.lc_port, s.port]].map((r, j) => /* @__PURE__ */ React.createElement("div", { key: j, style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, r[0]), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: 14.5, color: "var(--ink)" } }, "$", r[1].toLocaleString()))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-2)" } }, t.lc_lead), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-mono)", fontSize: 14.5, color: "var(--ink)" } }, s.lead, " ", t.lc_days))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15.5, fontWeight: 500, color: "var(--ink)" } }, t.lc_total), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--f-display)", fontSize: 26, letterSpacing: "-0.02em", color: s.best ? "var(--accent)" : "var(--ink)" } }, /* @__PURE__ */ React.createElement(CountUp, { value: s.total, active: seen })))))))), /* @__PURE__ */ React.createElement(Reveal, { delay: 150 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 36, fontFamily: "var(--f-display)", fontSize: "clamp(22px,2.6vw,30px)", letterSpacing: "-0.02em", color: "var(--ink)", maxWidth: "26ch" } }, t.lc_key))));
  }
  function RecordsV3({ t }) {
    return /* @__PURE__ */ React.createElement("section", { style: { background: "var(--surface-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(34px,3.8vw,52px)", maxWidth: "16ch" } }, t.rec_title)), /* @__PURE__ */ React.createElement(Reveal, { delay: 80 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 16, fontSize: 18, maxWidth: "48ch" } }, t.rec_sub)), /* @__PURE__ */ React.createElement("div", { className: "rec-grid", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 40 } }, t.rec.map((r, i) => /* @__PURE__ */ React.createElement(Reveal, { key: i, delay: i * 70 }, /* @__PURE__ */ React.createElement("div", { className: "surface", style: { border: "1px solid var(--rule)", borderRadius: 18, background: "var(--surface)", padding: "26px 24px", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 10 } }, r[0]), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16.5 } }, r[1]))))), /* @__PURE__ */ React.createElement(Reveal, { delay: 140 }, /* @__PURE__ */ React.createElement("p", { style: { marginTop: 36, fontFamily: "var(--f-display)", fontSize: "clamp(22px,2.6vw,30px)", letterSpacing: "-0.02em", color: "var(--ink)", maxWidth: "30ch" } }, t.rec_key))));
  }
  function FinalV3({ t }) {
    return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { className: "wrap", style: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24, paddingTop: 20, paddingBottom: 20 } }, /* @__PURE__ */ React.createElement(Reveal, null, /* @__PURE__ */ React.createElement(Stamp, { size: 44 })), /* @__PURE__ */ React.createElement(Reveal, { delay: 60 }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "clamp(38px,4.8vw,62px)", lineHeight: 1.02, maxWidth: "14ch" } }, t.fin_title)), /* @__PURE__ */ React.createElement(Reveal, { delay: 120 }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 18.5, maxWidth: "42ch" } }, t.fin_sub)), /* @__PURE__ */ React.createElement(Reveal, { delay: 170 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent", style: { height: 56, padding: "0 28px", fontSize: 17 }, onClick: () => {
      scrollToIntake("buyer");
      track("final_cta", "primary");
    } }, t.cta_quote, " ", /* @__PURE__ */ React.createElement(Arrow, null)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", style: { height: 56, padding: "0 24px", fontSize: 16.5 }, onClick: () => {
      scrollToIntake("network");
      track("final_cta", "secondary");
    } }, t.cta_bring))), /* @__PURE__ */ React.createElement(Reveal, { delay: 220 }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15.5, color: "var(--ink-2)" } }, t.fin_line))));
  }
  function FooterV3({ t }) {
    return /* @__PURE__ */ React.createElement("footer", { style: { borderTop: "1px solid var(--rule)", padding: "38px 0 46px" } }, /* @__PURE__ */ React.createElement("div", { className: "wrap", style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Wordmark, { size: 18 }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--ink-2)" } }, "\xA9 2026 \xB7 ", t.foot_corridors)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20, color: "var(--ink-2)", fontSize: 15 } }, t.foot_links.map((l, i) => /* @__PURE__ */ React.createElement("a", { key: i, href: "#" }, l)))));
  }
  function StickyCTA({ t }) {
    const [typing, setTyping] = useStateS(false);
    useEffectS(() => {
      const on = () => {
        var _a;
        return setTyping(["INPUT", "TEXTAREA", "SELECT"].includes((_a = document.activeElement) == null ? void 0 : _a.tagName));
      };
      document.addEventListener("focusin", on);
      document.addEventListener("focusout", () => setTimeout(on, 60));
      return () => {
        document.removeEventListener("focusin", on);
      };
    }, []);
    if (typing) return null;
    return /* @__PURE__ */ React.createElement("div", { className: "sticky-cta" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent", style: { width: "100%", height: 54, borderRadius: 14, fontSize: 16.5, boxShadow: "0 12px 32px -12px rgba(0,0,0,0.35)" }, onClick: () => scrollToIntake("buyer") }, t.cta_quote, " ", /* @__PURE__ */ React.createElement(Arrow, null)));
  }
  Object.assign(window, { NavV3, HeroV3, IntakeSection, WorkflowV3, RolesV3, LandedV3, RecordsV3, FinalV3, FooterV3, StickyCTA });
})();
(() => {
  const { useState: useStateApp, useEffect: useEffectApp } = React;
  function App() {
    const [theme, setTheme] = useStateApp(initTheme);
    const [lang, setLang] = useStateApp(initLang);
    const t = PS_T[lang] || PS_T.en;
    useEffectApp(() => {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      try {
        localStorage.setItem("ps3_theme", theme);
      } catch (e) {
      }
    }, [theme]);
    useEffectApp(() => {
      document.documentElement.setAttribute("lang", lang);
      try {
        localStorage.setItem("ps3_lang", lang);
      } catch (e) {
      }
    }, [lang]);
    return /* @__PURE__ */ React.createElement("div", { style: { fontFamily: lang === "zh" ? "'Inter', 'Noto Sans SC', sans-serif" : lang === "ja" ? "'Inter', 'Noto Sans JP', sans-serif" : void 0 } }, /* @__PURE__ */ React.createElement(NavV3, { t, theme, setTheme, lang, setLang }), /* @__PURE__ */ React.createElement(HeroV3, { t }), /* @__PURE__ */ React.createElement(IntakeSection, { t }), /* @__PURE__ */ React.createElement(RolesV3, { t }), /* @__PURE__ */ React.createElement(WorkflowV3, { t }), /* @__PURE__ */ React.createElement(LandedV3, { t }), /* @__PURE__ */ React.createElement(RecordsV3, { t }), /* @__PURE__ */ React.createElement(FinalV3, { t }), /* @__PURE__ */ React.createElement(FooterV3, { t }), /* @__PURE__ */ React.createElement(StickyCTA, { t }));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
