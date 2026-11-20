import { expect, test } from "@playwright/test";
import { reiniciarLimites } from "./ayudas";

// Web pública: formulario de demostración y textos legales.
test.beforeAll(() => reiniciarLimites());

test("el formulario de demostración valida y confirma el envío", async ({ page }, info) => {
  await page.goto("/contacto");
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByText("Escriba su nombre.")).toBeVisible();

  await page.getByLabel("Nombre").fill(`Prueba ${info.project.name}`);
  await page.getByLabel("Correo electrónico").fill(`demo-${info.project.name}-${Date.now()}@example.com`);
  await page.getByLabel(/Quiero recibir novedades/).check();
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByRole("status")).toContainText("Le escribiremos");
});

test("los textos legales están enlazados desde el pie y entre sí", async ({ page }) => {
  await page.goto("/");
  const pie = page.getByRole("navigation", { name: "Textos legales" });
  await pie.getByRole("link", { name: "Privacidad" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
  await expect(page.getByText("ferca@usal.es").first()).toBeVisible();
  await page.getByRole("navigation", { name: "Textos legales" }).getByRole("link", { name: "Aviso legal" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Aviso legal" })).toBeVisible();
  await page.getByRole("navigation", { name: "Textos legales" }).getByRole("link", { name: "Cookies" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Aviso de cookies" })).toBeVisible();
});
