"""Sintetiza cada frase de la locución por separado y guarda su duración en audio/frases.json.
Uso: python3 voz.py <modelo.onnx> [locutor]"""
import json, subprocess, sys, wave, os
import numpy as np
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELO, LOC = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "0")
SR = 48000
# (id, texto en pantalla, texto hablado o None)
FRASES = json.load(open(os.path.join(RAIZ, "scripts", "guion.json"), encoding="utf-8"))
out = []
for f in FRASES:
    ruta = os.path.join(RAIZ, "audio", "tmp", f["id"] + ".wav")
    subprocess.run([sys.executable, "-m", "piper", "-m", MODELO, "-s", LOC, "--length-scale", f.get("lento", "1.06"),
                    "--noise-scale", "0.55", "--noise-w-scale", "0.7", "-f", ruta],
                   input=(f.get("habla") or f["texto"]).encode(), check=True, capture_output=True)
    with wave.open(ruta) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    idx = np.where(np.abs(x) > 0.01)[0]
    x = x[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
    x = np.interp(np.linspace(0, len(x) - 1, int(len(x) * SR / sr)), np.arange(len(x)), x)
    np.save(ruta.replace(".wav", ".npy"), x)
    out.append({"id": f["id"], "dur": round(len(x) / SR, 3)})
    print(f["id"], out[-1]["dur"], f["texto"])
json.dump(out, open(os.path.join(RAIZ, "audio", "frases.json"), "w"), indent=1)
