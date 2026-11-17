"""Comprueba el contraste WCAG 2.x de las parejas de color de lumbra.
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
        ("Texto (tinta 950) sobre blanco", "#111111", "#FFFFFF", 4.5),
        ("Texto (tinta 950) sobre piedra 50", "#111111", "#F5F5F2", 4.5),
        ("Texto secundario sobre blanco", "#55554F", "#FFFFFF", 4.5),
        ("Texto secundario sobre piedra 50", "#55554F", "#F5F5F2", 4.5),
        ("Texto terciario sobre blanco", "#6B6B65", "#FFFFFF", 4.5),
        ("Botón primario: blanco sobre tinta 900", "#FFFFFF", "#1B1B1B", 4.5),
        ("Botón primario pulsado: blanco sobre tinta 800", "#FFFFFF", "#272726", 4.5),
        ("Botón de lumbre: tinta sobre lumbre", "#111111", "#F25A1F", 4.5),
        ("Texto de lumbre (600) sobre blanco", "#B83A0E", "#FFFFFF", 4.5),
        ("Lumbre suave: texto sobre su fondo", "#9A300C", "#FFE1D4", 4.5),
        ("Tinta suave: texto sobre su fondo", "#272726", "#F4F4F3", 4.5),
        ("Correcto: texto sobre su fondo", "#1D6440", "#E6F2EB", 4.5),
        ("Aviso: texto sobre su fondo", "#7A4B00", "#FBF0D6", 4.5),
        ("Error: texto sobre su fondo", "#A3122F", "#FCE8EC", 4.5),
        ("Información: texto sobre su fondo", "#24508F", "#E7EEF8", 4.5),
        ("Borde de control sobre blanco", "#8A8A84", "#FFFFFF", 3.0),
        ("Foco (lumbre 500) sobre blanco", "#D9480F", "#FFFFFF", 3.0),
        ("Lumbre como gráfico sobre blanco", "#F25A1F", "#FFFFFF", 3.0),
        ("Texto sobre superficie de marca", "#F5F5F2", "#1B1B1B", 4.5),
        ("Lumbre sobre superficie de marca", "#F25A1F", "#1B1B1B", 4.5),
    ],
    "oscuro": [
        ("Texto sobre fondo", "#F2F2EF", "#0E0E0E", 4.5),
        ("Texto sobre superficie", "#F2F2EF", "#171716", 4.5),
        ("Texto secundario sobre superficie", "#A9A9A3", "#171716", 4.5),
        ("Texto terciario sobre superficie", "#8C8C86", "#171716", 4.5),
        ("Botón primario: tinta sobre blanco roto", "#111111", "#F2F2EF", 4.5),
        ("Botón de lumbre: tinta sobre lumbre", "#111111", "#FF6A33", 4.5),
        ("Lumbre suave: texto sobre su fondo", "#FF9670", "#2E170D", 4.5),
        ("Tinta suave: texto sobre su fondo", "#E7E7E5", "#232322", 4.5),
        ("Correcto: texto sobre su fondo", "#8FCFA8", "#13261B", 4.5),
        ("Aviso: texto sobre su fondo", "#F0C66E", "#2B2210", 4.5),
        ("Error: texto sobre su fondo", "#F5A3B3", "#331219", 4.5),
        ("Información: texto sobre su fondo", "#A3C2EE", "#14213A", 4.5),
        ("Borde de control sobre superficie", "#6E6E69", "#171716", 3.0),
        ("Foco (lumbre 300) sobre fondo", "#FF9670", "#0E0E0E", 3.0),
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
