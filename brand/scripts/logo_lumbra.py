"""Genera las versiones del logotipo de lumbra a partir del original (brand/logo/fuente/lumbra-original.svg).

No se redibuja nada: se toman los trazados del original, se quitan los recortes y el lienzo vacío,
y se ajusta el encuadre. Uso: python3 brand/scripts/logo_lumbra.py
Salida: brand/logo/*.svg, copia en public/marca/ y src/app/icon.svg."""

import re
import shutil
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ORIGINAL = RAIZ / "brand/logo/fuente/lumbra-original.svg"
SALIDA = RAIZ / "brand/logo"

TINTA = "#1B1B1B"
BLANCO = "#F5F5F2"
LUMBRE = "#F25A1F"

# Encuadre medido sobre el original (unidades del viewBox de 1500).
CAJA = (199.98, 581.33, 1093.37, 274.97)  # palabra completa
CAJA_M = (465.99, 654.89, 324.36, 201.4)  # la onda de la «m»

fuente = ORIGINAL.read_text()
grupos = re.findall(r'<g transform="matrix\(1, 0, 0, 1, [\d.]+, [\d.]+\)">.*?</g></g></g></g>(?:</g>)?', fuente, re.S)
grupos = [re.sub(r' clip-path="url\(#[^)]+\)"', "", g) for g in grupos]
assert len(grupos) == 3, f"se esperaban 3 grupos y hay {len(grupos)}"
lu, bra, m = grupos  # el original los ordena así


def pintar(g: str, color: str) -> str:
    return g.replace('fill="#1b1b1b"', f'fill="{color}"')


def svg(caja, cuerpo: str, titulo: str, margen: float = 0, fondo: str | None = None, radio: float = 0) -> str:
    x, y, w, h = caja
    x, y, w, h = x - margen, y - margen, w + 2 * margen, h + 2 * margen
    rect = f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{radio:.2f}" fill="{fondo}"/>' if fondo else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" '
        f'role="img" aria-label="{titulo}"><title>{titulo}</title>{rect}{cuerpo}</svg>\n'
    )


def cuadrado(caja, lado_extra: float):
    x, y, w, h = caja
    lado = max(w, h) + lado_extra
    cx, cy = x + w / 2, y + h / 2
    return (cx - lado / 2, cy - lado / 2, lado, lado)


archivos = {
    "lumbra-horizontal-positivo.svg": svg(CAJA, pintar(lu + m + bra, TINTA), "lumbra"),
    "lumbra-horizontal-negativo.svg": svg(CAJA, pintar(lu + m + bra, BLANCO), "lumbra"),
    # Variante con la onda en lumbre: solo para piezas de marca, nunca sustituye al logotipo principal.
    "lumbra-horizontal-acento.svg": svg(CAJA, pintar(lu + bra, TINTA) + pintar(m, LUMBRE), "lumbra"),
    "lumbra-simbolo-positivo.svg": svg(CAJA_M, pintar(m, TINTA), "lumbra"),
    "lumbra-simbolo-negativo.svg": svg(CAJA_M, pintar(m, BLANCO), "lumbra"),
    "lumbra-simbolo-lumbre.svg": svg(CAJA_M, pintar(m, LUMBRE), "lumbra"),
    # Favicon y avatar: la onda en lumbre sobre un cuadrado de tinta. Legible a 16 px.
    "favicon.svg": svg(cuadrado(CAJA_M, 150), pintar(m, LUMBRE), "lumbra", fondo=TINTA, radio=110),
}

for nombre, contenido in archivos.items():
    (SALIDA / nombre).write_text(contenido)
    shutil.copy(SALIDA / nombre, RAIZ / "public/marca" / nombre)
shutil.copy(SALIDA / "favicon.svg", RAIZ / "src/app/icon.svg")
print("\n".join(archivos))

# Constante de la onda para la web (se dibuja en línea en la portada).
trazado = re.search(r'<path d="([^"]+)"', m).group(1).strip()
(RAIZ / "src/components/marca/onda.ts").write_text(
    "// Trazado de la onda (la «m» del logotipo), tomado de brand/logo/fuente/lumbra-original.svg.\n"
    "// Lo genera brand/scripts/logo_lumbra.py. No editar a mano.\n"
    f'export const ONDA_CAJA = "{CAJA_M[0]} {CAJA_M[1]} {CAJA_M[2]} {CAJA_M[3]}";\n'
    'export const ONDA_TRANSFORMACION = "translate(814.866818 659.416861)";\n'
    f'export const ONDA_TRAZADO = "{trazado}";\n'
)
