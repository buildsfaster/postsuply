/* post.supply sales desk dashboard: local-first view onto leads
   captured by the landing page contact form. */
(function () {
  "use strict";

  var h = React.createElement;
  var STATUSES = ["new", "contacted", "quoted", "won", "lost"];
  var POLL_MS = 2000;

  function formatDate(ts, locale) {
    try {
      return new Date(ts).toLocaleString(locale);
    } catch (e) {
      return new Date(ts).toISOString();
    }
  }

  function LangSwitch(props) {
    return h(
      "div",
      { className: "lang-switch", role: "group", "aria-label": "Language" },
      PS.SUPPORTED_LOCALES.map(function (code) {
        return h(
          "button",
          {
            key: code,
            type: "button",
            className: "lang-switch__btn",
            "aria-pressed": props.locale === code,
            onClick: function () {
              props.onChange(code);
            }
          },
          code.toUpperCase()
        );
      })
    );
  }

  function LeadRow(props) {
    var lead = props.lead;
    var t = props.t;
    var expanded = props.expanded;

    return h(
      React.Fragment,
      null,
      h(
        "tr",
        { className: "lead-row", onClick: props.onToggle },
        h(
          "td",
          { className: "mono lead-contact" },
          formatDate(lead.receivedAt, props.locale)
        ),
        h(
          "td",
          null,
          h("div", { className: "lead-name" }, lead.name),
          lead.company ? h("div", { className: "lead-company" }, lead.company) : null
        ),
        h(
          "td",
          { className: "lead-contact" },
          h("div", null, lead.email),
          lead.phone ? h("div", null, lead.phone) : null
        ),
        h("td", null, t("landing.materialOption" + lead.material.charAt(0).toUpperCase() + lead.material.slice(1)) || lead.material),
        h("td", null, lead.volume || ""),
        h(
          "td",
          { onClick: function (evt) { evt.stopPropagation(); } },
          h(
            "select",
            {
              className: "status-select",
              "data-status": lead.status,
              value: lead.status,
              onChange: function (evt) {
                props.onStatusChange(lead.id, evt.target.value);
              }
            },
            STATUSES.map(function (s) {
              return h("option", { key: s, value: s }, t("dashboard.status" + s.charAt(0).toUpperCase() + s.slice(1)));
            })
          )
        ),
        h(
          "td",
          { className: "lead-actions", onClick: function (evt) { evt.stopPropagation(); } },
          h(
            "button",
            {
              type: "button",
              onClick: function () {
                if (window.confirm(t("dashboard.actionDeleteConfirm"))) {
                  props.onDelete(lead.id);
                }
              }
            },
            t("dashboard.actionDelete")
          )
        )
      ),
      expanded
        ? h(
            "tr",
            { className: "lead-detail-row" },
            h(
              "td",
              { colSpan: 7 },
              h(
                "div",
                { className: "lead-detail" },
                h("strong", null, t("dashboard.detailMessage") + ": "),
                lead.message || t("dashboard.detailMessage")
              )
            )
          )
        : null
    );
  }

  function App() {
    var localeState = React.useState(PS.getLocale());
    var locale = localeState[0];
    var setLocale = localeState[1];

    var leadsState = React.useState(PS.leads.all());
    var leads = leadsState[0];
    var setLeads = leadsState[1];

    var searchState = React.useState("");
    var search = searchState[0];
    var setSearch = searchState[1];

    var filterState = React.useState("");
    var filter = filterState[0];
    var setFilter = filterState[1];

    var expandedState = React.useState(null);
    var expandedId = expandedState[0];
    var setExpandedId = expandedState[1];

    function t(path, vars) {
      return PS.t(locale, path, vars);
    }

    function refresh() {
      setLeads(PS.leads.all());
    }

    React.useEffect(function () {
      document.documentElement.lang = locale;
      document.title = t("common.brand") + " · " + t("dashboard.title");
    }, [locale]);

    React.useEffect(function () {
      var unsubscribe = PS.leads.subscribe(refresh);
      var intervalId = window.setInterval(refresh, POLL_MS);
      var onVisible = function () {
        if (document.visibilityState === "visible") refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", refresh);
      return function () {
        unsubscribe();
        window.clearInterval(intervalId);
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", refresh);
      };
    }, []);

    function changeLocale(code) {
      PS.setLocale(code);
      setLocale(code);
    }

    function onStatusChange(id, status) {
      PS.leads.update(id, { status: status });
      refresh();
    }

    function onDelete(id) {
      PS.leads.remove(id);
      refresh();
    }

    var visible = leads.filter(function (lead) {
      if (filter && lead.status !== filter) return false;
      if (!search.trim()) return true;
      var q = search.trim().toLowerCase();
      return (
        lead.name.toLowerCase().indexOf(q) !== -1 ||
        (lead.company || "").toLowerCase().indexOf(q) !== -1 ||
        lead.email.toLowerCase().indexOf(q) !== -1
      );
    });

    return h(
      React.Fragment,
      null,
      h(
        "header",
        { className: "container" },
        h(
          "div",
          { className: "desk-bar" },
          h("a", { className: "desk-bar__brand", href: "../" }, t("common.brand")),
          h(
            "nav",
            { className: "desk-bar__nav" },
            h(
              "span",
              { className: "live-badge" },
              h("span", { className: "live-badge__dot" }),
              t("dashboard.live")
            ),
            h(LangSwitch, { locale: locale, onChange: changeLocale })
          )
        )
      ),
      h(
        "main",
        { className: "container desk-main" },
        h("h1", null, t("dashboard.title")),
        h("p", null, t("dashboard.subtitle")),
        h(
          "div",
          { className: "desk-toolbar" },
          h("input", {
            type: "search",
            placeholder: t("dashboard.search"),
            value: search,
            onChange: function (evt) { setSearch(evt.target.value); },
            "aria-label": t("dashboard.search")
          }),
          h(
            "select",
            {
              value: filter,
              onChange: function (evt) { setFilter(evt.target.value); },
              "aria-label": t("dashboard.filterAll")
            },
            h("option", { value: "" }, t("dashboard.filterAll")),
            STATUSES.map(function (s) {
              return h("option", { key: s, value: s }, t("dashboard.status" + s.charAt(0).toUpperCase() + s.slice(1)));
            })
          ),
          h(
            "span",
            { className: "leads-count" },
            visible.length === 1 ? t("dashboard.countOne") : t("dashboard.count", { n: visible.length })
          )
        ),
        visible.length === 0
          ? h(
              "div",
              { className: "panel leads-empty" },
              h("p", null, t("dashboard.empty")),
              leads.length === 0 ? h("p", { className: "mono" }, t("dashboard.seedHint")) : null
            )
          : h(
              "div",
              { className: "panel leads-table-wrap" },
              h(
                "table",
                { className: "leads-table" },
                h(
                  "thead",
                  null,
                  h(
                    "tr",
                    null,
                    h("th", null, t("dashboard.colReceived")),
                    h("th", null, t("dashboard.colName")),
                    h("th", null, t("dashboard.colContact")),
                    h("th", null, t("dashboard.colMaterial")),
                    h("th", null, t("dashboard.colVolume")),
                    h("th", null, t("dashboard.colStatus")),
                    h("th", null, t("dashboard.colActions"))
                  )
                ),
                h(
                  "tbody",
                  null,
                  visible.map(function (lead) {
                    return h(LeadRow, {
                      key: lead.id,
                      lead: lead,
                      t: t,
                      locale: locale,
                      expanded: expandedId === lead.id,
                      onToggle: function () {
                        setExpandedId(expandedId === lead.id ? null : lead.id);
                      },
                      onStatusChange: onStatusChange,
                      onDelete: onDelete
                    });
                  })
                )
              )
            )
      ),
      h(
        "footer",
        { className: "desk-footer container" },
        h("p", null, t("common.footer"))
      )
    );
  }

  var root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(h(App));
})();
