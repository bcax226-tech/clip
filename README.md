# 🎬 ClipViral

Auto-clipping tool buat ngubah video panjang (podcast, talkshow, interview) jadi klip-klip pendek vertikal siap upload TikTok / Reels / Shorts.

Pipeline-nya:
1. **Input** — upload file video atau paste URL YouTube
2. **Transcribe** — [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (CTranslate2, lokal, **4–6× lebih cepat** dari openai-whisper). No API call.
3. **Cari momen viral** — Claude (Opus 4.7) analisa transcript, pilih 1–10 momen paling menarik, kasih judul clickbait + hook + hashtag
4. **Render** — FFmpeg potong, crop ke 9:16 (1080×1920), burn subtitle, tempel hook banner + judul di 3 detik pertama, optional background music

## Prasyarat

- Node.js 20+
- **FFmpeg** & **ffprobe** terinstall (`apt install ffmpeg` / `brew install ffmpeg`)
- **Python 3.9+** + `faster-whisper`:
  ```bash
  pip install faster-whisper
  ```
  Model auto-download saat pertama dipakai (~140MB untuk `base`).
- **yt-dlp** kalau mau pakai URL YouTube (`pip install yt-dlp`)
- Font bold (auto-detect: DejaVu Sans Bold di Linux, Arial Bold di macOS/Windows). Kalau gak ketemu, fallback ke default FFmpeg font.
- API key:
  - `ANTHROPIC_API_KEY` ([console.anthropic.com](https://console.anthropic.com))

Cek kesiapan environment kapan saja: `GET /api/health` (UI juga tampilin warning kalau ada yang kurang).

## Setup

```bash
npm install
pip install faster-whisper yt-dlp
cp .env.example .env
# isi ANTHROPIC_API_KEY
npm run dev
```

Buka http://localhost:3000

## Tuning kecepatan transcribe

Override via `.env`:

| Env | Default | Catatan |
| --- | --- | --- |
| `WHISPER_MODEL` | `base` | `tiny` (paling cepat, akurasi turun) → `small`/`medium`/`large-v3` (lebih akurat, lebih lambat) |
| `WHISPER_DEVICE` | `cpu` | `cuda` kalau punya GPU NVIDIA |
| `WHISPER_COMPUTE` | `int8` | `int8_float16` / `float16` (GPU), `float32` (akurasi max) |
| `PYTHON_BIN` | `python3` | Path Python kalau bukan default |

Patokan kasar di CPU modern (laptop i5/M1) dengan model `base` + `int8`:
- Audio 5 menit → transkrip ~30 detik
- Audio 30 menit → transkrip ~3 menit
- Audio 60 menit → transkrip ~6 menit

VAD (voice-activity-detection) di-enable default, ini auto-skip bagian silent dan bikin lebih kencang.

## Background music (opsional)

Taruh file `.mp3` / `.m4a` / `.wav` royalty-free di `public/music/`. Tool akan random pilih satu per klip.

## Struktur

```
scripts/
  transcribe_fast.py    # Python: faster-whisper wrapper, output NDJSON
src/
  app/
    page.tsx              # UI utama
    api/process/route.ts  # POST upload/URL → bikin job
    api/jobs/[id]/route.ts # GET status job
    api/health/route.ts   # cek ffmpeg/python/faster-whisper/font/key
  lib/
    pipeline.ts   # orkestrasi end-to-end
    download.ts   # yt-dlp wrapper
    transcribe.ts # spawn scripts/transcribe_fast.py
    analyze.ts    # Claude → momen viral
    clip.ts       # FFmpeg: crop 9:16 + subtitle + hook + musik
    ffmpeg.ts     # helper
    jobs.ts       # storage job di data/jobs/
    types.ts
```

## Catatan

- Job state disimpan di filesystem (`data/jobs/*.json`). Untuk production swap ke Redis/Postgres.
- Pipeline dijalankan inline di Next.js route (fire-and-forget). Untuk video panjang / banyak user, pakai queue (BullMQ + worker terpisah).
- `maxDuration = 600` di route — sesuaikan kalau deploy ke serverless (Vercel free max 60s).
- Font bold di-auto-detect lintas OS (`src/lib/fonts.ts`). Kalau gak ketemu, drawtext pakai default font FFmpeg.
