// post.supply shared runtime: reveal-on-scroll, brand mark, icons, day/night toggle,
// language menu, local-first lead store, and theme/locale init. Used by every surface.

(() => {
  const { useState, useEffect, useRef } = React;
  function logError(context, err) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[post.supply] " + context, err);
    }
  }
  function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const show = () => el.classList.add("in");
      if (!("IntersectionObserver" in window)) {
        show();
        return;
      }
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }), { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      io.observe(el);
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
        setTimeout(show, 60);
      }
      return () => io.disconnect();
    }, []);
    return ref;
  }
  function Reveal({ children, delay = 0, className = "", style }) {
    const r = useReveal();
    return /* @__PURE__ */ React.createElement("div", { ref: r, className: `reveal ${className}`, style: { transitionDelay: `${delay}ms`, ...style } }, children);
  }
  function Wordmark({ size = 21 }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "baseline", fontFamily: "var(--f-display)", fontWeight: 600, letterSpacing: "-0.03em", fontSize: size, color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("span", null, "Post"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--accent)" } }, "."), /* @__PURE__ */ React.createElement("span", null, "Supply"));
  }
  function Stamp({ size = 32 }) {
    return /* @__PURE__ */ React.createElement("div", { "aria-hidden": true, style: { width: size, height: size, borderRadius: 8, border: "1.5px solid var(--accent)", color: "var(--accent)", display: "grid", placeItems: "center", fontFamily: "var(--f-mono)", fontSize: size * 0.33, fontWeight: 500, flex: "0 0 auto" } }, "P.S");
  }
  function Arrow({ s = 15 }) {
    return /* @__PURE__ */ React.createElement("svg", { className: "cta-arrow", width: s, height: s, viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }));
  }
  function Check({ s = 12 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M4 12.5l5 5L20 6.5", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }));
  }
  function Cross({ s = 11 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M6 6l12 12M18 6L6 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }));
  }
  function WhatsApp({ s = 17 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true }, /* @__PURE__ */ React.createElement("path", { d: "M20.5 3.5A10 10 0 0 0 3.6 15.7L2 22l6.5-1.7A10 10 0 1 0 20.5 3.5Z", stroke: "currentColor", strokeWidth: "1.4" }), /* @__PURE__ */ React.createElement("path", { d: "M8.5 8.8c.2-.4.5-.5.8-.5h.6c.2 0 .4.1.5.4l.9 2c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6.6.9 1.5 1.8 2.6 2.3.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.3.4.5v.6c0 1-.9 1.8-1.9 1.6-3.6-.6-6.7-3.6-7.3-7.2-.1-.6.1-1.3.4-1.6Z", fill: "currentColor" }));
  }
  function Paperclip({ s = 16 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M20 11.5l-7.8 7.8a5 5 0 0 1-7-7L13 4.5a3.4 3.4 0 0 1 4.8 4.8l-7.8 7.8a1.8 1.8 0 0 1-2.5-2.5l7.2-7.2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }));
  }
  function ModeToggle({ theme, setTheme }) {
    const night = theme === "dark";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setTheme(night ? "light" : "dark");
          track("mode_changed", night ? "light" : "dark");
        },
        "aria-label": night ? "Switch to day mode" : "Switch to night mode",
        style: { position: "relative", width: 64, height: 34, borderRadius: 999, border: "1px solid var(--rule)", background: "var(--surface-2)", cursor: "pointer", padding: 0, transition: "background-color .4s ease, border-color .4s ease" }
      },
      /* @__PURE__ */ React.createElement("span", { "aria-hidden": true, style: { position: "absolute", top: 3, left: night ? 33 : 3, width: 26, height: 26, borderRadius: 999, background: "var(--surface)", border: "1px solid var(--rule)", display: "grid", placeItems: "center", color: "var(--ink)", transition: "left .35s cubic-bezier(.3,.7,.3,1), background-color .4s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: night ? 0 : 1, transform: night ? "rotate(12deg) scale(.7)" : "none", transition: "opacity .3s ease, transform .35s ease" } }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "4", stroke: "currentColor", strokeWidth: "1.7", fill: "none" }), /* @__PURE__ */ React.createElement("path", { d: "M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", fill: "none" }))), /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: night ? 1 : 0, transform: night ? "none" : "rotate(-12deg) scale(.7)", transition: "opacity .3s ease, transform .35s ease" } }, /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z", stroke: "currentColor", strokeWidth: "1.7", strokeLinejoin: "round" }))))
    );
  }
  function LangMenu({ lang, setLang, up = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      if (!open) return;
      function onDown(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open]);
    const short = { en: "EN", es: "ES", pt: "PT", zh: "\u4E2D\u6587", ja: "\u65E5\u672C\u8A9E" }[lang] || "EN";
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative" }, ref }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        "aria-label": "Language",
        "aria-expanded": open,
        style: { display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 13px", borderRadius: 999, border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer", fontSize: 15, fontWeight: 500, transition: "background-color .4s ease, border-color .4s ease" }
      },
      short,
      /* @__PURE__ */ React.createElement("svg", { width: "10", height: "10", viewBox: "0 0 10 10", style: { opacity: 0.55, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" } }, /* @__PURE__ */ React.createElement("path", { d: "M2 3.5l3 3 3-3", stroke: "currentColor", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }))
    ), open && /* @__PURE__ */ React.createElement("div", { className: "lang-pop", style: { position: "absolute", right: 0, [up ? "bottom" : "top"]: "calc(100% + 8px)", width: 168, background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 14, padding: 6, boxShadow: "var(--shadow)", zIndex: 60 } }, PS_LANGS.map(([code, name]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: code,
        onClick: () => {
          setLang(code);
          setOpen(false);
          track("language_changed", code);
        },
        style: { display: "flex", alignItems: "center", gap: 10, width: "100%", height: 42, padding: "0 12px", borderRadius: 9, border: "none", background: lang === code ? "var(--surface-2)" : "transparent", color: "var(--ink)", cursor: "pointer", font: "inherit", fontSize: 15.5, textAlign: "left" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: 999, background: lang === code ? "var(--accent)" : "transparent", flex: "0 0 auto" } }),
      name
    ))));
  }
  function saveLead(record) {
    const lead = Object.assign({
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      source: location.pathname,
      utm: location.search || null,
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      lang: document.documentElement.lang || "en",
      mode: document.documentElement.getAttribute("data-theme") || "light",
      status: "new"
    }, record);
    try {
      const all = JSON.parse(localStorage.getItem("ps_leads_v3") || "[]");
      all.push(lead);
      localStorage.setItem("ps_leads_v3", JSON.stringify(all));
    } catch (e) {
      logError("saveLead: could not persist lead to localStorage; lead not stored", e);
    }
    return lead;
  }
  function track(event, data) {
    try {
      const all = JSON.parse(localStorage.getItem("ps_events_v3") || "[]");
      all.push({ e: event, d: data != null ? data : null, ts: Date.now() });
      localStorage.setItem("ps_events_v3", JSON.stringify(all.slice(-600)));
    } catch (e) {
      logError("track: could not persist analytics event '" + event + "'", e);
    }
  }
  function scrollToIntake(role) {
    try {
      if (role) window.dispatchEvent(new CustomEvent("ps:setrole", { detail: role }));
    } catch (e) {
      logError("scrollToIntake: could not dispatch ps:setrole event", e);
    }
    const el = document.getElementById("rfq");
    if (!el) return;
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96, behavior: "smooth" });
    track("cta_to_intake", role || null);
  }
  function initTheme() {
    try {
      const s = localStorage.getItem("ps3_theme");
      if (s) return s;
      if (matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    } catch (e) {
      logError("initTheme: could not read stored theme preference", e);
    }
    return "light";
  }
  function initLang() {
    try {
      const s = localStorage.getItem("ps3_lang");
      if (s && PS_T[s]) return s;
      const n = (navigator.language || "en").toLowerCase();
      for (const p of ["es", "pt", "zh", "ja"]) if (n.startsWith(p)) return p;
    } catch (e) {
      logError("initLang: could not read stored language preference", e);
    }
    return "en";
  }
  Object.assign(window, { logError, useReveal, Reveal, Wordmark, Stamp, Arrow, Check, Cross, WhatsApp, Paperclip, ModeToggle, LangMenu, saveLead, track, scrollToIntake, initTheme, initLang });
})();
