"""Build a single-file, fully navigable preview of the site for publishing as a claude.ai Artifact.

Every page of the static site becomes a route in one document (#how-it-works, #es-materiales-plywood ...).
The lead form saves to the artifact's database when the viewer is allowed to write; otherwise it
falls back to the email message, exactly like the production site does when its endpoint is down.
"""
import base64, os, re
from bs4 import BeautifulSoup
import build
from content import PAGES

ROOT = build.ROOT
OUT = os.path.join(ROOT, "out", "artifact")
os.makedirs(OUT, exist_ok=True)


def route_of(path):
    r = path.strip("/").replace("/", "-")
    return r or "home"


ROUTES = {}
for pg in PAGES:
    for L in ("en", "es"):
        ROUTES[pg[L]["path"]] = route_of(pg[L]["path"])

DATA = {}
for f in ("wordmark.svg", "wordmark-reversed.svg", "wordmark-small.svg"):
    raw = open(os.path.join(build.ASSETS, f), "rb").read()
    DATA["/assets/" + f] = "data:image/svg+xml;base64," + base64.b64encode(raw).decode()


def page_fragment(pg, lang):
    path = pg[lang]["path"]
    route = ROUTES[path]
    html = build.render(pg, lang)
    soup = BeautifulSoup(html, "lxml")
    body = soup.body
    for s in body.find_all("script"):
        s.decompose()
    skip = body.find("a", class_="skip")
    if skip:
        skip.decompose()
    # unique ids per route
    idmap = {}
    for el in body.find_all(id=True):
        new = f"{route}--{el['id']}"
        idmap[el["id"]] = new
        el["id"] = new
    for attr in ("for", "aria-labelledby", "aria-describedby"):
        for el in body.find_all(attrs={attr: True}):
            el[attr] = " ".join(idmap.get(x, x) for x in el[attr].split())
    for img in body.find_all("img", src=True):
        if img["src"] in DATA:
            key = img["src"].rsplit("/", 1)[-1].replace(".svg", "")
            span = soup.new_tag("span")
            span["class"] = (img.get("class") or []) + ["wm", "wm-" + key]
            span["role"] = "img"
            span["aria-label"] = img.get("alt", "post.supply")
            span["style"] = f"width:{img['width']}px;height:{img['height']}px"
            img.replace_with(span)
    for a in body.find_all("a", href=True):
        h = a["href"]
        if h.startswith("#get-prices"):
            a["href"] = "#" + route
            a["data-form"] = route
        elif h.startswith("/"):
            p, _, frag = h.partition("#")
            if p in ROUTES:
                a["href"] = "#" + ROUTES[p]
                if frag == "get-prices":
                    a["data-form"] = ROUTES[p]
    for form in body.find_all("form"):
        form.attrs.pop("action", None)
        form.attrs.pop("method", None)
    inner = "".join(str(c) for c in body.contents)
    return route, pg[lang]["title"], build.HTML_LANG[lang], inner


CSS = build.CSS
CSS = re.sub(r"@font-face\{[^}]*\}\s*", "", CSS)
# safe-area aware gutters and sticky header for the viewer frame
CSS = CSS.replace(".wrap{max-width:1296px;margin:0 auto;padding:0 48px}",
                  ".wrap{max-width:1296px;margin:0 auto;padding-left:max(48px,env(safe-area-inset-left,0px));padding-right:max(48px,env(safe-area-inset-right,0px))}")
CSS = CSS.replace(" .wrap{padding:0 20px}", " .wrap{padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}")
CSS = CSS.replace(".top{position:sticky;top:0;", ".top{position:sticky;top:env(safe-area-inset-top,0px);")
CSS += "\n.route[hidden]{display:none!important}\nbody{min-height:100%}\n.wm{display:block;background-repeat:no-repeat;background-position:left center;background-size:contain;flex:none}\n.foot .wm{margin-bottom:16px}\n"
for k, v in DATA.items():
    CSS += ".wm-" + k.rsplit("/", 1)[-1].replace(".svg", "") + "{background-image:url(" + v + ")}\n"

JS = r"""
(function () {
  "use strict";
  var root = document.documentElement;
  var routes = {};
  document.querySelectorAll(".route").forEach(function (el) { routes[el.getAttribute("data-route")] = el; });
  var current = null, pendingForm = null;

  function show(r) {
    if (!routes[r]) r = "home";
    if (current === r) return;
    Object.keys(routes).forEach(function (k) { if (k !== r) routes[k].hidden = true; });
    var el = routes[r];
    el.hidden = false;
    current = r;
    document.title = el.getAttribute("data-title");
    root.setAttribute("lang", el.getAttribute("data-lang"));
    paintToggle();
    if (pendingForm === r) { pendingForm = null; toForm(r); } else { window.scrollTo(0, 0); }
  }
  function fromHash() { return (location.hash || "").replace(/^#/, "") || "home"; }
  window.addEventListener("hashchange", function () { show(fromHash()); });

  function toForm(r) {
    var f = routes[r] && routes[r].querySelector("form.lead-form");
    if (!f) return;
    f.scrollIntoView({ behavior: "smooth", block: "center" });
    var input = f.querySelector("input[name=phone]");
    if (input && f.getAttribute("data-step") === "1") setTimeout(function () { input.focus({ preventScroll: true }); }, 350);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-form]");
    if (a) {
      var target = a.getAttribute("data-form");
      var menu = a.closest("details");
      if (menu) menu.removeAttribute("open");
      if (target === current) { e.preventDefault(); toForm(target); }
      else { pendingForm = target; }
      return;
    }
    var m = e.target.closest(".menu a");
    if (m) m.closest("details").removeAttribute("open");
  });

  // Theme: opens light; dark is opt-in and remembered.
  try { if (localStorage.getItem("ps-theme") === "dark") root.setAttribute("data-theme", "dark"); } catch (e) {}
  function paintToggle() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".theme-toggle").forEach(function (t) {
      t.textContent = dark ? t.getAttribute("data-light") : t.getAttribute("data-dark");
      t.setAttribute("aria-pressed", dark ? "true" : "false");
    });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".theme-toggle");
    if (!t) return;
    var dark = root.getAttribute("data-theme") !== "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("ps-theme", dark ? "dark" : "light"); } catch (err) {}
    paintToggle();
  });

  // Lead storage: the artifact database when this viewer may write, else the email fallback.
  var store = null;
  var storeReady = (async function () {
    try {
      if (!window.claude || !window.claude.use) return null;
      var db = await window.claude.use("db");
      var user = await window.claude.use("user");
      var uid = user ? await user.id() : null;
      if (!db || !uid) return null;
      store = { db: db, uid: uid };
      return store;
    } catch (e) { return null; }
  })();

  function uidGen() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function digits(s) { return (s || "").replace(/\D/g, ""); }

  document.querySelectorAll("form.lead-form").forEach(function (form) {
    var id = uidGen();
    var status = form.querySelector(".status");
    form.setAttribute("novalidate", "");
    function say(html) { status.innerHTML = html; }
    function fallback() {
      say(form.getAttribute("data-error") + ' <strong>team@post.supply</strong>.');
    }
    async function send(step, data) {
      var s = store || await storeReady;
      if (!s) throw new Error("no store");
      var ref = s.db.doc("leads/" + s.uid + "/items/" + id);
      var base = {
        step: step, lang: form.elements.lang.value, role: form.elements.role.value,
        page: current, updated_at: new Date().toISOString()
      };
      Object.keys(data).forEach(function (k) { base[k] = data[k]; });
      if (step === 1) { base.received_at = base.updated_at; return ref.set(base); }
      return ref.update(base);
    }
    function go(step, sel) {
      form.setAttribute("data-step", step);
      var el = sel && form.querySelector(sel);
      if (el) el.focus();
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.website.value) return;
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
        send(1, { phone: phone })
          .then(function () { go("2", "input[name=name]"); })
          .catch(fallback)
          .then(function () { if (btn) btn.disabled = false; });
      } else if (step === "2") {
        send(2, { name: form.elements.name.value.trim().slice(0, 200), company: form.elements.company.value.trim().slice(0, 200) })
          .catch(function () {}).then(function () { go("3", "input[name=categories]"); });
      } else if (step === "3") {
        var cats = Array.prototype.filter.call(form.querySelectorAll("input[name=categories]"), function (c) { return c.checked; })
          .map(function (c) { return c.value; });
        send(3, { categories: cats }).catch(function () {}).then(function () {
          go("done");
          var d = form.querySelector(".step-done");
          if (d) { d.setAttribute("tabindex", "-1"); d.focus(); }
        });
      }
    });
  });

  root.classList.add("js");
  show(fromHash());
})();
"""


def main():
    parts = []
    for pg in PAGES:
        for L in ("en", "es"):
            route, title, hl, inner = page_fragment(pg, L)
            parts.append(f'<div class="route" data-route="{route}" data-title="{title}" data-lang="{hl}" hidden>{inner}</div>')
    head = (
        '<title>post.supply website</title>\n'
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono&display=swap">\n'
        f'<style>{CSS}</style>\n'
    )
    html = head + "\n".join(parts) + f"\n<script>{JS}</script>\n"
    # the home route must render first: un-hide it in markup so the first frame is complete
    html = html.replace('data-route="home" data-title=', 'data-route="home" data-first="1" data-title=', 1)
    html = html.replace('data-first="1" data-title="Building materials at one delivered price | post.supply" data-lang="en" hidden>',
                        'data-first="1" data-title="Building materials at one delivered price | post.supply" data-lang="en">')
    out = os.path.join(OUT, "post-supply.html")
    open(out, "w", encoding="utf-8").write(html)
    print(out, round(len(html) / 1024), "KB", "routes:", len(parts))


if __name__ == "__main__":
    main()
