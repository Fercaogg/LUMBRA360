"""Genera escenas/index.html a partir de plantilla.html (inserta el logotipo en línea y los puntos de los grupos)."""
import os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = os.path.join(R, "escenas")
svg = open(os.path.join(E, "assets", "logo-negativo-acento.svg"), encoding="utf-8").read()
svg = re.sub(r"<title>.*?</title>", "", svg)
svg = svg.replace('role="img" aria-label="lumbra"', 'aria-hidden="true"')
# Cada letra lleva class="lt"; la onda, class="onda"
svg = svg.replace('<g fill="#F5F5F2" fill-opacity="1">', '<g class="lt" fill="#F5F5F2" fill-opacity="1">')
svg = svg.replace('<g fill="#F25A1F" fill-opacity="1">', '<g fill="#F25A1F" fill-opacity="1" class="ondag">')
svg = re.sub(r'(class="ondag">.*?<path )', r'\1class="onda" ', svg, count=1, flags=re.S)
h = open(os.path.join(E, "plantilla.html"), encoding="utf-8").read()
h = h.replace("{{LOGO}}", svg)
for n in (3, 8, 9, 14):
    h = h.replace("{{P%d}}" % n, "<i></i>" * n)
open(os.path.join(E, "index.html"), "w", encoding="utf-8").write(h)
print("ok", svg.count('class="lt"'), svg.count('class="onda"'))
