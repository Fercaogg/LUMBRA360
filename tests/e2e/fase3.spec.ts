import { expect, test } from "@playwright/test";
import { DEMO, entrar, reiniciarLimites, salir } from "./ayudas";

test.describe.configure({ mode: "serial" });
test.beforeAll(() => reiniciarLimites());

const PDF = { name: "acta.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% acta de prueba\n%%EOF\n") };

test("política: plantilla, borrador, aprobación, acuse nominal, audiencia y formación", async ({ page, browser }, info) => {
  test.skip(info.project.name !== "movil", "La empresa demo solo admite un borrador a la vez: el recorrido se hace una vez.");
  const base = `/panel/empresa/${DEMO.empresa3}/desconexion`;

  await entrar(page, "empresa-3@demo.invalid");
  await page.goto(base);
  await page.getByLabel("Plantilla").selectOption({ index: 0 });
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page.getByRole("heading", { name: /versión 1/ })).toBeVisible();
  await expect(page.getByText("plantilla de demostración")).toBeVisible();

  // No se aprueba con una sección vacía.
  await page.getByLabel("Nombre y cargo de quien aprueba").fill("Dirección de prueba");
  await page.getByLabel("He revisado el texto completo").check();
  await page.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Complete todas las secciones antes de aprobar.")).toBeVisible();

  const cuerpos = page.getByLabel("Texto");
  await cuerpos.nth(1).fill("Texto de prueba de la sección 2.");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();
  await page.getByLabel("Nombre y cargo de quien aprueba").fill("Dirección de prueba");
  await page.getByLabel("He revisado el texto completo").check();
  await page.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Aprobada el")).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar borrador" })).toHaveCount(0);

  await page.goto(base);
  await page.getByRole("button", { name: "Abrir el acuse de lectura" }).click();
  const enlace = (await page.locator("p.font-mono").filter({ hasText: "/acuse/" }).textContent())!.trim();
  const ruta = new URL(enlace).pathname;

  const persona = await browser.newContext({ baseURL: "http://localhost:3000" });
  const p2 = await persona.newPage();
  await p2.goto(ruta);
  await expect(p2.getByRole("heading", { name: "Política de desconexión digital" })).toBeVisible();
  await expect(p2.getByText("Texto de prueba de la sección 2.")).toBeVisible();
  await expect(p2.getByText("Este acuse sí lleva su nombre")).toBeVisible();
  await p2.getByLabel("Nombre y apellidos").fill("Persona de prueba");
  await p2.getByRole("button", { name: "Confirmar lectura" }).click();
  await expect(p2.getByText("Marque la casilla para confirmar la lectura.")).toBeVisible();
  await p2.getByLabel("Nombre y apellidos").fill("Persona de prueba");
  await p2.getByLabel("He leído la política de desconexión digital").check();
  await p2.getByRole("button", { name: "Confirmar lectura" }).click();
  await expect(p2).toHaveURL(/\/acuse\/gracias$/);
  await persona.close();

  await page.goto(base);
  await page.getByText("Acuses registrados (1)").click();
  await expect(page.getByText("Persona de prueba")).toBeVisible();

  await page.getByLabel("Fecha").first().fill("2026-11-10");
  await page.getByLabel("Asistentes").fill("Representante de prueba 1, Representante de prueba 2");
  await page.getByLabel("Acta en PDF (opcional)").setInputFiles(PDF);
  await page.getByRole("button", { name: "Registrar audiencia" }).click();
  await expect(page.getByText("Audiencia registrada.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Descargar el acta/ })).toBeVisible();

  await page.getByLabel("Título").fill("Sesión de sensibilización de prueba");
  await page.getByLabel("Fecha").nth(1).fill("2026-11-12");
  await page.getByLabel("Participantes (opcional)").fill("14");
  await page.getByRole("button", { name: "Registrar formación" }).click();
  await expect(page.getByText("Formación registrada.")).toBeVisible();
  await expect(page.getByText("14 participantes")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar el acuse" }).click();
  await expect(page.getByText("Acuse cerrado. El enlace ya no funciona.")).toBeVisible();
  const tarde = await browser.newContext({ baseURL: "http://localhost:3000" });
  const p3 = await tarde.newPage();
  await p3.goto(ruta);
  await expect(p3.getByRole("heading", { name: "Este enlace no está disponible" })).toBeVisible();
  await tarde.close();
  await salir(page);

  // El partner solo consulta.
  await entrar(page, "gestor-b@demo.invalid");
  await page.goto(base);
  await expect(page.getByText("Usted puede consultarla.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar audiencia" })).toHaveCount(0);
  await expect(page.getByText("Sesión de sensibilización de prueba")).toBeVisible();
});

test("administración: una plantilla real no se publica sin revisión jurídica", async ({ page }, info) => {
  const nombre = `Plantilla prueba ${info.project.name}-${Date.now()}`;
  await entrar(page, "admin@demo.invalid");
  await page.goto("/admin/plantillas");
  await expect(page.getByText("[PENDIENTE: revisión jurídica]").first()).toBeVisible();
  await page.getByLabel("Nombre").fill(nombre);
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
  await page.getByLabel("Título").fill("Sección de prueba");
  await page.getByRole("button", { name: "Añadir sección" }).click();
  await expect(page.getByRole("heading", { name: "Sección de prueba" })).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("La plantilla necesita revisión jurídica antes de publicarse.").filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "Borrar borrador" }).click();
  await expect(page).toHaveURL(/\/admin\/plantillas$/);
});

test("un acuse con enlace inventado no se puede registrar", async ({ browser }) => {
  const contexto = await browser.newContext({ baseURL: "http://localhost:3000" });
  const page = await contexto.newPage();
  await page.goto(`/acuse/${"x".repeat(32)}`);
  await expect(page.getByRole("heading", { name: "Este enlace no está disponible" })).toBeVisible();
  await contexto.close();
});

test("el botón «Demo» abre la empresa de demostración en solo lectura", async ({ browser }) => {
  const visitante = await browser.newContext({ baseURL: "http://localhost:3000" });
  const p = await visitante.newPage();
  await p.goto("/");
  await p.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(p).toHaveURL(/\/demo$/);
  await p.getByRole("link", { name: /Entrar al panel/ }).click();
  await expect(p).toHaveURL(new RegExp(`/panel/empresa/${DEMO.empresa1}$`));
  await expect(p.getByText("Está viendo una demostración con datos ficticios")).toBeVisible();
  await p.goto(`/panel/empresa/${DEMO.empresa1}/plan`);
  await expect(p.getByRole("button", { name: "Añadir medida" })).toHaveCount(0);
  await p.goto(`/panel/empresa/${DEMO.empresa3}`);
  await expect(p.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
  await visitante.close();
});

test("la demo de la plantilla enseña el cuestionario sin guardar nada", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: /Ver el cuestionario/ }).click();
  await expect(page).toHaveURL(/\/demo\/cuestionario$/);
  await expect(page.getByText("no se guarda nada")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cuestionario de demostración (ficticio)" })).toBeVisible();
  await expect(page.getByText("Es voluntario y anónimo")).toBeVisible();

  // Sin responder todo no se envía.
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  await expect(page.getByText("Faltan preguntas por responder.")).toBeVisible();

  const preguntas = page.locator("ol > li fieldset");
  const n = await preguntas.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await preguntas.nth(i).getByRole("radio").first().check();
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Gracias/ })).toBeVisible();
  await expect(page.getByText("En la demostración no se ha guardado nada.")).toBeVisible();
});
