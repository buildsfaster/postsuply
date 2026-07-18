/* post.supply pricing calculator: five material categories feeding one
   running quote, persisted locally and exportable as a print-ready
   quote sheet. */
(function () {
  "use strict";

  var h = React.createElement;
  var STORAGE_KEY = "ps.calculator.session";

  var CATEGORIES = [
    {
      key: "lumber",
      tabKey: "tabLumber",
      fields: [
        { name: "species", labelKey: "fieldSpecies", type: "select", options: ["SPF", "SYP", "Douglas Fir"], default: "SPF" },
        { name: "grade", labelKey: "fieldGrade", type: "select", options: ["No.1", "No.2", "Stud"], default: "No.1" },
        { name: "size", labelKey: "fieldSize", type: "select", options: ["2x4", "2x6", "2x8", "2x10", "2x12"], default: "2x6" },
        { name: "length", labelKey: "fieldLength", type: "number", default: 8 }
      ],
      labelFn: function (v) {
        return v.size + " " + v.species + " " + v.grade + ", " + v.length + "ft";
      }
    },
    {
      key: "panel",
      tabKey: "tabPanel",
      fields: [
        { name: "type", labelKey: "fieldType", type: "select", options: ["OSB", "Plywood CDX", "Plywood BC"], default: "OSB" },
        { name: "thickness", labelKey: "fieldThickness", type: "select", options: ["7/16\"", "1/2\"", "5/8\"", "3/4\""], default: "1/2\"" }
      ],
      labelFn: function (v) {
        return v.type + ", " + v.thickness;
      }
    },
    {
      key: "engineered",
      tabKey: "tabEngineered",
      fields: [
        { name: "type", labelKey: "fieldType", type: "select", options: ["LVL", "I-Joist", "Glulam"], default: "LVL" },
        { name: "size", labelKey: "fieldSize", type: "text", default: "1-3/4x11-7/8" },
        { name: "length", labelKey: "fieldLength", type: "number", default: 20 }
      ],
      labelFn: function (v) {
        return v.type + " " + v.size + ", " + v.length + "ft";
      }
    },
    {
      key: "steel",
      tabKey: "tabSteel",
      fields: [
        { name: "type", labelKey: "fieldType", type: "select", options: ["Track", "Stud"], default: "Stud" },
        { name: "gauge", labelKey: "fieldGauge", type: "select", options: ["20ga", "18ga"], default: "20ga" },
        { name: "size", labelKey: "fieldSize", type: "text", default: "3-5/8\"" }
      ],
      labelFn: function (v) {
        return v.type + " " + v.size + ", " + v.gauge;
      }
    },
    {
      key: "insulation",
      tabKey: "tabInsulation",
      fields: [
        { name: "type", labelKey: "fieldType", type: "select", options: ["Fiberglass Batt", "Rigid Foam", "Mineral Wool"], default: "Fiberglass Batt" },
        { name: "rvalue", labelKey: "fieldRValue", type: "select", options: ["R-13", "R-19", "R-21", "R-30"], default: "R-13" }
      ],
      labelFn: function (v) {
        return v.type + ", " + v.rvalue;
      }
    }
  ];

  function defaultSession() {
    return {
      activeTab: CATEGORIES[0].key,
      lines: [],
      freight: 0,
      preparedFor: "",
      quoteRef: null,
      quoteDate: null
    };
  }

  var Store = (function () {
    var state = load();
    var listeners = [];

    function load() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? Object.assign(defaultSession(), JSON.parse(raw)) : defaultSession();
      } catch (e) {
        return defaultSession();
      }
    }

    function persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        /* storage unavailable, session stays in memory for this tab */
      }
    }

    function notify() {
      listeners.forEach(function (fn) {
        fn(state);
      });
    }

    return {
      get: function () {
        return state;
      },
      set: function (patch) {
        state = Object.assign({}, state, patch);
        persist();
        notify();
      },
      subscribe: function (fn) {
        listeners.push(fn);
        return function () {
          listeners = listeners.filter(function (l) {
            return l !== fn;
          });
        };
      }
    };
  })();

  function useStoreState() {
    var s = React.useState(Store.get());
    var value = s[0];
    var setValue = s[1];
    React.useEffect(function () {
      return Store.subscribe(function (next) {
        setValue(next);
      });
    }, []);
    return value;
  }

  function makeLineId() {
    return "ln_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  }

  function makeQuoteRef() {
    var d = new Date();
    var stamp = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    var suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PS-" + stamp + "-" + suffix;
  }

  function formatMoney(n) {
    var value = Number(n) || 0;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  function fieldDefaults(category) {
    var values = {};
    category.fields.forEach(function (f) {
      values[f.name] = f.default;
    });
    values.quantity = 1;
    values.unitPrice = "";
    return values;
  }

  function CategoryForm(props) {
    var category = props.category;
    var t = props.t;
    var valuesState = React.useState(fieldDefaults(category));
    var values = valuesState[0];
    var setValues = valuesState[1];

    React.useEffect(function () {
      setValues(fieldDefaults(category));
    }, [category.key]);

    function update(name) {
      return function (evt) {
        var val = evt.target.value;
        setValues(function (prev) {
          var next = Object.assign({}, prev);
          next[name] = val;
          return next;
        });
      };
    }

    function handleSubmit(evt) {
      evt.preventDefault();
      var qty = Number(values.quantity);
      var unitPrice = Number(values.unitPrice);
      if (!(qty > 0) || !(unitPrice >= 0) || values.unitPrice === "") {
        return;
      }
      var label = category.labelFn(values);
      props.onAddLine({
        id: makeLineId(),
        categoryKey: category.key,
        label: label,
        qty: qty,
        unitPrice: unitPrice,
        lineTotal: qty * unitPrice
      });
      setValues(fieldDefaults(category));
    }

    return h(
      "form",
      { className: "calc-form panel", onSubmit: handleSubmit },
      h(
        "div",
        { className: "calc-form__grid" },
        category.fields.map(function (f) {
          return h(
            "div",
            { className: "field", key: f.name },
            h("label", { htmlFor: "cf-" + f.name }, t("calculator." + f.labelKey)),
            f.type === "select"
              ? h(
                  "select",
                  { id: "cf-" + f.name, value: values[f.name], onChange: update(f.name) },
                  f.options.map(function (opt) {
                    return h("option", { key: opt, value: opt }, opt);
                  })
                )
              : h("input", {
                  id: "cf-" + f.name,
                  type: f.type,
                  value: values[f.name],
                  onChange: update(f.name)
                })
          );
        }),
        h(
          "div",
          { className: "field" },
          h("label", { htmlFor: "cf-quantity" }, t("calculator.fieldQuantity")),
          h("input", {
            id: "cf-quantity",
            type: "number",
            min: "1",
            step: "1",
            value: values.quantity,
            onChange: update("quantity")
          })
        ),
        h(
          "div",
          { className: "field" },
          h("label", { htmlFor: "cf-unitPrice" }, t("calculator.fieldUnitPrice")),
          h("input", {
            id: "cf-unitPrice",
            type: "number",
            min: "0",
            step: "0.01",
            value: values.unitPrice,
            onChange: update("unitPrice")
          })
        )
      ),
      h("button", { type: "submit", className: "btn" }, t("calculator.actionAddLine"))
    );
  }

  function QuotePanel(props) {
    var t = props.t;
    var locale = props.locale;
    var session = props.session;
    var lines = session.lines;
    var subtotal = lines.reduce(function (sum, l) {
      return sum + l.lineTotal;
    }, 0);
    var freight = Number(session.freight) || 0;
    var total = subtotal + freight;

    return h(
      "div",
      { className: "quote-panel panel" },
      h("h2", { className: "quote-panel__title" }, t("calculator.quoteTitle")),
      h(
        "div",
        { className: "quote-meta" },
        h(
          "div",
          { className: "field" },
          h("label", null, t("calculator.quoteRef")),
          h("span", { className: "mono" }, session.quoteRef || "-")
        ),
        h(
          "div",
          { className: "field" },
          h("label", null, t("calculator.quoteDate")),
          h(
            "span",
            { className: "mono" },
            session.quoteDate ? new Date(session.quoteDate).toLocaleDateString(locale) : "-"
          )
        ),
        h(
          "div",
          { className: "field quote-meta__full" },
          h("label", { htmlFor: "prepared-for" }, t("calculator.quotePreparedFor")),
          h("input", {
            id: "prepared-for",
            type: "text",
            placeholder: t("calculator.quotePreparedForPlaceholder"),
            value: session.preparedFor,
            onChange: function (evt) {
              Store.set({ preparedFor: evt.target.value });
            }
          })
        )
      ),
      lines.length === 0
        ? h("p", { className: "quote-empty" }, t("calculator.quoteEmpty"))
        : h(
            "table",
            { className: "quote-table" },
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                h("th", null, t("calculator.quoteColItem")),
                h("th", { className: "mono" }, t("calculator.quoteColQty")),
                h("th", { className: "mono" }, t("calculator.quoteColUnitPrice")),
                h("th", { className: "mono" }, t("calculator.quoteColTotal")),
                h("th", null)
              )
            ),
            h(
              "tbody",
              null,
              lines.map(function (line) {
                return h(
                  "tr",
                  { key: line.id },
                  h("td", null, line.label),
                  h("td", { className: "mono" }, line.qty),
                  h("td", { className: "mono" }, formatMoney(line.unitPrice)),
                  h("td", { className: "mono" }, formatMoney(line.lineTotal)),
                  h(
                    "td",
                    null,
                    h(
                      "button",
                      {
                        type: "button",
                        className: "quote-remove",
                        onClick: function () {
                          props.onRemoveLine(line.id);
                        }
                      },
                      t("calculator.quoteRemove")
                    )
                  )
                );
              })
            )
          ),
      h(
        "div",
        { className: "quote-totals" },
        h(
          "div",
          { className: "quote-totals__row" },
          h("span", null, t("calculator.quoteSubtotal")),
          h("span", { className: "mono" }, formatMoney(subtotal))
        ),
        h(
          "div",
          { className: "quote-totals__row quote-totals__row--freight" },
          h("label", { htmlFor: "freight-input" }, t("calculator.quoteFreight")),
          h("input", {
            id: "freight-input",
            type: "number",
            min: "0",
            step: "0.01",
            value: session.freight,
            onChange: function (evt) {
              Store.set({ freight: evt.target.value });
            }
          })
        ),
        h(
          "div",
          { className: "quote-totals__row quote-totals__row--total" },
          h("span", null, t("calculator.quoteTotal")),
          h("span", { className: "mono" }, formatMoney(total))
        )
      ),
      h(
        "div",
        { className: "quote-actions" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn--ghost",
            disabled: lines.length === 0,
            onClick: props.onClear
          },
          t("calculator.quoteClear")
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn",
            disabled: lines.length === 0,
            onClick: function () {
              window.print();
            }
          },
          t("calculator.quotePrint")
        )
      ),
      lines.length > 0 ? h("p", { className: "quote-saved-note" }, t("calculator.savedNote")) : null
    );
  }

  function App() {
    var localeState = React.useState(PS.getLocale());
    var locale = localeState[0];
    var setLocale = localeState[1];
    var session = useStoreState();

    function t(path, vars) {
      return PS.t(locale, path, vars);
    }

    React.useEffect(function () {
      document.documentElement.lang = locale;
      document.title = t("common.brand") + " · " + t("calculator.title");
    }, [locale]);

    function changeLocale(code) {
      PS.setLocale(code);
      setLocale(code);
    }

    function onAddLine(line) {
      var patch = { lines: session.lines.concat([line]) };
      if (!session.quoteRef) {
        patch.quoteRef = makeQuoteRef();
        patch.quoteDate = Date.now();
      }
      Store.set(patch);
    }

    function onRemoveLine(id) {
      Store.set({ lines: session.lines.filter(function (l) { return l.id !== id; }) });
    }

    function onClear() {
      if (window.confirm(t("dashboard.actionDeleteConfirm"))) {
        Store.set(defaultSession());
      }
    }

    var activeCategory = CATEGORIES.filter(function (c) {
      return c.key === session.activeTab;
    })[0] || CATEGORIES[0];

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
            h(LangSwitch, { locale: locale, onChange: changeLocale })
          )
        )
      ),
      h(
        "main",
        { className: "container calc-main" },
        h(
          "div",
          { className: "calc-header" },
          h("h1", null, t("calculator.title")),
          h("p", null, t("calculator.subtitle"))
        ),
        h(
          "div",
          { className: "calc-layout" },
          h(
            "div",
            null,
            h(
              "div",
              { className: "calc-tabs", role: "tablist" },
              CATEGORIES.map(function (c) {
                return h(
                  "button",
                  {
                    key: c.key,
                    type: "button",
                    className: "calc-tab",
                    role: "tab",
                    "aria-selected": c.key === session.activeTab,
                    onClick: function () {
                      Store.set({ activeTab: c.key });
                    }
                  },
                  t("calculator." + c.tabKey)
                );
              })
            ),
            h(CategoryForm, { category: activeCategory, t: t, onAddLine: onAddLine })
          ),
          h(QuotePanel, {
            t: t,
            locale: locale,
            session: session,
            onRemoveLine: onRemoveLine,
            onClear: onClear
          })
        )
      ),
      h(
        "footer",
        { className: "desk-footer container" },
        h("p", null, t("common.footer"))
      )
    );
  }

  function PrintSheet() {
    var localeState = React.useState(PS.getLocale());
    var locale = localeState[0];
    var session = useStoreState();

    function t(path, vars) {
      return PS.t(locale, path, vars);
    }

    var subtotal = session.lines.reduce(function (sum, l) {
      return sum + l.lineTotal;
    }, 0);
    var freight = Number(session.freight) || 0;
    var total = subtotal + freight;

    return h(
      "div",
      null,
      h("div", { className: "print-brand" }, t("common.brand")),
      h(
        "div",
        { className: "print-meta" },
        h(
          "span",
          null,
          t("calculator.quoteRef") + ": " + (session.quoteRef || "-")
        ),
        h(
          "span",
          null,
          t("calculator.quoteDate") + ": " + (session.quoteDate ? new Date(session.quoteDate).toLocaleDateString(locale) : "-")
        ),
        session.preparedFor
          ? h("span", null, t("calculator.quotePreparedFor") + ": " + session.preparedFor)
          : null
      ),
      h(
        "table",
        null,
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", null, t("calculator.quoteColItem")),
            h("th", { className: "mono" }, t("calculator.quoteColQty")),
            h("th", { className: "mono" }, t("calculator.quoteColUnitPrice")),
            h("th", { className: "mono" }, t("calculator.quoteColTotal"))
          )
        ),
        h(
          "tbody",
          null,
          session.lines.map(function (line) {
            return h(
              "tr",
              { key: line.id },
              h("td", null, line.label),
              h("td", { className: "mono" }, line.qty),
              h("td", { className: "mono" }, formatMoney(line.unitPrice)),
              h("td", { className: "mono" }, formatMoney(line.lineTotal))
            );
          })
        )
      ),
      h(
        "div",
        { className: "print-totals" },
        h(
          "div",
          { className: "print-totals__row" },
          h("span", null, t("calculator.quoteSubtotal")),
          h("span", null, formatMoney(subtotal))
        ),
        h(
          "div",
          { className: "print-totals__row" },
          h("span", null, t("calculator.quoteFreight")),
          h("span", null, formatMoney(freight))
        ),
        h(
          "div",
          { className: "print-totals__row print-totals__row--total" },
          h("span", null, t("calculator.quoteTotal")),
          h("span", null, formatMoney(total))
        )
      ),
      h("div", { className: "print-footer" }, t("common.footer"))
    );
  }

  var appRoot = ReactDOM.createRoot(document.getElementById("app-shell"));
  appRoot.render(h(App));

  var printRoot = ReactDOM.createRoot(document.getElementById("print-sheet"));
  printRoot.render(h(PrintSheet));
})();
