"""Monta brand/brand.html y brand/brand-guidelines.md a partir de sus fuentes (*.src.*).

Incrusta como sprite SVG los iconos de Lucide que usa la página y la tabla de contraste
calculada por contraste.py. Uso:

    python3 brand/scripts/construir_brand.py <carpeta icons de lucide-static>
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from contraste import resultados  # noqa: E402

MARCA = Path(__file__).resolve().parent.parent
ICONOS_GALERIA = [
    "layout-dashboard", "clipboard-check", "list-checks", "bell-off", "history", "file-check",
    "file-down", "file-text", "scroll-text", "stamp", "calendar-clock", "clock", "shield-check",
    "lock", "eye-off", "fingerprint", "users", "building-2", "mail", "search", "upload",
    "download", "settings", "bell", "info", "circle-check", "circle-x", "triangle-alert",
    "folder-open", "plus", "check", "x", "arrow-right", "chevron-right", "log-out",
]
ICONOS_EXTRA = ["sun", "moon", "monitor"]


def simbolo(carpeta: Path, nombre: str) -> str:
    svg = (carpeta / f"{nombre}.svg").read_text()
    interior = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()
    interior = re.sub(r"\s+", " ", interior)
    return f'<symbol id="i-{nombre}" viewBox="0 0 24 24">{interior}</symbol>'


def main() -> None:
    carpeta = Path(sys.argv[1])
    fuente = (MARCA / "brand.src.html").read_text()
    usados = set(re.findall(r'#i-([a-z0-9-]+)', fuente)) | set(ICONOS_GALERIA) | set(ICONOS_EXTRA)
    sprite = (
        '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
        + "".join(simbolo(carpeta, n) for n in sorted(usados))
        + "</svg>"
    )
    contraste = [[m, n, t, f, r, ok] for m, n, t, f, r, ok in resultados()]
    # La onda de la demostración de movimiento sale del mismo trazado que usa la web.
    onda = (MARCA.parent / "src/components/marca/onda.ts").read_text()
    trazado = re.search(r'ONDA_TRAZADO = "([^"]+)"', onda).group(1)
    transformacion = re.search(r'ONDA_TRANSFORMACION = "([^"]+)"', onda).group(1)
    fuente = fuente.replace('id="onda-demo"', f'id="onda-demo" d="{trazado}" transform="{transformacion}"').replace("<script>/*ONDA*/</script>\n", "")
    salida = (
        fuente.replace("<!--SPRITE-->", sprite)
        .replace("/*CONTRASTE*/[]", json.dumps(contraste, ensure_ascii=False))
        .replace("/*ICONOS*/[]", json.dumps(ICONOS_GALERIA))
    )
    (MARCA / "brand.html").write_text(salida)
    print(f"brand.html: {len(usados)} iconos, {len(contraste)} parejas de contraste")

    # La guía lleva la misma tabla de contraste, calculada, no copiada a mano.
    filas = ["| Modo | Pareja | Texto | Fondo | Contraste | Resultado |", "|---|---|---|---|---|---|"]
    for m, n, t, f, r, ok in resultados():
        filas.append(f"| {m} | {n} | `{t}` | `{f}` | {str(r).replace('.', ',')}:1 | {'Cumple' if ok else 'No cumple'} |")
    guia = (MARCA / "brand-guidelines.src.md").read_text().replace("{{CONTRASTE}}", "\n".join(filas))
    (MARCA / "brand-guidelines.md").write_text(guia)
    print("brand-guidelines.md generado")


if __name__ == "__main__":
    main()
