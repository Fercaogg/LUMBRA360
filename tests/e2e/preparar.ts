import { execSync } from "node:child_process";

// Deja la base de datos local limpia, con los datos de demostración recién cargados.
export default function preparar() {
  execSync("npx supabase db reset", { stdio: "ignore" });
}
