import { expect, test, type Browser, type Page } from "@playwright/test";
import { DEMO, entrar, reiniciarLimites, salir } from "./ayudas";

test.describe.configure({ mode: "serial" });
test.beforeAll(() => reiniciarLimites());

const ORIGEN = "Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo";
const PDF = { name: "informe-fpsico.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% informe de prueba\n%%EOF\n") };
const visible = (page: Page, texto: string) => page.getByText(texto).filter({ visible: true });

test("una evaluación es FPSICO: pide la autorización del INSST y muestra el origen", async ({ page }, info) => {
  const nombre = `Evaluación prueba ${info.project.name}-${Date.now()}`;
  await entrar(page, "admin@demo.invalid");
  await page.goto("/admin/instrumentos");
  await expect(visible(page, "[PENDIENTE: autorización escrita del INSST]")).toBeVisible();
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
  await expect(visible(page, ORIGEN)).toBeVisible();
  await expect(visible(page, "No se puede publicar ni copiar ningún ítem hasta tenerla.")).toBeVisible();
  await expect(visible(page, "[PENDIENTE: probar una importación real en FPSICO 4.1, sobre todo sin preguntas variables]")).toBeVisible();
  // Una evaluación no lleva niveles: no se puntúa aquí.
  await expect(page.getByRole("button", { name: "Añadir nivel" }).filter({ visible: true })).toHaveCount(0);

  await page.getByLabel("Nombre de la escala").fill("Escala de prueba");
  await page.getByRole("button", { name: "Añadir escala" }).click();
  for (const valor of ["1", "2"]) {
    await page.getByLabel("Etiqueta de la opción").fill(`Opción de prueba ${valor}`);
    await page.getByLabel("Valor").fill(valor);
    await page.getByRole("button", { name: "Añadir opción" }).click();
    await expect(visible(page, `Opción de prueba ${valor}`)).toBeVisible();
  }
  await page.getByLabel("Nombre del factor").fill("Factor de prueba");
  await page.getByRole("button", { name: "Añadir factor" }).click();
  await page.getByLabel("Enunciado del ítem").fill("Enunciado de prueba");
  await page.getByRole("button", { name: "Añadir ítem" }).click();
  await expect(visible(page, "Enunciado de prueba")).toBeVisible();

  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(visible(page, "Hace falta la autorización escrita del INSST antes de publicar.")).toBeVisible();
  await page.getByRole("button", { name: "Borrar borrador" }).click();
  await expect(page).toHaveURL(/\/admin\/instrumentos$/);
});

async function responder(browser: Browser, codigo: string, esperado: "gracias" | "usado", grupo?: string) {
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
    if (grupo) await page.getByLabel(grupo).check();
    const preguntas = page.locator("ol > li");
    await expect(preguntas).toHaveCount(4);
    for (let i = 0; i < 4; i++) await preguntas.nth(i).getByRole("radio").nth(3).check();
    await page.getByRole("button", { name: "Enviar respuestas" }).click();
    await expect(page).toHaveURL(/\/responder\/gracias$/);
    expect((await contexto.cookies()).length).toBe(0);
  }
  await contexto.close();
}

async function prepararCampana(page: Page, nombre: string, cuestionario: string, grupos: boolean): Promise<{ ruta: string; codigos: string[] }> {
  await page.goto(`/panel/empresa/${DEMO.empresa1}/campanas/nueva`);
  await page.getByLabel("Nombre de la campaña").fill(nombre);
  await page.getByLabel("Cuestionario").selectOption({ label: cuestionario });
  await page.getByLabel("Personas invitadas (opcional)").fill("6");
  if (grupos) await page.getByLabel("Área (demo)").check();
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
  const ruta = new URL(page.url()).pathname;
  await page.getByLabel("Cuántos códigos").fill("7");
  await page.getByRole("button", { name: "Generar códigos" }).click();
  const lista = page.getByRole("list", { name: "Códigos generados" }).getByRole("listitem");
  await expect(lista).toHaveCount(7);
  const codigos = await lista.allTextContents();
  await page.getByRole("button", { name: "Abrir campaña" }).click();
  await expect(page.getByText("Recordatorio general")).toBeVisible();
  return { ruta, codigos };
}

test("evaluación: respuestas anónimas, sin puntuación, exportación e informe subido y firmado", async ({ page, browser }, info) => {
  const campana = `Evaluación prueba ${info.project.name}-${Date.now()}`;
  const evaluacionDemo = "Cuestionario de demostración (ficticio) (evaluación) · demo";

  await entrar(page, "empresa-1@demo.invalid");
  // Una evaluación no pregunta el grupo.
  await page.goto(`/panel/empresa/${DEMO.empresa1}/campanas/nueva`);
  await page.getByLabel("Nombre de la campaña").fill(campana);
  await page.getByLabel("Cuestionario").selectOption({ label: evaluacionDemo });
  await page.getByLabel("Área (demo)").check();
  await page.getByRole("button", { name: "Crear en borrador" }).click();
  await expect(page.getByText("En las evaluaciones no se pregunta el grupo. Desmarque los grupos.")).toBeVisible();

  const { ruta, codigos } = await prepararCampana(page, campana, evaluacionDemo, false);
  for (const codigo of codigos.slice(0, 6)) await responder(browser, codigo, "gracias");
  await responder(browser, codigos[0], "usado");

  await page.goto(ruta);
  await expect(page.getByText("respuestas de 6 personas invitadas")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar campaña" }).click();
  await expect(page.getByText("Esta plataforma no puntúa la evaluación.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resultados por factores" })).toHaveCount(0);
  await expect(page.getByText("Solo el técnico de prevención asignado puede exportar")).toBeVisible();
  await page.getByRole("button", { name: "Preparar informe" }).click();
  await expect(page.getByText("Pendiente de la firma del técnico")).toBeVisible();
  await page.goto("/panel");
  await salir(page);

  await entrar(page, "tecnico-a@demo.invalid");
  await page.goto(ruta);
  const descarga = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar respuestas (.txt)" }).click();
  const fichero = await (await descarga).path();
  const texto = (await import("node:fs")).readFileSync(fichero, "utf8");
  const lineas = texto.split("\r\n").filter(Boolean);
  expect(lineas[0]).toBe("FORMATO DE DEMOSTRACION (ficticio)");
  expect(lineas.length).toBe(7);
  for (const linea of lineas.slice(1)) expect(linea).toBe("4;4;4;4");

  await expect(page.getByText("Suba antes el informe en PDF.")).toBeVisible();
  await page.getByLabel("Informe en PDF").setInputFiles(PDF);
  await page.getByRole("button", { name: "Subir informe" }).click();
  await expect(page.getByText("informe-fpsico.pdf")).toBeVisible();
  await expect(page.getByText(/SHA-256: [a-f0-9]{64}/)).toBeVisible();
  await page.getByLabel("Observación").fill("Observación de prueba del técnico.");
  await page.getByRole("button", { name: "Añadir observación" }).click();
  await expect(page.getByText("Observación de prueba del técnico.")).toBeVisible();
  await page.getByLabel("Su nombre completo").fill("Técnico de prueba");
  await page.getByLabel("He revisado el informe y las observaciones").check();
  await page.getByRole("button", { name: "Firmar informe" }).click();
  await expect(page.getByText("Registrado y firmado por")).toContainText("Técnico de prueba");
  await expect(page.getByLabel("Sustituir por otro PDF")).toHaveCount(0);

  const enlace = await page.getByRole("link", { name: "Descargar el informe" }).getAttribute("href");
  const pdf = await page.request.get(enlace!);
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const anonimo = await browser.newContext({ baseURL: "http://localhost:3000" });
  expect((await anonimo.request.get(enlace!)).status()).toBe(404);
  expect((await anonimo.request.get(`/api/exportar/${ruta.split("/").pop()}`)).status()).not.toBe(200);
  await anonimo.close();
  await page.goto("/panel");
  await salir(page);

  // El partner ve el estado y el documento, pero no puede exportar.
  await entrar(page, "gestor-a@demo.invalid");
  await expect(page.getByText("Informe firmado").first()).toBeVisible();
  const exportar = await page.request.get(`/api/exportar/${ruta.split("/").pop()}`);
  expect(exportar.status()).toBe(403);
  expect((await page.request.get(enlace!)).status()).toBe(200);
});

test("seguimiento: resultados agregados con grupos protegidos y plan de acción", async ({ page }, info) => {
  const medida = `Medida prueba ${info.project.name}-${Date.now()}`;
  await entrar(page, "empresa-1@demo.invalid");
  await page.goto(`/panel/empresa/${DEMO.empresa1}/campanas/00000000-0000-4000-8e00-000000000001`);
  await expect(page.getByText("Seguimiento", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Calculado con 18 respuestas.")).toBeVisible();
  const filtro = page.getByLabel("Área (demo)");
  // 9 + 6 + 3: el grupo de 3 se protege, y el de 6 también para que no se deduzca por resta.
  await expect(filtro.locator("option", { hasText: "Área demo 3 (protegido)" })).toBeDisabled();
  await expect(filtro.locator("option", { hasText: "Área demo 2 (protegido)" })).toBeDisabled();
  await filtro.selectOption({ label: "Área demo 1" });
  await page.getByRole("button", { name: "Aplicar filtro" }).click();
  await expect(page.getByText("Calculado con 9 respuestas del filtro elegido")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Informe" })).toHaveCount(0);

  await page.goto(`/panel/empresa/${DEMO.empresa1}/plan`);
  await page.getByLabel("Medida", { exact: true }).fill(medida);
  await page.getByLabel("Responsable (opcional)").fill("Responsable de prueba");
  await page.getByRole("button", { name: "Añadir medida" }).click();
  const tarjeta = page.locator("section").filter({ has: page.getByRole("heading", { name: medida }) });
  await tarjeta.getByLabel("Cambiar estado").selectOption("en_curso");
  await tarjeta.getByRole("button", { name: "Guardar estado" }).click();
  await expect(tarjeta.getByText("Historial de cambios (2)")).toBeVisible();
  await tarjeta.getByText("Historial de cambios (2)").click();
  await expect(tarjeta.getByText("de «Pendiente» a «En curso»")).toBeVisible();
});

test("una empresa ajena no ve campañas, planes ni documentos de otra", async ({ page }) => {
  await entrar(page, "empresa-3@demo.invalid");
  for (const ruta of [
    `/panel/empresa/${DEMO.empresa1}/campanas`,
    `/panel/empresa/${DEMO.empresa1}/plan`,
    `/panel/empresa/${DEMO.empresa1}/desconexion`,
    `/panel/empresa/${DEMO.empresa1}/campanas/00000000-0000-4000-8e00-000000000001`,
  ]) {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
  }
});
