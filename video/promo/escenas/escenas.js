// Animación del vídeo promocional de LUMBRA360.
// Todo depende del tiempo t (segundos): window.pintar(t) deja el fotograma listo para capturarlo.
(function () {
  const params = new URLSearchParams(location.search);
  const V = params.get("fmt") === "v"; // vertical 9:16
  document.body.classList.add(V ? "v" : "h");
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const css = (el, o) => Object.assign(el.style, o);
  const px = (n) => n + "px";

  // ---------- Maquetación por formato ----------
  const L = V
    ? {
        flot: { mail: [80, 330, -6], xls: [620, 400, 5], acta: [400, 760, 3], carpeta: [60, 1130, -4], nota: [740, 1210, 7] },
        lista: [80, 640, 920], centro: [540, 900],
        logo: [210, 640, 660], logoSub: [90, 850, 900],
        e3texto: [72, 260, 936], tit: 78, movil: [340, 760, 0.9],
        vres: [60, 300, 960, 1210],
        barras: { x: 90, y0: 700, dy: 110, w: 900, h: 34 },
        tarjetas: [[90, 440, 900, 270], [90, 740, 900, 270], [90, 1040, 900, 270]],
        e5cab: [90, 360],
        poli: [260, 230, 0.8], sello: [250, 520], e6der: [72, 840, 936],
        panel: [60, 330, 960], aud: [72, 236, 936],
      }
    : {
        flot: { mail: [240, 190, -6], xls: [1290, 150, 5], acta: [820, 380, 3], carpeta: [300, 560, -4], nota: [1390, 600, 7] },
        lista: [580, 290, 760], centro: [960, 520],
        logo: [670, 320, 580], logoSub: [160, 510, 1600],
        e3texto: [150, 250, 960], tit: 96, movil: [1290, 118, 0.86],
        vres: [160, 190, 1600, 590],
        barras: { x: 470, y0: 400, dy: 110, w: 1000, h: 34 },
        tarjetas: [[150, 370, 500, 270], [710, 370, 500, 270], [1270, 370, 500, 270]],
        e5cab: [150, 310],
        poli: [190, 130, 1], sello: [250, 520], e6der: [900, 200, 840],
        panel: [160, 165, 1600], aud: [160, 116, 1600],
      };

  for (const [k, [x, y, r]] of Object.entries(L.flot)) css($("#f-" + k), { left: px(x), top: px(y), transform: `rotate(${r}deg)` });
  css($("#lista"), { left: px(L.lista[0]), top: px(L.lista[1]), width: px(L.lista[2]) });
  css($("#logo"), { left: px(L.logo[0]), top: px(L.logo[1]), width: px(L.logo[2]) });
  css($("#logo-sub"), { left: px(L.logoSub[0]), top: px(L.logoSub[1]), width: px(L.logoSub[2]), lineHeight: "1.6" });
  css($("#e3-texto"), { left: px(L.e3texto[0]), top: px(L.e3texto[1]), width: px(L.e3texto[2]) });
  css($("#e3-tit"), { fontSize: px(L.tit), marginBottom: px(V ? 44 : 56) });
  css($("#e3-nota"), { marginTop: px(V ? 34 : 44), maxWidth: px(V ? 900 : 640) });
  css($("#movil-escena"), { left: px(L.movil[0]), top: px(L.movil[1]), transform: `scale(${L.movil[2]})`, transformOrigin: "top center" });
  css($("#v-res"), { left: px(L.vres[0]), top: px(L.vres[1]), width: px(L.vres[2]), height: px(L.vres[3]) });
  css($("#e5-cab"), { left: px(L.e5cab[0]), top: px(L.e5cab[1]) });
  const B = L.barras, anchos = [0.76, 0.44, 0.58];
  for (let i = 0; i < 3; i++) {
    const y = B.y0 + i * B.dy;
    css($("#br" + i), { left: px(B.x), top: px(y), width: px(B.w * anchos[i]), height: px(B.h) });
    css($("#be" + i), { left: px(B.x), top: px(y - 38) });
  }
  css($("#poli-escena"), { left: px(L.poli[0]), top: px(L.poli[1]), transform: `scale(${L.poli[2]})`, transformOrigin: "top left" });
  css($("#sello"), { left: px(L.sello[0]), top: px(L.sello[1]) });
  css($("#e6-der"), { left: px(L.e6der[0]), top: px(L.e6der[1]), width: px(L.e6der[2]) });
  css($("#sinvig"), { marginTop: px(34) });
  css($("#panel-escena"), { left: px(L.panel[0]), top: px(L.panel[1]), width: px(L.panel[2]) });
  css($("#e7-aud"), { left: px(L.aud[0]), top: px(L.aud[1]), width: px(L.aud[2]), lineHeight: "1.6" });
  if (V) {
    css($("#panel .lateral"), { display: "none" });
    css($("#panel .cab-p"), { flexDirection: "column", gap: "8px" });
    css($("#c-logo"), { width: px(620) });
  } else {
    css($("#c-logo"), { width: px(620) });
  }

  // Puntos de cada grupo
  $$(".grupo").forEach((g) => {
    const n = +g.dataset.n, cont = g.querySelector(".puntos");
    for (let i = 0; i < n; i++) cont.appendChild(document.createElement("i"));
  });

  // ---------- Línea de tiempo ----------
  gsap.defaults({ ease: "power2.inOut" });
  const tl = gsap.timeline({ paused: true });
  const fade = (sel, on, at, d = 0.6) => tl.to(sel, { opacity: on ? 1 : 0, duration: d, ease: "sine.inOut" }, at);

  // Escena 1: desorden flotando
  tl.set("#e1", { opacity: 1 }, 0);
  const docs = ["#d-mail", "#d-xls", "#d-acta", "#d-carpeta", "#d-nota"];
  const giros = [[8, -14], [-6, 16], [10, 8], [-8, -12], [6, 14]];
  docs.forEach((d, i) => {
    gsap.set(d, { transformPerspective: 1400, rotationX: giros[i][0], rotationY: giros[i][1] });
    tl.from(d, { opacity: 0, y: 50, scale: 0.92, duration: 1.6, ease: "power3.out" }, 0.15 + i * 0.28);
  });

  // Escena 2: se ordenan y aparece la lista
  const st = $("#stage").getBoundingClientRect();
  docs.forEach((d, i) => {
    const r = $(d).getBoundingClientRect();
    const cx = r.left - st.left + r.width / 2, cy = r.top - st.top + r.height / 2;
    tl.to(d, { x: L.centro[0] - cx, y: L.centro[1] - cy, scale: 0.3, rotationX: 0, rotationY: 0, opacity: 0, duration: 1.4, ease: "power3.inOut" }, 8.3 + i * 0.09);
  });
  tl.from("#lista", { opacity: 0, scale: 0.96, y: 24, duration: 1.1, ease: "power3.out" }, 9.0);
  tl.to(".fila", { opacity: 1, duration: 0.6, stagger: 0.22, ease: "sine.out" }, 9.4);
  tl.from(".fila", { x: -14, duration: 0.6, stagger: 0.22, ease: "power2.out" }, 9.4);
  $$(".fila").forEach((f, i) => {
    tl.to(f.querySelector("path"), { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 10.3 + i * 0.32);
    tl.to(f.querySelector(".relleno"), { opacity: 1, duration: 0.5 }, 10.3 + i * 0.32);
  });
  tl.to("#lista", { opacity: 0, y: -40, duration: 0.9, ease: "power2.in" }, 12.9);
  tl.fromTo("#logo", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" }, 13.4);
  tl.fromTo("#logo-sub", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, 14.1);
  tl.fromTo(".paso", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }, 14.7);
  fade("#e1", false, 17.5, 0.7);

  // Escena 3: cuestionario anónimo en el móvil
  fade("#e3", true, 18.0, 0.6);
  tl.from("#e3-tit", { opacity: 0, y: 30, duration: 1.2, ease: "power3.out" }, 18.3);
  gsap.set("#movil", { transformPerspective: 1800 });
  tl.fromTo("#movil", { opacity: 0, y: 70, rotationY: -40, rotationX: 10 }, { opacity: 1, y: 0, rotationY: V ? -10 : -18, rotationX: 5, duration: 1.8, ease: "power3.out" }, 18.2);
  tl.to("#movil", { rotationY: V ? 6 : -10, rotationX: 2, duration: 9.5, ease: "sine.inOut" }, 20.0);
  tl.to("#b-empezar", { scale: 0.95, duration: 0.15, ease: "power1.out" }, 21.9);
  tl.to("#b-empezar", { scale: 1, duration: 0.2, ease: "power1.out" }, 22.05);
  tl.to("#p-a", { opacity: 0, x: -40, duration: 0.5 }, 22.3);
  tl.fromTo("#p-b", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 22.4);
  tl.to("#op-dot", { scale: 1, duration: 0.3, ease: "back.out(2)" }, 24.1);
  tl.to("#op-sel", { borderColor: "#F25A1F", backgroundColor: "#FFF6F2", duration: 0.3 }, 24.1);
  tl.to("#prog-q", { width: "58%", duration: 0.6 }, 24.4);
  tl.to("#p-b", { opacity: 0, x: -40, duration: 0.5 }, 25.3);
  tl.fromTo("#p-c", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 25.4);
  tl.from("#g-circ", { scale: 0, svgOrigin: "60 60", duration: 0.6, ease: "back.out(1.6)" }, 25.5);
  tl.to("#g-check", { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, 25.9);
  const chips = $$("#e3-chips .chip");
  [20.4, 22.6, 23.5, 24.3].forEach((at, i) => tl.fromTo(chips[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, at));
  tl.fromTo("#e3-nota", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 26.2);
  fade("#e3", false, 29.3, 0.7);

  // Escena 4: resultados por grupos
  fade("#e4", true, 30.0, 0.6);
  tl.fromTo("#v-res", { opacity: 0, y: 50, rotationX: 10, transformPerspective: 2200 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.4, ease: "power3.out" }, 30.0);
  tl.to(".grupo", { opacity: 1, duration: 0.6, stagger: 0.15, ease: "sine.out" }, 30.6);
  $$(".grupo").forEach((g, gi) => {
    tl.to(g.querySelectorAll(".puntos i"), { scale: 1, duration: 0.35, stagger: 0.035, ease: "back.out(2)" }, 31.0 + gi * 0.2);
    g.querySelectorAll(".m-b i").forEach((b, bi) => {
      if (b.classList.contains("lb")) b.style.background = "#F25A1F";
      tl.to(b, { width: b.dataset.w, duration: 1.0, ease: "power3.out" }, 32.0 + gi * 0.15 + bi * 0.1);
    });
  });
  tl.to("#g-peq-c", { filter: "blur(12px)", opacity: 0.35, duration: 0.9, ease: "sine.inOut" }, 34.3);
  tl.to("#g-peq", { borderColor: "#F25A1F", duration: 0.6 }, 34.6);
  tl.fromTo("#velo", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, 34.7);
  tl.to("#v-res", { scale: 1.025, duration: 10, ease: "none" }, 31.4);
  fade("#e4", false, 41.0, 0.7);

  // Escena 5: de resultados a medidas
  fade("#e5", true, 41.5, 0.5);
  tl.fromTo(["#be0", "#be1", "#be2"], { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.15 }, 41.7);
  for (let i = 0; i < 3; i++) {
    const tgt = L.tarjetas[i];
    tl.fromTo("#br" + i, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1.0, ease: "power3.out" }, 41.8 + i * 0.15);
    tl.to("#br" + i, { left: tgt[0], top: tgt[1], width: tgt[2], height: tgt[3], borderRadius: 18, duration: 1.5, ease: "power3.inOut" }, 43.9 + i * 0.12);
    tl.to(`#br${i} .tar`, { opacity: 1, duration: 0.6 }, 44.5 + i * 0.12);
    tl.to(`#br${i} .fondo`, { opacity: 0, duration: 0.6 }, 44.8 + i * 0.12);
    tl.fromTo(`#br${i} .cuerpo`, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 45.3 + i * 0.15);
  }
  tl.to(["#be0", "#be1", "#be2"], { opacity: 0, duration: 0.4 }, 43.6);
  tl.fromTo("#e5-cab", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 45.4);
  tl.to("#st-pend", { opacity: 0, y: -8, duration: 0.4 }, 49.6);
  tl.fromTo("#st-curso", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 49.75);
  fade("#e5", false, 53.2, 0.7);

  // Escena 6: desconexión digital
  fade("#e6", true, 53.8, 0.6);
  tl.fromTo("#poli", { opacity: 0, x: -60, rotationY: 28, transformPerspective: 2000 }, { opacity: 1, x: 0, rotationY: V ? 0 : 10, duration: 1.8, ease: "power3.out" }, 53.9);
  const pds = $$(".pd");
  [55.3, 56.3, 57.3, 58.2].forEach((at, i) => {
    tl.fromTo(pds[i], { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, at);
    const c = pds[i].querySelector(".ok2 circle"), p = pds[i].querySelector(".ok2 path");
    if (c) { tl.to(c, { opacity: 1, duration: 0.4 }, at + 0.5); tl.to(p, { strokeDashoffset: 0, duration: 0.4 }, at + 0.7); }
  });
  tl.to("#anillo-p", { strokeDashoffset: 194.8 * (1 - 21 / 24), duration: 3.2, ease: "power2.out" }, 57.6);
  tl.fromTo("#sello", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.3)" }, 59.3);
  tl.fromTo("#sinvig", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9 }, 60.7);
  fade("#e6", false, 62.4, 0.6);

  // Escena 7: panel completo y cierre
  fade("#e7", true, 62.8, 0.6);
  gsap.set("#panel", { transformPerspective: 2400 });
  tl.fromTo("#panel", { opacity: 0, scale: 1.1, rotationX: 12, y: 40 }, { opacity: 1, scale: 1, rotationX: 3, y: 0, duration: 1.8, ease: "power3.out" }, 62.8);
  tl.to("#panel", { scale: 0.96, rotationX: 0, duration: 3, ease: "none" }, 64.6);
  tl.fromTo("#e7-aud", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 63.2);
  tl.fromTo(".losa", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 63.1);
  tl.fromTo(".ev", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.2, ease: "power3.out" }, 63.8);
  tl.to("#negro", { opacity: 1, duration: 0.7, ease: "sine.inOut" }, 65.9);
  tl.fromTo("#c-logo", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" }, 66.4);
  tl.fromTo("#c-nombre", { opacity: 0 }, { opacity: 1, duration: 1.0 }, 67.1);
  tl.fromTo("#c-lema", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.3, ease: "power3.out" }, 68.5);
  tl.fromTo("#c-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 70.6);
  tl.set({}, {}, 75);

  // ---------- Elementos que dependen del tiempo directamente ----------
  const ROT = [
    [0.6, 7.9, "", "Correos · hojas de cálculo · actas · carpetas"],
    [18.4, 29.4, "02", "Cuestionario anónimo"],
    [30.4, 41.1, "03", "Resultados por grupos"],
    [42.0, 53.3, "04", "Plan de acción"],
    [54.2, 62.5, "05", "Desconexión digital"],
    [63.1, 65.9, "06", "Evidencias fechadas"],
  ];
  const DEMO = [[18.4, 29.4], [30.4, 41.1], [54.2, 62.5]];
  const env = (t, a, b, f = 0.45) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
  const flotar = { mail: [0, 1], xls: [1.3, 0.8], acta: [2.1, 1.1], carpeta: [3.7, 0.9], nota: [4.4, 1.2] };
  const CODIGO = "K7M24Q";

  window.pintar = function (t) {
    tl.seek(Math.min(t, 75), false);
    // flotación suave de los papeles (se apaga al ordenarse)
    const amp = t < 8.3 ? 1 : Math.max(0, 1 - (t - 8.3) / 1.2);
    for (const [k, [ph, sp]] of Object.entries(flotar)) {
      const r = L.flot[k][2];
      const x = Math.sin(t * 0.55 * sp + ph) * 14 * amp, y = Math.cos(t * 0.45 * sp + ph * 1.3) * 18 * amp;
      $("#f-" + k).style.transform = `translate(${x}px, ${y}px) rotate(${r * (0.4 + 0.6 * amp) + Math.sin(t * 0.3 + ph) * 1.5 * amp}deg)`;
    }
    // rótulo de escena
    let ro = 0;
    for (const [a, b, n, tx] of ROT) {
      const e = env(t, a, b);
      if (t >= a - 0.01 && t <= b + 0.01) { $("#r-num").textContent = n; $("#r-tx").textContent = tx; ro = e; }
    }
    $("#rotulo").style.opacity = ro;
    $("#r-num").style.display = $("#r-num").textContent ? "" : "none";
    $("#demo").style.opacity = Math.max(0, ...DEMO.map(([a, b]) => env(t, a, b)));
    // código tecleado
    const boxes = $$("#codigo div");
    const n = Math.max(0, Math.min(6, Math.floor((t - 20.0) / 0.24) + 1));
    boxes.forEach((b, i) => { b.textContent = i < n ? CODIGO[i] : ""; b.classList.toggle("activo", i === n && n < 6 && t > 19.6); });
    // contador de acuses
    const p = Math.max(0, Math.min(1, (t - 57.6) / 3.2));
    $("#cifra").textContent = Math.round(21 * (1 - Math.pow(1 - p, 2))) + "/24";
    // subtítulos
    let s = "", so = 0;
    for (const c of window.CUES) {
      if (t >= c.ini && t <= c.fin) { s = c.texto; so = env(t, c.ini, c.fin, 0.12); }
    }
    const sub = $("#sub");
    if (sub.textContent !== s) sub.textContent = s;
    sub.style.opacity = so;
  };

  window.listo = document.fonts.ready.then(() => Promise.all(Array.from(document.images).map((im) => im.decode().catch(() => {})))).then(() => { window.pintar(params.has("t") ? +params.get("t") : 0); return true; });
})();
