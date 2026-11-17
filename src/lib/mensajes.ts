// Algunos mensajes llegan desde las funciones de la base de datos, redactados en «tú».
// La interfaz trata de usted: aquí se traducen antes de mostrarlos. Los que no están
// en la lista ya son impersonales y se muestran tal cual.
const USTED: Record<string, string> = {
  "Aprueba la política antes de pedir el acuse.": "Apruebe la política antes de pedir el acuse.",
  "Añade al menos un factor.": "Añada al menos un factor.",
  "Añade al menos un ítem.": "Añada al menos un ítem.",
  "Añade al menos una sección.": "Añada al menos una sección.",
  "Cierra la campaña antes de exportar.": "Cierre la campaña antes de exportar.",
  "Cierra la campaña antes de preparar el informe.": "Cierre la campaña antes de preparar el informe.",
  "Completa todas las secciones antes de aprobar.": "Complete todas las secciones antes de aprobar.",
  "Confirma antes el instrumento y su licencia.": "Confirme antes el instrumento y su licencia.",
  "Escribe el nombre de quien aprueba.": "Escriba el nombre de quien aprueba.",
  "Escribe tu nombre completo para firmar.": "Escriba su nombre completo para firmar.",
  "Sube antes el informe generado en la aplicación.": "Suba antes el informe generado en la aplicación.",
};

export function mensajeBd(mensaje: string): string {
  return USTED[mensaje] ?? mensaje;
}
