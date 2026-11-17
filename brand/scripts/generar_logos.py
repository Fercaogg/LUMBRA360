"""Genera los SVG del logotipo de LUMBRA360 (versión 2.0: dibujo «Fino» con la tinta de «Galería de luz»).

- Símbolo: anillo fino de 360° con una apertura arriba a la derecha y el punto de lumbre en el centro.
  Hay dos dibujos: el fino (32 px o más) y el pequeño, de trazo grueso (favicon y 16 a 32 px).
- Logotipo tipográfico: «LUMBRA» en Newsreader 400 muy espaciada y «360» en petróleo medio.
  Convertido a trazados: no depende de fuentes instaladas.

Uso:
    python3 brand/scripts/generar_logos.py
(lee las fuentes de brand/fonts; licencia SIL OFL)
"""

import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

MARCA = Path(__file__).resolve().parent.parent
SALIDA = MARCA / "logo"
FUENTE = MARCA / "fonts" / "newsreader-latin-400-normal.woff2"

COLORES = {
    # variante: (anillo y LUMBRA, 360, lumbre, fondo)
    "positivo": ("#0D262B", "#356C74", "#E6A23A", None),  # tinta 900, tinta 500, lumbre 400
    "negativo": ("#EEEBE5", "#B0CACD", "#EFB95A", None),  # marfil, tinta 200, lumbre 300 (fondo transparente)
}
TRACKING_LUMBRA = 0.22  # em
TRACKING_360 = 0.12
CUERPO = 26


def simbolo(color: str, lumbre: str, pequeno: bool = False, x: float = 0, y: float = 0, escala: float = 1) -> str:
    """Rejilla de 48 × 48. Fino: trazo 3, punto 4. Pequeño: trazo 6, punto 5."""
    cx = cy = 24
    r, trazo, punto = (16.5, 6, 5) if pequeno else (17, 3, 4)
    inicio, fin = -38, -82  # grados; la apertura queda entre ambos

    def p(a: float) -> tuple[float, float]:
        rad = math.radians(a)
        return cx + r * math.cos(rad), cy + r * math.sin(rad)

    x1, y1 = p(inicio)
    x2, y2 = p(fin)
    return (
        f'<g transform="translate({x:.2f} {y:.2f}) scale({escala})">'
        f'<path d="M{x1:.2f} {y1:.2f} A{r} {r} 0 1 1 {x2:.2f} {y2:.2f}" fill="none" stroke="{color}" '
        f'stroke-width="{trazo}" stroke-linecap="round"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{punto}" fill="{lumbre}"/></g>'
    )


def palabra(fuente: TTFont, texto: str, x: float, y: float, cuerpo: float, tracking: float, color: str) -> tuple[str, float]:
    glifos = fuente.getGlyphSet()
    cmap = fuente.getBestCmap()
    esc = cuerpo / fuente["head"].unitsPerEm
    caminos, cursor = [], 0.0
    for i, letra in enumerate(texto):
        nombre = cmap[ord(letra)]
        pluma = SVGPathPen(glifos)
        glifos[nombre].draw(TransformPen(pluma, (esc, 0, 0, -esc, x + cursor, y)))
        caminos.append(pluma.getCommands())
        cursor += glifos[nombre].width * esc + (tracking * cuerpo if i < len(texto) - 1 else 0)
    return f'<path fill="{color}" d="{" ".join(caminos)}"/>', cursor


def logotipo(fuente: TTFont, x: float, y: float, c1: str, c2: str, cuerpo: float = CUERPO) -> tuple[str, float]:
    t1, a1 = palabra(fuente, "LUMBRA", x, y, cuerpo, TRACKING_LUMBRA, c1)
    sep = TRACKING_LUMBRA * cuerpo + cuerpo * 0.22
    t2, a2 = palabra(fuente, "360", x + a1 + sep, y, cuerpo, TRACKING_360, c2)
    return t1 + t2, a1 + sep + a2


def svg(ancho: float, alto: float, contenido: str, fondo: str | None) -> str:
    rect = f'<rect width="100%" height="100%" fill="{fondo}"/>' if fondo else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho:.0f} {alto:.0f}" width="{ancho:.0f}" '
        f'height="{alto:.0f}" role="img" aria-labelledby="t"><title id="t">LUMBRA360</title>{rect}{contenido}</svg>\n'
    )


def main() -> None:
    fuente = TTFont(FUENTE)
    SALIDA.mkdir(parents=True, exist_ok=True)
    for variante, (c1, c2, lumbre, fondo) in COLORES.items():
        (SALIDA / f"lumbra360-simbolo-{variante}.svg").write_text(svg(48, 48, simbolo(c1, lumbre), fondo))
        (SALIDA / f"lumbra360-simbolo-pequeno-{variante}.svg").write_text(svg(48, 48, simbolo(c1, lumbre, True), fondo))

        texto, ancho_texto = logotipo(fuente, 0, 0, c1, c2)
        sep = 18
        ancho = 48 + sep + ancho_texto + 2
        (SALIDA / f"lumbra360-horizontal-{variante}.svg").write_text(
            svg(ancho, 48, simbolo(c1, lumbre) + f'<g transform="translate({48 + sep} 33.5)">{texto}</g>', fondo)
        )

        texto_v, ancho_v = logotipo(fuente, 0, 0, c1, c2, 24)
        ancho = max(ancho_v, 72) + 8
        (SALIDA / f"lumbra360-vertical-{variante}.svg").write_text(
            svg(ancho, 120, simbolo(c1, lumbre, False, (ancho - 72) / 2, 0, 1.5) + f'<g transform="translate({(ancho - ancho_v) / 2:.2f} 110)">{texto_v}</g>', fondo)
        )

    # Favicon: dibujo pequeño; cambia a la versión clara con el modo oscuro del sistema.
    pequeno = simbolo("#0D262B", "#E6A23A", True).replace('fill="none"', 'class="a" fill="none"').replace("<circle", '<circle class="p"')
    (SALIDA / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
        "<style>@media (prefers-color-scheme: dark){.a{stroke:#EEEBE5}.p{fill:#EFB95A}}</style>" + pequeno + "</svg>\n"
    )
    print("Logos generados en", SALIDA)


if __name__ == "__main__":
    main()
