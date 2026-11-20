import { NextResponse, type NextRequest } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { consumirIntento, ipDeLaPeticion } from "@/lib/limites";

// Demo del panel: abre una sesión de solo lectura sobre la empresa de demostración.
// La cuenta no tiene contraseña ni correo real; la base de datos le impide escribir
// (migración visor_demo). Si no hay empresa de demostración, no hay demo.
const CORREO_DEMO = process.env.DEMO_CORREO ?? "demo@lumbra360.invalid";
const EMPRESA_DEMO = process.env.DEMO_EMPRESA_ID ?? "00000000-0000-4000-b000-000000000001";

export async function GET(request: NextRequest) {
  const volver = (ruta: string, error?: string) => {
    const destino = request.nextUrl.clone();
    destino.pathname = ruta;
    destino.search = error ? `?error=${error}` : "";
    return NextResponse.redirect(destino, 303);
  };

  if (!(await consumirIntento(`demo:${await ipDeLaPeticion()}`, 20, 3600))) return volver("/acceso", "demo-limite");

  const admin = crearClienteAdmin();
  const { data: empresa } = await admin.from("empresas").select("id").eq("id", EMPRESA_DEMO).eq("es_demo", true).maybeSingle();
  if (!empresa) return volver("/acceso", "demo");

  // La cuenta se crea la primera vez; después ya existe.
  const alta = await admin.auth.admin.createUser({ email: CORREO_DEMO, email_confirm: true });
  if (alta.error && !/already|registered|exists/i.test(alta.error.message)) return volver("/acceso", "demo");

  const enlace = await admin.auth.admin.generateLink({ type: "magiclink", email: CORREO_DEMO });
  const usuarioId = enlace.data?.user?.id;
  const tokenHash = enlace.data?.properties?.hashed_token;
  if (enlace.error || !usuarioId || !tokenHash) return volver("/acceso", "demo");

  const { error: errVisor } = await admin.from("visores_demo").upsert({ usuario_id: usuarioId, empresa_id: empresa.id });
  if (errVisor) return volver("/acceso", "demo");

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  if (error) return volver("/acceso", "demo");

  return volver(`/panel/empresa/${empresa.id}`);
}
