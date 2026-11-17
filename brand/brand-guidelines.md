# LUMBRA360 · Guía de marca

Versión 1.0 · Dirección «Lumbre institucional»

LUMBRA360 une «lumbre» y visión de 360°. La idea central es la claridad: iluminar lo que antes estaba en zona gris (riesgos, cumplimiento y pruebas) para que la empresa sienta que **tiene todo en orden y lo puede demostrar**.

La marca debe transmitir confianza institucional sin parecer una web de la Administración ni una startup juvenil. Es elegante, sobria, rigurosa y serena.

**Archivos**

| Archivo | Contenido |
|---|---|
| `brand.html` | El sistema completo, visual e interactivo. Ábralo en el navegador. Funciona sin conexión. |
| `tokens.css` | Variables CSS: primitivos y semánticos, modo claro y oscuro, movimiento reducido. |
| `tailwind.config.ts` | Tema de Tailwind en formato de configuración. |
| `tailwind.theme.css` | El mismo tema para Tailwind 4 (`@theme`). |
| `logo/` | Logotipo en SVG: horizontal, vertical y símbolo, en positivo y negativo, y favicon. |
| `scripts/` | Generadores reproducibles: logotipos, contraste y página. |
| `fonts/`, `vendor/` | Fuentes (SIL OFL), GSAP 3.12.5 y licencia de Lucide, para que `brand.html` funcione sin red. |

**Skills.** El encargo pedía aplicar taste skill, design dna, ui ux pro max, motion design skill, gsap skill y genjutsu. Ninguna estaba instalada en la sesión en que se creó este sistema. Se han aplicado sus criterios de forma manual: tokens primero, patrones accesibles, filtro estético y movimiento con propósito. Conviene revisarlo con esas skills cuando estén disponibles.

---

## 1. Dirección creativa

Se exploraron tres direcciones:

| | Concepto | Paleta | Tipografía | Símbolo |
|---|---|---|---|---|
| **A · Lumbre institucional** | Luz cálida y contenida dentro de un círculo completo: claridad que ordena, no que deslumbra. | Petróleo profundo, lumbre ámbar en dosis mínimas y neutros de papel. | Newsreader, IBM Plex Sans e IBM Plex Mono. | Anillo de 360° con apertura y punto de lumbre central. |
| B · Archivo claro | El expediente bien ordenado. | Azul tinta, gris papel y ámbar. | Grotesca condensada e Inter. | Documento atravesado por un haz. |
| C · Horizonte sereno | Amanecer sobre una línea de horizonte. | Verde petróleo, arena y melocotón. | Cormorant y Nunito Sans. | Sol naciente. |

**Se elige la A.** Es la única que traduce el nombre completo: el anillo es la visión 360° y el punto es la lumbre.

- La B transmite rigor, pero roza lo burocrático, y con Inter y un icono de documento se acerca al aspecto de plantilla SaaS por defecto.
- La C cae en la estética wellness que hay que evitar, y Cormorant pierde legibilidad en pantalla.
- La A combina autoridad editorial (la serif) y precisión documental (Plex).

---

## 2. Logotipo

### Construcción

- **Anillo:** circunferencia de radio 16,5 con trazo de 6 sobre una rejilla de 48 × 48, con extremos redondeados. Representa la visión completa, los 360°.
- **Apertura:** entre −42° y −78°, arriba a la derecha. Indica transparencia: nada queda cerrado ni oculto. Además evita que el símbolo parezca un botón de encendido o un objetivo.
- **Lumbre:** círculo central de radio 5,25 en ámbar. Es la luz que permite ver con claridad, y el único punto cálido del símbolo.
- **Logotipo tipográfico:** «LUMBRA360» en Newsreader 500, con espaciado de 0,075 em, convertido a trazados. Va en mayúsculas para dar presencia institucional. El espaciado abierto evita que se lea apretado a tamaños pequeños.

**Por qué funciona a 16 px:** el trazo del anillo ocupa un octavo de la rejilla y el punto central es grande. A 16 px se distinguen anillo, apertura y punto, como se ve en `brand.html`.

### Versiones

| Archivo | Uso |
|---|---|
| `lumbra360-horizontal-positivo.svg` | Uso principal sobre fondos claros: cabeceras, documentos y correos. |
| `lumbra360-horizontal-negativo.svg` | Sobre petróleo o fondos oscuros. |
| `lumbra360-vertical-*.svg` | Espacios cuadrados: portadas, presentaciones y redes. |
| `lumbra360-simbolo-*.svg` | Avatares, iconos de aplicación y sellos pequeños. |
| `favicon.svg` | Pestaña del navegador. Cambia a la versión clara si el sistema está en modo oscuro. |

Colores del logotipo:
- Positivo: anillo y texto en petróleo 900 (`#0C2B30`), punto en lumbre 400 (`#E6A23A`).
- Negativo: anillo y texto en piedra 50 (`#F7F5F0`), punto en lumbre 300 (`#EFB95A`).

### Normas

- **Área de protección:** la mitad de la altura del símbolo en todo el contorno.
- **Tamaño mínimo:** símbolo a 16 px; logotipo horizontal a 120 px de ancho en pantalla y 30 mm en papel.
- **No:** deformar, cambiar colores, girar, añadir sombras o contornos, ni colocarlo sobre fotografías o fondos con poco contraste.
- **No:** separar el punto del anillo, cambiar la tipografía ni escribir «Lumbra 360» con espacio.
- **En texto corrido:** «LUMBRA360», en mayúsculas y sin espacio.

Para regenerar los SVG:

```bash
python3 brand/scripts/generar_logos.py <carpeta con newsreader-latin-500-normal.woff2>
```

---

## 3. Color

### Racional

- **Petróleo (primario):** azul verdoso profundo. Transmite confianza y calma sin ser el azul corporativo genérico ni el verde «salud». Es el color de la marca, de las acciones principales y de la navegación.
- **Lumbre (acento):** ámbar cálido y luminoso. Es la luz del concepto. Se usa poco, como mucho en torno al 5 % de una pantalla: el punto del símbolo, la acción de mayor valor (exportar el dossier), un dato que importa. Nunca rellena superficies grandes ni se usa para texto sobre fondo claro.
- **Piedra (neutros):** grises con base cálida, de papel. Hacen que el producto se sienta documental y humano, no clínico.
- **Semánticos:** verde (correcto), ámbar oscuro (aviso), rojo teja (error) e azul (información). El rojo no es dominante: solo aparece cuando algo falla de verdad.

### Escalas

| Paso | Petróleo | Lumbre | Piedra |
|---|---|---|---|
| 0 | | | `#FFFFFF` |
| 25 | | | `#FCFBF8` |
| 50 | `#EEF5F5` | `#FDF6E9` | `#F7F5F0` |
| 100 | `#D6E7E8` | `#FAE8C4` | `#EFECE4` |
| 200 | `#ADCFD2` | `#F5D28F` | `#E2DDD2` |
| 300 | `#7FB1B6` | `#EFB95A` | `#CBC5B8` |
| 400 | `#4F8F96` | `#E6A23A` | `#A39C8E` |
| 500 | `#2E727A` | `#CC8424` | `#8C8579` |
| 600 | `#1F5D65` | `#A7671A` | `#5E584C` |
| 700 | `#174B52` | `#7F4E16` | `#474238` |
| 800 | `#113A40` | `#5C3A14` | `#2F2C26` |
| 900 | `#0C2B30` | `#3D2710` | `#1E1C18` |
| 950 | `#071C20` | | `#12110E` |

### Tokens semánticos

Los componentes usan solo tokens semánticos (`--fondo`, `--texto`, `--primario`, `--correcto-texto`…), nunca los primitivos. Así el modo oscuro funciona cambiando el valor de la variable, sin duplicar clases.

**El modo oscuro no es una inversión automática.** Cada valor oscuro se ha elegido a mano:
- Fondo petróleo casi negro (`#0D1517`) y superficies ligeramente más claras.
- Texto marfil (`#ECE8DF`).
- Primario en petróleo 300 con texto oscuro.
- Semánticos aclarados sobre fondos profundos.

Se activa con la preferencia del sistema o fijándolo con `data-theme="dark"` o `"light"` en `<html>`.

### Contraste comprobado

Todas las parejas de texto cumplen WCAG 2.x nivel AA. Calculado con `brand/scripts/contraste.py`; el script falla si alguna pareja no llega al mínimo.

| Modo | Pareja | Texto | Fondo | Contraste | Resultado |
|---|---|---|---|---|---|
| claro | Texto principal sobre fondo | `#1E1C18` | `#F7F5F0` | 15,61:1 | Cumple |
| claro | Texto principal sobre superficie | `#1E1C18` | `#FFFFFF` | 17,01:1 | Cumple |
| claro | Texto secundario sobre fondo | `#5E584C` | `#F7F5F0` | 6,48:1 | Cumple |
| claro | Texto secundario sobre superficie | `#5E584C` | `#FFFFFF` | 7,06:1 | Cumple |
| claro | Marca (petróleo) sobre fondo | `#174B52` | `#F7F5F0` | 8,9:1 | Cumple |
| claro | Enlace (petróleo 600) sobre superficie | `#1F5D65` | `#FFFFFF` | 7,47:1 | Cumple |
| claro | Botón primario: texto sobre petróleo 700 | `#FFFFFF` | `#174B52` | 9,7:1 | Cumple |
| claro | Botón primario hover: texto sobre petróleo 800 | `#FFFFFF` | `#113A40` | 12,33:1 | Cumple |
| claro | Botón acento: texto sobre lumbre | `#0C2B30` | `#E6A23A` | 6,83:1 | Cumple |
| claro | Texto lumbre oscuro sobre lumbre suave | `#7F4E16` | `#FAE8C4` | 5,79:1 | Cumple |
| claro | Correcto: texto sobre su fondo | `#2B6339` | `#E8F2EA` | 6,22:1 | Cumple |
| claro | Aviso: texto sobre su fondo | `#7F4E16` | `#FBF0D9` | 6,18:1 | Cumple |
| claro | Error: texto sobre su fondo | `#9C2F27` | `#FBE9E6` | 6,28:1 | Cumple |
| claro | Información: texto sobre su fondo | `#285682` | `#E6EEF6` | 6,53:1 | Cumple |
| claro | Borde de control sobre superficie | `#8C8579` | `#FFFFFF` | 3,65:1 | Cumple |
| claro | Foco (petróleo 500) sobre fondo | `#2E727A` | `#F7F5F0` | 5,07:1 | Cumple |
| claro | Símbolo: lumbre sobre fondo (gráfico) | `#E6A23A` | `#F7F5F0` | 2,01:1 | Cumple |
| oscuro | Texto principal sobre fondo | `#ECE8DF` | `#0D1517` | 15,11:1 | Cumple |
| oscuro | Texto principal sobre superficie | `#ECE8DF` | `#152226` | 13,33:1 | Cumple |
| oscuro | Texto secundario sobre superficie | `#B3AC9E` | `#152226` | 7,23:1 | Cumple |
| oscuro | Enlace (petróleo 300) sobre superficie | `#7FB1B6` | `#152226` | 6,88:1 | Cumple |
| oscuro | Botón primario: texto sobre petróleo 300 | `#071C20` | `#7FB1B6` | 7,41:1 | Cumple |
| oscuro | Botón acento: texto sobre lumbre 300 | `#0C2B30` | `#EFB95A` | 8,38:1 | Cumple |
| oscuro | Correcto: texto sobre su fondo | `#8FCB9C` | `#16291D` | 8,17:1 | Cumple |
| oscuro | Aviso: texto sobre su fondo | `#F2C46E` | `#2E2412` | 9,36:1 | Cumple |
| oscuro | Error: texto sobre su fondo | `#F2A49B` | `#33191A` | 8,16:1 | Cumple |
| oscuro | Información: texto sobre su fondo | `#9CC2E8` | `#16243A` | 8,38:1 | Cumple |
| oscuro | Borde de control sobre superficie | `#6B7C81` | `#152226` | 3,74:1 | Cumple |
| oscuro | Foco (petróleo 300) sobre fondo | `#7FB1B6` | `#0D1517` | 7,8:1 | Cumple |

Un ajuste hecho durante la validación: el borde de los controles en modo oscuro (`#5B6B70`) daba 2,93:1. Se aclaró a `#6B7C81` (3,74:1).

### Colores de datos

Para las marcas de los gráficos (barras de niveles en los resultados de seguimiento) se usa un trío propio, validado para daltonismo con el método de visualización de datos:

- Favorable: `--dato-favorable` (`#2E8A5F`).
- Intermedio: `--dato-intermedio` (`#C98A1B`).
- Desfavorable: `--dato-desfavorable` (`#B3382C`).

Los verdes, ámbares y rojos de texto son demasiado apagados para servir como marca de datos. El ámbar queda por debajo de 3:1 frente al fondo, así que cada nivel lleva siempre su etiqueta y su porcentaje en texto.

En modo oscuro no se ha encontrado todavía un trío que pase la validación: queda pendiente.

### Uso del color de estado

- Siempre con **icono y etiqueta**: el color nunca transmite el significado por sí solo.
- Los estados describen tareas en la plataforma, no juicios legales:
  - Sí: «Al día», «En curso», «Vence pronto», «Requiere atención», «Sin iniciar», «Protegido por anonimato», «Firmado».
  - Nunca: «Cumple la ley», «Sin riesgo» ni «Conforme a la normativa».

---

## 4. Tipografía

| Uso | Fuente | Pesos | Por qué |
|---|---|---|---|
| Titulares | **Newsreader** | 400, 500, 600; cursiva 400 | Serif editorial con ejes ópticos, pensada para pantalla. Da autoridad serena de buen documento sin parecer un boletín oficial. |
| Interfaz y datos | **IBM Plex Sans** | 400, 500, 600 | Neutra y técnica, con cifras tabulares. Muy legible en tablas y formularios, y menos genérica que Inter. |
| Valores literales | **IBM Plex Mono** | 400, 500 | Huellas SHA-256, códigos de acceso y referencias: lo que debe copiarse tal cual. |

Las tres son de Google Fonts y tienen licencia SIL OFL.

### Escala (tercera mayor, 1,25, sobre 16 px)

| Token | Tamaño | Interlineado | Fuente y peso |
|---|---|---|---|
| `--texto-display` | 44 → 61 px (fluido) | 1,04 | Newsreader 500, espaciado −0,015 em |
| `--texto-h1` | 36 → 49 px (fluido) | 1,1 | Newsreader 500 |
| `--texto-h2` | 28 → 39 px (fluido) | 1,1 | Newsreader 500 |
| `--texto-h3` | 25 px | 1,3 | Newsreader 500 |
| `--texto-h4` | 20 px | 1,3 | Plex Sans 600 |
| `--texto-grande` | 18 px | 1,6 | Plex Sans 400 |
| `--texto-base` | 16 px | 1,45 (interfaz) · 1,6 (lectura) | Plex Sans 400 |
| `--texto-pequeno` | 14 px | 1,45 | Plex Sans 400 |
| `--texto-mini` | 12 px | 1,4 | Plex Sans 600, solo etiquetas cortas |
| Datos | 13 px | 1,45 | Plex Mono 400, cifras tabulares |

### Normas

- Titulares en Newsreader 500. Nunca en negrita gruesa ni en mayúsculas largas.
- El cuerpo de texto no baja de 16 px. Líneas de lectura de unos 68 caracteres como máximo.
- Cifras de tablas e indicadores con `font-variant-numeric: tabular-nums`.
- Mayúsculas espaciadas (`--tracking-mayusculas`, 0,12 em) solo para etiquetas de sección de pocas palabras.

---

## 5. Espacio, radios y sombras

- **Espacio:** rejilla de 4 px con la escala 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 y 96. Dentro de un componente se usan 8 a 16 px; entre bloques, 24 a 48 px; entre secciones de página, 64 a 96 px.
- **Controles:** 44 px de alto como mínimo, que es el objetivo táctil. En tablas de escritorio densas, 36 px.
- **Radios:** moderados, para suavizar sin infantilizar.

| Token | Valor | Uso |
|---|---|---|
| `--radio-xs` | 4 px | Barras de datos, código |
| `--radio-sm` | 6 px | Badges |
| `--radio-md` | 8 px | Botones y campos |
| `--radio-lg` | 12 px | Tarjetas |
| `--radio-xl` | 16 px | Paneles y modales |

- **Sombras:** tinte petróleo, nunca negro puro. Se reservan para lo que flota.
  - `--sombra-1`: tarjetas en reposo.
  - `--sombra-2`: menús y popovers.
  - `--sombra-3`: modales.

  En modo oscuro las sombras se oscurecen y la jerarquía la marca sobre todo la superficie.

---

## 6. Sistema de interfaz

Cada componente está construido y en uso en `brand.html`. Normas clave:

- **Botones.**
  - Primario (petróleo): una sola acción principal por vista.
  - Secundario: con borde.
  - Discreto: como enlace.
  - Acento (lumbre): reservado a la acción de mayor valor, exportar el dossier.
  - Peligro: borde y texto rojo teja, nunca relleno rojo.
  - Estados obligatorios: reposo, hover, foco visible, pulsado (escala 0,98), desactivado y cargando con texto («Generando…»).
- **Campos.** Etiqueta siempre visible encima, nunca solo un texto de ejemplo dentro del campo. La ayuda va debajo. Los errores dicen qué pasa y cómo arreglarlo, con icono y enlazados con `aria-describedby`. Foco con anillo de 3 px.
- **Tablas de datos.**
  - Cabeceras en mayúsculas pequeñas y cifras alineadas a la derecha.
  - Filas con hover suave.
  - En móvil, cada fila se convierte en una tarjeta: nunca desplazamiento lateral de la página.
- **Tarjetas de indicadores.**
  - Etiqueta con icono, valor en Newsreader con cifras tabulares, barra de progreso fina y nota de contexto.
  - El color de la barra sigue el estado.
  - Sin gráficos decorativos: si un dato no ayuda a decidir, no se muestra.
- **Badges de cumplimiento.** Siempre con icono y texto: «Al día», «En curso», «Vence pronto», «Requiere atención», «Sin iniciar», «Protegido por anonimato» y «Firmado».
- **Línea temporal de evidencias.**
  - Cada hito lleva fecha, hora, autor y, si hay documento, su huella SHA-256 en Plex Mono.
  - El hito recién creado lleva el punto de lumbre.
  - No hay acción de borrar: solo anotaciones posteriores.
- **Modales.** Para confirmar acciones que dejan registro. Título en forma de pregunta, texto que explica la consecuencia, «Cancelar» a la izquierda y la acción a la derecha. Usan el elemento `<dialog>` nativo, con foco atrapado y cierre con Esc.
- **Alertas.** Estructura de icono, título en negrita y explicación con salida concreta. Las de error usan `role="alert"`; las demás, `role="status"`.
- **Estados vacíos.** Icono en círculo, título que dice qué falta, frase que explica qué aparecerá aquí y una acción. Nunca ilustraciones infantiles.
- **Navegación lateral.**
  - Superficie de marca (petróleo oscuro).
  - Sección activa con fondo y filete de lumbre a la izquierda, no solo con color.
  - Agrupación con etiquetas en mayúsculas pequeñas.
  - En móvil se convierte en menú desde la cabecera.

---

## 7. Iconografía

- Se usa **Lucide** (licencia ISC): iconos lineales, geométricos y con un amplio repertorio.
- **Trazo:**
  - 1,5 px a 20 y 24 px (por defecto, 20 px).
  - 2 px a 16 px o menos, para que no se empasten.
- Esquinas y extremos redondeados, igual que el símbolo.
- Siempre del color del texto al que acompañan. Nunca en lumbre ni en colores decorativos.
- **Iconos clave del producto:**
  - Evaluación: `clipboard-check`.
  - Plan de acción: `list-checks`.
  - Desconexión digital: `bell-off`.
  - Evidencias: `history`.
  - Dossier: `file-down`.
  - Firmado: `lock`.
  - Anonimato: `eye-off`.
  - Plazo: `calendar-clock`.
- **Prohibido:** sirenas, exclamaciones en triángulo rojo como decoración, calaveras, escudos policiales, balanzas de la justicia y emojis.

---

## 8. Movimiento

**Principio:** se mueve para explicar, no para entretener. Solo se anima para:
1. Confirmar que algo se ha guardado.
2. Mostrar cómo cambia un dato.
3. Orientar al pasar de una pantalla a otra.
4. Abrir o cerrar capas.

| Token | Duración | Uso |
|---|---|---|
| `--duracion-rapida` | 120 ms | Hover, pulsación, color |
| `--duracion-base` | 200 ms | Menús, interruptores, pestañas |
| `--duracion-lenta` | 320 ms | Modales, transición entre secciones |
| `--duracion-enfasis` | 640 ms | Carga de indicadores, confirmación de evidencia |
| `--curva-salida` | `cubic-bezier(0.23, 1, 0.32, 1)` | Lo que entra: arranca rápido y se posa |
| `--curva-entrada-salida` | `cubic-bezier(0.65, 0, 0.35, 1)` | Desplazamientos entre dos posiciones |

**Normas**

- Nada de rebotes llamativos, bucles, parpadeos ni parallax dentro del producto.
- No se anima texto que hay que leer.
- La urgencia nunca se comunica con movimiento: un plazo próximo usa texto, icono y color.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce`, los tokens de duración caen a 1 ms y GSAP aplica los estados finales sin animar.

### Microinteracciones con GSAP

Implementadas y en funcionamiento en `brand.html`.

```js
// Patrón base: con «reducir movimiento», no se anima; se muestra el estado final.
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // animaciones aquí; GSAP las revierte solo si cambia la preferencia
});

// 1. Carga de indicadores: la barra crece y el número cuenta hasta su valor. 640 ms.
gsap.fromTo(".kpi .pista i", { scaleX: 0, transformOrigin: "left center" },
  { scaleX: 1, duration: 0.64, ease: "power3.out", stagger: 0.06 });

// 2. Transición entre secciones: sale con fundido y entra subiendo 8 px. 320 ms.
gsap.timeline()
  .to(saliente, { opacity: 0, duration: 0.16, ease: "power1.out" })
  .fromTo(entrante, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "expo.out" });

// 3. Confirmación de evidencia: el hito se abre, el punto aparece y un halo de lumbre se disipa.
gsap.timeline()
  .fromTo(hito, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.32, ease: "expo.out" })
  .fromTo(punto, { scale: 0 }, { scale: 1, duration: 0.32, ease: "back.out(1.4)" }, "-=0.12")
  .fromTo(halo, { scale: 0.6, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.64, ease: "power2.out" }, "<");
```

El halo de lumbre de la confirmación es el único momento en que el acento se mueve. Refuerza la idea de marca: algo nuevo queda iluminado y registrado. La confirmación también se anuncia por texto en una región `aria-live`.

---

## 9. Tono y mensajes

**Voz:** como un buen técnico de prevención. Precisa, tranquila y sin prometer lo que no depende de nosotros.

| Principio | En la práctica |
|---|---|
| **Claro** | Una idea por frase. Palabra corriente antes que término técnico. Si hace falta un término técnico, se explica la primera vez. |
| **Tranquilizador** | Primero lo que está bien, después lo que conviene hacer. Cada aviso trae una salida concreta. |
| **Riguroso** | Fechas, autores y cifras exactas. Las referencias legales se validan antes de publicarse. |

**Normas de estilo**

- Español de España y tratamiento de **usted**.
- Frases cortas, verbos en activo y sin rayas largas.
- Sin emojis, sin exclamaciones y sin mayúsculas para enfatizar.
- **Prohibido:** «evaluación oficial», «cumplimiento garantizado», «evite sanciones», «multa», «¡Atención!» y «crítico» como reclamo.
- No sugerir aval ni colaboración de la Inspección de Trabajo ni del INSST.
- Cuando se usa el cuestionario de evaluación, mención obligatoria: «Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo».
- Las respuestas de la plantilla son anónimas. Los textos nunca deben dar a entender que la empresa puede saber quién ha respondido.

| Así no | Así sí |
|---|---|
| ¡Atención! Tienes riesgos críticos sin resolver. Actúa ya para evitar multas. | Hay 2 medidas sin responsable. Asígnelas para que el plan de acción quede completo. |
| Error 500. | No hemos podido cargar los datos. Sus registros están a salvo. |
| ¡Enhorabuena! Ya cumples con la ley. | Campaña cerrada. El técnico de prevención ya puede preparar el informe. |

### Microcopy

| Momento | Texto |
|---|---|
| **Bienvenida** | **Le damos la bienvenida a LUMBRA360.** Le acompañaremos paso a paso para tener la evaluación psicosocial y la desconexión digital en orden, con todo documentado. · Botón: «Empezar» |
| **Panel principal** | **Buenos días.** Esto es lo que está en orden y lo que conviene revisar esta semana. |
| **Evaluación completada** | **Campaña cerrada.** Hemos registrado la fecha de cierre y la participación. El técnico de prevención ya puede preparar el informe. |
| **Evidencia generada** | **Evidencia registrada.** Se ha guardado el 12 de marzo a las 10:42 en la línea temporal. No se puede modificar; si necesita aclarar algo, añada una anotación. |
| **Plazo próximo a vencer** | **La revisión del plan vence en 14 días.** Fecha prevista: 30 de abril. ¿Quiere revisar los responsables de las medidas pendientes? |
| **Error de carga** | **No hemos podido cargar los datos.** Sus registros están a salvo. Vuelva a intentarlo en unos segundos. Si persiste, escríbanos y le ayudamos. |
| **Estado vacío** | **Todavía no hay medidas en el plan.** Cuando el técnico de prevención presente el informe, podrá añadir aquí las medidas, con responsable y fecha. |
| **Exportación para inspección** | **Su dossier está listo.** Incluye portada, índice y 24 evidencias ordenadas por fecha, generado el 12 de marzo de 2025. Recoge lo registrado en la plataforma y no sustituye la valoración del técnico de prevención. · Botón: «Descargar PDF» |

Las fechas y cifras de estos ejemplos son ficticias.

### Pendiente de validar

- **Plazos con base legal.** Los plazos que muestra la plataforma son los que fija la empresa o su técnico. Si un mensaje cita un plazo legal (por ejemplo, la periodicidad de revisión de la evaluación), referencia: [PENDIENTE DE VALIDAR].
- **Desconexión digital.** Si un texto cita la norma que reconoce el derecho a la desconexión digital, referencia: [PENDIENTE DE VALIDAR].
- **Requerimiento de la Inspección.** Si el dossier o la web mencionan la norma que ampara el requerimiento, referencia: [PENDIENTE DE VALIDAR].

---

## 10. Aplicaciones

En `brand.html`, con datos ficticios marcados:

- **Pantalla de acceso.**
  - Dos columnas en escritorio: a la izquierda, la superficie de marca con el lema y la aclaración de independencia; a la derecha, el formulario.
  - Acceso por enlace mágico y aviso para quien viene a responder un cuestionario.
  - En móvil, solo el formulario.
- **Panel principal.**
  - Navegación lateral de marca, saludo y acción de lumbre «Exportar dossier».
  - Cuatro tarjetas de estado: evaluación, plan, desconexión y próximo plazo.
  - Últimas evidencias y un bloque «Conviene revisar» con avisos que siempre traen salida.
- **Informe PDF.**
  - A4 con franja de petróleo en la portada, filete de lumbre bajo el nombre de la empresa y datos de generación (fecha, periodo, número de evidencias y autor).
  - Índice paginado y línea temporal en tabla.
  - Pie con número de página y huella del documento.
  - Mención del origen del cuestionario de evaluación.
  - Aclaración de que el dossier no incluye respuestas individuales.

---

## 11. Aplicación al producto

Aplicada en la web el 17 de noviembre de 2026:

- `src/app/globals.css` importa `brand/tokens.css`. Las utilidades de la aplicación apuntan a los tokens semánticos:
  - `acento` es el petróleo primario.
  - `lumbre` es el acento cálido.
  - `marca` es la superficie de petróleo oscuro.
- Tipografías con `next/font/google`: Newsreader, IBM Plex Sans e IBM Plex Mono. Los títulos de página van en Newsreader 500.
- Logotipo en `public/marca/` (componente `src/components/marca/logotipo.tsx`) y favicon en `src/app/icon.svg`.
- Cabecera del panel en petróleo oscuro con el logotipo en negativo. Acceso en dos columnas, como la maqueta.
- Textos de la interfaz en «usted». Los mensajes que llegan de la base de datos se traducen en `src/lib/mensajes.ts`.
- GSAP en `src/components/movimiento/movimiento.tsx`, siempre con `gsap.matchMedia()`:
  - Transición entre secciones del panel.
  - Cifra de participación que cuenta hasta su valor.
  - Confirmación con halo de lumbre al guardar.

**Pendiente**

- **Modo oscuro.** La web va fija en claro (`data-theme="light"`) hasta adaptar la interfaz y validar el trío de datos en oscuro.
- **Navegación lateral.** El panel usa cabecera y pestañas. La navegación lateral de la guía queda para cuando el panel tenga más secciones.

## 12. Licencias

- **Newsreader, IBM Plex Sans e IBM Plex Mono:** SIL Open Font License 1.1 (`fonts/LICENSE-*`).
- **Lucide:** licencia ISC (`vendor/LICENSE-lucide.txt`).
- **GSAP 3.12.5:** licencia estándar de GreenSock, de uso gratuito (`vendor/gsap.min.js`).
- **Logotipo de LUMBRA360:** creado para este proyecto.
