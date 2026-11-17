"""Comprueba el contraste WCAG 2.x de las parejas de color de LUMBRA360.
Uso: python3 brand/scripts/contraste.py   (sale con error si alguna pareja de texto no llega a AA)"""

import sys

def lum(hexa: str) -> float:
    r, g, b = (int(hexa[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(a: str, b: str) -> float:
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

# (descripción, texto, fondo, mínimo) · 4.5 texto normal, 3.0 texto grande o elemento gráfico
PAREJAS = {
    "claro": [
        ("Texto principal sobre fondo", "#1E1C18", "#F7F5F0", 4.5),
        ("Texto principal sobre superficie", "#1E1C18", "#FFFFFF", 4.5),
        ("Texto secundario sobre fondo", "#5E584C", "#F7F5F0", 4.5),
        ("Texto secundario sobre superficie", "#5E584C", "#FFFFFF", 4.5),
        ("Marca (petróleo) sobre fondo", "#174B52", "#F7F5F0", 4.5),
        ("Enlace (petróleo 600) sobre superficie", "#1F5D65", "#FFFFFF", 4.5),
        ("Botón primario: texto sobre petróleo 700", "#FFFFFF", "#174B52", 4.5),
        ("Botón primario hover: texto sobre petróleo 800", "#FFFFFF", "#113A40", 4.5),
        ("Botón acento: texto sobre lumbre", "#0C2B30", "#E6A23A", 4.5),
        ("Texto lumbre oscuro sobre lumbre suave", "#7F4E16", "#FAE8C4", 4.5),
        ("Correcto: texto sobre su fondo", "#2B6339", "#E8F2EA", 4.5),
        ("Aviso: texto sobre su fondo", "#7F4E16", "#FBF0D9", 4.5),
        ("Error: texto sobre su fondo", "#9C2F27", "#FBE9E6", 4.5),
        ("Información: texto sobre su fondo", "#285682", "#E6EEF6", 4.5),
        ("Borde de control sobre superficie", "#8C8579", "#FFFFFF", 3.0),
        ("Foco (petróleo 500) sobre fondo", "#2E727A", "#F7F5F0", 3.0),
        ("Símbolo: lumbre sobre fondo (gráfico)", "#E6A23A", "#F7F5F0", 1.0),
    ],
    "oscuro": [
        ("Texto principal sobre fondo", "#ECE8DF", "#0D1517", 4.5),
        ("Texto principal sobre superficie", "#ECE8DF", "#152226", 4.5),
        ("Texto secundario sobre superficie", "#B3AC9E", "#152226", 4.5),
        ("Enlace (petróleo 300) sobre superficie", "#7FB1B6", "#152226", 4.5),
        ("Botón primario: texto sobre petróleo 300", "#071C20", "#7FB1B6", 4.5),
        ("Botón acento: texto sobre lumbre 300", "#0C2B30", "#EFB95A", 4.5),
        ("Correcto: texto sobre su fondo", "#8FCB9C", "#16291D", 4.5),
        ("Aviso: texto sobre su fondo", "#F2C46E", "#2E2412", 4.5),
        ("Error: texto sobre su fondo", "#F2A49B", "#33191A", 4.5),
        ("Información: texto sobre su fondo", "#9CC2E8", "#16243A", 4.5),
        ("Borde de control sobre superficie", "#6B7C81", "#152226", 3.0),
        ("Foco (petróleo 300) sobre fondo", "#7FB1B6", "#0D1517", 3.0),
    ],
}

def resultados():
    """Lista de (modo, pareja, texto, fondo, contraste, cumple)."""
    salida = []
    for modo, lista in PAREJAS.items():
        for nombre, t, f, minimo in lista:
            r = ratio(t, f)
            salida.append((modo, nombre, t, f, round(r, 2), r >= minimo))
    return salida


if __name__ == "__main__":
    fallos = 0
    for modo, lista in PAREJAS.items():
        print(f"\n## Modo {modo}\n")
        print("| Pareja | Texto | Fondo | Contraste | Mínimo | Resultado |")
        print("|---|---|---|---|---|---|")
        for nombre, t, f, minimo in lista:
            r = ratio(t, f)
            ok = r >= minimo
            fallos += 0 if ok else 1
            print(f"| {nombre} | `{t}` | `{f}` | {r:.2f}:1 | {minimo}:1 | {'Cumple' if ok else 'NO CUMPLE'} |")
    sys.exit(1 if fallos else 0)
