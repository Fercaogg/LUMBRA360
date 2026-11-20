import gsap from "gsap";

// Prepara animaciones cuando el navegador queda libre, en lugar de durante la carga.
// Así la portada no se bloquea creando todas las animaciones a la vez.
// Devuelve la limpieza, para usarla como retorno de useGSAP.
export function aplazar(preparar: () => void | (() => void)): () => void {
  const conInactividad = typeof window.requestIdleCallback === "function";
  let limpiar: void | (() => void);
  let contexto: gsap.Context | undefined;
  const ejecutar = () => {
    contexto = gsap.context(() => {
      limpiar = preparar();
    });
  };
  const id = conInactividad ? window.requestIdleCallback(ejecutar, { timeout: 800 }) : window.setTimeout(ejecutar, 80);
  return () => {
    if (conInactividad) window.cancelIdleCallback(id);
    else window.clearTimeout(id);
    if (typeof limpiar === "function") limpiar();
    contexto?.revert();
  };
}
