# 🎬 ClipViral

Auto-clipping tool buat ngubah video panjang (podcast, talkshow, interview) jadi klip-klip pendek vertikal siap upload TikTok / Reels / Shorts.

Pipeline-nya:
1. **Input** — upload file video atau paste URL YouTube
2. **Transcribe** — Whisper (OpenAI) bikin transcript + timestamp
3. **Cari momen viral** — Claude (Opus 4.7) analisa transcript, pilih 1–10 momen paling menarik, kasih judul clickbait + hook + hashtag
4. **Render** — FFmpeg potong, crop ke 9:16 (1080×1920), burn subtitle, tempel hook banner + judul di 3 detik pertama, optional background music

## Prasyarat

- Node.js 20+
- **FFmpeg** & **ffprobe** terinstall (`apt install ffmpeg` / `brew install ffmpeg`)
- **yt-dlp** kalau mau pakai URL YouTube (`pip install yt-dlp`)
- Font DejaVu Sans Bold di `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf` (default di Ubuntu/Debian — edit path di `src/lib/clip.ts` kalau lain)
- API key:
  - `ANTHROPIC_API_KEY` ([console.anthropic.com](https://console.anthropic.com))
  - `OPENAI_API_KEY` (untuk Whisper — [platform.openai.com](https://platform.openai.com))

## Setup

```bash
npm install
cp .env.example .env
# isi ANTHROPIC_API_KEY & OPENAI_API_KEY
npm run dev
```

Buka http://localhost:3000

## Background music (opsional)

Taruh file `.mp3` / `.m4a` / `.wav` royalty-free di `public/music/`. Tool akan random pilih satu per klip.

## Struktur

```
src/
  app/
    page.tsx              # UI utama
    api/process/route.ts  # POST upload/URL → bikin job
    api/jobs/[id]/route.ts # GET status job
  lib/
    pipeline.ts   # orkestrasi end-to-end
    download.ts   # yt-dlp wrapper
    transcribe.ts # extract audio + Whisper
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
- Whisper API limit 25MB per upload. Untuk audio > 25MB perlu split — belum diimplementasi.
- Font path di-hardcode untuk Linux. Untuk Mac/Windows ubah path di `src/lib/clip.ts`.
