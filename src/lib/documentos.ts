import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { crearClienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

export const TAMANO_MAXIMO_PDF = 10 * 1024 * 1024;

export type DocumentoSubido = { ruta: string; nombre: string; sha256: string };

// Sube un PDF al almacén privado, en la carpeta de la empresa. Quién puede subir lo decide RLS.
// Se guarda la huella SHA-256 para poder demostrar después que el documento no ha cambiado.
export async function subirPdf(
  supabase: Cliente,
  empresaId: string,
  archivo: FormDataEntryValue | null,
): Promise<{ documento: DocumentoSubido } | { error: string } | { vacio: true }> {
  if (!(archivo instanceof File) || archivo.size === 0) return { vacio: true };
  if (archivo.size > TAMANO_MAXIMO_PDF) return { error: "El documento no puede pasar de 10 MB." };
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const esPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (archivo.type !== "application/pdf" || !esPdf) return { error: "El documento tiene que ser un PDF." };

  const ruta = `${empresaId}/${randomUUID()}.pdf`;
  const { error } = await supabase.storage.from("documentos").upload(ruta, bytes, { contentType: "application/pdf" });
  if (error) return { error: "No tiene permiso para subir documentos de esta empresa." };

  const nombre = archivo.name.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 150) || "documento.pdf";
  return { documento: { ruta, nombre, sha256: createHash("sha256").update(bytes).digest("hex") } };
}
