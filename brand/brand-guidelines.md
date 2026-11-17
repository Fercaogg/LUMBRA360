# LUMBRA360 · Guía de marca

Versión 2.0 · Dirección «Galería de luz»

LUMBRA360 une «lumbre» y visión de 360°. La idea central es la claridad: iluminar lo que antes estaba en zona gris (riesgos, cumplimiento y pruebas) para que la empresa sienta que **tiene todo en orden y lo puede demostrar**.

Esta guía explica el porqué de cada decisión y las normas de uso. Los valores exactos están en `DESIGN.md` y `tokens.css`, y todo se ve en funcionamiento en `brand.html`.

**Archivos**

| Archivo | Contenido |
|---|---|
| `DESIGN.md` | Sistema de diseño: tokens, componentes y normas. Fuente de verdad. |
| `brand.html` | El sistema completo, visual e interactivo. Funciona sin conexión. |
| `tokens.css` | Variables CSS, modo claro y oscuro, movimiento reducido. |
| `tailwind.config.ts` · `tailwind.theme.css` | El tema en formato de configuración y para Tailwind 4. |
| `logo/` | Logotipo en SVG: horizontal, vertical, símbolo fino y símbolo pequeño, en positivo y negativo, y favicon. |
| `scripts/` | Generadores reproducibles: logotipos, contraste y página. |

**Skills.** El encargo pedía aplicar taste skill, design dna, ui ux pro max, motion design skill, gsap skill y genjutsu. Ninguna estaba instalada en la sesión en que se creó este sistema. Se han aplicado sus criterios de forma manual:
- Tokens primero (design dna).
- Patrones accesibles comprobados por script (ui ux pro max).
- Filtro estético en cada decisión (taste).
- Movimiento solo con propósito y siempre con GSAP y `matchMedia` (motion y gsap).

Conviene revisarlo con esas skills cuando estén disponibles.

**Referencias.** Se han usado dos análisis de terceros solo como criterio:
- Una galería de producto, para la identidad, el aire y la tipografía.
- Una plataforma financiera, para las tablas, los indicadores y los estados.

No se reutilizan sus colores, tipografías, nombres ni logotipos. El detalle está en `DESIGN.md`.

---

## 1. Dirección creativa

| | Concepto | Paleta | Tipografía | Símbolo |
|---|---|---|---|---|
| **A · Galería de luz** | Una sala blanca y serena donde la información queda expuesta con calma, como una obra iluminada. | Blanco y pergamino cálido, tinta petróleo casi negra, lumbre ámbar como único acento. | Newsreader ligera a gran tamaño; IBM Plex Sans con cifras tabulares. | Anillo fino de 360° con punto de lumbre central. |
| B · Haz | Un haz de luz que barre la zona gris. | Blanco, gris piedra, tinta grafito, ámbar. | Grotesca compacta e Inter. | Semicírculo con una cuña de luz. |
| C · Amanecer documental | El papel y el sello de un archivo histórico. | Crema, sepia, terracota. | EB Garamond y una sans humanista. | Arco de sol sobre una línea. |

**Se elige la A**, por cuatro motivos:
- Es la que mejor responde a la referencia principal: mucho aire, una sola tinta, un único acento y la tipografía como protagonista.
- Convierte el nombre en sistema: el anillo es la visión 360°, el punto es la lumbre y el blanco es la claridad.
- Mantiene el símbolo que ya funciona a 16 px.
- La serif ligera da presencia y serenidad sin parecer la Administración.

Las otras dos se descartan:
- La B, con Inter y grotesca compacta, cae en el aspecto de plantilla SaaS que hay que evitar.
- La C resulta nostálgica y poco digital para un producto que debe transmitir rigor actual.

**Qué cambia respecto a la versión 1:**
- Se pasa del papel con bloques de petróleo a un lienzo blanco con mucho aire.
- La tinta pasa a ser el único color de acción.
- Los titulares crecen y se aligeran (Newsreader 300).
- Los botones adoptan forma de cápsula.
- Las sombras de tarjeta desaparecen.

---

## 2. Logotipo

### Construcción

- **Anillo:** circunferencia de radio 17 y trazo 3 sobre una rejilla de 48 × 48, con extremos redondeados. Representa la visión completa.
- **Apertura:** entre −38° y −82°, arriba a la derecha. Indica transparencia: nada queda cerrado ni oculto.
- **Lumbre:** punto central de radio 4 en `#E6A23A`. Es la luz que permite ver con claridad.
- **Logotipo tipográfico:** «LUMBRA» en Newsreader 400 con espaciado de 0,22 em y «360» en tinta 500. La palabra muy espaciada en mayúsculas da calma y carácter editorial. El «360» en un tono más claro funciona como segunda voz sin competir.
- **Dos dibujos del símbolo:** el **fino**, desde 32 px, y el **pequeño** (trazo 6 y punto 5) para el favicon y de 16 a 32 px. Un trazo fino desaparece a tamaño pequeño; el pequeño mantiene la lectura.

Todo va convertido a trazados. Se regenera con:

```bash
python3 brand/scripts/generar_logos.py
```

### Versiones

| Archivo | Uso |
|---|---|
| `lumbra360-horizontal-positivo.svg` | Uso principal sobre blanco o pergamino |
| `lumbra360-horizontal-negativo.svg` | Sobre tinta o fondos oscuros |
| `lumbra360-vertical-*.svg` | Espacios cuadrados: portadas, presentaciones, redes |
| `lumbra360-simbolo-*.svg` | Símbolo fino, desde 32 px |
| `lumbra360-simbolo-pequeno-*.svg` | Símbolo pequeño, de 16 a 32 px |
| `favicon.svg` | Pestaña del navegador. Cambia con el modo oscuro del sistema. |

**Colores del logotipo**
- Positivo: anillo y «LUMBRA» en tinta 900 `#0D262B`, «360» en tinta 500 `#356C74` y punto `#E6A23A`.
- Negativo: marfil `#EEEBE5`, «360» en tinta 200 `#B0CACD` y punto `#EFB95A`.

### Normas

- **Área de protección:** la mitad de la altura del símbolo en todo el contorno.
- **Tamaño mínimo:** símbolo pequeño a 16 px; logotipo horizontal a 140 px de ancho en pantalla y 35 mm en papel.
- **No:**
  - Deformar, cambiar colores, girar, añadir sombras o contornos.
  - Colocarlo sobre fotografías o fondos con poco contraste.
  - Separar el punto del anillo o cambiar la tipografía.
- **En texto corrido:** «LUMBRA360», sin espacio.

---

## 3. Color

**Racional**
- **Blanco y pergamino.** El aire es el material principal. Transmiten orden y calma, y dejan que la información se vea.
- **Tinta petróleo casi negra.** Un único tono para texto y acción, como una pluma estilográfica. Es más cálida y propia que el negro puro y no es el azul corporativo de siempre.
- **Lumbre ámbar.** La luz del concepto, como mucho en torno al 5 % de la pantalla:
  - El punto del símbolo.
  - Exportar el dossier.
  - La evidencia recién registrada.
  - Algún filete de énfasis.
- **Semánticos.** Verde, ámbar oscuro, rojo teja y azul, siempre con icono y etiqueta. El rojo solo aparece cuando algo falla de verdad.

**Proporción orientativa:** blanco y pergamino en torno al 80 %, tinta en torno al 15 % y lumbre en torno al 5 %.

### Contraste comprobado

Todas las parejas de texto cumplen WCAG 2.x nivel AA. Calculado con `brand/scripts/contraste.py`; el script falla si alguna pareja no llega al mínimo.

| Modo | Pareja | Texto | Fondo | Contraste | Resultado |
|---|---|---|---|---|---|
| claro | Texto (tinta) sobre blanco | `#0B1A1D` | `#FFFFFF` | 17,8:1 | Cumple |
| claro | Texto (tinta) sobre pergamino | `#0B1A1D` | `#F7F5F1` | 16,35:1 | Cumple |
| claro | Texto secundario sobre blanco | `#5C5850` | `#FFFFFF` | 7,08:1 | Cumple |
| claro | Texto secundario sobre pergamino | `#5C5850` | `#F7F5F1` | 6,5:1 | Cumple |
| claro | Texto terciario sobre blanco | `#706A61` | `#FFFFFF` | 5,35:1 | Cumple |
| claro | Enlace (tinta 600) sobre blanco | `#24555D` | `#FFFFFF` | 8,29:1 | Cumple |
| claro | Botón primario: blanco sobre tinta 900 | `#FFFFFF` | `#0D262B` | 15,8:1 | Cumple |
| claro | Botón primario pulsado: blanco sobre tinta 800 | `#FFFFFF` | `#13343A` | 13,29:1 | Cumple |
| claro | Botón de lumbre: tinta sobre lumbre | `#0D262B` | `#E6A23A` | 7,22:1 | Cumple |
| claro | Lumbre texto sobre lumbre suave | `#7F4E16` | `#FAE8C4` | 5,79:1 | Cumple |
| claro | Tinta suave: texto sobre su fondo | `#13343A` | `#EFF4F4` | 11,97:1 | Cumple |
| claro | Correcto: texto sobre su fondo | `#2B6339` | `#E8F2EA` | 6,22:1 | Cumple |
| claro | Aviso: texto sobre su fondo | `#7F4E16` | `#FBF0D9` | 6,18:1 | Cumple |
| claro | Error: texto sobre su fondo | `#9C2F27` | `#FBE9E6` | 6,28:1 | Cumple |
| claro | Información: texto sobre su fondo | `#285682` | `#E6EEF6` | 6,53:1 | Cumple |
| claro | Borde de control sobre blanco | `#8A8378` | `#FFFFFF` | 3,75:1 | Cumple |
| claro | Foco (tinta 500) sobre blanco | `#356C74` | `#FFFFFF` | 5,92:1 | Cumple |
| claro | Texto sobre superficie de marca | `#EEEBE5` | `#0D262B` | 13,28:1 | Cumple |
| oscuro | Texto sobre fondo | `#EEEBE5` | `#0B1214` | 15,89:1 | Cumple |
| oscuro | Texto sobre superficie | `#EEEBE5` | `#121C1F` | 14,57:1 | Cumple |
| oscuro | Texto secundario sobre superficie | `#B4AEA3` | `#121C1F` | 7,86:1 | Cumple |
| oscuro | Texto terciario sobre superficie | `#968F84` | `#121C1F` | 5,41:1 | Cumple |
| oscuro | Enlace (tinta 300) sobre superficie | `#82AAAF` | `#121C1F` | 6,87:1 | Cumple |
| oscuro | Botón primario: tinta sobre marfil | `#0B1A1D` | `#EEEBE5` | 14,96:1 | Cumple |
| oscuro | Botón de lumbre: tinta sobre lumbre 300 | `#0D262B` | `#EFB95A` | 8,85:1 | Cumple |
| oscuro | Tinta suave: texto sobre su fondo | `#CFE0E2` | `#1A2B30` | 10,76:1 | Cumple |
| oscuro | Correcto: texto sobre su fondo | `#8FCB9C` | `#16291D` | 8,17:1 | Cumple |
| oscuro | Aviso: texto sobre su fondo | `#F2C46E` | `#2E2412` | 9,36:1 | Cumple |
| oscuro | Error: texto sobre su fondo | `#F2A49B` | `#33191A` | 8,16:1 | Cumple |
| oscuro | Información: texto sobre su fondo | `#9CC2E8` | `#16243A` | 8,38:1 | Cumple |
| oscuro | Borde de control sobre superficie | `#6E7F84` | `#121C1F` | 4,15:1 | Cumple |
| oscuro | Foco (tinta 300) sobre fondo | `#82AAAF` | `#0B1214` | 7,49:1 | Cumple |

### Uso del color de estado

Los estados describen tareas en la plataforma, no juicios legales:
- Sí: «Al día», «En curso», «Vence pronto», «Requiere atención», «Sin iniciar», «Protegido por anonimato», «Firmado».
- Nunca: «Cumple la ley», «Sin riesgo» ni «Conforme a la normativa».

---

## 4. Tipografía

- **Newsreader** para titulares.
  - En peso 300 y a 56–80 px, con interletraje −0,03 em, da a cada página la presencia tranquila de una galería.
  - Desde h1 hacia abajo pasa a 400 para mantener la legibilidad.
- **IBM Plex Sans** para interfaz, lectura y datos.
  - Lectura a 17 px, interfaz a 16 y datos a 14 con cifras tabulares.
  - Solo pesos 400 y 600: la jerarquía la hacen el tamaño y el aire.
- **IBM Plex Mono** para valores literales: huellas, códigos y referencias.

Las tres son libres (SIL OFL), de Google Fonts. La escala completa está en `DESIGN.md`.

---

## 5. Espacio, forma y elevación

- **Espacio:** rejilla de 4 px. Entre secciones de 80 a 128 px, para que cada idea tenga su sala.
- **Contenedores:** textos centrados a 736 px de ancho y composición a 1152 px.
- **Dos gramáticas de forma:**
  - **Cápsula para actuar:** botones y estados.
  - **Rectángulo suave para contener:** campos de 8 px, tarjetas de datos de 12 px, tarjetas de presentación de 20 px y modales de 28 px.
- **Elevación mínima.** Las tarjetas no llevan sombra: se separan con aire, filete o cambio de fondo. Solo flotan los menús y los modales.

---

## 6. Interfaz

Las especificaciones están en `DESIGN.md` y los ejemplos en `brand.html`. Las decisiones con más peso:

- **Un solo botón primario por vista,** de tinta. El botón de lumbre es exclusivo de la exportación del dossier.
- **Tablas de informe financiero:**
  - Cabeceras discretas en mayúsculas espaciadas.
  - Cifras tabulares a la derecha y filetes de 1 px.
  - Sin rayado cebra.
  - En móvil, tarjetas.
- **Indicadores** con la cifra en Newsreader, una barra fina y una nota de contexto. Si un dato no ayuda a decidir, no se muestra.
- **Línea temporal de evidencias** con fecha, hora, autor y huella. No hay borrado: solo anotaciones.
- **Navegación lateral en pergamino:** la sección activa en blanco, con un filete de lumbre.

---

## 7. Iconografía

- **Lucide**, trazo de 1,5 px a 20 y 24 px, y de 2 px a 16 px.
- En el color del texto al que acompaña.
- Sin iconos de alarma, sirenas, escudos policiales ni balanzas.
- **Iconos del producto:**
  - Evaluación: `clipboard-check`.
  - Plan: `list-checks`.
  - Desconexión: `bell-off`.
  - Evidencias: `history`.
  - Dossier: `file-down`.
  - Firmado: `lock`.
  - Anonimato: `eye-off`.
  - Plazo: `calendar-clock`.

---

## 8. Movimiento

**Se mueve para explicar, no para entretener.** Solo se anima para:
- Confirmar que algo se ha guardado.
- Mostrar cómo cambia un dato.
- Orientar al pasar de una sección a otra.

**Normas**
- Sin rebotes, bucles ni parpadeos.
- La urgencia nunca se comunica con movimiento.
- Con «reducir movimiento», todo ocurre al instante (`gsap.matchMedia()`).

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // 1. Carga de indicadores: la cifra cuenta y la barra crece. 720 ms.
  gsap.fromTo(".kpi .pista i", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.72, ease: "power3.out", stagger: 0.06 });
  // 2. Transición entre secciones: fundido y 12 px hacia arriba. 360 ms.
  gsap.fromTo(seccion, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, ease: "expo.out" });
  // 3. Confirmación de evidencia: se abre la entrada, aparece el nodo y un halo de lumbre se disipa.
  gsap.timeline()
    .fromTo(entrada, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.36, ease: "expo.out" })
    .fromTo(nodo, { scale: 0 }, { scale: 1, duration: 0.36, ease: "back.out(1.4)" }, "-=0.12")
    .fromTo(halo, { scale: 0.6, opacity: 0.9 }, { scale: 2, opacity: 0, duration: 0.72, ease: "power2.out" }, "<");
});
```

---

## 9. Tono y mensajes

**Voz:** como un buen técnico de prevención. Precisa, tranquila y sin prometer lo que no depende de nosotros.

| Principio | En la práctica |
|---|---|
| **Claro** | Una idea por frase. Palabra corriente antes que término técnico. |
| **Tranquilizador** | Primero lo que está bien, después lo que conviene hacer. Cada aviso trae una salida. |
| **Riguroso** | Fechas, autores y cifras exactas. Las referencias legales se validan antes de publicarse. |

**Normas de estilo**

- Español de España y tratamiento de **usted**.
- Frases cortas, verbos en activo y sin rayas largas.
- Sin emojis, sin exclamaciones y sin mayúsculas para enfatizar.
- **Prohibido:** «evaluación oficial», «cumplimiento garantizado», «evite sanciones», «multa» o «crítico» como reclamo.
- No sugerir aval ni colaboración de la Inspección de Trabajo ni del INSST.
- Cuando se usa el cuestionario de evaluación del INSST, mención obligatoria: «Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo».

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

- Plazos con base legal, por ejemplo la periodicidad de revisión de la evaluación: [PENDIENTE DE VALIDAR].
- Norma que reconoce el derecho a la desconexión digital: [PENDIENTE DE VALIDAR].
- Norma que ampara un requerimiento de la Inspección de Trabajo: [PENDIENTE DE VALIDAR].

---

## 10. Aplicaciones

En `brand.html`, con datos ficticios marcados:

- **Landing:**
  - Héroe de gran tipografía sobre blanco.
  - Secciones que alternan pergamino y una pausa en tinta.
  - Un único botón primario por sección.
- **Acceso:** una sola columna centrada sobre blanco, con el símbolo, un titular en Newsreader y el formulario. Nada más.
- **Panel principal:**
  - Navegación lateral en pergamino y saludo en Newsreader.
  - Indicadores con filete.
  - Tabla densa de empresas o evidencias.
  - Acción de lumbre para exportar.
- **Informe PDF:**
  - Portada blanca con mucho aire, logotipo, nombre de la empresa en Newsreader ligera y filete de lumbre.
  - Datos de generación en tabla.
  - Índice y línea temporal.
  - Pie con número de página y huella.

---

## 11. Aplicación al producto

La web usa `brand/tokens.css` desde la versión 1. Los nombres de los tokens se han mantenido, así que la aplicación hereda este sistema:
- La tinta como color de acción.
- Los nuevos neutros y radios.
- El logotipo y el favicon nuevos.

**Pendiente**
- Pasar la landing y el panel a la composición de la versión 2: más aire, titulares grandes en Newsreader ligera, botones en cápsula y navegación lateral en pergamino.
- Validar los colores de datos y la interfaz en modo oscuro.

## 12. Licencias

- **Newsreader, IBM Plex Sans e IBM Plex Mono:** SIL Open Font License 1.1 (`fonts/`).
- **Lucide:** licencia ISC (`vendor/LICENSE-lucide.txt`).
- **GSAP 3.12.5:** licencia estándar de GreenSock, de uso gratuito (`vendor/gsap.min.js`).
- **Logotipo de LUMBRA360:** creado para este proyecto.
