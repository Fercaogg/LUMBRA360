"""Música ambiental original para el vídeo (síntesis con numpy, sin muestras de terceros).
Uso: python3 musica.py salida.wav [duración_s]"""
import sys, numpy as np, wave

SR = 48000
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 75.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
BPM = 84
BEAT = 60 / BPM
BAR = BEAT * 4

def midi(m): return 440 * 2 ** ((m - 69) / 12)

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    # filtro de un polo, vectorizado por bloques sencillo
    from itertools import accumulate
    b = 1 - a
    return np.fromiter(accumulate(x * b, lambda p, v: p * a + v), dtype=np.float64, count=len(x))

def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = min(n // 2, int(a * SR)), min(n // 2, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e

# Progresión cálida en re mayor: Dmaj9, Bm9, Gmaj9, Asus(add9) (dos compases cada uno)
CHORDS = [
    [50, 57, 61, 64, 66],   # D A C# E F#
    [47, 54, 57, 61, 62],   # B F# A C# D
    [43, 50, 54, 57, 62],   # G D F# A D
    [45, 52, 57, 59, 64],   # A E A B E
]
pad = np.zeros(N); arp = np.zeros(N); bass = np.zeros(N)
chord_len = BAR * 2
n_chords = int(np.ceil(DUR / chord_len))
for c in range(n_chords):
    start = c * chord_len
    notes = CHORDS[c % 4]
    # Cierre: acorde final de re mayor sostenido
    if start >= 64.0:
        notes = CHORDS[0]
    s0 = int(start * SR); s1 = min(N, int((start + chord_len + 1.5) * SR))
    n = s1 - s0
    if n <= 0: continue
    tt = np.arange(n) / SR
    e = env_adsr(n, 1.4, 1.8)
    for m in notes[1:]:
        f = midi(m + 12)
        for det in (-0.12, 0.0, 0.11):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * 2 ** (det / 12)
            # onda suave: senoidal + un poco de segundo y tercer armónico
            w = np.sin(2 * np.pi * ff * tt + ph) + 0.25 * np.sin(4 * np.pi * ff * tt + ph) + 0.08 * np.sin(6 * np.pi * ff * tt)
            pad[s0:s1] += w * e * 0.05
    fb = midi(notes[0])
    bass[s0:s1] += (np.sin(2 * np.pi * fb * tt) + 0.15 * np.sin(4 * np.pi * fb * tt)) * e * 0.16
    # Arpegio de corcheas (entra a los 8 s)
    if start >= 8.0 and start < 70:
        pattern = [notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[3] + 12, notes[2] + 12, notes[4] + 24, notes[3] + 12]
        for k in range(16):
            ts = start + k * BEAT / 2
            if ts >= DUR: break
            m = pattern[k % 8]
            ln = int(1.6 * SR); a0 = int(ts * SR); a1 = min(N, a0 + ln)
            tk = np.arange(a1 - a0) / SR
            f = midi(m)
            v = 0.055 * (0.8 + 0.2 * rng.random())
            note = (np.sin(2 * np.pi * f * tk) + 0.3 * np.sin(4 * np.pi * f * tk) * np.exp(-tk * 6)) * np.exp(-tk * 3.2)
            note[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
            arp[a0:a1] += note * v

# Pulso muy suave (bombo amortiguado y shaker) entre 18 s y 64 s
perc = np.zeros(N)
b = 0
while b * BEAT < DUR:
    ts = b * BEAT
    if 18.0 <= ts < 64.0:
        a0 = int(ts * SR); ln = int(0.5 * SR); a1 = min(N, a0 + ln)
        tk = np.arange(a1 - a0) / SR
        if b % 2 == 0:
            f = 52 + 40 * np.exp(-tk * 30)
            perc[a0:a1] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tk * 9) * 0.10
        # shaker en contratiempo
        s0 = int((ts + BEAT / 2) * SR); s1 = min(N, s0 + int(0.12 * SR))
        if s1 > s0:
            nz = rng.standard_normal(s1 - s0)
            nz = np.diff(np.concatenate([[0], nz]))  # paso alto sencillo
            perc[s0:s1] += nz * np.exp(-np.arange(s1 - s0) / SR * 40) * 0.012
    b += 1

# Pasos de filtro
arp = lowpass(arp, 3800)
pad = lowpass(pad, 2400)
mix_dry = pad + arp + bass + perc

# Reverberación: respuesta al impulso sintética (ruido con caída exponencial), convolución por FFT
ir_len = int(3.2 * SR)
ir = rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR * 2.2)
ir = lowpass(ir, 5000)
ir /= np.sqrt(np.sum(ir ** 2))
def conv(x, h):
    L = len(x) + len(h) - 1
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]
wetL = conv(pad + arp * 1.2, ir)
ir2 = np.roll(ir, int(0.011 * SR))
wetR = conv(pad + arp * 1.2, ir2)

# Paneo ligero del arpegio
L = mix_dry + 0.06 * arp + wetL * 0.55
R = mix_dry - 0.06 * arp + wetR * 0.55

# Envolvente global: entrada suave y salida
g = np.ones(N)
g[: int(2.5 * SR)] = np.linspace(0, 1, int(2.5 * SR)) ** 1.5
fo = int(4.0 * SR)
g[-fo:] *= np.linspace(1, 0, fo) ** 1.6
L *= g; R *= g
peak = max(np.abs(L).max(), np.abs(R).max())
L /= peak / 0.8; R /= peak / 0.8
out = np.stack([L, R], axis=1)
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", DUR)
