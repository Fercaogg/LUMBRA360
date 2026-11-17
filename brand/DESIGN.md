---
version: 3.0
name: lumbra · Tinta y lumbre
description: >-
  Parte del logotipo: «lumbra» en una grotesca negra compacta, con la «m» convertida en una onda.
  Lienzo blanco con mucho aire, tinta negra para el texto y la interfaz, titulares grandes en grotesca
  con interletraje cerrado y un único acento bermellón (lumbre) que aparece solo donde importa.
  Las vistas densas (tablas, indicadores, estados) ganan precisión sin perder la calma.

colors:
  ink: "#111111"            # tinta 950: todo el texto
  ink-action: "#1B1B1B"     # tinta 900: logotipo, botón primario, bloques oscuros
  ink-action-press: "#272726"
  ink-link: "#111111"       # enlaces en tinta, subrayados
  focus: "#D9480F"          # lumbre 500: anillo de foco
  ink-soft-bg: "#F4F4F3"    # tinta 50: selección, fila activa
  text-secondary: "#55554F" # piedra 700
  text-tertiary: "#6B6B65"  # piedra 600
  canvas: "#FFFFFF"         # lienzo dominante
  canvas-alt: "#F5F5F2"     # alterna secciones
  canvas-sunken: "#EDEDEA"
  hairline: "#E3E3DF"
  hairline-strong: "#CFCFCA"
  control-border: "#8A8A84"
  on-ink: "#F5F5F2"         # texto sobre tinta
  lumbre: "#F25A1F"         # único acento
  lumbre-soft: "#FFE1D4"
  lumbre-text: "#B83A0E"    # lumbre como texto sobre blanco
  success-text: "#1D6440"
  success-bg: "#E6F2EB"
  warning-text: "#7A4B00"
  warning-bg: "#FBF0D6"
  error-text: "#A3122F"     # carmesí: no se confunde con la lumbre
  error-bg: "#FCE8EC"
  info-text: "#24508F"
  info-bg: "#E7EEF8"
  data-good: "#2E8A5F"
  data-mid: "#C98A1B"
  data-bad: "#B3382C"

typography:
  hero:
    fontFamily: "Instrument Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 120px           # 50 px en móvil
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: -0.045em
  display:
    fontFamily: "Instrument Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 76px            # 38 px en móvil
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: -0.03em
  h1:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 44px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.03em
  h2:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 34px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.025em
  h3:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.02em
  h4:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.3
  lead:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  data:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: tnum
  eyebrow:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: 12px
    fontWeight: 400
    letterSpacing: 0.14em
    textTransform: uppercase
  literal:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    fontFeature: tnum

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  pill: 999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px
  "12": 48px
  "16": 64px
  "24": 96px
  "32": 128px
  section: "80 → 128px"

elevation:
  flat: none
  hairline: "0 0 0 1px rgb(17 17 17 / 0.06)"
  float: "0 1px 2px rgb(17 17 17 / 0.04), 0 12px 32px -16px rgb(17 17 17 / 0.16)"
  overlay: "0 2px 6px rgb(17 17 17 / 0.05), 0 32px 64px -24px rgb(17 17 17 / 0.24)"

components:
  button-primary:     { background: "{colors.ink-action}", text: "{colors.on-ink}", typography: "{typography.ui}", rounded: "{rounded.pill}", height: 44px, padding: "0 22px" }
  button-secondary:   { background: transparent, text: "{colors.ink}", border: "1px {colors.hairline-strong}", rounded: "{rounded.pill}", height: 44px }
  button-lumbre:      { background: "{colors.lumbre}", text: "{colors.ink-action}", rounded: "{rounded.pill}", use: "solo exportar el dossier" }
  button-text:        { background: transparent, text: "{colors.ink-link}", underline: always }
  input:              { background: "{colors.canvas}", border: "1px {colors.control-border}", rounded: "{rounded.sm}", height: 44px, focus: "anillo 2px {colors.focus}" }
  card-presentation:  { background: "{colors.canvas-alt}", rounded: "{rounded.lg}", padding: 40px, shadow: none }
  card-data:          { background: "{colors.canvas}", border: "1px {colors.hairline}", rounded: "{rounded.md}", padding: 20px }
  kpi:                { label: "{typography.caption}", value: "{typography.h1} tnum", rule: "barra 4px {rounded.xs}" }
  table:              { header: "{typography.eyebrow} {colors.text-tertiary}", row: "{typography.data}", rowHeight: 48px, dense: 40px, divider: "{colors.hairline}" }
  badge-status:       { rounded: "{rounded.pill}", typography: "12px 600", icon: 14px, padding: "2px 10px 2px 8px" }
  timeline:           { rail: "1px {colors.hairline-strong}", node: "9px ring {colors.ink-action}", new-node: "{colors.lumbre}" }
  modal:              { background: "{colors.canvas}", rounded: "{rounded.xl}", shadow: "{elevation.overlay}", width: 520px }
  alert:              { rounded: "{rounded.md}", border: "1px", icon: 20px }
  empty-state:        { align: center, icon: "48px círculo {colors.ink-soft-bg}", maxWidth: 44ch }
  sidebar:            { background: "{colors.canvas-alt}", width: 248px, item: "40px {rounded.sm}", active: "{colors.canvas} + filete 2px {colors.lumbre}" }
  nav-top:            { background: "{colors.canvas} 85% + blur", height: 64px, border: "1px {colors.hairline}" }
---

# DESIGN.md · lumbra

Sistema de diseño propio de lumbra, versión 3.0, **«Tinta y lumbre»**. Parte del logotipo entregado por el cliente (`brand/logo/fuente/lumbra-original.svg`), que no se redibuja. Los tokens anteriores son la fuente de verdad. Su implementación está en `brand/tokens.css`, `brand/tailwind.config.ts` y `brand/tailwind.theme.css`. La página `brand/brand.html` lo muestra todo en funcionamiento.

## Referencias y qué se toma de cada una

Se han usado dos análisis de terceros como referencia de criterio, no de identidad.

- **Referencia principal (galería de producto):** se toma su forma de trabajar.
  - Mucho espacio en blanco y pocas cosas en pantalla.
  - Titulares grandes con interletraje negativo.
  - Una sola tinta para el texto y un solo color de acción.
  - Ausencia de sombras decorativas y de degradados.
  - Ritmo de secciones que alternan fondo (blanco ↔ piedra 50 ↔ tinta).
  - Botones en cápsula, contracción leve al pulsar y cuerpo de lectura a 17 px.
- **Referencia secundaria (infraestructura financiera):** solo para lo denso.
  - Tablas con cifras tabulares y etiquetas de columna discretas.
  - Tarjetas de datos con filete en lugar de sombra.
  - Estados en cápsulas pequeñas y paneles compactos con relleno de 20 a 24 px.

**No se reutiliza nada propietario:**
- Ni el azul de acción ni el violeta de esas marcas.
- Ni sus tipografías (SF Pro, Söhne).
- Ni sus nombres, logotipos o degradados característicos.

El color de acción es el negro del logotipo. El acento es la lumbre bermellón, que viene del nombre.

## Resumen

LUMBRA360 se presenta como una sala bien iluminada: el contenido es la obra y la interfaz se retira. La sensación buscada es **«tengo todo en orden y lo puedo demostrar»**.

**Rasgos clave**

- **Lienzo blanco dominante** con gris piedra muy claro (`canvas-alt`) para alternar secciones y agrupar. El cambio de fondo es el separador: no hacen falta líneas ni sombras.
- **Una sola tinta.** Todo el texto va en tinta 950, y la acción principal es un botón de tinta 900. No hay un segundo color de acción.
- **Un solo acento.** La lumbre aparece en el punto del símbolo, en la acción de mayor valor (exportar el dossier) y en la evidencia recién registrada. Nunca rellena superficies grandes.
- **Tipografía protagonista.** Instrument Sans regular a 76–120 px con interletraje muy cerrado. Las páginas se leen como un buen documento, no como un panel de control.
- **Densidad controlada.** Las vistas de datos usan tablas con cifras tabulares, filetes de 1 px y cápsulas de estado, como un buen informe financiero.
- **Elevación mínima.** Sin sombras en tarjetas ni botones. Solo flotan los menús y los modales.

## Logotipo

- **Original:** `brand/logo/fuente/lumbra-original.svg`, del cliente. Las versiones se generan con `python3 brand/scripts/logo_lumbra.py`: se quitan los recortes y el lienzo vacío, y se ajusta el encuadre. No se redibuja ni se cambia la tipografía del logotipo.
- **Versiones:** horizontal positivo (tinta), negativo (blanco roto) y acento (onda en lumbre, solo para piezas de marca).
- **Símbolo:** la onda de la «m». Se usa sola en el favicon (lumbre sobre tinta), en el acceso y como gran gráfico en los cierres.
- **Mínimo:** 72 px de ancho en pantalla para el horizontal. El símbolo se lee a 16 px.
- **No:** separar letras, cambiar la grotesca, contornear, poner degradados o colorear otra letra que no sea la onda.

## Color

### Tinta
El negro del logotipo, `#1B1B1B`, es la acción, el logotipo y los bloques oscuros. El texto va en `#111111`. La escala neutra de tinta (50 a 950) sirve para estados, rellenos y bordes.

### Lienzo y neutros
Blanco puro dominante y `#F5F5F2` para alternar secciones. Los neutros (piedra) llevan un punto mínimo de calidez para que el blanco no sea clínico, sin llegar al crema.

### Lumbre
`#F25A1F`, bermellón. Un único acento: la acción de mayor valor (exportar el dossier), la onda del símbolo, viñetas pequeñas y nada más. Como texto sobre blanco, solo `#B83A0E` o más oscuro. Sobre lumbre, texto en tinta (5,6:1), nunca en blanco.

### Semánticos
Verde, ámbar, carmesí y azul, siempre con icono y etiqueta. El error es carmesí (`#A3122F`) para que no se confunda con la lumbre.

### Datos
Trío de datos validado para daltonismo: `#2E8A5F`, `#C98A1B`, `#B3382C`. Siempre con etiqueta y porcentaje. Modo oscuro: pendiente de validar.

### Modo oscuro
Negro neutro (`#0E0E0E`), superficies `#171716`, texto blanco roto y la acción en blanco roto. La lumbre sube a `#FF6A33`.

Contraste: 34 parejas comprobadas con `brand/scripts/contraste.py`, todas AA.

## Tipografía

- **Instrument Sans** (SIL OFL) para todo: titulares, interfaz y datos. Grotesca contemporánea que acompaña al logotipo sin imitarlo. Tiene cifras tabulares (`tnum`) para tablas e indicadores.
- **Titulares:** regular (400) en tamaños grandes, con interletraje muy cerrado (−0,045 em en el héroe). La elegancia sale del tamaño y del aire, no del peso.
- **Interfaz:** 400 para texto, 600 para énfasis. Cuerpo de lectura a 17 px.
- **IBM Plex Mono** (SIL OFL) para valores literales (huellas, códigos) y para los índices de sección en mayúsculas espaciadas.
- La clase `font-serif` de la aplicación se mantiene como nombre de la familia de titulares, pero ahora apunta a Instrument Sans.

## Espacio y composición

- **Rejilla de 4 px:** 4, 8, 12, 16, 24, 32, 48, 64, 96 y 128.
- **Entre secciones:** 80 a 128 px (`--espacio-seccion`). Cada sección de presentación ocupa casi una pantalla.
- **Contenedores:**
  - 1152 px para composición.
  - 736 px para bloques de texto centrados.
  - 64 caracteres de línea de lectura.
- **Tarjetas:** las de presentación llevan 40 px de relleno, las de datos 20 a 24 px y las celdas de tabla 12 a 16 px.
- **Ritmo de la landing:** blanco → piedra 50 → blanco → tinta (un bloque oscuro como pausa) → piedra 50. El cambio de fondo divide.

## Elevación y forma

| Nivel | Valor | Uso |
|---|---|---|
| Plano | sin sombra | Secciones, tarjetas de presentación, navegación |
| Filete | `0 0 0 1px` al 6 % | Tarjetas de datos, campos |
| Flota | sombra suave y amplia | Menús, desplegables |
| Capa | sombra profunda | Modales |

**Radios**

| Token | Valor | Uso |
|---|---|---|
| xs | 4 px | Barras de datos |
| sm | 8 px | Campos |
| md | 12 px | Tarjetas de datos, alertas, menús |
| lg | 20 px | Tarjetas de presentación, maquetas |
| xl | 28 px | Modales |
| pill | 999 px | Botones y cápsulas de estado |

Se usan dos gramáticas: **cápsula para actuar** (botones y estados) y **rectángulo suave para contener** (campos, tarjetas). No se mezclan.

## Componentes

- **Botón primario.** Cápsula de tinta 900 con texto blanco, 44 px de alto y 22 px de relleno lateral.
  - Al pulsar: escala 0,97 y tinta 800.
  - Uno por vista.
- **Botón secundario.** Cápsula transparente con filete `hairline-strong` y texto en tinta.
- **Botón de lumbre.** Cápsula bermellón con texto de tinta. **Solo para exportar el dossier**: es el gesto que da sentido al producto.
- **Botón de texto.** Tinta 600, subrayado al pasar el cursor.
- **Campo.** Rectángulo de 8 px de radio con borde `control-border`, etiqueta encima en 14 px y 600, y ayuda debajo. Foco: borde de tinta y anillo de 3 px. Error: borde rojo y mensaje con icono.
- **Tabla de datos.**
  - Cabecera en *eyebrow* `text-tertiary` con filete inferior `hairline-strong`.
  - Filas de 48 px (40 en vista densa) con filete `hairline` y cifras tabulares alineadas a la derecha.
  - Fila al pasar el cursor en `canvas-alt`.
  - Sin rayado cebra.
  - En móvil, cada fila pasa a ser una tarjeta.
- **Indicador (KPI).** Etiqueta en 14 px secundaria, cifra en Instrument Sans 44 px con `tnum`, barra de 4 px y nota. Sin gráficos decorativos.
- **Cápsula de estado.** 12 px y 600, con icono de 14 px y fondo y texto semánticos: «Al día», «En curso», «Vence pronto», «Requiere atención», «Sin iniciar», «Protegido por anonimato» y «Firmado».
- **Línea temporal de evidencias.**
  - Raíl de 1 px y nodos de 9 px con anillo de tinta.
  - Cada entrada lleva fecha, hora, autor y huella en Plex Mono.
  - La entrada nueva lleva el nodo de lumbre.
  - No hay acción de borrar.
- **Modal.** Blanco, con radio de 28 px y sombra de capa. Título en Instrument Sans 24 (500), consecuencia explicada, «Cancelar» y la acción. Se construye con `<dialog>` nativo.
- **Alerta.** Rectángulo de 12 px con fondo semántico, icono, título y una salida concreta.
- **Estado vacío.** Centrado, con icono en círculo de 48 px, título en Instrument Sans, una frase y una acción.
- **Navegación lateral.**
  - Pergamino, 248 px de ancho.
  - Elementos de 40 px con icono de 20 px.
  - El activo, en blanco con filete de lumbre de 2 px a la izquierda.
  - Grupos con *eyebrow*.
  - En móvil se convierte en menú.
- **Navegación superior.** Blanca al 85 % con desenfoque, 64 px de alto y filete inferior. Logotipo a la izquierda y una sola acción a la derecha.

## Iconografía

- **Lucide** (ISC).
- **Trazo:** 1,5 px a 20 y 24 px; 2 px a 16 px.
- Extremos redondeados, en el color del texto al que acompaña.
- Sin iconos de alarma, sirenas, escudos policiales ni balanzas.

## Movimiento

| Token | Duración | Uso |
|---|---|---|
| rápida | 120 ms | Pulsación, cambio de color |
| base | 200 ms | Menús, interruptores |
| lenta | 360 ms | Modales, cambio de sección |
| énfasis | 720 ms | Carga de indicadores, confirmación de evidencia |

**Curvas:**
- `cubic-bezier(0.23, 1, 0.32, 1)` para lo que entra.
- `cubic-bezier(0.65, 0, 0.35, 1)` para desplazamientos entre dos puntos.

Sin rebotes ni bucles.

**Cuándo se anima:** solo para confirmar, orientar o mostrar un cambio de dato.

**Con `prefers-reduced-motion`:** no se anima nada. GSAP lo gestiona con `gsap.matchMedia()` y los tokens de duración caen a 1 ms.

**Microinteracciones con GSAP:**
1. **Carga de indicadores:** la cifra cuenta hasta su valor y la barra crece. 720 ms, `power3.out`.
2. **Transición entre secciones:** fundido y 12 px hacia arriba. 360 ms, `expo.out`.
3. **Confirmación de evidencia:** la entrada se abre, el nodo aparece y un halo de lumbre se disipa. 720 ms.

## Qué hacer y qué no

**Hacer**
- Dejar que el aire y el tamaño hagan la jerarquía antes de añadir bordes o color.
- Alternar fondos (blanco ↔ piedra 50 ↔ tinta) para separar secciones.
- Usar la tinta para el texto y la acción, y la lumbre solo donde importa.
- Usar cifras tabulares en todo número que se compare.
- Acompañar siempre un estado de icono y etiqueta.

**No hacer**
- Añadir un segundo color de acción o usar la lumbre como texto.
- Poner sombras en tarjetas o botones, o degradados decorativos.
- Usar pesos 500 o 700, o titulares en mayúsculas.
- Usar rojo como color dominante, iconos de alarma o tono de urgencia.
- Usar ilustraciones infantiles, estética wellness ni fotografías de archivo de personas sonriendo.

## Comportamiento responsive

| Punto | Cambio |
|---|---|
| ≤ 640 px | Una columna, titular héroe a 44 px, secciones a 80 px, tablas como tarjetas, navegación lateral como menú |
| 641–1023 px | Dos columnas en rejillas, navegación lateral plegable |
| ≥ 1024 px | Composición completa con contenido limitado a 1152 px |

Objetivo táctil mínimo de 44 × 44 px. Nunca desplazamiento lateral de página.

## Huecos conocidos

- **Colores de datos en modo oscuro:** sin validar.
- **Gráficos:** este sistema solo define las barras de nivel. Otros gráficos se diseñarán cuando el producto los necesite.
- **Referencias normativas** en los mensajes: [PENDIENTE DE VALIDAR].
