// Película promocional de LUMBRA360 (16:9, 116 s). Todo depende del tiempo: window.pintar(t).
(function () {
  const DUR = 139;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  gsap.defaults({ ease: "power2.inOut", overwrite: false });
  const tl = gsap.timeline({ paused: true });
  const vistos = new Set();

  // Entrada con estado inicial explícito (evita que un tween posterior pise el estado de inicio).
  function ent(sel, desde, hasta, at) {
    const key = typeof sel === "string" ? sel : null;
    if (!key || !vistos.has(key)) { gsap.set(sel, desde); if (key) vistos.add(key); }
    tl.set(sel, desde, at);
    tl.to(sel, hasta, at);
  }
  const sale = (sel, at, d = 0.45, extra = {}) => tl.to(sel, Object.assign({ opacity: 0, filter: "blur(10px)", duration: d, ease: "power3.in" }, extra), at);

  // Titulares palabra a palabra
  $$("[data-palabras]").forEach((el) => {
    const parte = (nodo, ac) => {
      const out = [];
      nodo.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { out.push(document.createTextNode(" ")); return; }
            const s = document.createElement("span"); s.className = "w" + (ac ? " ac" : ""); s.textContent = p; out.push(s);
          });
        } else if (n.nodeName === "BR") out.push(document.createElement("br"));
        else out.push(...parte(n, n.classList.contains("ac")));
      });
      return out;
    };
    const nuevos = parte(el, false);
    el.innerHTML = ""; nuevos.forEach((n) => el.appendChild(n));
    gsap.set(el.querySelectorAll(".w"), { opacity: 0, filter: "blur(12px)" });
  });
  const palabras = (sel, at, paso = 0.07) => {
    const w = $(sel).querySelectorAll(".w");
    tl.set(w, { opacity: 0, filter: "blur(12px)", y: 0 }, at);
    tl.to(w, { opacity: 1, filter: "blur(0px)", duration: 0.42, stagger: paso, ease: "power2.out" }, at);
  };
  const palabrasFuera = (sel, at) => tl.to($(sel).querySelectorAll(".w"), { opacity: 0, filter: "blur(10px)", duration: 0.28, stagger: 0.02, ease: "power2.in" }, at);

  // Inundaciones de fondo
  const inunda = (sel, at, d = 0.85, origen = "50% 50%") => {
    gsap.set(sel, { clipPath: `circle(0% at ${origen})` });
    tl.to(sel, { clipPath: `circle(75% at ${origen})`, duration: d, ease: "power2.inOut" }, at);
  };

  // Logotipo construido trazo a trazo
  function construyeLogo(w, at) {
    const svg = $(w + " svg");
    const onda = svg.querySelector(".onda");
    const letras = Array.from(svg.querySelectorAll(".lt"));
    const L = onda.getTotalLength();
    gsap.set(onda, { strokeDasharray: L, strokeDashoffset: L, fillOpacity: 0, strokeOpacity: 1 });
    gsap.set(letras, { opacity: 0, y: 70 });
    gsap.set(w, { transformPerspective: 1600, opacity: 1 });
    tl.fromTo(w, { scale: 1.22, rotationY: -22 }, { scale: 1, rotationY: 0, duration: 3.0, ease: "power3.out", immediateRender: false }, at);
    tl.to(onda, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, at + 0.1);
    tl.to(onda, { fillOpacity: 1, strokeOpacity: 0, duration: 0.5, ease: "sine.inOut" }, at + 1.35);
    const orden = letras.map((l) => [l.getBBox().x + l.getCTM().e, l]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
    tl.to(orden, { opacity: 1, y: 0, duration: 1.0, stagger: 0.075, ease: "expo.out" }, at + 1.5);
  }

  // ===================== 1. Apertura =====================
  construyeLogo("#l1w", 0.25);
  ent("#l1n", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.3em", duration: 1.4, ease: "expo.out" }, 2.4);
  tl.to(["#l1w"], { y: -230, scale: 0.6, duration: 1.2, ease: "power3.inOut" }, 4.2);
  tl.to("#l1n", { y: -300, opacity: 0, duration: 0.8, ease: "power3.inOut" }, 4.2);
  ent("#avales-et", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 4.6);
  ent(".aval", { opacity: 0, z: -1100, rotationY: 65, rotationX: 12, y: 60 },
      { opacity: 1, z: 0, rotationY: 0, rotationX: 0, y: 0, duration: 1.6, stagger: 0.16, ease: "expo.out" }, 4.75);
  tl.to(".aval", { opacity: 0, z: -700, rotationY: -55, duration: 0.7, stagger: 0.06, ease: "power3.in" }, 8.55);
  sale(["#l1w", "#avales-et"], 8.7, 0.5);
  inunda("#fl1", 9.15);

  // ===================== 2. Lo que pide la ley =====================
  palabras("#t2a", 10.35);
  gsap.set("#leyes", { perspective: 1800 });
  ent("#ley1", { opacity: 0, z: -500, y: 120, rotationY: -40, rotationX: 10 }, { opacity: 1, z: 0, y: 0, rotationY: -14, rotationX: 5, duration: 1.6, ease: "expo.out" }, 10.9);
  ent("#ley1c", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 16.6);
  tl.to("#ley1", { rotationY: -8, duration: 10, ease: "sine.inOut" }, 12.5);
  palabrasFuera("#t2a", 15.2);
  palabras("#t2b", 15.65);
  [17.55, 18.85, 19.75].forEach((at, i) => ent(`#pills .pill:nth-child(${i + 1})`, { opacity: 0, x: -40, filter: "blur(8px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, at));
  palabrasFuera("#t2b", 21.3);
  sale("#pills .pill", 21.3, 0.35, { stagger: 0.05 });
  palabras("#t2c", 21.8);
  tl.to("#ley1", { z: -320, x: -70, y: -60, opacity: 0.35, duration: 1.2, ease: "power3.inOut" }, 21.9);
  ent("#ley2", { opacity: 0, z: 420, x: 260, rotationY: -45 }, { opacity: 1, z: 0, x: 0, rotationY: -10, rotationX: 4, duration: 1.5, ease: "expo.out" }, 22.0);
  $$("#ley2 .fila").forEach((f, i) => ent(f, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 22.75 + i * 0.7));
  palabrasFuera("#t2c", 26.0);
  tl.to(["#ley2", "#ley1"], { z: 700, opacity: 0, duration: 0.75, stagger: 0.05, ease: "power3.in" }, 26.05);
  inunda("#fl2", 26.45);

  // ===================== 3. El problema (mundo 3D de papeles) =====================
  const ico = {
    mail: '<svg class="ic" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    xls: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    doc: '<svg class="ic" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/></svg>',
    carpeta: '<svg class="ic" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  };
  const rayas = (n) => Array.from({ length: n }, (_, i) => `<div class="r" style="width:${60 + ((i * 37) % 38)}%"></div>`).join("");
  const tabla = '<table>' + '<tr><td></td><td></td><td></td><td></td></tr>'.repeat(4) + '</table>';
  const PAPELES = [
    ["mail", "Re: Re: evaluación pendiente", "Bandeja de entrada", 420, -760, -300, -500, 8, -22, -6],
    ["xls", "riesgos_v3_FINAL(2).xlsx", "", 400, 620, -330, -700, -6, 20, 5],
    ["doc", "Acta de reunión", "Comité de seguridad y salud", 320, -260, 120, -250, 10, 14, 3],
    ["nota", "¿Quién tiene la última versión?", "", 280, 560, 200, -150, 6, -18, 6],
    ["carpeta", "Carpeta PRL (copia)", "", 360, -820, 240, -900, -8, 26, -4],
    ["mail", "Fwd: encuesta clima", "Hace 3 meses", 380, 120, -470, -1200, 12, -10, -3],
    ["nota", "¿Se hizo algo después?", "", 260, -560, -60, -1500, -10, 16, -7],
    ["xls", "medidas_2025.xlsx", "", 380, 900, 60, -1700, 6, -24, 4],
    ["doc", "Política de desconexión (borrador)", "Sin aprobar", 340, -40, 380, -1300, -14, -8, 2],
    ["nota", "¿Dónde está el acta?", "", 260, 300, -180, -2000, 8, 20, -5],
    ["carpeta", "PRL antiguo", "", 330, -380, -380, -2200, 10, -26, 6],
    ["mail", "Re: ¿quién falta por responder?", "", 400, 260, 420, -600, -12, 12, -2],
    ["doc", "Informe 2023.pdf", "", 300, -980, -420, -1900, 6, 30, 4],
    ["xls", "copia de copia.xlsx", "", 360, 1020, -380, -1400, -8, -30, -6],
  ];
  const cam = $("#camara");
  PAPELES.forEach((p, i) => {
    const [tipo, tit, sub, w, x, y, z, rx, ry, rz] = p;
    const d = document.createElement("div");
    d.className = "pap" + (tipo === "nota" ? " nota" : "");
    d.style.width = w + "px";
    if (tipo === "nota") d.innerHTML = tit;
    else d.innerHTML = `<div class="cab">${ico[tipo]}${tit}</div>${sub ? `<div class="sub">${sub}</div>` : ""}${tipo === "xls" ? tabla : rayas(tipo === "doc" ? 6 : 3)}`;
    const niebla = document.createElement("div"); niebla.className = "niebla"; niebla.style.opacity = Math.min(0.72, Math.max(0, (-z - 200) / 2600)).toFixed(2);
    d.appendChild(niebla);
    cam.appendChild(d);
    gsap.set(d, { xPercent: -50, yPercent: -50, x, y, z, rotationX: rx, rotationY: ry, rotation: rz, opacity: 0 });
    tl.to(d, { opacity: 1, duration: 1.0, ease: "sine.out" }, 26.9 + (i % 7) * 0.12);
    tl.to(d, { x: 0, y: 0, z: 200, rotationX: 0, rotationY: 0, rotation: 0, scale: 0.08, opacity: 0, duration: 1.0, ease: "power3.in" }, 36.5 + (i % 5) * 0.04);
  });
  gsap.set(cam, { z: -380, rotationY: 7 });
  tl.to(cam, { z: 380, rotationY: -5, duration: 10.2, ease: "sine.inOut" }, 26.8);
  ent("#viñeta", { opacity: 0 }, { opacity: 1, duration: 1.0 }, 27.9);
  palabras("#t3a", 28.25, 0.08);
  palabrasFuera("#t3a", 33.55);
  palabras("#t3b", 34.0, 0.16);
  palabrasFuera("#t3b", 36.3);
  tl.to("#viñeta", { opacity: 0, duration: 0.6 }, 36.6);
  ent("#onda3", { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 37.15);
  tl.to("#onda3", { scale: 16, opacity: 0, duration: 0.75, ease: "power3.in" }, 37.85);
  inunda("#fl3", 37.95, 0.7);

  // ===================== 4 a 10. Producto real (capturas de la aplicación actual) =====================
  const K = 1400 / 1600; // escala de las capturas: coordenadas en píxeles CSS de una página de 1600 px
  const ALTO = { "#i-resumen": 1722, "#i-evaluacion": 2020, "#i-seguimiento": 1698, "#i-plan": 1421, "#i-desc": 1602 };
  const PANT = Object.keys(ALTO);
  let pantActual = "#i-resumen";
  gsap.set("#cam", { x: 0, y: 0, scale: 1 });
  const verPant = (id, at, d = 0.35) => { PANT.forEach((p) => tl.to(p, { opacity: p === id ? 1 : 0, duration: d, ease: "sine.inOut" }, at)); pantActual = id; };
  const zona = (r, maxS = 1.9) => {
    const [x0, y0, x1, y1] = r.map((v) => v * K);
    const s = Math.min(1300 / (x1 - x0), 560 / (y1 - y0), maxS);
    let x = 700 - s * (x0 + x1) / 2, y = 330 - s * (y0 + y1) / 2;
    x = Math.min(0, Math.max(1400 - 1400 * s, x));
    y = Math.min(0, Math.max(660 - s * ALTO[pantActual] * K, y));
    return { x, y, scale: s };
  };
  const acerca = (r, at, maxS, d = 1.0) => tl.to("#cam", Object.assign(zona(r, maxS), { duration: d, ease: "power3.inOut" }), at);
  const aleja = (at, d = 0.9) => tl.to("#cam", { x: 0, y: 0, scale: 1, duration: d, ease: "power3.inOut" }, at);
  const marcas = $("#marcas");
  const marca = (r, at, tipo = "caja", d = 0.45) => {
    const [x0, y0, x1, y1] = r.map((v) => v * K);
    const m = document.createElement("div"); m.className = tipo;
    Object.assign(m.style, { left: x0 - 6 + "px", top: y0 - 4 + "px", width: x1 - x0 + 12 + "px", height: y1 - y0 + 8 + "px" });
    marcas.appendChild(m);
    if (tipo === "mk") tl.to(m, { scaleX: 1, duration: d, ease: "power2.out" }, at);
    else { gsap.set(m, { scale: 1.1 }); tl.to(m, { opacity: 1, scale: 1, duration: d, ease: "expo.out" }, at); }
    return m;
  };
  const quitaMarcas = (ms, at) => tl.to(ms, { opacity: 0, duration: 0.3 }, at);

  // La solución: el panel de la empresa
  gsap.set("#app", { transformPerspective: 2200 });
  verPant("#i-resumen", 38.6, 0.01);
  ent("#app", { opacity: 0, rotationX: 30, z: -600, y: 160 }, { opacity: 1, rotationX: 0, z: 0, y: 0, duration: 1.7, ease: "expo.out" }, 38.7);
  palabras("#t4a", 39.6);
  acerca([188, 212, 460, 604], 42.6, 1.9, 1.1);
  const mNav = [[200, 224, 448, 264], [200, 272, 448, 312], [200, 320, 448, 360], [200, 368, 448, 408], [200, 416, 448, 456]].map((r, i) => marca(r, 43.5 + i * 0.3));
  const mAn = marca([200, 482, 448, 596], 45.0);
  palabrasFuera("#t4a", 45.75);
  quitaMarcas([...mNav, mAn], 45.7);
  palabras("#t4b", 46.2, 0.06);
  acerca([490, 140, 1100, 300], 46.0, 1.9, 1.0);
  const mSer = marca([494, 152, 738, 177], 46.9, "mk", 0.6);
  quitaMarcas([mSer], 48.9);
  palabrasFuera("#t4b", 48.95);
  tl.to("#app", { x: -1700, filter: "blur(18px)", duration: 0.55, ease: "power3.in" }, 49.05);

  // Cuestionario: capturas reales del recorrido en móvil
  const RS = ["#r0", "#r1", "#r2", "#r3", "#r4", "#r5", "#r6"];
  const enfoque = (cy) => { const k = 440 / 390; return { scale: 1, x: 0, y: Math.min(0, Math.max(870 - 952, 435 - cy * k)) }; };
  const pantM = (id, at, cy, z, d = 0.45) => {
    RS.forEach((r) => tl.to(r, { opacity: r === id ? 1 : 0, duration: d, ease: "sine.inOut" }, at));
    tl.to("#pv", Object.assign(enfoque(cy), { duration: 0.9, ease: "power3.inOut" }), at - 0.1);
  };
  gsap.set("#pv", enfoque(412)); gsap.set("#r0", { opacity: 1 });
  gsap.set("#movil", { transformPerspective: 1800 });
  ent("#movil-esc", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 49.35);
  ent("#movil", { x: 700, rotationY: -55, rotationX: 8, filter: "blur(16px)" }, { x: 0, rotationY: -12, rotationX: 4, filter: "blur(0px)", duration: 1.5, ease: "expo.out" }, 49.35);
  tl.to("#movil", { rotationY: -5, rotationX: 2, duration: 10, ease: "sine.inOut" }, 51.0);
  palabras("#t5a", 49.9);
  pantM("#r1", 50.8, 412, 1.3, 0.25);
  pantM("#r2", 52.1, 300, 1.12);
  pantM("#r3", 54.4, 560, 1.28);
  pantM("#r4", 56.2, 470, 1.24);
  pantM("#r5", 57.1, 470, 1.24, 0.2);
  pantM("#r6", 58.5, 610, 1.24);
  [51.6, 54.6, 56.4].forEach((at, i) => ent(`#sin .sin:nth-child(${i + 1})`, { opacity: 0, x: -30, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, at));
  ent("#fpsico", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 58.6);
  palabrasFuera("#t5a", 61.0);
  sale(["#sin .sin", "#fpsico"], 61.0, 0.35);
  tl.to("#movil", { x: 600, rotationY: 50, opacity: 0, duration: 0.6, ease: "power3.in" }, 61.05);

  // Una persona, una respuesta: garantías de la campaña
  verPant("#i-evaluacion", 61.4, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 61.4);
  tl.set("#app", { x: -1700, filter: "blur(18px)", rotationX: 0, z: 0, scale: 1, opacity: 1 }, 61.45);
  tl.to("#app", { x: 0, filter: "blur(0px)", duration: 0.85, ease: "expo.out" }, 61.5);
  palabras("#t4f", 62.0, 0.08);
  acerca([556, 888, 956, 1140], 62.3, 1.9, 1.1);
  const mG1 = marca([560, 893, 952, 1033], 62.9);
  const mG2 = marca([560, 1037, 952, 1135], 65.3);
  quitaMarcas([mG1, mG2], 67.6);
  acerca([496, 778, 1400, 1322], 67.6, 1.9, 1.2);
  palabrasFuera("#t4f", 71.0);

  // La evaluación se trata en FPSICO
  palabras("#t4g", 71.6, 0.07);
  ent("#origen-pie", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 71.8);
  acerca([516, 1418, 1230, 1480], 72.0, 1.9, 1.1);
  const mF1 = marca([523, 1424, 862, 1449], 72.7, "mk", 0.6);
  acerca([516, 1478, 1384, 1696], 75.1, 1.9, 1.1);
  const mF2 = marca([523, 1484, 958, 1506], 75.8, "mk", 0.6);
  quitaMarcas([mF1], 75.2);
  acerca([496, 345, 1400, 494], 78.3, 1.9, 1.1);
  quitaMarcas([mF2], 78.4);
  const mF3 = marca([1171, 410, 1375, 465], 79.2);
  palabrasFuera("#t4g", 82.6);
  tl.to("#origen-pie", { opacity: 0, duration: 0.4 }, 82.6);
  quitaMarcas([mF3], 82.6);

  // Resultados de un seguimiento
  tl.to("#app", { opacity: 0, filter: "blur(12px)", scale: 0.97, duration: 0.35, ease: "power2.in" }, 82.8);
  verPant("#i-seguimiento", 83.15, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 83.15);
  tl.to("#app", { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "expo.out" }, 83.2);
  palabras("#t4c", 83.3, 0.06);
  acerca([496, 522, 936, 752], 83.9, 1.9, 1.1);
  const mS1 = marca([678, 657, 910, 723], 85.6);
  quitaMarcas([mS1], 87.7);
  acerca([496, 1318, 1400, 1580], 87.8, 1.9, 1.1);
  gsap.set("#desp", { scaleY: 0.4, opacity: 0 });
  tl.to("#desp", { scaleY: 1, opacity: 1, duration: 0.45, ease: "expo.out" }, 88.7);
  tl.to("#desp .prot", { backgroundColor: "#FFE1D4", color: "#B83A0E", duration: 0.4, stagger: 0.2 }, 89.6);
  tl.to("#desp", { opacity: 0, scaleY: 0.6, duration: 0.3, ease: "power2.in" }, 93.4);
  palabrasFuera("#t4c", 93.7);

  // Plan de acción
  tl.to("#app", { opacity: 0, filter: "blur(12px)", scale: 0.97, duration: 0.35, ease: "power2.in" }, 93.9);
  verPant("#i-plan", 94.25, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 94.25);
  tl.to("#app", { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "expo.out" }, 94.3);
  palabras("#t4d", 94.5);
  acerca([496, 254, 1400, 424], 94.9, 1.9, 1.0);
  acerca([492, 480, 1060, 760], 96.3, 1.9, 1.0);
  const mP = [marca([544, 614, 780, 642], 97.1), marca([815, 614, 983, 642], 97.75), marca([521, 690, 692, 718], 98.45)];
  quitaMarcas(mP, 101.4);
  palabrasFuera("#t4d", 101.6);

  // Desconexión digital
  tl.to("#app", { opacity: 0, filter: "blur(12px)", scale: 0.97, duration: 0.35, ease: "power2.in" }, 101.8);
  verPant("#i-desc", 102.15, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 102.15);
  tl.to("#app", { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "expo.out" }, 102.2);
  palabras("#t4e", 102.4, 0.06);
  acerca([496, 280, 1400, 442], 102.6, 1.9, 1.0);
  const mD = [marca([521, 343, 726, 414], 103.2), marca([738, 343, 942, 398], 104.4), marca([954, 343, 1159, 398], 106.0), marca([1171, 343, 1375, 398], 107.3)];
  quitaMarcas(mD, 108.5);
  acerca([496, 605, 1400, 783], 108.5, 1.9, 1.0);
  const mV = marca([523, 716, 972, 740], 109.5, "mk", 0.7);
  gsap.set("#sello", { left: 1240, top: 690 });
  ent("#sello", { opacity: 0, scale: 2.2, rotation: -16 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.55, ease: "back.out(1.3)" }, 110.3);
  palabrasFuera("#t4e", 112.6);
  sale(["#app", "#sello"], 112.7, 0.5);
  inunda("#fl4", 113.0, 0.8);

  // ===================== 9. Sin vigilancia =====================
  palabras("#t9a", 114.55, 0.12);
  ent(".nm", { opacity: 0, rotationX: 60, y: 40, transformPerspective: 1400 }, { opacity: 1, rotationX: 0, y: 0, duration: 1.0, stagger: 0.14, ease: "expo.out" }, 115.5);
  [117.35, 118.25, 119.2].forEach((at, i) => tl.to(`.nm:nth-child(${i + 1}) i`, { scaleX: 1, duration: 0.45, ease: "power3.out" }, at));
  [117.5, 118.4, 119.35].forEach((at, i) => tl.to(`.nm:nth-child(${i + 1})`, { color: "#8A8A84", duration: 0.4 }, at));
  ent("#nomide-et", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7 }, 119.75);
  palabrasFuera("#t9a", 120.65);
  sale([".nm", "#nomide-et"], 120.65, 0.4);

  // ===================== 10. Origen =====================
  gsap.set("#hitos", { opacity: 0 });
  tl.set("#hitos", { opacity: 1 }, 121);
  palabras("#t10a", 121.25);
  gsap.set("#hitos-in", { transformPerspective: 2400, rotationY: 5, rotationX: 9 });
  tl.to("#hitos-in", { rotationY: -3, rotationX: 3, duration: 7.4, ease: "sine.inOut" }, 121.1);
  [["#h1", 121.95], ["#h2", 124.55], ["#h3", 125.95]].forEach(([h, at]) => {
    ent(h + " .c", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, at);
    ent([h + " .mono", h + " h5", h + " p"], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "expo.out" }, at + 0.2);
  });
  tl.to("#linea i", { scaleX: 0.5, duration: 1.8, ease: "power2.inOut" }, 122.6);
  tl.to("#linea i", { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 124.9);
  palabrasFuera("#t10a", 128.1);
  sale("#hitos", 128.15, 0.5);

  // ===================== 11. Cierre =====================
  construyeLogo("#l2w", 128.75);
  ent("#l2n", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.3em", duration: 1.4, ease: "expo.out" }, 130.4);
  palabras("#lema", 132.55, 0.1);
  ent("#cta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.0, ease: "expo.out" }, 134.45);
  ent("#mini", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, 135.7);
  tl.set({}, {}, DUR);

  // ===================== Elementos dependientes del tiempo =====================
  const CAP = [
    [10.3, 26.2, "", "Lo que pide la ley", 0], [27.6, 36.4, "", "El problema", 1], [38.9, 45.7, "", "La solución", 0],
    [46.0, 48.9, "01", "Alta de la empresa", 0], [49.5, 61.0, "02", "Cuestionario anónimo", 0], [61.6, 71.0, "03", "Una persona, una respuesta", 0],
    [71.6, 82.6, "04", "Evaluación con FPSICO", 0], [83.3, 93.7, "05", "Resultados de seguimiento", 0], [94.4, 101.6, "06", "Plan de acción", 0],
    [102.3, 112.6, "07", "Desconexión digital", 0], [114.4, 120.7, "", "Principios", 1], [121.2, 128.1, "", "Origen", 1],
  ];
  const DEMO = [[38.9, 48.9], [61.6, 112.6]];
  const env = (t, a, b, f = 0.4) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));

  window.pintar = function (t) {
    tl.seek(Math.min(t, DUR), false);
    let o = 0;
    for (const [a, b, n, tx, osc] of CAP) {
      if (t >= a - 0.01 && t <= b + 0.01) {
        $("#cap-n").textContent = n; $("#cap-t").textContent = tx; o = env(t, a, b);
        $("#cap").style.color = osc ? "#BDBDB6" : "#55554F";
        $("#cap-n").style.display = n ? "" : "none";
      }
    }
    $("#cap").style.opacity = o;
    $("#demo").style.opacity = Math.max(0, ...DEMO.map(([a, b]) => env(t, a, b)));
    let s = "", so = 0;
    for (const c of window.CUES) if (t >= c.ini && t <= c.fin) { s = c.texto; so = env(t, c.ini, c.fin, 0.12); }
    const sub = $("#sub"); if (sub.textContent !== s) sub.textContent = s; sub.style.opacity = so;
  };
  const params = new URLSearchParams(location.search);
  window.listo = document.fonts.ready
    .then(() => Promise.all(Array.from(document.images).map((im) => im.decode().catch(() => {}))))
    .then(() => { window.pintar(params.has("t") ? +params.get("t") : 0); return true; });
})();
