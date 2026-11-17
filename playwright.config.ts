import { defineConfig, devices } from "@playwright/test";

// Los tests de extremo a extremo corren contra el Supabase local con los datos de demostración.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  globalSetup: "./tests/e2e/preparar.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    // Opcional: ruta a un Chromium ya instalado. Si no se indica, Playwright usa el suyo.
    launchOptions: process.env.CHROMIUM_RUTA ? { executablePath: process.env.CHROMIUM_RUTA } : {},
  },
  projects: [
    // Cada proyecto se presenta con una IP de documentación distinta (RFC 5737)
    // para no agotar entre los dos el límite de intentos por IP.
    { name: "movil", use: { ...devices["Pixel 7"], extraHTTPHeaders: { "x-forwarded-for": "203.0.113.10" } } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"], extraHTTPHeaders: { "x-forwarded-for": "203.0.113.20" } } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
