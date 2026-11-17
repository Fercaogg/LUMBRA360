# LUMBRA360

Plataforma web de evaluación psicosocial continua y desconexión digital con evidencias fechadas, para pymes y para los partners que las gestionan (servicios de prevención ajenos y gestorías).

Lema de diseño: cumplir y cuidar sin vigilar.

> El nombre del producto vive en una sola constante: `src/config/marca.ts`.

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base, roles y multiempresa | Hecha |
| 2 | Evaluación psicosocial | Hecha |
| 3 | Desconexión digital | Pendiente |
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

## Probar la fase 2

Los datos de demostración traen un cuestionario ficticio publicado y una campaña ya cerrada con 18 respuestas ficticias.

1. Entra como `empresa-1@demo.invalid` y abre «Campañas y pulsos». La campaña de demostración muestra resultados por factores. El grupo de 3 respuestas aparece protegido.
2. Prepara una campaña nueva, genera códigos y ábrela.
3. En una ventana privada, abre `http://localhost:3000/responder` y responde con un código. Hacen falta 5 respuestas para ver resultados.
4. Cierra la campaña. Los resultados solo se ven con la campaña cerrada.
5. Prepara el informe. Entra como `tecnico-a@demo.invalid` para añadir observaciones, firmarlo y descargar el PDF.
6. En «Plan de acción», añade una medida y cambia su estado. El historial guarda cada cambio.
7. Como `admin@demo.invalid`, en Administración, Instrumentos, puedes crear un cuestionario. No se publica sin confirmar la licencia.

## Anonimato: qué garantiza la base de datos

- Las respuestas no llevan usuario, correo, IP ni hora. Solo el día.
- Ningún rol lee las tablas de respuestas ni de códigos. Tampoco administración.
- Los resultados solo salen de funciones agregadas, con la campaña cerrada.
- Mínimo de 5 respuestas por grupo, también en filtros combinados. Si un grupo oculto pudiera deducirse por resta, se oculta además el grupo visible más pequeño.
- Un código de un solo uso no guarda relación con la respuesta ni la fecha de uso.
- Informes firmados y evidencias no se pueden modificar ni borrar.

## Tests

```bash
npm run test:rls
```

```bash
npm run test:e2e
```

- `test:rls` demuestra contra la base de datos local el aislamiento entre empresas y partners y las reglas de anonimato.
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
