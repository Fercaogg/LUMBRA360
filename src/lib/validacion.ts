import { z } from "zod";

// Esquemas de validación en servidor. Toda entrada de formulario pasa por aquí.

const texto = (min: number, max: number, mensaje: string) =>
  z.string().trim().min(min, mensaje).max(max, `Máximo ${max} caracteres.`);

export const esquemaCorreo = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email("Escribe un correo válido."));

export const esquemaUuid = z.uuid("Identificador no válido.");

export const esquemaAcceso = z.object({ correo: esquemaCorreo });

export const esquemaPartner = z.object({
  nombre: texto(2, 120, "Escribe el nombre del partner."),
});

export const esquemaEmpresa = z.object({
  nombre: texto(2, 160, "Escribe el nombre de la empresa."),
  plantilla: z
    .union([z.literal(""), z.coerce.number().int("Usa un número entero.").min(1, "Mínimo 1.").max(100000, "Máximo 100000.")])
    .transform((v) => (v === "" ? null : v)),
  partnerId: z.union([z.literal(""), esquemaUuid]).transform((v) => (v === "" ? null : v)),
});

export const esquemaInvitacion = z.object({
  correo: esquemaCorreo,
  rol: z.enum(["partner", "tecnico", "empresa"]),
  partnerId: z.union([z.literal(""), esquemaUuid]).transform((v) => (v === "" ? null : v)),
  empresaId: z.union([z.literal(""), esquemaUuid]).transform((v) => (v === "" ? null : v)),
});

export const esquemaMarca = z.object({
  partnerId: esquemaUuid,
  marcaBlanca: z.boolean(),
  marcaNombre: z
    .string()
    .trim()
    .max(80, "Máximo 80 caracteres.")
    .refine((v) => v === "" || v.length >= 2, "Mínimo 2 caracteres.")
    .transform((v) => (v === "" ? null : v)),
});

export const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp"] as const;
export const TAMANO_MAXIMO_LOGO = 512 * 1024;

export type EstadoFormulario = {
  ok: boolean;
  mensaje?: string;
  errores?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoFormulario = { ok: false };

export function erroresDe(error: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const problema of error.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    if (!salida[campo]) salida[campo] = problema.message;
  }
  return salida;
}
