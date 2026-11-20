# Vídeo promocional de LUMBRA360 (75 s)

Lema: «Cumplir y cuidar sin vigilar.»

## Entregables (`salida/`)

| Archivo | Formato |
|---|---|
| `lumbra360-promo-16x9.mp4` | 1920 × 1080, 30 fps, H.264 + AAC, subtítulos incrustados |
| `lumbra360-promo-9x16.mp4` | 1080 × 1920, 30 fps, versión vertical para redes |
| `../subtitulos/lumbra360-promo.es.srt` | Subtítulos en archivo aparte (para YouTube, LinkedIn, etc.) |

## Estructura

| Tiempo | Escena | Locución |
|---|---|---|
| 0–8 s | Correos, Excel, acta, carpeta y una nota flotan desordenados | «Cuidar a la plantilla es parte del trabajo. Demostrarlo, también.» |
| 8–18 s | Los papeles se ordenan en una lista con marcas; logotipo; los 6 pasos | «LUMBRA360 reúne la evaluación psicosocial y la desconexión digital en un mismo sitio.» |
| 18–30 s | Móvil: código, pregunta, respuesta enviada | «La plantilla responde de forma anónima, desde el móvil, sin cuenta y sin nombre.» |
| 30–42 s | Resultados por grupos; el grupo pequeño se difumina: «Protegido» | «Los resultados se ven por grupos de cinco personas o más. Nadie queda expuesto.» |
| 42–54 s | Las barras se convierten en medidas con responsable, fecha y estado | «Cada resultado se convierte en medidas con responsable y fecha.» |
| 54–63 s | Política de desconexión, sello «Fechado», acuses de lectura | «Política de desconexión, audiencia, acuses y formación. Todo queda fechado.» |
| 63–75 s | Panel con evidencias fechadas; cierre en negro con logotipo, lema y llamada | «LUMBRA360. Cumplir y cuidar sin vigilar.» |

Todos los datos en pantalla son ficticios y van marcados como «Empresa demo (ficticia)» y «Seguimiento de demostración (ficticio)». Los responsables aparecen por su función, sin nombres de personas.

## Cómo se genera

Todo es reproducible desde esta carpeta:

```bash
python3 scripts/musica.py audio/musica.wav 75        # música original sintetizada (numpy)
python3 scripts/audio.py <voz.onnx> [locutor]         # locución, mezcla, SRT y escenas/cues.js
NODE_PATH=$(npm root -g) node scripts/render.js h salida/lumbra360-promo-16x9.mp4
NODE_PATH=$(npm root -g) node scripts/render.js v salida/lumbra360-promo-9x16.mp4
node scripts/render.js h --fotos 10,36,70 carpeta     # fotogramas sueltos para revisar
```

- **Escenas:** `escenas/index.html` + `escenas/escenas.js` (GSAP de `brand/vendor`, fuentes de `brand/fonts`, logotipo de `brand/logo`). La animación depende solo del tiempo, así que cada fotograma es exacto.
- **Locución provisional:** voz sintética Piper `es_ES-davefx-medium` (pip `piper-tts`; modelo descargado de las versiones de sherpa-onnx en GitHub). Sirve para fijar ritmo y subtítulos. Para la versión final se recomienda grabar una voz profesional con el mismo guion y sustituir `audio/locucion.wav` (los tiempos de cada frase están en `escenas/cues.js`).
- **Música:** compuesta por síntesis en `scripts/musica.py` (re mayor, 84 ppm, pads, arpegio y pulso suave). Sin muestras ni obras de terceros.
- **Web del cierre:** `lumbra360.vercel.app` (la URL de producción de `src/config/publicacion.ts`). Si cambia el dominio, edítese `#c-url` en `escenas/index.html` y vuelva a renderizarse.
