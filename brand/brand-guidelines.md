# LUMBRA360 · Guía de marca

Versión 3.0 · «Tinta y lumbre»

LUMBRA360 une «lumbre», lo que ilumina lo que estaba en zona gris, y «360», la vuelta completa: medir, decidir, actuar y demostrar. La marca transmite una sola idea: **tengo todo en orden y lo puedo demostrar**. Lema: «Cumplir y cuidar sin vigilar.»

Las especificaciones técnicas están en `DESIGN.md` y `tokens.css`. Los ejemplos vivos, en `brand.html` (se abre en el navegador, sin conexión).

## 1. Nombre

- En los textos, siempre **LUMBRA360**, junto y en mayúsculas.
- El logotipo dice «lumbra». El 360 vive en el nombre, no en el dibujo.
- El nombre está en una sola constante del código: `src/config/marca.ts`.

## 2. Logotipo

- **Original:** `logo/fuente/lumbra-original.svg`. No se redibuja. Las versiones se generan con `python3 brand/scripts/logo_lumbra.py`.
- **Versiones:**
  - positivo (tinta sobre blanco);
  - negativo (blanco roto sobre tinta);
  - acento, con la onda en lumbre, solo para piezas de marca.
- **Símbolo:** la onda de la «m». Se usa sola en el favicon (lumbre sobre tinta) y como gráfico en la web.
- **Tamaño mínimo:** 72 px de ancho en pantalla. El símbolo se lee a 16 px.
- **Área de respeto:** la altura de la «l» alrededor del logotipo.
- **No:** deformar, recolorear, añadir sombras o degradados, ni colocarlo sobre la lumbre.

## 3. Color

| Papel | Token | Valor | Uso |
|---|---|---|---|
| Tinta | `--tinta-900` | `#1B1B1B` | Logotipo, botón principal, bloques oscuros |
| Texto | `--tinta-950` | `#111111` | Todo el texto |
| Lumbre | `--lumbre-400` | `#F25A1F` | Único acento: acción de más valor, onda, detalles |
| Lienzo | `--piedra-0` | `#FFFFFF` | Fondo dominante |
| Alterno | `--piedra-50` | `#F5F5F2` | Secciones alternas |
| Error | `--rojo-texto` | `#A3122F` | Carmesí, para no confundirse con la lumbre |

- Sobre la lumbre, el texto va en tinta, nunca en blanco.
- Como texto sobre blanco, solo `--lumbre-600` (`#B83A0E`) o más oscuro.
- Los estados (correcto, aviso, error, información) llevan siempre icono y etiqueta: el color nunca va solo.
- El modo oscuro está definido en `tokens.css` valor a valor.

### Contraste comprobado

Calculado con `brand/scripts/contraste.py`, WCAG 2.x nivel AA.

| Modo | Pareja | Texto | Fondo | Contraste | Resultado |
|---|---|---|---|---|---|
| claro | Texto (tinta 950) sobre blanco | `#111111` | `#FFFFFF` | 18,88:1 | Cumple |
| claro | Texto (tinta 950) sobre piedra 50 | `#111111` | `#F5F5F2` | 17,29:1 | Cumple |
| claro | Texto secundario sobre blanco | `#55554F` | `#FFFFFF` | 7,5:1 | Cumple |
| claro | Texto secundario sobre piedra 50 | `#55554F` | `#F5F5F2` | 6,87:1 | Cumple |
| claro | Texto terciario sobre blanco | `#6B6B65` | `#FFFFFF` | 5,36:1 | Cumple |
| claro | Botón primario: blanco sobre tinta 900 | `#FFFFFF` | `#1B1B1B` | 17,22:1 | Cumple |
| claro | Botón primario pulsado: blanco sobre tinta 800 | `#FFFFFF` | `#272726` | 14,95:1 | Cumple |
| claro | Botón de lumbre: tinta sobre lumbre | `#111111` | `#F25A1F` | 5,63:1 | Cumple |
| claro | Texto de lumbre (600) sobre blanco | `#B83A0E` | `#FFFFFF` | 5,75:1 | Cumple |
| claro | Lumbre suave: texto sobre su fondo | `#9A300C` | `#FFE1D4` | 6,06:1 | Cumple |
| claro | Tinta suave: texto sobre su fondo | `#272726` | `#F4F4F3` | 13,59:1 | Cumple |
| claro | Correcto: texto sobre su fondo | `#1D6440` | `#E6F2EB` | 6,19:1 | Cumple |
| claro | Aviso: texto sobre su fondo | `#7A4B00` | `#FBF0D6` | 6,54:1 | Cumple |
| claro | Error: texto sobre su fondo | `#A3122F` | `#FCE8EC` | 6,66:1 | Cumple |
| claro | Información: texto sobre su fondo | `#24508F` | `#E7EEF8` | 6,87:1 | Cumple |
| claro | Borde de control sobre blanco | `#8A8A84` | `#FFFFFF` | 3,47:1 | Cumple |
| claro | Foco (lumbre 500) sobre blanco | `#D9480F` | `#FFFFFF` | 4,3:1 | Cumple |
| claro | Lumbre como gráfico sobre blanco | `#F25A1F` | `#FFFFFF` | 3,36:1 | Cumple |
| claro | Texto sobre superficie de marca | `#F5F5F2` | `#1B1B1B` | 15,77:1 | Cumple |
| claro | Lumbre sobre superficie de marca | `#F25A1F` | `#1B1B1B` | 5,13:1 | Cumple |
| oscuro | Texto sobre fondo | `#F2F2EF` | `#0E0E0E` | 17,21:1 | Cumple |
| oscuro | Texto sobre superficie | `#F2F2EF` | `#171716` | 15,99:1 | Cumple |
| oscuro | Texto secundario sobre superficie | `#A9A9A3` | `#171716` | 7,6:1 | Cumple |
| oscuro | Texto terciario sobre superficie | `#8C8C86` | `#171716` | 5,31:1 | Cumple |
| oscuro | Botón primario: tinta sobre blanco roto | `#111111` | `#F2F2EF` | 16,84:1 | Cumple |
| oscuro | Botón de lumbre: tinta sobre lumbre | `#111111` | `#FF6A33` | 6,62:1 | Cumple |
| oscuro | Lumbre suave: texto sobre su fondo | `#FF9670` | `#2E170D` | 7,91:1 | Cumple |
| oscuro | Tinta suave: texto sobre su fondo | `#E7E7E5` | `#232322` | 12,7:1 | Cumple |
| oscuro | Correcto: texto sobre su fondo | `#8FCFA8` | `#13261B` | 8,83:1 | Cumple |
| oscuro | Aviso: texto sobre su fondo | `#F0C66E` | `#2B2210` | 9,71:1 | Cumple |
| oscuro | Error: texto sobre su fondo | `#F5A3B3` | `#331219` | 8,68:1 | Cumple |
| oscuro | Información: texto sobre su fondo | `#A3C2EE` | `#14213A` | 8,8:1 | Cumple |
| oscuro | Borde de control sobre superficie | `#6E6E69` | `#171716` | 3,5:1 | Cumple |
| oscuro | Foco (lumbre 300) sobre fondo | `#FF9670` | `#0E0E0E` | 9,05:1 | Cumple |

## 4. Tipografía

- **Instrument Sans** (SIL OFL) para todo: titulares, interfaz y datos, con cifras tabulares.
- **IBM Plex Mono** (SIL OFL) para valores literales (huellas, códigos) e índices de sección.
- **Escala:**
  - héroe 60 px (500);
  - títulos de sección 40 px (500), todos iguales;
  - tarjetas 18 px (600);
  - lectura 17 px;
  - datos 14 px.
- **Interletraje:** cerrado en titulares (−0,03 a −0,035 em).
- **Reglas:**
  - títulos sin punto final (las preguntas conservan sus signos);
  - párrafos de 60 a 70 caracteres, alineados a la izquierda;
  - porcentajes con espacio: 75 %.

## 5. Composición y componentes

- **Retícula:** 1200 px de contenido como máximo, con márgenes de 24 px en móvil y 32 px en escritorio.
- **Espaciado:** múltiplos de 8 px. Mismo espacio vertical entre secciones (96 px en móvil, 160 px en escritorio).
- **Fondos:** alternan blanco y piedra 50. Una sección oscura de tinta puede romper el ritmo una vez por página.
- **Botones:** en cápsula, 48 px de alto, y uno principal por bloque.
- **Tarjetas:** radio de 20 px, filete de 1 px y mismo relleno. Sin sombras decorativas.
- **Panel oscuro (bento):** para lo que debe destacar. Lleva un foco de luz en lumbre que sigue al puntero.
- **Iconos:** Lucide (ISC), trazo 1,75, en casilla de 44 px con fondo `--lumbre-50` cuando acompañan a un título.
- **Capturas:** siempre reales, con datos de demostración marcados, dentro de un portátil o un móvil con el mismo tratamiento.

## 6. Movimiento

- **Herramientas:** GSAP con ScrollTrigger y desplazamiento suave con Lenis.
- **Ligado al scroll:** avanza al bajar y retrocede al subir. Las escenas cuentan el producto: el portátil que se abre con el vídeo de la marca, los papeles que se ordenan, la película de pantallas, los perfiles del bento.
- **Recorridos cortos** (24 a 64 px) y curvas suaves.
- **Si no explica algo, no se anima.** Nunca se comunica urgencia con movimiento.
- **Con «reducir movimiento»:** todo se ve quieto, en su estado final.

## 7. Voz y tono

- **Forma:** español de España, de usted, frases cortas.
- **Fondo:** se explica qué pasa y qué hacer, sin alarma ni tecnicismos.
- **Nunca se escribe:** «evaluación oficial», «cumplimiento garantizado» ni «evita sanciones».
- **No se inventan** cifras, clientes, testimonios ni certificaciones. Los datos de demostración se marcan como ejemplo.
- **No se sugiere** que el INSST avala la plataforma. Donde se usa FPSICO, aparece: «Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo».
- **La IA** no se menciona en textos públicos.

## 8. Logotipos de terceros

- **Dónde aparecen:** Universidad de Salamanca, Fundación General de la Universidad de Salamanca, Prototipos, RIS3 de Castilla y León y YMCA Salamanca, solo en la sección «Respaldo». Van en pequeño y sin alterar.
- **WORKWELL360** es el prototipo del que nace LUMBRA360.
- **Autorización:** cada uso necesita la de su titular. Los orígenes están anotados en `credits.md`.

## 9. Pendiente de validar

- Plazos con base legal, por ejemplo la periodicidad de revisión de la evaluación: [PENDIENTE DE VALIDAR].
- Norma que reconoce el derecho a la desconexión digital: [PENDIENTE DE VALIDAR].
- Norma que ampara un requerimiento de la Inspección de Trabajo: [PENDIENTE DE VALIDAR].
- Colores de gráficos en modo oscuro: [PENDIENTE DE VALIDAR].
