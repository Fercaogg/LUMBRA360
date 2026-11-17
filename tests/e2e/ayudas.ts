import { execSync } from "node:child_process";
import { expect, type Page } from "@playwright/test";

const MAILPIT = "http://127.0.0.1:54324";

type Resumen = { ID: string; To: { Address: string }[] };

// Lee el enlace de acceso del buzón local (Mailpit). No sale ningún correo real.
async function enlaceDeAcceso(correo: string): Promise<string> {
  for (let intento = 0; intento < 40; intento++) {
    const lista = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=50`)).json()) as { messages: Resumen[] };
    const mensaje = lista.messages.find((m) => m.To.some((d) => d.Address === correo));
    if (mensaje) {
      const detalle = (await (await fetch(`${MAILPIT}/api/v1/message/${mensaje.ID}`)).json()) as { HTML: string };
      await fetch(`${MAILPIT}/api/v1/messages`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ IDs: [mensaje.ID] }),
      });
      const enlace = /href="([^"]*\/auth\/confirmar[^"]*)"/.exec(detalle.HTML)?.[1];
      if (!enlace) throw new Error("El correo no trae enlace de acceso.");
      return enlace.replaceAll("&amp;", "&");
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`No ha llegado el correo de acceso para ${correo}.`);
}

export async function entrar(page: Page, correo: string): Promise<void> {
  await page.goto("/acceso");
  await page.getByLabel("Correo").fill(correo);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("recibirá un enlace");
  await page.goto(await enlaceDeAcceso(correo));
  await expect(page).toHaveURL(/\/(panel|admin)/);
}

export async function salir(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
}

export const DEMO = {
  partnerA: "00000000-0000-4000-a000-000000000001",
  partnerB: "00000000-0000-4000-a000-000000000002",
  empresa1: "00000000-0000-4000-b000-000000000001",
  empresa2: "00000000-0000-4000-b000-000000000002",
  empresa3: "00000000-0000-4000-b000-000000000003",
};

// Vacía el contador de intentos del Supabase local para que los tests no se frenen entre sí.
export function reiniciarLimites(): void {
  execSync('docker exec supabase_db_lumbra360 psql -U postgres -c "truncate privado.limites_intentos"', { stdio: "ignore" });
}
