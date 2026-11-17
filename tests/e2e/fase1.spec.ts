import { expect, test, type Page } from "@playwright/test";
import { DEMO, entrar, reiniciarLimites, salir } from "./ayudas";

// Cada proyecto (móvil y escritorio) usa sus propios nombres para no chocar.
test.describe.configure({ mode: "serial" });
test.beforeAll(() => reiniciarLimites());

// Un espacio ajeno se comporta como si no existiera: ni nombre ni datos.
async function noExiste(page: Page, ruta: string) {
  await page.goto(ruta);
  await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
  await expect(page.getByText("(ficticia)")).toHaveCount(0);
}

test("sin sesión, el panel redirige al acceso", async ({ page }) => {
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/acceso$/);
  await page.goto("/admin/pendientes");
  await expect(page).toHaveURL(/\/acceso$/);
});

test("un correo sin invitación recibe la misma respuesta y ningún correo", async ({ page }) => {
  await page.goto("/acceso");
  await page.getByLabel("Correo").fill("no-es-un-correo");
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByText("Escriba un correo válido.")).toBeVisible();

  const desconocido = `nadie-${Date.now()}@demo.invalid`;
  await page.getByLabel("Correo").fill(desconocido);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("recibirá un enlace");
  const buzon = await (await fetch("http://127.0.0.1:54324/api/v1/messages?limit=50")).json();
  expect(JSON.stringify(buzon)).not.toContain(desconocido);
});

test("un enlace no válido vuelve al acceso con aviso", async ({ page }) => {
  await page.goto("/auth/confirmar?token_hash=falso&type=email");
  await expect(page).toHaveURL(/\/acceso\?error=enlace$/);
  await expect(page.getByText("El enlace no es válido o ha caducado")).toBeVisible();
});

test("recorrido: administración crea partner, el gestor da de alta una empresa y da acceso", async ({ page }, info) => {
  const marca = `${info.project.name}-${Date.now()}`;
  const partner = `Partner prueba ${marca}`;
  const empresa = `Empresa prueba ${marca}`;
  const gestor = `gestor-${marca}@demo.invalid`;
  const cuenta = `rrhh-${marca}@demo.invalid`;

  await entrar(page, "admin@demo.invalid");
  await page.goto("/admin/pendientes");
  await expect(page.getByText("[PENDIENTE]").first()).toBeVisible();

  await page.goto("/admin/partners");
  await page.getByLabel("Nombre").fill(partner);
  await page.getByRole("button", { name: "Crear partner" }).click();
  await expect(page.getByRole("link", { name: new RegExp(partner) })).toBeVisible();

  await page.getByLabel("Partner", { exact: true }).selectOption({ label: partner });
  await page.getByLabel("Correo del gestor").fill(gestor);
  await page.getByRole("button", { name: "Dar acceso" }).click();
  await expect(page.getByText("Acceso concedido")).toBeVisible();
  await salir(page);

  await entrar(page, gestor);
  await expect(page.getByRole("heading", { name: partner })).toBeVisible();
  await expect(page.getByText("Todavía no hay empresas")).toBeVisible();
  await page.getByRole("link", { name: "Dar de alta una empresa" }).first().click();
  await page.getByLabel("Nombre de la empresa").fill(empresa);
  await page.getByLabel("Personas en plantilla (opcional)").fill("23");
  await page.getByRole("button", { name: "Dar de alta" }).click();
  await expect(page.getByRole("heading", { name: empresa })).toBeVisible();
  await expect(page.getByText("23 personas en plantilla.")).toBeVisible();

  await page.getByLabel("Correo").first().fill(cuenta);
  await page.getByRole("button", { name: "Dar acceso" }).click();
  await expect(page.getByText("Acceso concedido")).toBeVisible();

  // El gestor nuevo no ve las empresas de otros partners.
  await noExiste(page, `/panel/empresa/${DEMO.empresa1}`);
  await noExiste(page, `/panel/partner/${DEMO.partnerA}`);
  // Sin rol de administración, /admin devuelve a su único espacio.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/panel\/partner\//);
  await expect(page.getByRole("heading", { name: partner })).toBeVisible();
  await salir(page);

  await entrar(page, cuenta);
  await expect(page.getByRole("heading", { name: empresa })).toBeVisible();
  await expect(page.getByText("Quién tiene acceso")).toHaveCount(0);
  await noExiste(page, `/panel/empresa/${DEMO.empresa3}`);
});

test("datos demo: cada rol ve solo lo suyo y la marca blanca aparece", async ({ page }) => {
  await entrar(page, "gestor-a@demo.invalid");
  await expect(page.getByText("Empresa demo 1 (ficticia)")).toBeVisible();
  await expect(page.getByText("Empresa demo 2 (ficticia)")).toBeVisible();
  await expect(page.getByText("Empresa demo 3 (ficticia)")).toHaveCount(0);
  await expect(page.getByText("Demo", { exact: true }).first()).toBeVisible();
  await page.goto(`/panel/partner/${DEMO.partnerA}`);
  await salir(page);

  await entrar(page, "tecnico-a@demo.invalid");
  await page.goto("/panel");
  await expect(page.getByText("Empresa demo 1 (ficticia)")).toBeVisible();
  await expect(page.getByText("Empresa demo 2 (ficticia)")).toHaveCount(0);
  await noExiste(page, `/panel/empresa/${DEMO.empresa2}`);
  await page.goto("/panel");
  await salir(page);

  await entrar(page, "empresa-1@demo.invalid");
  await expect(page.getByRole("heading", { name: "Empresa demo 1 (ficticia)" })).toBeVisible();
  await expect(page.getByText("Servicio ofrecido por")).toContainText("Marca demo A");
  await expect(page.getByText("Empresa de demostración")).toBeVisible();
  await noExiste(page, `/panel/empresa/${DEMO.empresa3}`);
});

test("cabeceras de seguridad presentes", async ({ request }) => {
  const respuesta = await request.get("/acceso");
  const c = respuesta.headers();
  expect(c["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(c["strict-transport-security"]).toContain("max-age=");
  expect(c["x-frame-options"]).toBe("DENY");
  expect(c["x-content-type-options"]).toBe("nosniff");
  expect(c["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(c["permissions-policy"]).toContain("camera=()");
  expect(c["x-powered-by"]).toBeUndefined();
});
