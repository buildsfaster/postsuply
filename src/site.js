(function () {
  "use strict";
  var root = document.documentElement;

  // Theme: opens light, dark is opt-in and remembered.
  var toggle = document.querySelector(".theme-toggle");
  function paintToggle() {
    if (!toggle) return;
    var dark = root.getAttribute("data-theme") === "dark";
    toggle.textContent = dark ? toggle.getAttribute("data-light") : toggle.getAttribute("data-dark");
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  if (toggle) {
    paintToggle();
    toggle.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") !== "dark";
      root.setAttribute("data-theme", dark ? "dark" : "light");
      try { localStorage.setItem("ps-theme", dark ? "dark" : "light"); } catch (e) {}
      paintToggle();
    });
  }

  // Close the mobile menu after choosing a link.
  var menu = document.querySelector(".menu");
  if (menu) menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.removeAttribute("open"); });

  // Progressive lead form: phone first, then name and company, then categories.
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function digits(s) { return (s || "").replace(/\D/g, ""); }

  Array.prototype.forEach.call(document.querySelectorAll("form.lead-form"), function (form) {
    var id = uid();
    var status = form.querySelector(".status");
    var endpoint = form.getAttribute("action");
    form.setAttribute("novalidate", "");

    function say(html) { status.innerHTML = html; }
    function fallback(phone) {
      var subject = encodeURIComponent(form.getAttribute("data-mail-subject") || "post.supply");
      var body = encodeURIComponent((phone ? phone + "\n\n" : ""));
      say(form.getAttribute("data-error") + ' <a href="mailto:team@post.supply?subject=' + subject + "&body=" + body + '">team@post.supply</a>.');
    }
    function send(payload) {
      payload.id = id;
      payload.lang = form.elements.lang.value;
      payload.role = form.elements.role.value;
      payload.page = location.pathname;
      payload.website = form.elements.website.value;
      return fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r; });
    }
    function go(step, focusSel) {
      form.setAttribute("data-step", step);
      var el = focusSel && form.querySelector(focusSel);
      if (el) el.focus({ preventScroll: false });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var step = form.getAttribute("data-step") || "1";
      var btn = form.querySelector(".step-" + step + " button");
      if (step === "1") {
        var phone = form.elements.phone.value.trim();
        var n = digits(phone).length;
        if (n < 7 || n > 15) {
          say(form.getAttribute("data-phone-bad"));
          form.elements.phone.setAttribute("aria-invalid", "true");
          form.elements.phone.focus();
          return;
        }
        form.elements.phone.removeAttribute("aria-invalid");
        say("");
        if (btn) btn.disabled = true;
        send({ step: 1, phone: phone })
          .then(function () { go("2", "input[name=name]"); })
          .catch(function () { fallback(phone); })
          .then(function () { if (btn) btn.disabled = false; });
      } else if (step === "2") {
        send({ step: 2, name: form.elements.name.value.trim(), company: form.elements.company.value.trim() })
          .catch(function () {})
          .then(function () { go("3", "input[name=categories]"); });
      } else if (step === "3") {
        var cats = Array.prototype.filter.call(form.querySelectorAll("input[name=categories]"), function (c) { return c.checked; })
          .map(function (c) { return c.value; });
        send({ step: 3, categories: cats })
          .catch(function () {})
          .then(function () { go("done"); var d = form.querySelector(".step-done"); if (d) { d.setAttribute("tabindex", "-1"); d.focus(); } });
      }
    });
  });
})();
