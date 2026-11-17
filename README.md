# LUMBRA360

Plataforma web de evaluación psicosocial continua y desconexión digital con evidencias fechadas, para pymes y para los partners que las gestionan (servicios de prevención ajenos y gestorías).

Lema de diseño: cumplir y cuidar sin vigilar.

> El nombre del producto vive en una sola constante: `src/config/marca.ts`.

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base, roles y multiempresa | Hecha |
| 2 | Evaluación psicosocial (adaptada a FPSICO en la fase 3) | Hecha |
| 3 | Desconexión digital | Hecha |
| 4 | Registro de evidencias | Pendiente |
| 5 | Precios y cobro | Pendiente |
| 6 | Web pública | Pendiente |
| 7 | Módulo de investigación | Pendiente |
| 8 | Seguridad, calidad y despliegue | Pendiente |

Las fechas de cada módulo están en `MODULOS.md`.

## Stack

Next.js 16 (App Router, TypeScript estricto), Supabase (Postgres, Auth, RLS, Storage), Tailwind 4, Vitest y Playwright.

## Instalación en local

Requisitos: Node 22 y Docker (para el Supabase local).

```bash
npm install
```

```bash
npm run db:iniciar
```

```bash
cp .env.example .env.local
```

Rellena `.env.local` con los valores que muestra `npx supabase status` (URL, clave publicable y clave secreta). Después:

```bash
npm run db:reiniciar
```

```bash
npm run dev
```

`db:reiniciar` aplica las migraciones y carga los datos de demostración de `supabase/seed.sql`. Todos son ficticios y van marcados como demo.

## Probar la fase 1

1. Abre `http://localhost:3000/acceso`.
2. Escribe una cuenta de demostración.
3. Abre el buzón local en `http://127.0.0.1:54324` y pulsa el enlace del correo.

| Correo | Rol | Qué ve |
|---|---|---|
| `admin@demo.invalid` | Administración | Todo, más la lista de pendientes |
| `gestor-a@demo.invalid` | Gestor del partner A | Empresas demo 1 y 2 |
| `gestor-b@demo.invalid` | Gestor del partner B | Empresa demo 3 |
| `tecnico-a@demo.invalid` | Técnico de prevención | Solo la empresa demo 1 |
| `empresa-1@demo.invalid` | Empresa | Solo la empresa demo 1, con marca blanca |
| `empresa-3@demo.invalid` | Empresa | Solo la empresa demo 3 |

Cada correo admite 3 enlaces cada 15 minutos. Es el límite de intentos, no un fallo.

## Evaluación psicosocial: FPSICO, sin puntuar en la plataforma

La evaluación se apoya en FPSICO 4.1 del INSST. Los pesos y baremos son información reservada del INSST, así que la plataforma no calcula ninguna puntuación de evaluación. Solo:

1. Presenta el cuestionario anónimo.
2. Exporta las respuestas en un `.txt` para importarlas en la aplicación FPSICO. Solo lo hace el técnico de prevención asignado, con la campaña cerrada y al menos 5 respuestas. Una línea por respuesta, en orden aleatorio, sin identificador, fecha ni grupo.
3. Registra el informe que el técnico genera en la aplicación FPSICO: lo sube en PDF, añade observaciones y lo firma. Queda su huella SHA-256.

Estado actual:

- Banco de ítems de FPSICO vacío. Falta la autorización escrita del INSST.
- El formato exacto del `.txt` está por comprobar en el manual técnico y de uso de FPSICO 4.1. Se configura desde administración y la exportación queda bloqueada hasta confirmarlo.
- Mención obligatoria en informes y web: «Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo». Está en `src/config/atribucion.ts`. Nunca se sugiere aval ni colaboración del INSST.

Los **seguimientos** usan ítems propios y sí se puntúan en la plataforma, con mínimo de 5 por grupo. Nunca se llaman evaluación.

## Probar las fases 2 y 3

Los datos de demostración traen un cuestionario de evaluación ficticio, un seguimiento ficticio ya cerrado con 18 respuestas y una plantilla de política ficticia.

1. Entra como `empresa-1@demo.invalid`. En «Campañas y seguimientos», el seguimiento de demostración muestra resultados por factores. Dos grupos aparecen protegidos.
2. Prepara una evaluación, genera códigos y ábrela. En una ventana privada, responde en `http://localhost:3000/responder`.
3. Cierra la campaña y prepara el informe.
4. Entra como `tecnico-a@demo.invalid`: exporta el `.txt`, sube un PDF como informe, añade una observación y firma.
5. En «Desconexión digital», como empresa o técnico: empieza la política desde la plantilla, complétala, apruébala, abre el acuse y confírmalo desde una ventana privada. Registra una audiencia con su acta y una formación.
6. Como `admin@demo.invalid`, en Instrumentos y Plantillas: una evaluación no se publica sin la autorización del INSST y una plantilla no se publica sin revisión jurídica.

## Anonimato y datos nominales

- Las respuestas no llevan usuario, correo, IP ni hora. Solo el día.
- Ningún rol lee las tablas de respuestas ni de códigos. La única salida individual es la exportación para FPSICO, sin ningún dato identificativo.
- Los resultados de seguimiento salen solo de funciones agregadas, con la campaña cerrada y mínimo de 5, también en filtros combinados y frente a la deducción por resta.
- Las evaluaciones no preguntan el grupo.
- El acuse de lectura de la política sí es nominal (nombre y fecha). Va en tablas separadas, sin relación con los cuestionarios.
- Informes firmados, políticas aprobadas, acuses, audiencias, formaciones y evidencias no se pueden modificar ni borrar.

## Tests

```bash
npm run test:rls
```

```bash
npm run test:e2e
```

- `test:rls` demuestra contra la base de datos local el aislamiento entre empresas y partners, las reglas de anonimato, la exportación y la desconexión digital.
- `test:e2e` recorre la aplicación en móvil y escritorio. Reinicia la base de datos local antes de empezar.

## Usar el proyecto de Supabase en la nube

1. Aplica la migración de `supabase/migrations` (con `npx supabase link` y `npx supabase db push`, o pegándola en el editor SQL). No ejecutes `seed.sql`.
2. En Authentication, URL Configuration: pon la URL del sitio y añade `<URL>/auth/confirmar` a las redirecciones.
3. En Authentication, Emails: usa `supabase/templates/acceso.html` en las plantillas "Magic Link" y "Confirm signup".
4. Crea tu acceso de administración en el editor SQL, con tu correo:

```sql
insert into public.invitaciones (correo, rol) values ('tu-correo', 'admin');
```

5. Pon la clave secreta del proyecto en `SUPABASE_SECRET_KEY`. Nunca en el repositorio ni con prefijo `NEXT_PUBLIC_`.

## Reglas del producto que el código respeta

- Las personas trabajadoras no tienen cuenta. No se guarda su nombre, su correo ni su actividad.
- Empresa y partner ven solo agregados, con un mínimo de 5 respuestas por grupo (fase 2).
- Los permisos se deciden en la base de datos con RLS. La interfaz solo los refleja.
- Lo que falta por confirmar se marca `[PENDIENTE]` en `/admin/pendientes`, nunca en páginas públicas.
