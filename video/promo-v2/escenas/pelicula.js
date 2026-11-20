// Película promocional de LUMBRA360 (16:9, 116 s). Todo depende del tiempo: window.pintar(t).
(function () {
  const DUR = 116;
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

  // ===================== 4 a 8. Producto real =====================
  const K = 1400 / 1600; // escala de las capturas
  const PANT = ["#i-empresa", "#i-partner", "#i-resultados", "#i-plan", "#i-desc"];
  gsap.set("#cam", { x: 0, y: 0, scale: 1 });
  const verPant = (id, at, d = 0.35) => PANT.forEach((p) => tl.to(p, { opacity: p === id ? 1 : 0, duration: d, ease: "sine.inOut" }, at));
  // Acercamiento a una zona de la captura (coordenadas en píxeles de la captura original de 1600 px)
  const zona = (r, maxS = 1.9) => {
    const [x0, y0, x1, y1] = r.map((v) => v * K);
    const s = Math.min(1300 / (x1 - x0), 560 / (y1 - y0), maxS);
    let x = 700 - s * (x0 + x1) / 2, y = 305 - s * (y0 + y1) / 2;
    x = Math.min(0, Math.max(1400 - 1400 * s, x)); y = Math.min(0, y);
    return { x, y, scale: s };
  };
  const acerca = (r, at, maxS, d = 1.0) => tl.to("#cam", Object.assign(zona(r, maxS), { duration: d, ease: "power3.inOut" }), at);
  const aleja = (at, d = 0.9) => tl.to("#cam", { x: 0, y: 0, scale: 1, duration: d, ease: "power3.inOut" }, at);
  const marcas = $("#marcas");
  const marca = (r, at, tipo = "mk", d = 0.45) => {
    const [x0, y0, x1, y1] = r.map((v) => v * K);
    const m = document.createElement("div"); m.className = tipo;
    Object.assign(m.style, { left: x0 - 6 + "px", top: y0 - 4 + "px", width: x1 - x0 + 12 + "px", height: y1 - y0 + 8 + "px" });
    marcas.appendChild(m);
    if (tipo === "mk") tl.to(m, { scaleX: 1, duration: d, ease: "power2.out" }, at);
    else { gsap.set(m, { scale: 1.12 }); tl.to(m, { opacity: 1, scale: 1, duration: d, ease: "expo.out" }, at); }
    return m;
  };
  const quitaMarcas = (ms, at) => tl.to(ms, { opacity: 0, duration: 0.3 }, at);

  // 4. Todo en un solo sitio
  gsap.set("#app", { transformPerspective: 2200 });
  verPant("#i-empresa", 38.6, 0.01);
  ent("#app", { opacity: 0, rotationX: 30, z: -600, y: 160 }, { opacity: 1, rotationX: 0, z: 0, y: 0, duration: 1.7, ease: "expo.out" }, 38.7);
  palabras("#t4a", 39.6);
  acerca([130, 420, 1000, 486], 43.0, 1.8, 1.1);
  const tabs = [[146, 440, 238, 466], [272, 440, 504, 466], [536, 440, 666, 466], [698, 440, 876, 466], [908, 440, 976, 466]]
    .map((r, i) => marca(r, 43.85 + i * 0.36));
  palabrasFuera("#t4a", 45.75);
  quitaMarcas(tabs, 45.8);
  aleja(45.9, 0.8);
  verPant("#i-partner", 46.15);
  palabras("#t4b", 46.3, 0.06);
  acerca([140, 380, 900, 486], 47.2, 1.95, 1.0);
  palabrasFuera("#t4b", 49.15);
  tl.to("#app", { x: -1700, filter: "blur(18px)", duration: 0.55, ease: "power3.in" }, 49.25);

  // 5. Cuestionario anónimo en el móvil (pantalla real reconstruida con sus textos)
  gsap.set("#movil", { transformPerspective: 1800 });
  ent("#movil-esc", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 49.55);
  ent("#movil", { x: 700, rotationY: -55, rotationX: 8, filter: "blur(16px)" }, { x: 0, rotationY: -12, rotationX: 4, filter: "blur(0px)", duration: 1.5, ease: "expo.out" }, 49.55);
  tl.to("#movil", { rotationY: -5, rotationX: 2, duration: 8, ease: "sine.inOut" }, 51.2);
  palabras("#t5a", 50.0);
  tl.to("#continuar", { scale: 0.94, duration: 0.12, ease: "power1.out" }, 53.15);
  tl.to("#continuar", { scale: 1, duration: 0.25, ease: "power2.out" }, 53.27);
  [54.6, 55.5, 56.35].forEach((at, i) => ent(`#sin .sin:nth-child(${i + 1})`, { opacity: 0, x: -30, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, at));
  ent("#fpsico", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 57.3);
  palabrasFuera("#t5a", 59.15);
  sale(["#sin .sin", "#fpsico"], 59.15, 0.35);
  tl.to("#movil", { x: 600, rotationY: 50, opacity: 0, duration: 0.6, ease: "power3.in" }, 59.2);

  // 6. Resultados por grupos
  verPant("#i-resultados", 59.6, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 59.6);
  tl.set("#app", { x: -1700, filter: "blur(18px)", rotationX: 0, z: 0, scale: 1, opacity: 1 }, 59.7);
  tl.to("#app", { x: 0, filter: "blur(0px)", duration: 0.85, ease: "expo.out" }, 59.75);
  palabras("#t4c", 60.4, 0.06);
  acerca([140, 352, 780, 610], 61.5, 1.9, 1.1);
  const mGr = [marca([172, 548, 446, 574], 63.0, "mk", 0.6), marca([350, 518, 740, 544], 65.95, "mk", 0.8)];
  tl.to("#app", { scale: 0.9, z: -200, opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "power3.in" }, 66.95);
  quitaMarcas(mGr, 67.8);
  ent(".gr", { opacity: 0, y: 140, rotationX: -65 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 67.3);
  ent("#grupos-nota", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 68.0);
  tl.to("#gpeq-c", { filter: "blur(14px)", opacity: 0.3, duration: 0.8, ease: "sine.inOut" }, 68.45);
  tl.to("#gpeq", { borderColor: "#F25A1F", duration: 0.5 }, 68.6);
  ent("#velo", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }, 68.65);
  sale([".gr", "#grupos-nota"], 70.55, 0.45, { y: -40, stagger: 0.04 });
  palabrasFuera("#t4c", 70.6);

  // 7. Plan de acción
  verPant("#i-plan", 70.9, 0.01);
  tl.set("#cam", { x: 0, y: 0, scale: 1 }, 70.9);
  tl.set("#app", { x: 0, scale: 0.92, z: 0, opacity: 0, filter: "blur(12px)" }, 70.95);
  tl.to("#app", { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" }, 71.0);
  palabras("#t4d", 71.25);
  acerca([140, 380, 912, 780], 72.35, 1.75, 1.0);
  const mPl = [marca([170, 504, 492, 558], 73.95, "caja"), marca([538, 504, 868, 532], 74.6, "caja"), marca([774, 408, 884, 446], 75.3, "caja"), marca([168, 698, 404, 728], 76.4, "caja")];
  quitaMarcas(mPl, 78.45);
  palabrasFuera("#t4d", 78.6);
  aleja(78.5, 0.7);

  // 8. Desconexión digital
  verPant("#i-desc", 78.95);
  palabras("#t4e", 79.15, 0.06);
  acerca([126, 196, 1070, 272], 79.6, 1.9, 0.9);
  const mDe = [marca([140, 208, 288, 234], 80.15), marca([293, 208, 861, 234], 81.35, "mk", 0.8), marca([866, 208, 1025, 234], 83.05), marca([138, 240, 243, 266], 84.25), marca([248, 240, 620, 266], 86.25, "mk", 0.7)];
  quitaMarcas(mDe, 87.15);
  acerca([140, 560, 780, 690], 87.1, 1.9, 1.0);
  ent("#sello", { opacity: 0, scale: 2.2, rotation: -16 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.55, ease: "back.out(1.3)" }, 88.05);
  palabrasFuera("#t4e", 89.75);
  sale(["#app", "#sello"], 89.85, 0.5);
  inunda("#fl4", 90.15, 0.8);

  // ===================== 9. Sin vigilancia =====================
  palabras("#t9a", 91.55, 0.12);
  ent(".nm", { opacity: 0, rotationX: 60, y: 40, transformPerspective: 1400 }, { opacity: 1, rotationX: 0, y: 0, duration: 1.0, stagger: 0.14, ease: "expo.out" }, 92.5);
  [94.35, 95.25, 96.2].forEach((at, i) => tl.to(`.nm:nth-child(${i + 1}) i`, { scaleX: 1, duration: 0.45, ease: "power3.out" }, at));
  [94.5, 95.4, 96.35].forEach((at, i) => tl.to(`.nm:nth-child(${i + 1})`, { color: "#8A8A84", duration: 0.4 }, at));
  ent("#nomide-et", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7 }, 96.75);
  palabrasFuera("#t9a", 97.65);
  sale([".nm", "#nomide-et"], 97.65, 0.4);

  // ===================== 10. Origen =====================
  gsap.set("#hitos", { opacity: 0 });
  tl.set("#hitos", { opacity: 1 }, 98.0);
  palabras("#t10a", 98.25);
  gsap.set("#hitos-in", { transformPerspective: 2400, rotationY: 5, rotationX: 9 });
  tl.to("#hitos-in", { rotationY: -3, rotationX: 3, duration: 7.4, ease: "sine.inOut" }, 98.1);
  [["#h1", 98.95], ["#h2", 101.55], ["#h3", 102.95]].forEach(([h, at]) => {
    ent(h + " .c", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, at);
    ent([h + " .mono", h + " h5", h + " p"], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "expo.out" }, at + 0.2);
  });
  tl.to("#linea i", { scaleX: 0.5, duration: 1.8, ease: "power2.inOut" }, 99.6);
  tl.to("#linea i", { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 101.9);
  palabrasFuera("#t10a", 105.1);
  sale("#hitos", 105.15, 0.5);

  // ===================== 11. Cierre =====================
  construyeLogo("#l2w", 105.75);
  ent("#l2n", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.3em", duration: 1.4, ease: "expo.out" }, 107.4);
  palabras("#lema", 109.55, 0.1);
  ent("#cta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.0, ease: "expo.out" }, 111.45);
  ent("#mini", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, 112.7);
  tl.set({}, {}, DUR);

  // ===================== Elementos dependientes del tiempo =====================
  const CAP = [
    [10.3, 26.2, "", "Lo que pide la ley", 0], [27.6, 36.4, "", "El problema", 1], [38.9, 45.8, "", "La solución", 0],
    [46.1, 49.2, "01", "Alta de la empresa", 0], [49.7, 59.2, "02", "Cuestionario anónimo", 0], [60.1, 70.6, "03", "Resultados por grupos", 0],
    [71.1, 78.6, "04", "Plan de acción", 0], [79.1, 89.8, "05", "Desconexión digital", 0], [91.4, 97.7, "", "Principios", 1], [98.2, 105.1, "", "Origen", 1],
  ];
  const DEMO = [[38.9, 49.2], [49.7, 59.2], [60.1, 70.6], [71.1, 89.8]];
  const env = (t, a, b, f = 0.4) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
  const CODIGO = "K7M24Q";

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
    const n = Math.max(0, Math.min(6, Math.floor((t - 51.4) / 0.2) + 1));
    $("#codigo").textContent = CODIGO.slice(0, n);
    $("#cursor").style.opacity = n < 6 && Math.floor(t * 2) % 2 === 0 ? 1 : 0;
    let s = "", so = 0;
    for (const c of window.CUES) if (t >= c.ini && t <= c.fin) { s = c.texto; so = env(t, c.ini, c.fin, 0.12); }
    const sub = $("#sub"); if (sub.textContent !== s) sub.textContent = s; sub.style.opacity = so;
  };
  const params = new URLSearchParams(location.search);
  window.listo = document.fonts.ready
    .then(() => Promise.all(Array.from(document.images).map((im) => im.decode().catch(() => {}))))
    .then(() => { window.pintar(params.has("t") ? +params.get("t") : 0); return true; });
})();
