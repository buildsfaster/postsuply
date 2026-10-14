"""Build the static post.supply site into ../dist.

python3 build.py            -> HTML, CSS, JS, sitemap, robots, headers, function
python3 build.py --images   -> also renders icons and Open Graph images (Playwright)
"""
import base64, hashlib, json, os, shutil, sys
from html import escape
from content import PAGES, UI, SITE, EMAIL, path_of
from lib import faq_html, strip_tags

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = ROOT
DIST = os.path.join(OUT, "public")
ASSETS = os.path.join(ROOT, "assets")
TODAY = "2026-10-14"
LANGS = ("en", "es")
HTML_LANG = {"en": "en", "es": "es-PR"}
OG_LOCALE = {"en": "en_US", "es": "es_PR"}

CSS = open(os.path.join(HERE, "site.css"), encoding="utf-8").read()
JS = open(os.path.join(HERE, "site.js"), encoding="utf-8").read()
JS_VER = hashlib.sha256(JS.encode()).hexdigest()[:10]
HEAD_JS = "document.documentElement.classList.add('js');try{if(localStorage.getItem('ps-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}"


def sha(s):
    return "'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'"


BY_ID = {pg["id"]: pg for pg in PAGES}


def url(path):
    return SITE + path


def crumbs_chain(pg, lang):
    chain = []
    cur = pg
    while cur:
        chain.append(cur)
        cur = BY_ID.get(cur["parent"]) if cur.get("parent") else None
    chain.reverse()
    if chain[0]["id"] != "home":
        chain.insert(0, BY_ID["home"])
    return [(c[lang]["crumb"] if c["id"] != "home" else UI[lang]["crumb_home"], c[lang]["path"]) for c in chain]


def schema(pg, lang):
    d = pg[lang]
    u = url(d["path"])
    org = {
        "@type": "Organization", "@id": SITE + "/#org", "name": "post.supply", "url": SITE + "/",
        "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png", "width": 512, "height": 512},
        "email": EMAIL,
        "description": "post.supply turns a message into a delivered order: one request, comparable supply and one delivered price for building materials.",
        "contactPoint": [{"@type": "ContactPoint", "contactType": "sales", "email": EMAIL, "availableLanguage": ["en", "es"]}],
    }
    site = {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "post.supply",
            "inLanguage": ["en", "es-PR"], "publisher": {"@id": SITE + "/#org"}}
    chain = crumbs_chain(pg, lang)
    bc = {"@type": "BreadcrumbList", "@id": u + "#breadcrumb", "itemListElement": [
        {"@type": "ListItem", "position": i, "name": n, "item": url(pth)} for i, (n, pth) in enumerate(chain, 1)]}
    page = {"@type": "WebPage", "@id": u + "#webpage", "url": u, "name": d["title"], "description": d["description"],
            "inLanguage": HTML_LANG[lang], "isPartOf": {"@id": SITE + "/#website"}, "about": {"@id": SITE + "/#org"},
            "breadcrumb": {"@id": u + "#breadcrumb"}, "dateModified": TODAY,
            "primaryImageOfPage": {"@type": "ImageObject", "url": og_url(pg, lang), "width": 1200, "height": 630}}
    if d.get("faqs"):
        page["@type"] = ["WebPage", "FAQPage"]
        page["mainEntity"] = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in d["faqs"]]
    graph = [org, site, page]
    if pg["id"] != "home":
        graph.append(bc)
    if d.get("service"):
        graph.append({
            "@type": "Service", "@id": SITE + "/#service",
            "name": "Building materials sourcing with one delivered price" if lang == "en" else "Compra de materiales de construcción con un solo precio entregado",
            "serviceType": "Building materials sourcing and delivered-price quotes",
            "provider": {"@id": SITE + "/#org"},
            "areaServed": {"@type": "AdministrativeArea", "name": "Puerto Rico"},
            "availableChannel": {"@type": "ServiceChannel", "serviceUrl": url(path_of("contact", lang)), "availableLanguage": ["en", "es"]},
            "description": d["description"],
        })
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))


def og_url(pg, lang):
    return f"{SITE}/og/{pg['id']}-{lang}.png"


def form_html(lang, role, uid):
    t = UI[lang]
    cta = t["cta"] if role == "buyer" else ("Request a trial" if lang == "en" else "Solicitar una prueba")
    subj = "Price request" if lang == "en" else "Solicitud de precios"
    if role == "supplier":
        subj = "Supplier trial" if lang == "en" else "Prueba para suplidores"
    opts = "".join(f'<label><input type="checkbox" name="categories" value="{escape(o)}">{escape(o)}</label>' for o in t["cat_opts"])
    return f'''<form class="lead-form" id="get-prices" action="/api/lead" method="post" data-step="1" data-error="{escape(t['error'])}" data-phone-bad="{escape(t['phone_bad'])}" data-mail-subject="{escape(subj)}">
<input type="hidden" name="lang" value="{lang}"><input type="hidden" name="role" value="{role}">
<div class="hp" aria-hidden="true"><label for="website-{uid}">Website</label><input id="website-{uid}" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<div class="step step-1"><label for="phone-{uid}">{t['phone']}</label><div class="row"><input id="phone-{uid}" name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="(787) 555-0123" aria-describedby="hint-{uid}"><button class="btn btn-primary" type="submit">{cta}</button></div><p class="hint" id="hint-{uid}">{t['phone_hint']}</p></div>
<div class="step step-2"><p class="step-title js-only">{t['step2']}</p><div class="pair"><div><label for="name-{uid}">{t['name']}</label><input id="name-{uid}" name="name" type="text" autocomplete="given-name"></div><div><label for="company-{uid}">{t['company']}</label><input id="company-{uid}" name="company" type="text" autocomplete="organization"></div></div><button class="btn btn-ghost js-only" type="submit">{t['next']}</button></div>
<div class="step step-3"><fieldset><legend>{t['cats'] if role == 'buyer' else ('What do you sell?' if lang == 'en' else '¿Qué vendes?')}</legend><div class="opts">{opts}</div></fieldset><button class="btn btn-ghost js-only" type="submit">{t['finish']}</button></div>
<div class="step-done"><p><strong>{t['done']}</strong></p><p>{t['done_more']}</p></div>
<p class="consent">{t['consent']}</p>
<p class="status" role="status" aria-live="polite"></p>
</form>'''


def nav_links(lang, active_id, cls=""):
    out = []
    for pid, label in UI[lang]["nav"]:
        cur = ' aria-current="page"' if pid == active_id or (pid == "materials" and BY_ID[active_id].get("parent") == "materials") else ""
        out.append(f'<a href="{path_of(pid, lang)}"{cur}>{label}</a>')
    return "".join(out)


def render(pg, lang):
    d = pg[lang]
    t = UI[lang]
    other = "es" if lang == "en" else "en"
    u = url(d["path"])
    is_home = pg["id"] == "home"
    noindex = pg.get("noindex")
    has_form = bool(d.get("form"))
    cta_href = "#get-prices" if has_form else path_of("contact", lang) + "#get-prices"

    head = [
        '<!doctype html>',
        f'<html lang="{HTML_LANG[lang]}" data-theme="light">',
        '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f'<title>{escape(d["title"])}</title>',
        f'<meta name="description" content="{escape(d["description"])}">',
        f'<meta name="robots" content="{"noindex, follow" if noindex else "index, follow, max-snippet:-1, max-image-preview:large"}">',
        f'<link rel="canonical" href="{u}">',
    ]
    if not noindex:
        head += [
            f'<link rel="alternate" hreflang="en" href="{url(pg["en"]["path"])}">',
            f'<link rel="alternate" hreflang="es" href="{url(pg["es"]["path"])}">',
            f'<link rel="alternate" hreflang="x-default" href="{url(pg["en"]["path"])}">',
        ]
    head += [
        '<meta name="color-scheme" content="light">',
        '<meta name="theme-color" content="#F0EBE5">',
        '<meta name="format-detection" content="telephone=no">',
        '<link rel="preload" href="/assets/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="icon" href="/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="/icon.svg" type="image/svg+xml">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="post.supply">',
        f'<meta property="og:title" content="{escape(d["title"])}">',
        f'<meta property="og:description" content="{escape(d["description"])}">',
        f'<meta property="og:url" content="{u}">',
        f'<meta property="og:image" content="{og_url(pg, lang)}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{escape(strip_tags(d["h1"]))}">',
        f'<meta property="og:locale" content="{OG_LOCALE[lang]}">',
        f'<meta property="og:locale:alternate" content="{OG_LOCALE[other]}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<script>{HEAD_JS}</script>',
        f'<style>{CSS}</style>',
        f'<script type="application/ld+json">{schema(pg, lang)}</script>',
        '</head>',
    ]

    # language switch: EN · ES (fully translated). PT, 中文, 日本語 on the roadmap.
    langs = []
    for L in LANGS:
        cur = ' aria-current="true"' if L == lang else ""
        langs.append(f'<a href="{pg[L]["path"]}" hreflang="{L}" lang="{HTML_LANG[L]}"{cur} title="{UI[L]["lang_name"]}">{L.upper()}</a>')

    top = f'''<a class="skip" href="#main">{t["skip"]}</a>
<header class="top"><div class="wrap top-in">
<a class="brand" href="{path_of("home", lang)}" aria-label="post.supply">
<img class="logo-light" src="/assets/wordmark.svg" width="128" height="22" alt="post.supply">
<img class="logo-dark" src="/assets/wordmark-reversed.svg" width="128" height="22" alt="post.supply"></a>
<nav class="nav" aria-label="{"Primary" if lang == "en" else "Principal"}">{nav_links(lang, pg["id"])}</nav>
<div class="tools">
<nav class="langs" aria-label="{"Language" if lang == "en" else "Idioma"}">{"".join(langs)}</nav>
<button class="theme-toggle" type="button" data-dark="{t["dark"]}" data-light="{t["light"]}" aria-pressed="false">{t["dark"]}</button>
<a class="btn btn-ghost top-cta" href="{cta_href}">{t["cta"]}</a>
<details class="menu"><summary>{t["menu"]}</summary><nav aria-label="{"Menu" if lang == "en" else "Menú"}">{nav_links(lang, pg["id"])}<a href="{cta_href}">{t["cta"]}</a></nav></details>
</div></div></header>'''

    main = ['<main id="main">']
    if not is_home and not noindex:
        chain = crumbs_chain(pg, lang)
        items = []
        for i, (n, pth) in enumerate(chain):
            if i == len(chain) - 1:
                items.append(f'<li aria-current="page">{escape(n)}</li>')
            else:
                items.append(f'<li><a href="{pth}">{escape(n)}</a></li>')
        main.append(f'<nav class="crumbs wrap" aria-label="{"Breadcrumb" if lang == "en" else "Ruta"}"><ol>{"".join(items)}</ol></nav>')

    hero = [f'<section class="hero"><div class="wrap">',
            f'<p class="eyebrow"><span class="dot" aria-hidden="true"></span>{escape(d["eyebrow"])}</p>',
            f'<h1>{d["h1"]}</h1>',
            f'<p class="lead">{d["lead"]}</p>']
    if d.get("updated"):
        hero.append(f'<p class="updated mono">{t["updated"]}: <time datetime="{d["updated"]}">{d["updated"]}</time></p>')
    if has_form:
        hero.append(form_html(lang, d["form"], pg["id"]))
        if d["form"] == "buyer":
            hero.append(f'<p class="free-note mono">{t["free_note"]}</p>')
    hero.append('</div></section>')
    main += hero

    secs = list(d.get("sections", []))
    if d.get("faqs"):
        secs.append({"label": d["faq_label"], "h2": d["faq_h2"], "body": faq_html(d["faqs"]), "band": len(secs) % 2 == 1})
    for i, s in enumerate(secs, 1):
        band = " band" if s.get("band") else ""
        sid = f"s{i}"
        main.append(f'<section class="sec{band}" aria-labelledby="{sid}"><div class="wrap grid"><p class="label" aria-hidden="true">{escape(s["label"])}</p><div class="content"><h2 id="{sid}">{s["h2"]}</h2>{s["body"]}</div></div></section>')

    c = d.get("closing")
    if c:
        main.append(f'''<section class="closing"><div class="wrap"><h2>{c["h2"]}</h2><p>{c["p"]}</p><a class="btn btn-primary" href="{cta_href}">{c["cta"]}</a><p class="mono">{t["or_email"]} <a href="mailto:{EMAIL}">{EMAIL}</a></p></div></section>''')
    main.append('</main>')

    mat_title = "Materials" if lang == "en" else "Materiales"
    co_title = "post.supply"
    mats = "".join(f'<li><a href="{BY_ID[x][lang]["path"]}">{BY_ID[x][lang]["crumb"]}</a></li>' for x in ("plywood", "panels", "decking", "poles"))
    comp = "".join(f'<li><a href="{path_of(x, lang)}">{BY_ID[x][lang]["crumb"]}</a></li>' for x in ("how", "suppliers", "materials", "contact", "privacy"))
    other_links = "".join(f'<li><a href="{BY_ID[x][other]["path"]}" hreflang="{other}" lang="{HTML_LANG[other]}">{BY_ID[x][other]["crumb"]}</a></li>' for x in ("home", "how", "suppliers", "materials"))
    foot = f'''<footer class="foot"><div class="wrap">
<div class="foot-grid">
<div><img src="/assets/wordmark-small.svg" width="109" height="18" alt="post.supply" class="logo-light" loading="lazy"><img src="/assets/wordmark-reversed.svg" width="104" height="18" alt="post.supply" class="logo-dark" loading="lazy"><p>{t["footer_tag"]}</p><p><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
<div><h2>{co_title}</h2><ul>{comp}</ul></div>
<div><h2>{mat_title}</h2><ul>{mats}</ul></div>
<div><h2>{UI[other]["lang_name"]}</h2><ul>{other_links}</ul></div>
</div>
<div class="foot-bottom"><span class="mono">© 2026 post.supply. {t["footer_rights"]}</span><span class="mono">{"Opens light. Dark is your choice." if lang == "en" else "Abre en claro. El oscuro es tu elección."}</span></div>
</div></footer>
<script src="/assets/site.js?v={JS_VER}" defer></script>
</body></html>'''

    return "\n".join(head) + "\n<body" + ("" if is_home else ' class="inner"') + ">\n" + top + "\n" + "\n".join(main) + "\n" + foot + "\n"


def write(rel, text, mode="w"):
    p = os.path.join(DIST, rel.lstrip("/"))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, mode, encoding=None if "b" in mode else "utf-8") as f:
        f.write(text)


def build():
    if os.path.isdir(DIST):
        for name in os.listdir(DIST):
            if name in ("og",):  # keep rendered images between runs
                continue
            fp = os.path.join(DIST, name)
            shutil.rmtree(fp) if os.path.isdir(fp) else os.remove(fp)
    os.makedirs(DIST, exist_ok=True)

    for pg in PAGES:
        for lang in LANGS:
            path = pg[lang]["path"]
            write(path + "index.html", render(pg, lang))

    # 404 (bilingual)
    nf = {"id": "nf", "parent": None, "noindex": True,
          "en": {"path": "/404.html", "title": "Page not found | post.supply", "description": "This page does not exist.",
                 "crumb": "Not found", "eyebrow": "post.supply · 404", "h1": "This page does not exist.",
                 "lead": 'Go to the <a href="/">home page</a>, see <a href="/materials/">materials</a>, or email <a href="mailto:team@post.supply">team@post.supply</a>. <span lang="es-PR">Esta página no existe. Ve al <a href="/es/">inicio en español</a>.</span>',
                 "sections": [], "closing": None},
          }
    nf["es"] = nf["en"]
    BY_ID["nf"] = nf
    write("404.html", render(nf, "en"))

    # assets
    os.makedirs(os.path.join(DIST, "assets"), exist_ok=True)
    shutil.copytree(os.path.join(ASSETS, "fonts"), os.path.join(DIST, "assets", "fonts"))
    for f in ("wordmark.svg", "wordmark-reversed.svg", "wordmark-small.svg"):
        shutil.copy(os.path.join(ASSETS, f), os.path.join(DIST, "assets", f))
    shutil.copy(os.path.join(ASSETS, "icon.svg"), os.path.join(DIST, "icon.svg"))
    write("assets/site.js", JS)
    shutil.rmtree(os.path.join(OUT, "functions"), ignore_errors=True)
    shutil.copytree(os.path.join(HERE, "functions"), os.path.join(OUT, "functions"))

    # sitemap with hreflang alternates
    rows = []
    for pg in PAGES:
        if pg.get("noindex"):
            continue
        for lang in LANGS:
            alts = "".join(f'<xhtml:link rel="alternate" hreflang="{L}" href="{url(pg[L]["path"])}"/>' for L in LANGS)
            alts += f'<xhtml:link rel="alternate" hreflang="x-default" href="{url(pg["en"]["path"])}"/>'
            rows.append(f'<url><loc>{url(pg[lang]["path"])}</loc><lastmod>{TODAY}</lastmod>{alts}</url>')
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(rows) + "\n</urlset>\n")

    write("robots.txt", f"""# post.supply
# Search engines and AI assistants are welcome to read this site.
User-agent: *
Allow: /
Disallow: /api/

Sitemap: {SITE}/sitemap.xml
""")

    write("site.webmanifest", json.dumps({
        "name": "post.supply", "short_name": "post.supply", "start_url": "/", "display": "browser",
        "background_color": "#F0EBE5", "theme_color": "#F0EBE5",
        "icons": [{"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
                  {"src": "/icon.svg", "sizes": "any", "type": "image/svg+xml"}]}, indent=2))

    csp = ("default-src 'self'; "
           f"script-src 'self' {sha(HEAD_JS)}; "
           f"style-src 'self' {sha(CSS)}; "
           "img-src 'self' data:; font-src 'self'; connect-src 'self'; "
           "form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests")
    write("_headers", f"""/*
  Content-Security-Policy: {csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=604800

/*.png
  Cache-Control: public, max-age=604800

/thanks/*
  X-Robots-Tag: noindex

/es/gracias/*
  X-Robots-Tag: noindex
""")
    write("_redirects", """/index.html  /  301
/home  /  301
/es/index.html  /es/  301
/materiales  /es/materiales/  301
/suplidores  /es/suplidores/  301
""")
    print("pages:", sum(2 for pg in PAGES), "+ 404")


if __name__ == "__main__":
    build()
