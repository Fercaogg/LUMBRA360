// Renderiza el vídeo fotograma a fotograma con Chromium (Playwright) y lo codifica con ffmpeg.
// Uso: node render.js h|v salida.mp4 [fps]   o   node render.js h|v --fotos 1,5,10 carpeta
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

(async () => {
  const fmt = process.argv[2] === "v" ? "v" : "h";
  const [W, H] = fmt === "v" ? [1080, 1920] : [1920, 1080];
  const url = "file://" + path.resolve(__dirname, "../escenas/index.html") + "?fmt=" + fmt;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("console", (m) => console.log("[pagina]", m.text()));
  page.on("pageerror", (e) => console.log("[error]", e.message));
  await page.goto(url);
  await page.evaluate(() => window.listo);
  const stage = await page.$("#stage");

  if (process.argv[3] === "--fotos") {
    const tiempos = process.argv[4].split(",").map(Number);
    const dir = process.argv[5];
    fs.mkdirSync(dir, { recursive: true });
    for (const t of tiempos) {
      await page.evaluate((t) => window.pintar(t), t);
      await stage.screenshot({ path: path.join(dir, `${fmt}_${String(t).padStart(5, "0")}.png`) });
    }
    await browser.close();
    return;
  }

  const salida = process.argv[3];
  const fps = +(process.argv[4] || 30);
  const audio = path.resolve(__dirname, "../audio/mezcla.wav");
  const total = Math.round(75 * fps);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-profile:v", "high", "-tune", "animation", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", salida], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.pintar(t), f / fps);
    const buf = await stage.screenshot({ type: "jpeg", quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % (fps * 5) === 0) console.log(`${fmt} ${(f / fps).toFixed(0)} s · ${((Date.now() - t0) / 1000).toFixed(0)} s reales`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  console.log("hecho", salida);
})();
