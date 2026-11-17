import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { NOMBRE } from "@/config/marca";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

// Informe firmado en PDF. Se genera con la sesión de quien lo pide: decide RLS.
// Sale de la foto guardada al firmar, no de un cálculo nuevo.

type Nivel = { etiqueta: string; tono: string };
type Factor = { factor_id: string; nombre: string; media: number; nivel: Nivel | null; distribucion: { etiqueta: string; porcentaje: number }[] | null };
type Datos = {
  resultados: { n: number; minimo: number; factores: Factor[] };
  campana: { nombre: string; tipo: string; abierta_el: string | null; cerrada_el: string | null; plantilla_invitada: number | null; minimo_grupo: number };
  instrumento: { nombre: string; es_demo: boolean } | null;
  observaciones: { factor_id: string | null; texto: string }[];
};

const e = StyleSheet.create({
  pagina: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", color: "#17211e", lineHeight: 1.45 },
  marca: { fontSize: 9, color: "#0f5c4c", fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  titulo: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 10 },
  sub: { color: "#4a5753", marginTop: 4 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 8 },
  fila: { flexDirection: "row", marginBottom: 3 },
  etiqueta: { width: 150, color: "#4a5753" },
  factor: { borderWidth: 1, borderColor: "#d9d5c9", borderRadius: 4, padding: 10, marginBottom: 8 },
  factorNombre: { fontFamily: "Helvetica-Bold", fontSize: 11.5 },
  aviso: { backgroundColor: "#fbf0d9", color: "#7a4b00", padding: 8, borderRadius: 4, marginTop: 12 },
  nota: { color: "#4a5753", fontSize: 9, marginTop: 6 },
  firma: { marginTop: 28, borderTopWidth: 1, borderTopColor: "#17211e", paddingTop: 8, width: 260 },
  pie: { position: "absolute", bottom: 28, left: 48, right: 48, fontSize: 8, color: "#4a5753", flexDirection: "row", justifyContent: "space-between" },
});

const dia = (valor: string | null) =>
  valor ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(valor)) : "";
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

export async function GET(_request: Request, { params }: { params: Promise<{ informeId: string }> }) {
  const { informeId } = await params;
  const id = esquemaUuid.safeParse(informeId);
  if (!id.success) return new Response("No encontrado", { status: 404 });

  const supabase = await crearClienteServidor();
  const { data: informe } = await supabase
    .from("informes")
    .select("id, estado, datos, firmante_nombre, firmado_el, campanas(empresas(nombre, es_demo))")
    .eq("id", id.data)
    .maybeSingle();
  if (!informe || informe.estado !== "firmado" || !informe.datos) return new Response("No encontrado", { status: 404 });

  const datos = informe.datos as unknown as Datos;
  const empresa = informe.campanas?.empresas;
  const participacion = datos.campana.plantilla_invitada
    ? `${datos.resultados.n} respuestas de ${datos.campana.plantilla_invitada} personas invitadas (${Math.min(100, Math.round((100 * datos.resultados.n) / datos.campana.plantilla_invitada))} %)`
    : `${datos.resultados.n} respuestas`;
  const nombreFactor = (factorId: string | null) => datos.resultados.factores.find((f) => f.factor_id === factorId)?.nombre ?? "General";
  const esDemo = Boolean(empresa?.es_demo || datos.instrumento?.es_demo);

  const documento = (
    <Document title={`Informe · ${datos.campana.nombre}`} author={informe.firmante_nombre ?? undefined} creator={NOMBRE} language="es-ES">
      <Page size="A4" style={e.pagina}>
        <Text style={e.marca}>{NOMBRE}</Text>
        <Text style={e.titulo}>Informe por factores</Text>
        <Text style={e.sub}>{empresa?.nombre ?? ""} · {datos.campana.nombre}</Text>
        {esDemo ? <Text style={e.aviso}>Documento de demostración. Los datos y los textos del cuestionario son ficticios.</Text> : null}

        <Text style={e.h2}>Datos de la campaña</Text>
        <View style={e.fila}><Text style={e.etiqueta}>Cuestionario</Text><Text>{datos.instrumento?.nombre ?? ""}</Text></View>
        <View style={e.fila}><Text style={e.etiqueta}>Apertura</Text><Text>{dia(datos.campana.abierta_el)}</Text></View>
        <View style={e.fila}><Text style={e.etiqueta}>Cierre</Text><Text>{dia(datos.campana.cerrada_el)}</Text></View>
        <View style={e.fila}><Text style={e.etiqueta}>Participación</Text><Text>{participacion}</Text></View>
        <View style={e.fila}><Text style={e.etiqueta}>Mínimo por grupo</Text><Text>{datos.campana.minimo_grupo} respuestas</Text></View>
        <Text style={e.nota}>
          Las respuestas son voluntarias y anónimas. Este informe solo contiene resultados agregados. Es una herramienta de apoyo para el técnico de prevención.
        </Text>

        <Text style={e.h2}>Resultados por factores</Text>
        {datos.resultados.factores.map((factor) => (
          <View key={factor.factor_id} style={e.factor} wrap={false}>
            <Text style={e.factorNombre}>{factor.nombre}</Text>
            <Text>Media: {num.format(Number(factor.media))}{factor.nivel ? `   ·   Nivel: ${factor.nivel.etiqueta}` : ""}</Text>
            <Text style={e.nota}>{(factor.distribucion ?? []).map((d) => `${d.etiqueta}: ${d.porcentaje} %`).join("   ·   ")}</Text>
          </View>
        ))}

        <Text style={e.h2}>Observaciones del técnico de prevención</Text>
        {datos.observaciones.length === 0 ? <Text style={e.sub}>Sin observaciones.</Text> : null}
        {datos.observaciones.map((o, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{nombreFactor(o.factor_id)}</Text>
            <Text>{o.texto}</Text>
          </View>
        ))}

        <View style={e.firma} wrap={false}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{informe.firmante_nombre}</Text>
          <Text>Técnico de prevención</Text>
          <Text style={e.sub}>Firmado en la plataforma el {dia(informe.firmado_el)}</Text>
        </View>

        <View style={e.pie} fixed>
          <Text>Informe {informe.id}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  const pdf = await renderToBuffer(documento);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="informe-${informe.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
