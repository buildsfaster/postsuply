"""Small HTML helpers shared by content.py and build.py."""
from html import escape

STATUS = {
    "en": {"live": "Live", "prototype": "Prototype", "manual": "Manual",
           "roadmap": "Roadmap", "hypothesis": "Hypothesis"},
    "es": {"live": "Activo", "prototype": "Prototipo", "manual": "Manual",
           "roadmap": "Hoja de ruta", "hypothesis": "Hipótesis"},
}


def tag(lang, key):
    return f'<span class="tag tag-{key}">{STATUS[lang][key]}</span>'


def ruled(items, numbered=True):
    """items: list of (title, text) or (title, text, href)."""
    out = ['<ol class="ruled">' if numbered else '<ul class="ruled">']
    for i, it in enumerate(items, 1):
        title, text = it[0], it[1]
        href = it[2] if len(it) > 2 else None
        t = f'<a href="{href}">{title}</a>' if href else title
        num = f'<span class="num">{i:02d}</span>' if numbered else ''
        out.append(f'<li>{num}<div><h3>{t}</h3><p>{text}</p></div></li>')
    out.append('</ol>' if numbered else '</ul>')
    return "".join(out)


def status_table(lang, rows, head):
    """rows: (capability, status_key, note)."""
    h = f'<table class="status"><thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead><tbody>'
    for cap, key, note in rows:
        n = f'<span class="note">{note}</span>' if note else ''
        h += f'<tr><td><strong>{cap}</strong>{n}</td><td>{tag(lang, key)}</td></tr>'
    return h + '</tbody></table>'


def tiles(names):
    lis = "".join(f'<li><span class="num">{i:02d}</span><span>{n}</span></li>' for i, n in enumerate(names, 1))
    return f'<ol class="tiles">{lis}</ol>'


def checklist(items):
    return '<ul class="checks">' + "".join(f'<li>{i}</li>' for i in items) + '</ul>'


def p(*paras):
    return "".join(f"<p>{x}</p>" for x in paras)


def faq_html(faqs, label_id="faq"):
    out = ['<div class="faq">']
    for q, a in faqs:
        out.append(f'<div class="qa"><h3>{q}</h3><p>{a}</p></div>')
    out.append('</div>')
    return "".join(out)


def strip_tags(s):
    import re
    return re.sub(r"<[^>]+>", "", s)
