// Mención obligatoria cuando el cuestionario procede del INSST (FPSICO).
// Se muestra tal cual, sin añadidos: no se sugiere aval ni colaboración del INSST.
export const ORIGEN_INSST = "Origen del cuestionario: Instituto Nacional de Seguridad y Salud en el Trabajo";

// Los cuestionarios con ítems propios son de seguimiento. Nunca se llaman evaluación.
export const TIPOS_CAMPANA = { evaluacion: "Evaluación", pulso: "Seguimiento" } as const;
