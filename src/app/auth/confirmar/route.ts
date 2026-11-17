import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

const TIPOS = ["email", "magiclink", "signup"] as const;
type Tipo = (typeof TIPOS)[number];

// Llegada desde el enlace del correo. Acepta los dos formatos de Supabase:
// token_hash (plantilla propia, recomendado) y code (plantilla por defecto).
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const tokenHash = parametros.get("token_hash");
  const tipo = parametros.get("type");
  const codigo = parametros.get("code");

  const supabase = await crearClienteServidor();
  let correcto = false;

  if (tokenHash && tokenHash.length <= 200 && TIPOS.includes(tipo as Tipo)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo as Tipo });
    correcto = !error;
  } else if (codigo && codigo.length <= 200) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    correcto = !error;
  }

  // El destino es fijo: no se acepta ninguna URL de retorno externa.
  const destino = request.nextUrl.clone();
  destino.search = "";
  if (correcto) {
    destino.pathname = "/panel";
  } else {
    destino.pathname = "/acceso";
    destino.searchParams.set("error", "enlace");
  }
  return NextResponse.redirect(destino);
}
