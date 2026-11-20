"""Genera la plantilla de carta de apoyo empresarial para la candidatura de LUMBRA360 (TCUE 2026/2027)."""
import sys
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
from docx.shared import Cm, Pt, RGBColor

D = sys.argv[1]  # carpeta con los logos
SALIDA = sys.argv[2]

TINTA = RGBColor(0x11, 0x11, 0x11)
SUAVE = RGBColor(0x55, 0x55, 0x4F)
TERCIARIO = RGBColor(0x6B, 0x6B, 0x65)
LUMBRE_TEXTO = RGBColor(0xB8, 0x3A, 0x0E)
FUENTE = "Arial"  # alternativa de la marca a Instrument Sans: se ve igual en cualquier ordenador

doc = Document()

# ---------- Estilos base ----------
st = doc.styles["Normal"]
st.font.name = FUENTE
st.font.size = Pt(10.5)
st.font.color.rgb = TINTA
st.element.rPr.rFonts.set(qn("w:eastAsia"), FUENTE)
pf = st.paragraph_format
pf.space_after = Pt(6)
pf.line_spacing = 1.3

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.3)
sec.top_margin = Cm(3.0)
sec.bottom_margin = Cm(3.4)
sec.header_distance = Cm(1.1)
sec.footer_distance = Cm(0.9)


def sombreado(elem, color):
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    elem.append(shd)


def borde_parrafo(p, lado, color, grosor=8, espacio=4):
    pPr = p._p.get_or_add_pPr()
    bdr = pPr.find(qn("w:pBdr"))
    if bdr is None:
        bdr = OxmlElement("w:pBdr")
        pPr.append(bdr)
    b = OxmlElement(f"w:{lado}")
    b.set(qn("w:val"), "single")
    b.set(qn("w:sz"), str(grosor))
    b.set(qn("w:space"), str(espacio))
    b.set(qn("w:color"), color)
    bdr.append(b)


def texto(p, t, negrita=False, color=None, tam=None, cursiva=False, mayus=False, espaciado=None):
    r = p.add_run(t)
    r.bold = negrita
    r.italic = cursiva
    if color is not None:
        r.font.color.rgb = color
    if tam:
        r.font.size = Pt(tam)
    if mayus:
        r.font.all_caps = True
    if espaciado:
        rPr = r._r.get_or_add_rPr()
        sp = OxmlElement("w:spacing")
        sp.set(qn("w:val"), str(espaciado))
        rPr.append(sp)
    return r


def campo(p, marcador):
    """Hueco para rellenar: texto entre corchetes sobre gris claro, fácil de localizar y sustituir."""
    r = p.add_run(f"[{marcador}]")
    r.font.color.rgb = SUAVE
    sombreado(r._r.get_or_add_rPr(), "EDEDEA")
    return r


def casilla(p):
    """Casilla de verificación de Word (se marca con un clic). Si el programa no la admite, se ve ☐."""
    sdt = parse_xml(
        f'<w:sdt {nsdecls("w")} xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">'
        "<w:sdtPr><w:rPr><w:rFonts w:ascii=\"MS Gothic\" w:eastAsia=\"MS Gothic\" w:hAnsi=\"MS Gothic\"/>"
        "<w:color w:val=\"B83A0E\"/><w:sz w:val=\"24\"/></w:rPr>"
        "<w14:checkbox><w14:checked w14:val=\"0\"/>"
        "<w14:checkedState w14:val=\"2612\" w14:font=\"MS Gothic\"/>"
        "<w14:uncheckedState w14:val=\"2610\" w14:font=\"MS Gothic\"/></w14:checkbox></w:sdtPr>"
        "<w:sdtContent><w:r><w:rPr><w:rFonts w:ascii=\"MS Gothic\" w:eastAsia=\"MS Gothic\" w:hAnsi=\"MS Gothic\" w:hint=\"eastAsia\"/>"
        "<w:color w:val=\"B83A0E\"/><w:sz w:val=\"24\"/></w:rPr><w:t>☐</w:t></w:r></w:sdtContent></w:sdt>"
    )
    p._p.append(sdt)


def etiqueta(t, antes=14, despues=6):
    """Antetítulo en mayúsculas espaciadas y color lumbre, como en la web."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(antes)
    p.paragraph_format.space_after = Pt(despues)
    p.paragraph_format.keep_with_next = True
    texto(p, t, color=LUMBRE_TEXTO, tam=8, mayus=True, espaciado=30, negrita=True)
    return p


def sin_bordes_tabla(tabla):
    tblPr = tabla._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{lado}")
        e.set(qn("w:val"), "nil")
        b.append(e)
    tblPr.append(b)


def bordes_tabla(tabla, color="CFCFCA"):
    tblPr = tabla._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for lado in ("top", "bottom", "insideH"):
        e = OxmlElement(f"w:{lado}")
        e.set(qn("w:val"), "single")
        e.set(qn("w:sz"), "4")
        e.set(qn("w:color"), color)
        b.append(e)
    for lado in ("left", "right", "insideV"):
        e = OxmlElement(f"w:{lado}")
        e.set(qn("w:val"), "nil")
        b.append(e)
    tblPr.append(b)


def margen_celdas(tabla, arriba=70, abajo=70, izq=0, der=100):
    tblPr = tabla._tbl.tblPr
    m = OxmlElement("w:tblCellMar")
    for lado, v in (("top", arriba), ("bottom", abajo), ("left", izq), ("right", der)):
        e = OxmlElement(f"w:{lado}")
        e.set(qn("w:w"), str(v))
        e.set(qn("w:type"), "dxa")
        m.append(e)
    tblPr.append(m)


def ancho_columnas(tabla, anchos):
    tabla.autofit = False
    grid = tabla._tbl.tblGrid
    for gc, w in zip(grid.findall(qn("w:gridCol")), anchos):
        gc.set(qn("w:w"), str(int(w.twips)))
    tblPr = tabla._tbl.tblPr
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    for fila in tabla.rows:
        for c, w in zip(fila.cells, anchos):
            c.width = w


# ---------- Cabecera ----------
cab = sec.header
cab.is_linked_to_previous = False
t = cab.add_table(rows=1, cols=2, width=Cm(16.4))
sin_bordes_tabla(t)
ancho_columnas(t, [Cm(7.4), Cm(9.0)])
c0, c1 = t.rows[0].cells
p = c0.paragraphs[0]
p.add_run().add_picture(f"{D}/lumbra-acento.png", height=Cm(0.85))
c0.vertical_alignment = c1.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
p = c1.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p.paragraph_format.space_after = Pt(0)
p.paragraph_format.line_spacing = 1.15
texto(p, "Convocatoria Prototipos TCUE · 2026/2027", color=LUMBRE_TEXTO, tam=7.5, mayus=True, espaciado=20, negrita=True)
p = c1.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p.paragraph_format.space_after = Pt(0)
texto(p, "Documento de apoyo empresarial (base 3.ª, punto 4)", color=TERCIARIO, tam=8)
# Fino hilo bajo la cabecera
p = cab.paragraphs[0]
p.paragraph_format.space_after = Pt(0)
p._p.getparent().remove(p._p)
p = cab.add_paragraph()
p.paragraph_format.space_before = Pt(4)
p.paragraph_format.space_after = Pt(0)
borde_parrafo(p, "bottom", "E3E3DF", grosor=6, espacio=1)
texto(p, " ", tam=2)

# ---------- Pie con logos institucionales ----------
pie = sec.footer
pie.is_linked_to_previous = False
p = pie.paragraphs[0]
borde_parrafo(p, "top", "E3E3DF", grosor=6, espacio=8)
p.paragraph_format.space_after = Pt(0)
tl = pie.add_table(rows=1, cols=4, width=Cm(16.4))
sin_bordes_tabla(tl)
ancho_columnas(tl, [Cm(4.6), Cm(2.6), Cm(4.2), Cm(5.0)])
logos = [("usal.png", Cm(1.05), WD_ALIGN_PARAGRAPH.LEFT), ("fgusal.png", Cm(1.35), WD_ALIGN_PARAGRAPH.CENTER),
         ("tcue.png", Cm(1.3), WD_ALIGN_PARAGRAPH.CENTER), ("ris3.png", Cm(0.75), WD_ALIGN_PARAGRAPH.RIGHT)]
for celda, (f, alto, al) in zip(tl.rows[0].cells, logos):
    celda.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    q = celda.paragraphs[0]
    q.alignment = al
    q.paragraph_format.space_after = Pt(0)
    q.add_run().add_picture(f"{D}/{f}", height=alto)
p = pie.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(6)
p.paragraph_format.space_after = Pt(0)
texto(p, "Esta actuación se enmarca en el PLAN TCUE 2024-2027 financiado por la Junta de Castilla y León.", color=TERCIARIO, tam=7.5)

# ---------- Título ----------
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
texto(p, "Carta de apoyo empresarial", tam=8, mayus=True, espaciado=30, color=LUMBRE_TEXTO, negrita=True)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
p.paragraph_format.line_spacing = 1.05
texto(p, "Apoyo al desarrollo de LUMBRA360", tam=21, espaciado=-10)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(10)
texto(p, "Convocatoria de Prototipos orientados al mercado en TCUE, curso 2026/2027. "
         "Fundación General de la Universidad de Salamanca.", color=SUAVE, tam=10)

# ---------- Datos de la entidad ----------
etiqueta("Datos de la entidad", antes=6)
filas = [
    ("Razón social", "Nombre de la empresa o entidad"),
    ("CIF / NIF", "B00000000"),
    ("Domicilio social", "Calle, número, código postal, localidad y provincia"),
    ("Actividad", "Sector o actividad principal (CNAE, si se conoce)"),
    ("Tipo de entidad", "Pyme / servicio de prevención ajeno / gestoría o asesoría / otra"),
    ("N.º de personas en plantilla", "Número aproximado"),
    ("Web", "www.ejemplo.es"),
]
tb = doc.add_table(rows=0, cols=2)
bordes_tabla(tb)
margen_celdas(tb)
for k, v in filas:
    c = tb.add_row().cells
    q = c[0].paragraphs[0]
    q.paragraph_format.space_after = Pt(0)
    texto(q, k, color=SUAVE, tam=9.5)
    q = c[1].paragraphs[0]
    q.paragraph_format.space_after = Pt(0)
    campo(q, v).font.size = Pt(9.5)
ancho_columnas(tb, [Cm(5.0), Cm(11.4)])

# ---------- Declaración ----------
etiqueta("Declaración", antes=16)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
texto(p, "D./D.ª ")
campo(p, "Nombre y apellidos")
texto(p, ", con DNI ")
campo(p, "00000000X")
texto(p, ", en calidad de ")
campo(p, "cargo")
texto(p, " y en representación de la entidad arriba indicada,")

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(6)
p.paragraph_format.keep_with_next = True
texto(p, "MANIFIESTA", negrita=True, espaciado=30, tam=10)

manifiesta = [
    [("Que conoce el proyecto ", None), ("LUMBRA360", "b"),
     (", una plataforma web de evaluación psicosocial continua y de gestión de la desconexión digital, con registro de evidencias fechadas, "
      "dirigida a pymes y a los servicios de prevención ajenos y gestorías que las acompañan. El proyecto lo promueve ", None),
     ("Fernando Martín Vaquero", "b"),
     (", estudiante del Máster en Estudios de la Ciencia, la Tecnología y la Innovación de la Universidad de Salamanca, "
      "con la tutela académica de la Dra. Ana María Pinto Llorente y el Dr. Luis Eduardo Andrade Silva, y se presenta a la "
      "Convocatoria de Prototipos orientados al mercado en TCUE, curso 2026/2027, de la Fundación General de la Universidad de Salamanca, "
      "en el marco del Plan TCUE 2024-2027 de la Junta de Castilla y León.", None)],
    [("Que ha podido conocer el funcionamiento de la aplicación (cuestionarios anónimos desde el móvil, resultados agregados por grupos, "
      "plan de acción con responsables y fechas, y política de desconexión digital con acuses de lectura) y considera que responde a "
      "una necesidad real de las empresas: evaluar y hacer seguimiento de los riesgos psicosociales conforme a la Ley 31/1995, de "
      "Prevención de Riesgos Laborales, y garantizar el derecho a la desconexión digital recogido en el artículo 88 de la Ley "
      "Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales, dejando constancia documental de cada paso.", None)],
    [("Que apoya el desarrollo del prototipo y su orientación al mercado, y manifiesta su interés en colaborar en las formas que se "
      "marcan a continuación:", None)],
]
for i, partes in enumerate(manifiesta, 1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(0.7)
    p.paragraph_format.first_line_indent = Cm(-0.7)
    texto(p, f"{i}.\t", color=LUMBRE_TEXTO, negrita=True)
    p.paragraph_format.keep_with_next = i == len(manifiesta)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(0.7))
    for t_, estilo in partes:
        texto(p, t_, negrita=(estilo == "b"))

opciones = [
    "Orientación sobre las necesidades reales de su sector para definir las funciones del prototipo.",
    "Participación en una prueba piloto con su plantilla o con empresas clientes (enero a julio de 2027), con respuestas anónimas.",
    "Valoración de uso: comentarios sobre la utilidad, la facilidad de uso y las mejoras necesarias.",
    "Tutela o mentoría empresarial del proyecto, a través de la persona de contacto indicada más abajo.",
    "Interés en utilizar o contratar la solución una vez finalizado el prototipo.",
    "Difusión del proyecto entre su red de empresas, clientes o colaboradores.",
]
for o in opciones:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(1.45)
    p.paragraph_format.first_line_indent = Cm(-0.75)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(1.45))
    casilla(p)
    p.paragraph_format.keep_with_next = True
    texto(p, "\t" + o, tam=10)
p = doc.add_paragraph()
p.paragraph_format.left_indent = Cm(1.45)
p.paragraph_format.first_line_indent = Cm(-0.75)
p.paragraph_format.space_after = Pt(8)
p.paragraph_format.tab_stops.add_tab_stop(Cm(1.45))
casilla(p)
texto(p, "\tOtra: ", tam=10)
campo(p, "describir").font.size = Pt(10)

finales = [
    [("Que ", None), ("autoriza", None), (" a que el nombre de la entidad figure como empresa colaboradora en la candidatura y en los "
      "materiales de difusión del proyecto:  ", None), ("CHK", "c"), ("  Sí   ", None), ("CHK", "c"), ("  No", None)],
    [("Que la presente carta expresa un apoyo y un interés de colaboración, y no supone compromiso económico ni contractual para "
      "ninguna de las partes. En cualquier prueba piloto, los datos se tratarán de forma anónima y conforme a la normativa de "
      "protección de datos.", None)],
]
for i, partes in enumerate(finales, len(manifiesta) + 1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(0.7)
    p.paragraph_format.first_line_indent = Cm(-0.7)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(0.7))
    texto(p, f"{i}.\t", color=LUMBRE_TEXTO, negrita=True)
    for t_, estilo in partes:
        if estilo == "c":
            casilla(p)
        else:
            texto(p, t_)

# ---------- Persona de contacto ----------
etiqueta("Persona de contacto para el proyecto", antes=14)
tc = doc.add_table(rows=0, cols=2)
bordes_tabla(tc)
margen_celdas(tc)
for k, v in [("Nombre y cargo", "Nombre, apellidos y cargo"), ("Correo electrónico", "correo@empresa.es"), ("Teléfono", "000 000 000")]:
    c = tc.add_row().cells
    q = c[0].paragraphs[0]
    q.paragraph_format.space_after = Pt(0)
    texto(q, k, color=SUAVE, tam=9.5)
    q = c[1].paragraphs[0]
    q.paragraph_format.space_after = Pt(0)
    campo(q, v).font.size = Pt(9.5)
ancho_columnas(tc, [Cm(5.0), Cm(11.4)])

# ---------- Firma ----------
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(16)
p.paragraph_format.keep_with_next = True
texto(p, "Y para que así conste, a los efectos de la candidatura, firma la presente")
p = doc.add_paragraph()
p.paragraph_format.keep_with_next = True
texto(p, "en ")
campo(p, "localidad")
texto(p, ", a ")
campo(p, "día")
texto(p, " de ")
campo(p, "mes")
texto(p, " de 2026.")

tf = doc.add_table(rows=1, cols=2)
sin_bordes_tabla(tf)
ancho_columnas(tf, [Cm(8.6), Cm(7.8)])
cf, cs = tf.rows[0].cells
for celda, rotulo in ((cf, "Firma"), (cs, "Sello de la entidad")):
    q = celda.paragraphs[0]
    q.paragraph_format.space_before = Pt(58)
    q.paragraph_format.space_after = Pt(2)
    q.paragraph_format.keep_with_next = True
    borde_parrafo(q, "top", "8A8A84", grosor=4, espacio=4)
    texto(q, rotulo, color=TERCIARIO, tam=8, mayus=True, espaciado=20)
q = cf.add_paragraph()
q.paragraph_format.space_after = Pt(0)
campo(q, "Nombre y apellidos").font.size = Pt(9.5)
q = cf.add_paragraph()
campo(q, "Cargo").font.size = Pt(9.5)
for c in (cf, cs):
    c.paragraphs[0].paragraph_format.right_indent = Cm(0.8)

doc.core_properties.title = "Carta de apoyo empresarial · LUMBRA360 · Prototipos TCUE 2026/2027"
doc.core_properties.author = "LUMBRA360"
doc.save(SALIDA)
print("ok", SALIDA)
