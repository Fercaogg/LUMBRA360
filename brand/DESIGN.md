---
version: 2.0
name: LUMBRA360 · Galería de luz
description: >-
  Una galería blanca y serena donde la información de cumplimiento queda expuesta con calma.
  Mucho aire, titulares grandes en una serif ligera, una sola tinta petróleo casi negra para el
  texto y la interfaz, y un único acento cálido (lumbre) que aparece solo donde importa.
  Las vistas densas (tablas, indicadores, estados) ganan precisión sin perder la calma.

colors:
  ink: "#0B1A1D"            # tinta 950: todo el texto
  ink-action: "#0D262B"     # tinta 900: botón primario, logotipo
  ink-action-press: "#13343A"
  ink-link: "#24555D"       # tinta 600: enlaces en texto
  ink-focus: "#356C74"      # tinta 500: anillo de foco
  ink-soft-bg: "#EFF4F4"    # tinta 50: selección, fila activa
  text-secondary: "#5C5850" # piedra 700
  text-tertiary: "#706A61"  # piedra 600
  canvas: "#FFFFFF"         # lienzo dominante
  canvas-alt: "#F7F5F1"     # pergamino: alterna secciones
  canvas-sunken: "#EFECE6"
  hairline: "#E6E2DA"
  hairline-strong: "#D3CDC2"
  control-border: "#8A8378"
  on-ink: "#FFFFFF"
  ivory: "#EEEBE5"          # texto sobre superficie oscura
  lumbre: "#E6A23A"         # único acento
  lumbre-soft: "#FAE8C4"
  lumbre-text: "#7F4E16"
  success-text: "#2B6339"
  success-bg: "#E8F2EA"
  warning-text: "#7F4E16"
  warning-bg: "#FBF0D9"
  error-text: "#9C2F27"
  error-bg: "#FBE9E6"
  info-text: "#285682"
  info-bg: "#E6EEF6"
  data-good: "#2E8A5F"
  data-mid: "#C98A1B"
  data-bad: "#B3382C"

typography:
  hero:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 80px            # 44 px en móvil
    fontWeight: 300
    lineHeight: 1.02
    letterSpacing: -0.03em
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 56px            # 36 px en móvil
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: -0.03em
  h1:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
  h3:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: -0.02em
  h4:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.005em
  lead:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 22px            # 19 px en móvil
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.005em
  ui:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -0.005em
  data:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: tnum
  caption:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  eyebrow:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
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
  hairline: "0 0 0 1px rgb(11 26 29 / 0.06)"
  float: "0 1px 2px rgb(11 26 29 / 0.04), 0 12px 32px -16px rgb(11 26 29 / 0.16)"
  overlay: "0 2px 6px rgb(11 26 29 / 0.05), 0 32px 64px -24px rgb(11 26 29 / 0.24)"

components:
  button-primary:     { background: "{colors.ink-action}", text: "{colors.on-ink}", typography: "{typography.ui}", rounded: "{rounded.pill}", height: 44px, padding: "0 22px" }
  button-secondary:   { background: transparent, text: "{colors.ink}", border: "1px {colors.hairline-strong}", rounded: "{rounded.pill}", height: 44px }
  button-lumbre:      { background: "{colors.lumbre}", text: "{colors.ink-action}", rounded: "{rounded.pill}", use: "solo exportar el dossier" }
  button-text:        { background: transparent, text: "{colors.ink-link}", underline: "on hover" }
  input:              { background: "{colors.canvas}", border: "1px {colors.control-border}", rounded: "{rounded.sm}", height: 44px, focus: "ring 3px {colors.ink-focus} 25%" }
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

# DESIGN.md · LUMBRA360

Sistema de diseño propio de LUMBRA360, versión 2.0, dirección **«Galería de luz»**. Los tokens anteriores son la fuente de verdad. Su implementación está en `brand/tokens.css`, `brand/tailwind.config.ts` y `brand/tailwind.theme.css`. La página `brand/brand.html` lo muestra todo en funcionamiento.

## Referencias y qué se toma de cada una

Se han usado dos análisis de terceros como referencia de criterio, no de identidad.

- **Referencia principal (galería de producto):** se toma su forma de trabajar.
  - Mucho espacio en blanco y pocas cosas en pantalla.
  - Titulares grandes con interletraje negativo.
  - Una sola tinta para el texto y un solo color de acción.
  - Ausencia de sombras decorativas y de degradados.
  - Ritmo de secciones que alternan fondo (blanco ↔ pergamino ↔ tinta).
  - Botones en cápsula, contracción leve al pulsar y cuerpo de lectura a 17 px.
- **Referencia secundaria (infraestructura financiera):** solo para lo denso.
  - Tablas con cifras tabulares y etiquetas de columna discretas.
  - Tarjetas de datos con filete en lugar de sombra.
  - Estados en cápsulas pequeñas y paneles compactos con relleno de 20 a 24 px.

**No se reutiliza nada propietario:**
- Ni el azul de acción ni el violeta de esas marcas.
- Ni sus tipografías (SF Pro, Söhne).
- Ni sus nombres, logotipos o degradados característicos.

El color de acción de LUMBRA360 es su propia tinta petróleo. El acento es la lumbre ámbar, que viene del nombre.

## Resumen

LUMBRA360 se presenta como una sala bien iluminada: el contenido es la obra y la interfaz se retira. La sensación buscada es **«tengo todo en orden y lo puedo demostrar»**.

**Rasgos clave**

- **Lienzo blanco dominante** con pergamino cálido (`canvas-alt`) para alternar secciones y agrupar. El cambio de fondo es el separador: no hacen falta líneas ni sombras.
- **Una sola tinta.** Todo el texto va en tinta 950, y la acción principal es un botón de tinta 900. No hay un segundo color de acción.
- **Un solo acento.** La lumbre aparece en el punto del símbolo, en la acción de mayor valor (exportar el dossier) y en la evidencia recién registrada. Nunca rellena superficies grandes.
- **Tipografía protagonista.** Newsreader ligera (300) a 56–80 px con interletraje negativo. Las páginas se leen como un buen documento, no como un panel de control.
- **Densidad controlada.** Las vistas de datos usan tablas con cifras tabulares, filetes de 1 px y cápsulas de estado, como un buen informe financiero.
- **Elevación mínima.** Sin sombras en tarjetas ni botones. Solo flotan los menús y los modales.

## Color

### Tinta

Petróleo casi negro, con base azul verdosa. Da autoridad sin la frialdad del negro puro ni del azul corporativo.

| Token | Hex | Uso |
|---|---|---|
| `ink` (tinta 950) | `#0B1A1D` | Todo el texto principal |
| `ink-action` (tinta 900) | `#0D262B` | Botón primario, logotipo, superficie oscura |
| `ink-action-press` (tinta 800) | `#13343A` | Botón primario pulsado o con el cursor encima |
| `ink-link` (tinta 600) | `#24555D` | Enlaces dentro del texto |
| `ink-focus` (tinta 500) | `#356C74` | Anillo de foco |
| `ink-soft-bg` (tinta 50) | `#EFF4F4` | Fila seleccionada, elemento activo, icono de estado vacío |

### Lienzo y neutros

Neutros cálidos, de papel. Evitan la frialdad clínica y el aspecto de plantilla.

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#FFFFFF` | Lienzo dominante |
| `canvas-alt` | `#F7F5F1` | Pergamino: secciones alternas, navegación lateral, tarjetas de presentación |
| `canvas-sunken` | `#EFECE6` | Pistas de barras, campos desactivados |
| `hairline` | `#E6E2DA` | Filetes decorativos |
| `hairline-strong` | `#D3CDC2` | Borde de botón secundario, raíl de la línea temporal |
| `control-border` | `#8A8378` | Borde de campos (3,6:1 sobre blanco) |
| `text-secondary` | `#5C5850` | Texto secundario (6,9:1) |
| `text-tertiary` | `#706A61` | Metadatos y cabeceras de tabla (5,3:1) |

### Lumbre

`#E6A23A` es el único acento. Normas:
- Como mucho, en torno al 5 % de una pantalla.
- Nunca como color de texto sobre fondo claro.
- El texto sobre lumbre va siempre en tinta 900 (6,8:1).

### Semánticos

Siempre acompañados de icono y etiqueta.

| Estado | Texto | Fondo | Uso |
|---|---|---|---|
| Correcto | `#2B6339` | `#E8F2EA` | Al día, completado |
| Aviso | `#7F4E16` | `#FBF0D9` | Plazo próximo, algo pendiente |
| Error | `#9C2F27` | `#FBE9E6` | Fallo real. Nunca como decoración |
| Información | `#285682` | `#E6EEF6` | Contexto, anonimato |

### Datos

Para las marcas de los gráficos se usan `#2E8A5F`, `#C98A1B` y `#B3382C`, validados para daltonismo. Llevan siempre etiqueta y porcentaje en texto. En modo oscuro quedan pendientes de validar.

### Modo oscuro

No es una inversión: cada valor se ha elegido a mano.
- Fondo `#0B1214` y superficie `#121C1F`.
- Texto marfil `#EEEBE5`.
- **La acción pasa a ser marfil con texto de tinta.**
- La lumbre sube a `#EFB95A`.

Se activa con la preferencia del sistema o con `data-theme`.

## Tipografía

| Familia | Papel | Por qué |
|---|---|---|
| **Newsreader** (SIL OFL) | Titulares: 300 en tamaños grandes y 400 desde h1 hacia abajo | Serif editorial con ejes ópticos. A tamaño grande y peso ligero da la presencia serena de una galería. Más carácter que una sans y sin rigidez institucional. |
| **IBM Plex Sans** (SIL OFL) | Interfaz, lectura y datos: 400 y 600 | Neutra y técnica, con cifras tabulares (`tnum`). Muy legible a 14–17 px. Menos genérica que las sans habituales del SaaS. |
| **IBM Plex Mono** (SIL OFL) | Huellas SHA-256, códigos y referencias | Señala lo que se copia tal cual. |

**Escala**

| Token | Tamaño | Peso | Interlineado | Interletraje |
|---|---|---|---|---|
| hero | 80 px (44 en móvil) | 300 | 1,02 | −0,03 em |
| display | 56 px (36 en móvil) | 300 | 1,05 | −0,03 em |
| h1 | 44 px (32 en móvil) | 400 | 1,1 | −0,02 em |
| h2 | 34 px (26 en móvil) | 400 | 1,1 | −0,02 em |
| h3 | 24 px | 400 | 1,3 | −0,02 em |
| h4 | 19 px, Plex | 600 | 1,3 | −0,005 em |
| lead | 22 px (19 en móvil) | 400 | 1,55 | 0 |
| body | 17 px | 400 | 1,55 | −0,005 em |
| ui | 16 px | 400 | 1,45 | −0,005 em |
| data | 14 px, con `tnum` | 400 | 1,45 | 0 |
| eyebrow | 12 px, mayúsculas | 600 | 1,4 | +0,14 em |

**Principios**

- **Lectura a 17 px**, como la referencia principal. La interfaz va a 16 px y los datos a 14 px.
- **Pesos:** 300 solo en Newsreader grande; 400 para texto; 600 para énfasis. No se usan 500 ni 700: la jerarquía la hacen el tamaño y el aire.
- **Interletraje negativo** solo en titulares. Mayúsculas espaciadas solo en etiquetas de una o dos palabras.
- **Cifras tabulares** en toda tabla, indicador y fecha alineada.

## Espacio y composición

- **Rejilla de 4 px:** 4, 8, 12, 16, 24, 32, 48, 64, 96 y 128.
- **Entre secciones:** 80 a 128 px (`--espacio-seccion`). Cada sección de presentación ocupa casi una pantalla.
- **Contenedores:**
  - 1152 px para composición.
  - 736 px para bloques de texto centrados.
  - 64 caracteres de línea de lectura.
- **Tarjetas:** las de presentación llevan 40 px de relleno, las de datos 20 a 24 px y las celdas de tabla 12 a 16 px.
- **Ritmo de la landing:** blanco → pergamino → blanco → tinta (un bloque oscuro como pausa) → pergamino. El cambio de fondo divide.

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
- **Botón de lumbre.** Cápsula ámbar con texto de tinta. **Solo para exportar el dossier**: es el gesto que da sentido al producto.
- **Botón de texto.** Tinta 600, subrayado al pasar el cursor.
- **Campo.** Rectángulo de 8 px de radio con borde `control-border`, etiqueta encima en 14 px y 600, y ayuda debajo. Foco: borde de tinta y anillo de 3 px. Error: borde rojo y mensaje con icono.
- **Tabla de datos.**
  - Cabecera en *eyebrow* `text-tertiary` con filete inferior `hairline-strong`.
  - Filas de 48 px (40 en vista densa) con filete `hairline` y cifras tabulares alineadas a la derecha.
  - Fila al pasar el cursor en `canvas-alt`.
  - Sin rayado cebra.
  - En móvil, cada fila pasa a ser una tarjeta.
- **Indicador (KPI).** Etiqueta en 14 px secundaria, cifra en Newsreader 44 px con `tnum`, barra de 4 px y nota. Sin gráficos decorativos.
- **Cápsula de estado.** 12 px y 600, con icono de 14 px y fondo y texto semánticos: «Al día», «En curso», «Vence pronto», «Requiere atención», «Sin iniciar», «Protegido por anonimato» y «Firmado».
- **Línea temporal de evidencias.**
  - Raíl de 1 px y nodos de 9 px con anillo de tinta.
  - Cada entrada lleva fecha, hora, autor y huella en Plex Mono.
  - La entrada nueva lleva el nodo de lumbre.
  - No hay acción de borrar.
- **Modal.** Blanco, con radio de 28 px y sombra de capa. Título en Newsreader 24, consecuencia explicada, «Cancelar» y la acción. Se construye con `<dialog>` nativo.
- **Alerta.** Rectángulo de 12 px con fondo semántico, icono, título y una salida concreta.
- **Estado vacío.** Centrado, con icono en círculo de 48 px, título en Newsreader, una frase y una acción.
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
- Alternar fondos (blanco ↔ pergamino ↔ tinta) para separar secciones.
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
