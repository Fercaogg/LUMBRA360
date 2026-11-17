import { expect, test, type Browser } from "@playwright/test";
import { DEMO, entrar, reiniciarLimites, salir } from "./ayudas";

test.describe.configure({ mode: "serial" });
test.beforeAll(() => reiniciarLimites());

test("administración configura un instrumento y no puede publicarlo sin confirmar la licencia", async ({ page }, info) => {
  const nombre = `Instrumento prueba ${info.project.name}-${Date.now()}`;
  await entrar(page, "admin@demo.invalid");
  await page.goto("/admin/instrumentos");
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
  // Next conserva oculta la página anterior: se comprueba solo lo visible.
  await expect(page.getByText("No se puede publicar hasta confirmarlo.").filter({ visible: true })).toBeVisible();

  await page.getByLabel("Nombre de la escala").fill("Escala de prueba");
  await page.getByRole("button", { name: "Añadir escala" }).click();
  for (const valor of ["1", "2"]) {
    await page.getByLabel("Etiqueta de la opción").fill(`Opción de prueba ${valor}`);
    await page.getByLabel("Valor").fill(valor);
    await page.getByRole("button", { name: "Añadir opción" }).click();
    await expect(page.getByText(`Opción de prueba ${valor}`)).toBeVisible();
  }

  await page.getByLabel("Nombre del factor").fill("Factor de prueba");
  await page.getByRole("button", { name: "Añadir factor" }).click();
  await expect(page.getByRole("heading", { name: "Factor de prueba" })).toBeVisible();
  await page.getByLabel("Etiqueta del nivel").fill("Nivel de prueba");
  await page.getByLabel("Desde la puntuación").fill("1");
  await page.getByRole("button", { name: "Añadir nivel" }).click();
  await expect(page.getByText("Nivel de prueba")).toBeVisible();
  await page.getByLabel("Enunciado del ítem").fill("Enunciado de prueba");
  await page.getByRole("button", { name: "Añadir ítem" }).click();
  await expect(page.getByText("Enunciado de prueba")).toBeVisible();

  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Confirma antes el instrumento y su licencia.")).toBeVisible();

  await page.getByLabel("Instrumento y licencia confirmados").check();
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Guardado.")).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Instrumento publicado.")).toBeVisible();
  await expect(page.getByText("ya no está en borrador").filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Añadir ítem" }).filter({ visible: true })).toHaveCount(0);
});

async function responder(browser: Browser, codigo: string, esperado: "gracias" | "usado") {
  // Contexto nuevo: sin sesión ni cookies, como una persona de la plantilla.
  const contexto = await browser.newContext({ baseURL: "http://localhost:3000" });
  const page = await contexto.newPage();
  await page.goto("/responder");
  await page.getByLabel("Código").fill(codigo);
  await page.getByRole("button", { name: "Continuar" }).click();
  if (esperado === "usado") {
    await expect(page.getByRole("heading", { name: "Este código ya se ha usado" })).toBeVisible();
  } else {
    await expect(page.getByText("Es voluntario y anónimo")).toBeVisible();
    await page.getByLabel("Área demo 1").check();
    const preguntas = page.locator("ol > li");
    const total = await preguntas.count();
    expect(total).toBe(4);
    for (let i = 0; i < total; i++) await preguntas.nth(i).getByRole("radio").nth(3).check();
    await page.getByRole("button", { name: "Enviar respuestas" }).click();
    await expect(page).toHaveURL(/\/responder\/gracias$/);
    expect((await contexto.cookies()).length).toBe(0);
  }
  await contexto.close();
}

test("recorrido: campaña, respuestas anónimas, resultados, informe firmado y plan de acción", async ({ page, browser }, info) => {
  const campana = `Campaña prueba ${info.project.name}-${Date.now()}`;
  const medida = `Medida prueba ${info.project.name}-${Date.now()}`;

  // La empresa prepara y abre la campaña.
  await entrar(page, "empresa-1@demo.invalid");
  await page.goto(`/panel/empresa/${DEMO.empresa1}/campanas/nueva`);
  await page.getByLabel("Nombre de la campaña").fill(campana);
  await page.getByLabel("Cuestionario").selectOption({ label: "Cuestionario de demostración (ficticio) (evaluación) · demo" });
  await page.getByLabel("Personas invitadas (opcional)").fill("6");
  await page.getByLabel("Área (demo)").check();
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByRole("heading", { name: campana })).toBeVisible();
  const ruta = new URL(page.url()).pathname;

  await page.getByLabel("Cuántos códigos").fill("7");
  await page.getByRole("button", { name: "Generar códigos" }).click();
  const lista = page.getByRole("list", { name: "Códigos generados" }).getByRole("listitem");
  await expect(lista).toHaveCount(7);
  const codigos = await lista.allTextContents();

  await page.getByRole("button", { name: "Abrir campaña" }).click();
  await expect(page.getByText("Abierta", { exact: true })).toBeVisible();
  await expect(page.getByText("Recordatorio general")).toBeVisible();

  // Seis personas responden sin cuenta. Un código repetido no vale.
  for (const codigo of codigos.slice(0, 6)) await responder(browser, codigo, "gracias");
  await responder(browser, codigos[0], "usado");

  // Con la campaña abierta: participación sí, resultados no.
  await page.goto(ruta);
  await expect(page.getByText("100 %")).toBeVisible();
  await expect(page.getByText("6 respuestas de 6 personas invitadas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resultados por factores" })).toHaveCount(0);

  await page.getByRole("button", { name: "Cerrar campaña" }).click();
  await expect(page.getByRole("heading", { name: "Resultados por factores" })).toBeVisible();
  await expect(page.getByText("Calculado con 6 respuestas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Factor de demostración A" })).toBeVisible();
  await expect(page.getByText("En «").first()).toBeVisible();

  // Los grupos sin respuestas suficientes no se pueden elegir.
  const filtro = page.getByLabel("Área (demo)");
  await expect(filtro.locator("option", { hasText: "Área demo 2 (protegido)" })).toBeDisabled();
  await filtro.selectOption({ label: "Área demo 1" });
  await page.getByRole("button", { name: "Aplicar filtro" }).click();
  await expect(page.getByText("Calculado con 6 respuestas del filtro elegido")).toBeVisible();

  // La empresa prepara el informe, pero no puede firmarlo.
  await page.goto(ruta);
  await page.getByRole("button", { name: "Preparar informe" }).click();
  await expect(page.getByText("Pendiente de la firma del técnico")).toBeVisible();
  await expect(page.getByRole("button", { name: "Firmar informe" })).toHaveCount(0);

  // La empresa añade una medida al plan de acción.
  await page.goto(`/panel/empresa/${DEMO.empresa1}/plan`);
  await page.getByLabel("Medida", { exact: true }).fill(medida);
  await page.getByLabel("Responsable (opcional)").fill("Responsable de prueba");
  await page.getByRole("button", { name: "Añadir medida" }).click();
  await expect(page.getByRole("heading", { name: medida })).toBeVisible();
  await page.goto(`/panel/empresa/${DEMO.empresa1}`);
  await salir(page);

  // El técnico de prevención añade una observación y firma.
  await entrar(page, "tecnico-a@demo.invalid");
  await page.goto(ruta);
  await page.getByLabel("Observación").fill("Observación de prueba del técnico.");
  await page.getByRole("button", { name: "Añadir observación" }).click();
  await expect(page.getByText("Observación de prueba del técnico.")).toBeVisible();
  await page.getByLabel("Tu nombre completo").fill("Técnico de prueba");
  await page.getByRole("button", { name: "Firmar informe" }).click();
  await expect(page.getByText("Marca la casilla para firmar.")).toBeVisible();
  await page.getByLabel("Tu nombre completo").fill("Técnico de prueba");
  await page.getByLabel("He revisado los resultados y las observaciones").check();
  await page.getByRole("button", { name: "Firmar informe" }).click();
  await expect(page.getByText("Firmado por")).toContainText("Técnico de prueba");
  await expect(page.getByRole("button", { name: "Añadir observación" })).toHaveCount(0);

  // El PDF se descarga con sesión y no existe sin ella.
  const enlace = await page.getByRole("link", { name: "Descargar informe en PDF" }).getAttribute("href");
  const pdf = await page.request.get(enlace!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const anonimo = await browser.newContext({ baseURL: "http://localhost:3000" });
  expect((await anonimo.request.get(enlace!)).status()).toBe(404);
  await anonimo.close();

  // El técnico cambia el estado de la medida y queda en el historial.
  await page.goto(`/panel/empresa/${DEMO.empresa1}/plan`);
  const tarjeta = page.locator("section").filter({ has: page.getByRole("heading", { name: medida }) });
  await tarjeta.getByLabel("Cambiar estado").selectOption("en_curso");
  await tarjeta.getByRole("button", { name: "Guardar estado" }).click();
  await expect(tarjeta.getByText("Historial de cambios (2)")).toBeVisible();
  await tarjeta.getByText("Historial de cambios (2)").click();
  await expect(tarjeta.getByText("de «Pendiente» a «En curso»")).toBeVisible();
  await page.goto("/panel");
  await salir(page);

  // El partner ve el estado de la evaluación en su lista y no puede editar el plan.
  await entrar(page, "gestor-a@demo.invalid");
  await expect(page.getByText("Informe firmado").first()).toBeVisible();
  await page.goto(`/panel/empresa/${DEMO.empresa1}/plan`);
  await expect(page.getByRole("heading", { name: medida })).toBeVisible();
  await expect(page.getByRole("button", { name: "Añadir medida" })).toHaveCount(0);
});

test("una empresa ajena no ve campañas ni informes de otra", async ({ page }) => {
  await entrar(page, "empresa-3@demo.invalid");
  for (const ruta of [`/panel/empresa/${DEMO.empresa1}/campanas`, `/panel/empresa/${DEMO.empresa1}/plan`, `/panel/empresa/${DEMO.empresa1}/campanas/00000000-0000-4000-8e00-000000000001`]) {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
  }
});
