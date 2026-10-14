"""Render icons and Open Graph images with Playwright (Chromium), using the brand files."""
import os, sys
from html import escape
from PIL import Image
from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(__file__))
from content import PAGES
from lib import strip_tags

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
A = os.path.join(ROOT, "assets")
FONT = "file://" + os.path.join(A, "fonts")

ICON_SVG = open(os.path.join(A, "icon.svg")).read()
WORDMARK = "file://" + os.path.join(A, "wordmark.svg")

OG = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:G;src:url({font}/Geist-Variable.woff2);font-weight:100 900}}
@font-face{{font-family:M;src:url({font}/GeistMono-Regular.woff2)}}
html,body{{margin:0;width:1200px;height:630px;background:#F0EBE5;color:#1C1B19}}
.f{{box-sizing:border-box;width:1200px;height:630px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}}
img{{height:40px;width:auto;align-self:flex-start}}
h1{{font:600 {size}px/1.04 G;letter-spacing:-.035em;margin:0;max-width:1000px;text-wrap:balance}}
.b{{display:flex;justify-content:space-between;align-items:center;font:400 22px/1 M;letter-spacing:.04em;color:#6B665E;border-top:1px solid #DCD6CE;padding-top:24px}}
</style></head><body><div class="f"><img src="{wm}"><h1>{h1}</h1><div class="b"><span>{eyebrow}</span></div></div></body></html>"""


def main():
    os.makedirs(os.path.join(PUB, "og"), exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        # icons
        pg = b.new_page(viewport={"width": 512, "height": 512})
        for size, name in ((512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (64, "_icon-64.png")):
            pg.set_viewport_size({"width": size, "height": size})
            svg = ICON_SVG.replace('viewBox="0 0 512 512"', f'viewBox="0 0 512 512" width="{size}" height="{size}"')
            if name == "apple-touch-icon.png":  # iOS rounds corners itself: square ink field
                svg = svg.replace('rx="112"', 'rx="0"')
            pg.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
            pg.screenshot(path=os.path.join(PUB, name), omit_background=True, clip={"x": 0, "y": 0, "width": size, "height": size})
        im = Image.open(os.path.join(PUB, "_icon-64.png")).convert("RGBA")
        im.save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
        os.remove(os.path.join(PUB, "_icon-64.png"))
        # OG images
        pg.set_viewport_size({"width": 1200, "height": 630})
        jobs = [(x["id"], L, x[L]) for x in PAGES for L in ("en", "es")]
        jobs.append(("nf", "en", {"h1": "This page does not exist.", "eyebrow": "post.supply · 404"}))
        for pid, L, d in jobs:
            h1 = strip_tags(d["h1"])
            size = 92 if len(h1) < 40 else (78 if len(h1) < 60 else 66)
            html = OG.format(font=FONT, wm=WORDMARK, h1=escape(h1), eyebrow=escape(d["eyebrow"].split(" · ", 1)[-1]), size=size)
            tmp = os.path.join(A, "_og.html")
            open(tmp, "w", encoding="utf-8").write(html)
            pg.goto("file://" + tmp, wait_until="networkidle")
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(150)
            out = os.path.join(PUB, "og", f"{pid}-{L}.png")
            pg.screenshot(path=out, clip={"x": 0, "y": 0, "width": 1200, "height": 630})
        os.remove(os.path.join(A, "_og.html"))
        b.close()
    print("images done")


if __name__ == "__main__":
    main()
