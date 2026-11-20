# LUMBRA360 · película promocional (139 s, 16:9)

Salida: `salida/lumbra360-pelicula-16x9.mp4` (1920 × 1080, 30 fps, H.264 + AAC, −15 LUFS, subtítulos incrustados).
Subtítulos aparte: `subtitulos/lumbra360-promo-v2.es.srt`.

## Estructura

| Tiempo | Escena | Qué se ve |
|---|---|---|
| 0–10 s | Apertura | El logotipo se dibuja trazo a trazo y entran en 3D las tarjetas de avales: Universidad de Salamanca, Fundación General USAL, Prototipos 2026/2027, RIS3 de Castilla y León |
| 10–27 s | Lo que pide la ley | Ley 31/1995 (arts. 16 y 23) y Ley Orgánica 3/2018 (art. 88) como documentos en 3D |
| 27–38 s | El problema | Mundo 3D de correos, hojas, actas y notas sueltas; todo se concentra en la onda |
| 38–49 s | La solución · 01 Alta | Panel actual de la empresa: barra lateral, «Anonimato protegido», «Servicio ofrecido por Marca demo A» |
| 49–61 s | 02 Cuestionario | Recorrido real en móvil: código de un solo uso, «Antes de empezar», «Es voluntario y anónimo», páginas con barra de progreso y aviso «Falta esta respuesta» |
| 61–71 s | 03 Una persona, una respuesta | «Cómo se protege este cuestionario»: una persona, una respuesta; respuestas inalterables |
| 71–83 s | 04 Evaluación con FPSICO | «Esta plataforma no puntúa la evaluación», exportación solo por el técnico, fase «Informe firmado» y rótulo de origen del INSST |
| 83–94 s | 05 Resultados de seguimiento | Participación («No se sabe quién ha respondido ni quién falta») y filtro con las áreas protegidas |
| 94–102 s | 06 Plan de acción | Anillo 1/3, responsable, fecha e historial de cambios |
| 102–113 s | 07 Desconexión digital | «Lo que conviene tener hecho» 4 de 4, versión aprobada con fecha y autor, sello «Fechado» |
| 114–121 s | Principios | «Sin vigilar a nadie»: actividad, conexiones y correos tachados |
| 121–128 s | Origen | WORKWELL360 → YMCA Salamanca → LUMBRA360 |
| 128–139 s | Cierre | Logotipo, lema, «Solicite una demostración», web y avales |

Las capturas (`escenas/assets/p_*.webp` en escritorio a 2x y `r_*.webp` en móvil a 3x) salen de la rama `claude/admiring-keller-vumcqu` (commit 26a2fd6) en local, con los datos de demostración de `supabase/seed.sql`. Para el recorrido en móvil se abrió temporalmente la evaluación demo con un código de prueba en la base de datos local, y después se dejó como estaba.

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
