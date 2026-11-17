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
        ("Texto (tinta) sobre blanco", "#0B1A1D", "#FFFFFF", 4.5),
        ("Texto (tinta) sobre pergamino", "#0B1A1D", "#F7F5F1", 4.5),
        ("Texto secundario sobre blanco", "#5C5850", "#FFFFFF", 4.5),
        ("Texto secundario sobre pergamino", "#5C5850", "#F7F5F1", 4.5),
        ("Texto terciario sobre blanco", "#706A61", "#FFFFFF", 4.5),
        ("Enlace (tinta 600) sobre blanco", "#24555D", "#FFFFFF", 4.5),
        ("Botón primario: blanco sobre tinta 900", "#FFFFFF", "#0D262B", 4.5),
        ("Botón primario pulsado: blanco sobre tinta 800", "#FFFFFF", "#13343A", 4.5),
        ("Botón de lumbre: tinta sobre lumbre", "#0D262B", "#E6A23A", 4.5),
        ("Lumbre texto sobre lumbre suave", "#7F4E16", "#FAE8C4", 4.5),
        ("Tinta suave: texto sobre su fondo", "#13343A", "#EFF4F4", 4.5),
        ("Correcto: texto sobre su fondo", "#2B6339", "#E8F2EA", 4.5),
        ("Aviso: texto sobre su fondo", "#7F4E16", "#FBF0D9", 4.5),
        ("Error: texto sobre su fondo", "#9C2F27", "#FBE9E6", 4.5),
        ("Información: texto sobre su fondo", "#285682", "#E6EEF6", 4.5),
        ("Borde de control sobre blanco", "#8A8378", "#FFFFFF", 3.0),
        ("Foco (tinta 500) sobre blanco", "#356C74", "#FFFFFF", 3.0),
        ("Texto sobre superficie de marca", "#EEEBE5", "#0D262B", 4.5),
    ],
    "oscuro": [
        ("Texto sobre fondo", "#EEEBE5", "#0B1214", 4.5),
        ("Texto sobre superficie", "#EEEBE5", "#121C1F", 4.5),
        ("Texto secundario sobre superficie", "#B4AEA3", "#121C1F", 4.5),
        ("Texto terciario sobre superficie", "#968F84", "#121C1F", 4.5),
        ("Enlace (tinta 300) sobre superficie", "#82AAAF", "#121C1F", 4.5),
        ("Botón primario: tinta sobre marfil", "#0B1A1D", "#EEEBE5", 4.5),
        ("Botón de lumbre: tinta sobre lumbre 300", "#0D262B", "#EFB95A", 4.5),
        ("Tinta suave: texto sobre su fondo", "#CFE0E2", "#1A2B30", 4.5),
        ("Correcto: texto sobre su fondo", "#8FCB9C", "#16291D", 4.5),
        ("Aviso: texto sobre su fondo", "#F2C46E", "#2E2412", 4.5),
        ("Error: texto sobre su fondo", "#F2A49B", "#33191A", 4.5),
        ("Información: texto sobre su fondo", "#9CC2E8", "#16243A", 4.5),
        ("Borde de control sobre superficie", "#6E7F84", "#121C1F", 3.0),
        ("Foco (tinta 300) sobre fondo", "#82AAAF", "#0B1214", 3.0),
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
