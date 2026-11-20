"""Coloca cada frase en su tiempo, mezcla con la música y escribe subtítulos (SRT y cues.js)."""
import json, os, wave
import numpy as np
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, DUR = 48000, 116.0
INICIOS = {"a1":1.6,"a2":4.4,"b1":10.6,"b2":15.6,"b3":21.8,"c1":28.0,"c2":34.0,"d1":39.6,"e1":46.6,"e2":50.0,"e3":54.6,
           "f1":61.0,"f2":65.8,"g1":72.0,"h1":80.0,"h2":86.2,"i1":91.8,"j1":99.0,"k1":107.2,"k2":109.6}
guion = {f["id"]: f for f in json.load(open(os.path.join(RAIZ, "scripts", "guion.json"), encoding="utf-8"))}
voz = np.zeros(int(DUR * SR)); cues = []
for fid, t in INICIOS.items():
    x = np.load(os.path.join(RAIZ, "audio", "tmp", fid + ".npy"))
    a = int(t * SR); voz[a:a + len(x)] += x
    cues.append({"id": fid, "ini": round(t - 0.08, 2), "fin": round(t + len(x) / SR + 0.4, 2), "texto": guion[fid]["texto"]})
for i in range(len(cues) - 1):
    cues[i]["fin"] = min(cues[i]["fin"], round(cues[i + 1]["ini"] - 0.05, 2))
voz *= 0.85 / np.abs(voz).max()
def lee(r):
    with wave.open(r) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64).reshape(-1, 2) / 32768
def escribe(r, x):
    with wave.open(r, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
m = lee(os.path.join(RAIZ, "audio", "musica.wav"))[: len(voz)]
g = np.full(len(voz), 0.62)
for c in cues: g[max(0, int((c["ini"] - 0.25) * SR)): int((c["fin"] + 0.1) * SR)] = 0.28
k = int(0.4 * SR); g = np.convolve(g, np.ones(k) / k, mode="same")
mez = m * g[:, None] + np.stack([voz, voz], 1) * 0.95
escribe(os.path.join(RAIZ, "audio", "mezcla.wav"), mez / (np.abs(mez).max() / 0.9))
escribe(os.path.join(RAIZ, "audio", "locucion.wav"), np.stack([voz, voz], 1))
def wrap(s, n=42):
    if len(s) <= n: return s
    w = s.split(); i = min(range(1, len(w)), key=lambda i: max(len(" ".join(w[:i])), len(" ".join(w[i:]))))
    return " ".join(w[:i]) + "\n" + " ".join(w[i:])
def ts(s):
    m_, se = divmod(s, 60); return f"00:{int(m_):02d}:{int(se):02d},{int(round((se % 1) * 1000)) % 1000:03d}"
with open(os.path.join(RAIZ, "subtitulos", "lumbra360-promo-v2.es.srt"), "w", encoding="utf-8") as f:
    for i, c in enumerate(cues, 1): f.write(f"{i}\n{ts(c['ini'])} --> {ts(c['fin'])}\n{wrap(c['texto'])}\n\n")
with open(os.path.join(RAIZ, "escenas", "cues.js"), "w", encoding="utf-8") as f:
    f.write("window.CUES = " + json.dumps(cues, ensure_ascii=False, indent=1) + ";\n")
print(len(cues), "subtítulos")
