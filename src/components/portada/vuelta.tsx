import { Simbolo } from "@/components/marca/logotipo";

// «360»: la vuelta completa. Cuatro arcos que se dibujan con el scroll (efectos.tsx, data-arco).
const ETAPAS = [
  { titulo: "Medir", texto: "Seguimientos breves y evaluación con cuestionarios anónimos." },
  { titulo: "Decidir", texto: "El técnico de prevención analiza las respuestas y firma su informe." },
  { titulo: "Actuar", texto: "Plan de acción con responsables y política de desconexión digital." },
  { titulo: "Demostrar", texto: "Cada paso queda registrado con fecha y autor." },
];

const C = 200;
const R = 150;
const punto = (grados: number, r = R) => {
  const a = ((grados - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};
const arco = (desde: number, hasta: number) => {
  const [x1, y1] = punto(desde);
  const [x2, y2] = punto(hasta);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export function Vuelta() {
  return (
    <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
      <div className="flex flex-col gap-6">
        <p className="max-w-xl text-pretty text-xl leading-relaxed text-tinta-suave sm:text-2xl sm:leading-snug">
          La gestión psicosocial no termina con un cuestionario. Hay que medir, decidir, actuar y poder demostrarlo. <span className="text-tinta">360 es esa vuelta completa, en un solo sitio.</span>
        </p>
        <ol className="flex flex-col border-t border-linea">
          {ETAPAS.map((e, i) => (
            <li key={e.titulo} data-subir className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-linea py-5">
              <span className="font-mono text-xs leading-7 text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{e.titulo}</span>
                <span className="text-pretty text-tinta-suave">{e.texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-tinta-suave">Y vuelta a empezar: el siguiente seguimiento muestra cómo evoluciona la situación.</p>
      </div>

      <div aria-hidden className="relative order-first mx-auto w-[86%] max-w-[30rem] sm:w-full lg:order-none">
        <svg viewBox="0 0 400 400" className="block w-full overflow-visible">
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--linea)" strokeWidth="1" strokeDasharray="2 6" />
          {ETAPAS.map((e, i) => {
            const desde = i * 90 + 6;
            const hasta = (i + 1) * 90 - 6;
            const [px, py] = punto(desde);
            const [fx, fy] = punto(hasta);
            const [fx2, fy2] = punto(hasta - 5, R + 7);
            const [fx3, fy3] = punto(hasta - 5, R - 7);
            return (
              <g key={e.titulo}>
                <path data-arco d={arco(desde, hasta)} pathLength={100} fill="none" stroke="var(--tinta-900)" strokeWidth="2.5" strokeLinecap="round" />
                <path data-flecha d={`M ${fx2} ${fy2} L ${fx} ${fy} L ${fx3} ${fy3}`} fill="none" stroke="var(--tinta-900)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={px} cy={py} r="5" fill="var(--lumbre)" />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Simbolo tamano={92} color="var(--lumbre)" />
          <span className="text-[clamp(2.5rem,6vw,4rem)] font-medium leading-none tracking-[-0.04em]">360°</span>
        </div>
        {ETAPAS.map((e, i) => (
          <span
            key={e.titulo}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-linea-fuerte bg-superficie px-3 py-1.5 text-sm font-semibold shadow-[var(--sombra-2)]"
            style={{ left: `${(punto(i * 90 + 45)[0] / 400) * 100}%`, top: `${(punto(i * 90 + 45)[1] / 400) * 100}%` }}
          >
            <span className="mr-2 font-mono text-xs font-normal text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
            {e.titulo}
          </span>
        ))}
      </div>
    </div>
  );
}
