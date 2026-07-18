/* post.supply landing page: hero, materials, desk process, and the
   live contact form that feeds the sales desk dashboard. */
(function () {
  "use strict";

  var h = React.createElement;
  var MATERIAL_KEYS = ["lumber", "panel", "engineered", "steel", "insulation", "other"];

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

  function ContactForm(props) {
    var t = props.t;
    var React_ = React;
    var initial = { name: "", company: "", email: "", phone: "", material: "", volume: "", message: "" };
    var stateRef = React_.useState(initial);
    var form = stateRef[0];
    var setForm = stateRef[1];
    var errorsRef = React_.useState({});
    var errors = errorsRef[0];
    var setErrors = errorsRef[1];
    var statusRef = React_.useState({ tone: "", text: "" });
    var status = statusRef[0];
    var setStatus = statusRef[1];
    var submittingRef = React_.useState(false);
    var submitting = submittingRef[0];
    var setSubmitting = submittingRef[1];

    function update(field) {
      return function (evt) {
        var value = evt.target.value;
        setForm(function (prev) {
          var next = {};
          Object.keys(prev).forEach(function (k) { next[k] = prev[k]; });
          next[field] = value;
          return next;
        });
      };
    }

    function validate(values) {
      var next = {};
      if (!values.name.trim()) next.name = t("landing.errorRequired");
      if (!values.email.trim()) {
        next.email = t("landing.errorRequired");
      } else if (!PS.isValidEmail(values.email)) {
        next.email = t("landing.errorEmail");
      }
      if (!values.material) next.material = t("landing.errorRequired");
      if (values.phone && !PS.isValidPhone(values.phone)) {
        next.phone = t("landing.errorPhone");
      }
      return next;
    }

    function handleSubmit(evt) {
      evt.preventDefault();
      var validation = validate(form);
      setErrors(validation);
      if (Object.keys(validation).length > 0) {
        setStatus({ tone: "error", text: t("landing.errorGeneric") });
        return;
      }
      setSubmitting(true);
      setStatus({ tone: "", text: "" });
      window.setTimeout(function () {
        PS.leads.add(form);
        setSubmitting(false);
        setStatus({ tone: "success", text: t("landing.success") });
        setForm(initial);
        setErrors({});
      }, 250);
    }

    function fieldProps(name) {
      return {
        id: "field-" + name,
        value: form[name],
        onChange: update(name)
      };
    }

    function renderField(name, label, opts) {
      opts = opts || {};
      var invalid = Boolean(errors[name]);
      return h(
        "div",
        { className: "field", "data-invalid": invalid ? "true" : "false" },
        h("label", { htmlFor: "field-" + name }, label),
        opts.textarea
          ? h("textarea", Object.assign({ rows: 4, placeholder: opts.placeholder }, fieldProps(name)))
          : h("input", Object.assign({ type: opts.type || "text", placeholder: opts.placeholder }, fieldProps(name))),
        h("div", { className: "field__error" }, errors[name] || "")
      );
    }

    var materialInvalid = Boolean(errors.material);

    return h(
      "form",
      { className: "contact-form", onSubmit: handleSubmit, noValidate: true },
      h(
        "div",
        { className: "contact-form__row" },
        renderField("name", t("landing.fieldName")),
        renderField("company", t("landing.fieldCompany"))
      ),
      h(
        "div",
        { className: "contact-form__row" },
        renderField("email", t("landing.fieldEmail"), { type: "email" }),
        renderField("phone", t("landing.fieldPhone"), { type: "tel" })
      ),
      h(
        "div",
        { className: "field", "data-invalid": materialInvalid ? "true" : "false" },
        h("label", { htmlFor: "field-material" }, t("landing.fieldMaterial")),
        h(
          "select",
          Object.assign({}, fieldProps("material")),
          h("option", { value: "" }, t("landing.fieldMaterialPlaceholder")),
          MATERIAL_KEYS.map(function (key) {
            return h(
              "option",
              { key: key, value: key },
              t("landing.materialOption" + key.charAt(0).toUpperCase() + key.slice(1))
            );
          })
        ),
        h("div", { className: "field__error" }, errors.material || "")
      ),
      renderField("volume", t("landing.fieldVolume"), { placeholder: t("landing.fieldVolumePlaceholder") }),
      renderField("message", t("landing.fieldMessage"), { textarea: true, placeholder: t("landing.fieldMessagePlaceholder") }),
      h(
        "button",
        { type: "submit", className: "btn", disabled: submitting },
        submitting ? t("landing.submitting") : t("landing.submit")
      ),
      h(
        "div",
        { className: "contact-form__status", "data-tone": status.tone, role: "status" },
        status.text
      )
    );
  }

  function App() {
    var localeRef = React.useState(PS.getLocale());
    var locale = localeRef[0];
    var setLocale = localeRef[1];

    function t(path, vars) {
      return PS.t(locale, path, vars);
    }

    React.useEffect(function () {
      document.documentElement.lang = locale;
      document.title = t("common.brand") + " · " + t("landing.heroTitle");
    }, [locale]);

    function changeLocale(code) {
      PS.setLocale(code);
      setLocale(code);
    }

    var materials = [
      ["materialLumber", "materialLumberDesc"],
      ["materialPanel", "materialPanelDesc"],
      ["materialEngineered", "materialEngineeredDesc"],
      ["materialSteel", "materialSteelDesc"],
      ["materialInsulation", "materialInsulationDesc"]
    ];

    var steps = [
      ["deskStepOne", "deskStepOneDesc"],
      ["deskStepTwo", "deskStepTwoDesc"],
      ["deskStepThree", "deskStepThreeDesc"]
    ];

    return h(
      React.Fragment,
      null,
      h(
        "header",
        { className: "container" },
        h(
          "div",
          { className: "desk-bar" },
          h("a", { className: "desk-bar__brand", href: "#top" }, t("common.brand")),
          h(
            "nav",
            { className: "desk-bar__nav" },
            h("a", { href: "calculator/" }, t("nav.pricing")),
            h("a", { href: "#contact" }, t("nav.contact")),
            h(LangSwitch, { locale: locale, onChange: changeLocale })
          )
        )
      ),
      h(
        "main",
        { id: "top" },
        h(
          "section",
          { className: "hero container" },
          h("p", { className: "hero__eyebrow" }, t("landing.heroEyebrow")),
          h("h1", { className: "hero__title" }, t("landing.heroTitle")),
          h("p", { className: "hero__subtitle" }, t("landing.heroSubtitle")),
          h(
            "div",
            { className: "hero__actions" },
            h("a", { className: "btn", href: "#contact" }, t("landing.heroCta")),
            h("a", { className: "btn btn--ghost", href: "calculator/" }, t("landing.heroCtaSecondary"))
          )
        ),
        h(
          "section",
          { className: "section container" },
          h("h2", { className: "section__title" }, t("landing.materialsTitle")),
          h(
            "div",
            { className: "materials-grid" },
            materials.map(function (pair) {
              return h(
                "div",
                { className: "material-card panel", key: pair[0] },
                h("h3", null, t("landing." + pair[0])),
                h("p", null, t("landing." + pair[1]))
              );
            })
          )
        ),
        h(
          "section",
          { className: "section container" },
          h("h2", { className: "section__title" }, t("landing.deskTitle")),
          h(
            "div",
            { className: "desk-steps" },
            steps.map(function (pair) {
              return h(
                "div",
                { className: "desk-step", key: pair[0] },
                h("h3", null, t("landing." + pair[0])),
                h("p", null, t("landing." + pair[1]))
              );
            })
          )
        ),
        h(
          "section",
          { className: "section container", id: "contact" },
          h(
            "div",
            { className: "contact-panel panel" },
            h("h2", { className: "contact-panel__title" }, t("landing.contactTitle")),
            h("p", { className: "contact-panel__subtitle" }, t("landing.contactSubtitle")),
            h(ContactForm, { t: t, locale: locale })
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
