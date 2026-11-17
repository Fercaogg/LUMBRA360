"""Genera los SVG del logotipo de LUMBRA360.

El logotipo tipográfico se convierte a trazados, así que los SVG no dependen de
ninguna fuente instalada. Fuente: Newsreader 500 (licencia SIL OFL), del paquete
@fontsource/newsreader. Uso:

    python3 brand/scripts/generar_logos.py <carpeta con newsreader-latin-500-normal.woff2>
"""

import math
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

SALIDA = Path(__file__).resolve().parent.parent / "logo"

# Colores de marca (ver tokens.css)
PETROLEO = "#0C2B30"   # petroleo-900
LUMBRE = "#E6A23A"     # ambar-400
MARFIL = "#F7F5F0"     # neutro-50, para fondo oscuro
LUMBRE_OSCURO = "#EFB95A"  # ambar-300, para fondo oscuro

TEXTO = "LUMBRA360"
TRACKING = 0.075  # en em


def simbolo(color_anillo: str, color_punto: str, x: float = 0, y: float = 0, escala: float = 1) -> str:
    """Anillo de 360° con una apertura arriba a la derecha y un punto de lumbre en el centro.
    Rejilla de 48 x 48. Trazo de 6 para que siga legible a 16 px."""
    cx = cy = 24
    r = 16.5
    inicio, fin = -42, -78  # grados; la apertura queda entre ambos
    def punto(a: float) -> tuple[float, float]:
        rad = math.radians(a)
        return cx + r * math.cos(rad), cy + r * math.sin(rad)
    x1, y1 = punto(inicio)
    x2, y2 = punto(fin)
    anillo = (
        f'<path d="M{x1:.2f} {y1:.2f} A{r} {r} 0 1 1 {x2:.2f} {y2:.2f}" fill="none" '
        f'stroke="{color_anillo}" stroke-width="6" stroke-linecap="round"/>'
    )
    centro = f'<circle cx="{cx}" cy="{cy}" r="5.25" fill="{color_punto}"/>'
    return f'<g transform="translate({x} {y}) scale({escala})">{anillo}{centro}</g>'


def palabra(fuente: TTFont, color: str, x: float, y_base: float, cuerpo: float) -> tuple[str, float]:
    """Devuelve el trazado del texto y su anchura, con el tracking aplicado."""
    glifos = fuente.getGlyphSet()
    cmap = fuente.getBestCmap()
    upm = fuente["head"].unitsPerEm
    escala = cuerpo / upm
    caminos = []
    cursor = 0.0
    for i, letra in enumerate(TEXTO):
        nombre = cmap[ord(letra)]
        pluma = SVGPathPen(glifos)
        transformada = TransformPen(pluma, (escala, 0, 0, -escala, x + cursor, y_base))
        glifos[nombre].draw(transformada)
        caminos.append(pluma.getCommands())
        cursor += glifos[nombre].width * escala
        if i < len(TEXTO) - 1:
            cursor += TRACKING * cuerpo
    return f'<path fill="{color}" d="{" ".join(caminos)}"/>', cursor


def svg(ancho: float, alto: float, contenido: str, titulo: str, fondo: str | None = None) -> str:
    rect = f'<rect width="100%" height="100%" fill="{fondo}"/>' if fondo else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho:.0f} {alto:.0f}" '
        f'width="{ancho:.0f}" height="{alto:.0f}" role="img" aria-labelledby="t">'
        f'<title id="t">{titulo}</title>{rect}{contenido}</svg>\n'
    )


def main() -> None:
    carpeta = Path(sys.argv[1])
    fuente = TTFont(carpeta / "newsreader-latin-500-normal.woff2")
    SALIDA.mkdir(parents=True, exist_ok=True)

    for variante, anillo, punto, texto, fondo in [
        ("positivo", PETROLEO, LUMBRE, PETROLEO, None),
        ("negativo", MARFIL, LUMBRE_OSCURO, MARFIL, PETROLEO),
    ]:
        # Solo símbolo
        (SALIDA / f"lumbra360-simbolo-{variante}.svg").write_text(
            svg(48, 48, simbolo(anillo, punto), "LUMBRA360", fondo)
        )

        # Horizontal: símbolo de 48 y texto de 30 de cuerpo, alineado al centro óptico
        trazo, ancho_texto = palabra(fuente, texto, 0, 0, 30)
        sep = 16
        ancho = 48 + sep + ancho_texto + 2
        contenido = simbolo(anillo, punto) + f'<g transform="translate({48 + sep} 34.5)">{trazo}</g>'
        (SALIDA / f"lumbra360-horizontal-{variante}.svg").write_text(svg(ancho, 48, contenido, "LUMBRA360", fondo))

        # Vertical: símbolo de 72 centrado sobre el texto
        trazo_v, ancho_v = palabra(fuente, texto, 0, 0, 28)
        ancho = max(ancho_v, 72) + 8
        contenido = (
            simbolo(anillo, punto, (ancho - 72) / 2, 0, 1.5)
            + f'<g transform="translate({(ancho - ancho_v) / 2:.2f} 112)">{trazo_v}</g>'
        )
        (SALIDA / f"lumbra360-vertical-{variante}.svg").write_text(svg(ancho, 122, contenido, "LUMBRA360", fondo))

    # Favicon: símbolo con margen, pensado para 16 y 32 px
    (SALIDA / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
        '<style>@media (prefers-color-scheme: dark){.a{stroke:#F7F5F0}.p{fill:#EFB95A}}</style>'
        + simbolo(PETROLEO, LUMBRE).replace('fill="none"', 'class="a" fill="none"').replace('<circle', '<circle class="p"')
        + "</svg>\n"
    )
    print("Logos generados en", SALIDA)


if __name__ == "__main__":
    main()
