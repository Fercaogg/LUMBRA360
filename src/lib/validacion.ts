import { z } from "zod";

// Esquemas de validación en servidor. Toda entrada de formulario pasa por aquí.

const texto = (min: number, max: number, mensaje: string) =>
  z.string().trim().min(min, mensaje).max(max, `Máximo ${max} caracteres.`);

export const esquemaCorreo = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email("Escriba un correo válido."));

export const esquemaUuid = z.uuid("Identificador no válido.");

export const esquemaAcceso = z.object({ correo: esquemaCorreo });

export const esquemaPartner = z.object({
  nombre: texto(2, 120, "Escriba el nombre del partner."),
});

export const esquemaEmpresa = z.object({
  nombre: texto(2, 160, "Escriba el nombre de la empresa."),
  plantilla: z
    .union([z.literal(""), z.coerce.number().int("Use un número entero.").min(1, "Mínimo 1.").max(100000, "Máximo 100000.")])
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
  // Datos que se enseñan una sola vez, como los códigos recién generados.
  lista?: string[];
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

// ---------------------------------------------------------------------------
// Fase 2: evaluación psicosocial
// ---------------------------------------------------------------------------

const opcional = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres.`).transform((v) => (v === "" ? null : v));
const enteroOpcional = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int("Use un número entero.").min(min, `Mínimo ${min}.`).max(max, `Máximo ${max}.`)])
    .transform((v) => (v === "" ? null : v));
const uuidOpcional = z.union([z.literal(""), esquemaUuid]).transform((v) => (v === "" ? null : v));
const numero = z.coerce.number("Escriba un número.").min(-1000, "Valor demasiado bajo.").max(1000, "Valor demasiado alto.");

export const esquemaInstrumento = z.object({
  nombre: texto(2, 160, "Escriba el nombre del instrumento."),
  tipo: z.enum(["evaluacion", "pulso"]),
  descripcion: opcional(1000),
  minutos: enteroOpcional(1, 120),
});

export const esquemaInstrumentoDatos = z.object({
  id: esquemaUuid,
  nombre: texto(2, 160, "Escriba el nombre del instrumento."),
  descripcion: opcional(1000),
  minutos: enteroOpcional(1, 120),
  licenciaConfirmada: z.boolean(),
  licenciaNota: opcional(1000),
});

export const esquemaEscala = z.object({ instrumentoId: esquemaUuid, nombre: texto(1, 120, "Escriba un nombre.") });
export const esquemaOpcion = z.object({
  escalaId: esquemaUuid,
  etiqueta: texto(1, 120, "Escriba la etiqueta."),
  valor: numero,
  codigo: opcional(10),
});

export const esquemaExportacion = z.object({
  id: esquemaUuid,
  separador: z.string().max(3, "Máximo 3 caracteres."),
  cabecera: opcional(500),
  finLinea: z.enum(["crlf", "lf"]),
  formato: z.enum(["personalizado", "fpsico31"]),
  confirmado: z.boolean(),
});
export const esquemaFactor = z.object({
  instrumentoId: esquemaUuid,
  nombre: texto(1, 160, "Escriba el nombre del factor."),
  metodo: z.enum(["media", "suma"]),
});
export const esquemaNivel = z.object({
  factorId: esquemaUuid,
  etiqueta: texto(1, 80, "Escriba la etiqueta."),
  desde: numero,
  tono: z.enum(["favorable", "intermedio", "desfavorable"]),
});
export const esquemaItem = z.object({
  instrumentoId: esquemaUuid,
  factorId: esquemaUuid,
  escalaId: esquemaUuid,
  enunciado: texto(1, 600, "Escriba el enunciado."),
  invertido: z.boolean(),
});

export const TABLAS_INSTRUMENTO = ["escalas", "escala_opciones", "factores", "niveles", "items"] as const;

export const esquemaDimension = z.object({ empresaId: esquemaUuid, nombre: texto(1, 80, "Escriba un nombre.") });
export const esquemaGrupo = z.object({ dimensionId: esquemaUuid, nombre: texto(1, 80, "Escriba un nombre.") });

export const esquemaCampana = z.object({
  empresaId: esquemaUuid,
  instrumentoId: z.uuid("Elija un instrumento."),
  nombre: texto(2, 160, "Escriba el nombre de la campaña."),
  modo: z.enum(["codigos", "enlace"]),
  plantilla: enteroOpcional(1, 100000),
  minimo: z.coerce.number().int("Use un número entero.").min(5, "El mínimo no puede bajar de 5.").max(50, "Máximo 50."),
  dimensiones: z.array(esquemaUuid).max(5, "Máximo 5 dimensiones."),
});

export const esquemaCodigos = z.object({
  campanaId: esquemaUuid,
  cantidad: z.coerce.number().int("Use un número entero.").min(1, "Mínimo 1.").max(500, "Máximo 500 por tanda."),
});

export const esquemaObservacion = z.object({
  informeId: esquemaUuid,
  texto: texto(1, 4000, "Escriba la observación."),
});

export const esquemaFirma = z.object({
  informeId: esquemaUuid,
  nombre: texto(3, 160, "Escriba su nombre completo."),
  conforme: z.literal(true, "Marque la casilla para firmar."),
});

export const esquemaMedida = z.object({
  empresaId: esquemaUuid,
  campanaId: uuidOpcional,
  titulo: texto(2, 200, "Escriba la medida."),
  descripcion: opcional(4000),
  responsable: opcional(160),
  fecha: z
    .union([z.literal(""), z.iso.date("Fecha no válida.")])
    .transform((v) => (v === "" ? null : v)),
});

export const ESTADOS_MEDIDA = ["pendiente", "en_curso", "hecha", "descartada"] as const;

export const esquemaAccesoRespuesta = z.string().trim().min(8, "El código es demasiado corto.").max(80, "El código es demasiado largo.");

// ---------------------------------------------------------------------------
// Fase 3: desconexión digital
// ---------------------------------------------------------------------------

const fechaObligatoria = z.iso.date("Escriba una fecha válida.");

export const esquemaPlantilla = z.object({ nombre: texto(2, 160, "Escriba el nombre de la plantilla.") });
export const esquemaPlantillaDatos = z.object({
  id: esquemaUuid,
  nombre: texto(2, 160, "Escriba el nombre de la plantilla."),
  revisada: z.boolean(),
  nota: opcional(1000),
});
export const esquemaSeccionPlantilla = z.object({
  plantillaId: esquemaUuid,
  titulo: texto(1, 200, "Escriba el título de la sección."),
  cuerpo: z.string().trim().max(20000, "Máximo 20000 caracteres."),
  ayuda: opcional(1000),
});

export const esquemaSeccionesPolitica = z
  .array(
    z.object({
      titulo: texto(1, 200, "Falta un título."),
      cuerpo: z.string().trim().max(20000, "Máximo 20000 caracteres por sección."),
      ayuda: z.string().max(1000).nullable(),
    }),
  )
  .min(1, "La política necesita al menos una sección.")
  .max(40, "Máximo 40 secciones.");

export const esquemaAprobacion = z.object({
  politicaId: esquemaUuid,
  nombre: texto(3, 160, "Escriba el nombre de quien aprueba."),
  conforme: z.literal(true, "Marque la casilla para aprobar."),
});

export const esquemaAudiencia = z.object({
  empresaId: esquemaUuid,
  politicaId: uuidOpcional,
  fecha: fechaObligatoria,
  asistentes: texto(3, 4000, "Escriba quién asistió."),
  notas: opcional(4000),
});

export const esquemaFormacion = z.object({
  empresaId: esquemaUuid,
  titulo: texto(2, 200, "Escriba el título."),
  fecha: fechaObligatoria,
  descripcion: opcional(4000),
  participantes: enteroOpcional(1, 100000),
});

export const esquemaAcuse = z.object({
  token: z.string().min(20).max(80),
  nombre: texto(3, 160, "Escriba su nombre y apellidos."),
  conforme: z.literal(true, "Marque la casilla para confirmar la lectura."),
});
