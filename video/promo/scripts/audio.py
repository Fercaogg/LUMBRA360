"""Genera la locución (Piper, voz es_ES), los subtítulos y la mezcla final con la música.
Uso: python3 audio.py <ruta_modelo.onnx> [id_locutor]
Salidas: audio/locucion.wav, audio/mezcla.wav, subtitulos/lumbra360-promo.es.srt, escenas/cues.js"""
import json, subprocess, sys, wave, os
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
MODELO = sys.argv[1]
LOCUTOR = sys.argv[2] if len(sys.argv) > 2 else "0"
SR = 48000
DUR = 75.0

# Bloques de locución: (inicio en segundos, [(texto en pantalla, texto hablado), ...])
BLOQUES = [
    (0.9,  [("Cuidar a la plantilla es parte del trabajo.", None), ("Demostrarlo, también.", None)]),
    (9.4,  [("LUMBRA360 reúne la evaluación psicosocial y la desconexión digital en un mismo sitio.",
             "Lumbra trescientos sesenta reúne la evaluación psicosocial y la desconexión digital en un mismo sitio.")]),
    (19.8, [("La plantilla responde de forma anónima, desde el móvil, sin cuenta y sin nombre.", None)]),
    (31.4, [("Los resultados se ven por grupos de cinco personas o más.", None), ("Nadie queda expuesto.", None)]),
    (43.8, [("Cada resultado se convierte en medidas con responsable y fecha.", None)]),
    (55.4, [("Política de desconexión, audiencia, acuses y formación.", None), ("Todo queda fechado.", None)]),
    (66.6, [("LUMBRA360.", "Lumbra trescientos sesenta."), ("Cumplir y cuidar sin vigilar.", None)]),
]
PAUSA = 0.45

def sintetiza(texto, ruta):
    subprocess.run([sys.executable, "-m", "piper", "-m", MODELO, "-s", LOCUTOR, "--length-scale", "1.08",
                    "--noise-scale", "0.55", "--noise-w-scale", "0.7", "-f", ruta],
                   input=texto.encode(), check=True, capture_output=True)
    with wave.open(ruta) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    # recorte de silencios en los extremos
    umbral = 0.01
    idx = np.where(np.abs(x) > umbral)[0]
    x = x[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
    # remuestreo lineal a 48 kHz
    n = int(len(x) * SR / sr)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)

os.makedirs(os.path.join(RAIZ, "audio", "tmp"), exist_ok=True)
os.makedirs(os.path.join(RAIZ, "subtitulos"), exist_ok=True)
voz = np.zeros(int(DUR * SR))
cues = []
for b, (inicio, frases) in enumerate(BLOQUES):
    t = inicio
    for f, (pantalla, hablado) in enumerate(frases):
        x = sintetiza(hablado or pantalla, os.path.join(RAIZ, "audio", "tmp", f"vo_{b}_{f}.wav"))
        a = int(t * SR); voz[a:a + len(x)] += x
        d = len(x) / SR
        cues.append({"ini": round(t - 0.1, 2), "fin": round(t + d + 0.35, 2), "texto": pantalla, "bloque": b})
        t += d + PAUSA
# Ajuste: que un subtítulo no pise al siguiente
for i in range(len(cues) - 1):
    cues[i]["fin"] = min(cues[i]["fin"], cues[i + 1]["ini"] - 0.05)

voz /= max(1e-9, np.abs(voz).max()); voz *= 0.85

def escribe(ruta, est):
    pcm = (np.clip(est, -1, 1) * 32767).astype(np.int16)
    with wave.open(ruta, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

escribe(os.path.join(RAIZ, "audio", "locucion.wav"), np.stack([voz, voz], 1))

# Mezcla con la música, bajándola mientras habla la voz
with wave.open(os.path.join(RAIZ, "audio", "musica.wav")) as w:
    m = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64).reshape(-1, 2) / 32768
m = m[: len(voz)]
ganancia = np.full(len(voz), 0.62)
for c in cues:
    a, z = int((c["ini"] - 0.2) * SR), int((c["fin"] + 0.1) * SR)
    ganancia[max(0, a):z] = 0.30
k = int(0.35 * SR)
ganancia = np.convolve(ganancia, np.ones(k) / k, mode="same")
mezcla = m * ganancia[:, None] + np.stack([voz, voz], 1) * 0.95
mezcla /= np.abs(mezcla).max() / 0.9
escribe(os.path.join(RAIZ, "audio", "mezcla.wav"), mezcla)

def ts(s):
    h, r = divmod(s, 3600); mi, se = divmod(r, 60)
    return f"{int(h):02d}:{int(mi):02d}:{int(se):02d},{int(round((se - int(se)) * 1000)):03d}"
with open(os.path.join(RAIZ, "subtitulos", "lumbra360-promo.es.srt"), "w", encoding="utf-8") as f:
    for i, c in enumerate(cues, 1):
        f.write(f"{i}\n{ts(c['ini'])} --> {ts(c['fin'])}\n{c['texto']}\n\n")
with open(os.path.join(RAIZ, "escenas", "cues.js"), "w", encoding="utf-8") as f:
    f.write("window.CUES = " + json.dumps(cues, ensure_ascii=False, indent=1) + ";\n")
for c in cues: print(c)
