# LUMBRA360 · película promocional (116 s, 16:9)

Salida: `salida/lumbra360-pelicula-16x9.mp4` (1920 × 1080, 30 fps, H.264 + AAC, −15 LUFS, subtítulos incrustados).
Subtítulos aparte: `subtitulos/lumbra360-promo-v2.es.srt`.

## Estructura

| Tiempo | Escena | Qué se ve |
|---|---|---|
| 0–10 s | Apertura | El logotipo se dibuja trazo a trazo (la onda y luego las letras) y entran en 3D las cuatro tarjetas de avales: Universidad de Salamanca, Fundación General USAL, Prototipos 2026/2027, RIS3 de Castilla y León |
| 10–27 s | Lo que pide la ley | Ley 31/1995 (arts. 16 y 23) y Ley Orgánica 3/2018 (art. 88) como documentos en 3D; carga de trabajo, autonomía y apoyo del equipo |
| 27–38 s | El problema | Mundo 3D de correos, hojas, actas y notas sueltas; «Sin seguimiento. Sin pruebas.»; todo se concentra en la onda |
| 38–46 s | La solución | Captura real del panel de empresa; acercamiento a sus pestañas |
| 46–49 s | 01 Alta | Captura real del panel del partner |
| 49–60 s | 02 Cuestionario | Móvil con la pantalla real de acceso (textos literales) y el código tecleado; rótulo FPSICO con su origen |
| 60–71 s | 03 Resultados | Captura real: «No se sabe quién ha respondido ni quién falta. Mínimo por grupo: 5 respuestas»; grupos de ejemplo y grupo pequeño protegido |
| 71–79 s | 04 Plan de acción | Captura real: responsable, fecha prevista, estado e historial |
| 79–90 s | 05 Desconexión | Captura real: política, audiencia, acuse de lectura y formación; versión aprobada con fecha y autor; sello «Fechado» |
| 91–98 s | Principios | «Sin vigilar a nadie»: actividad, conexiones y correos tachados |
| 98–105 s | Origen | WORKWELL360 → YMCA Salamanca → LUMBRA360 |
| 105–116 s | Cierre | Logotipo, lema, «Solicite una demostración», web y avales |

## Regenerar

```bash
python3 scripts/voz.py <voz.onnx>             # frases de la locución (Piper es_ES, provisional)
python3 scripts/musica.py audio/musica.wav 116
python3 scripts/mezcla.py                      # coloca las frases, mezcla y escribe subtítulos
python3 scripts/construir.py                   # plantilla.html -> index.html (logotipo en línea)
NODE_PATH=$(npm root -g) node scripts/render.js h salida/lumbra360-pelicula-16x9.mp4
NODE_PATH=$(npm root -g) node scripts/render.js h --fotos 10,45,88 carpeta   # fotogramas sueltos
```

El guion está en `scripts/guion.json` y los tiempos de cada frase en `scripts/mezcla.py`.

## Pendiente de validar antes de publicar

- **Logotipos de terceros:** según `brand/credits.md`, cada uno necesita la autorización de su titular (USAL, Fundación General USAL, Prototipos/TCUE, RIS3 CyL, YMCA Salamanca, WORKWELL360).
- **Citas legales:** Ley 31/1995 arts. 16 y 23 y Ley Orgánica 3/2018 art. 88. `brand/brand-guidelines.md` las marca como [PENDIENTE DE VALIDAR]; conviene que las revise el técnico o un asesor.
- **Voz:** sintética y provisional (Piper `es_ES-davefx-medium`). Para publicar, grabar una voz profesional con `scripts/guion.json`.
- **Datos de pantalla:** las capturas son de la aplicación real con datos de demostración ficticios y marcados como tales.
