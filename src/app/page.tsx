"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

type Health = {
  ok: boolean;
  checks: {
    ffmpeg: boolean;
    ffprobe: boolean;
    ytDlp: boolean;
    font: boolean;
    anthropicKey: boolean;
    openaiKey: boolean;
  };
};

export default function Home() {
  const [mode, setMode] = useState<"upload" | "url">("url");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [numClips, setNumClips] = useState(3);
  const [addMusic, setAddMusic] = useState(true);
  const [language, setLanguage] = useState("id");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/jobs/${jobId}`);
      if (r.ok) {
        const j = (await r.json()) as Job;
        setJob(j);
        if (j.status === "done" || j.status === "error") clearInterval(t);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [jobId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (mode === "upload" && file) fd.append("file", file);
      if (mode === "url" && url) fd.append("url", url);
      fd.append("numClips", String(numClips));
      fd.append("addMusic", String(addMusic));
      fd.append("language", language);
      const res = await fetch("/api/process", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit");
      setJobId(data.id);
      setJob(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setJobId(null);
    setJob(null);
    setFile(null);
    setUrl("");
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">🎬 ClipViral</h1>
        <p className="text-zinc-400">Auto-clip podcast jadi vidio viral TikTok/Reels — pakai AI</p>
      </header>

      {health && !health.ok && (
        <div className="mb-6 p-4 bg-yellow-950 border border-yellow-700 rounded-xl text-sm space-y-1">
          <p className="font-semibold text-yellow-300">⚠ Ada dependency yang belum siap:</p>
          <ul className="text-yellow-200 list-disc list-inside">
            {!health.checks.ffmpeg && <li>ffmpeg tidak terdeteksi — install dulu sebelum lanjut</li>}
            {!health.checks.ffprobe && <li>ffprobe tidak terdeteksi (biasanya satu paket sama ffmpeg)</li>}
            {!health.checks.anthropicKey && <li>ANTHROPIC_API_KEY belum di-set di .env</li>}
            {!health.checks.openaiKey && <li>OPENAI_API_KEY belum di-set di .env</li>}
            {!health.checks.ytDlp && mode === "url" && (
              <li>yt-dlp tidak terdeteksi — wajib kalau pakai URL YouTube (`pip install yt-dlp`)</li>
            )}
          </ul>
        </div>
      )}

      {!jobId && (
        <form onSubmit={submit} className="space-y-5 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex-1 py-2 rounded-lg ${mode === "url" ? "bg-red-600" : "bg-zinc-800"}`}
            >
              URL YouTube
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex-1 py-2 rounded-lg ${mode === "upload" ? "bg-red-600" : "bg-zinc-800"}`}
            >
              Upload File
            </button>
          </div>

          {mode === "url" ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-zinc-800 p-3 rounded-lg outline-none focus:ring-2 ring-red-500"
              required
            />
          ) : (
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full bg-zinc-800 p-3 rounded-lg"
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-zinc-400">Jumlah klip</span>
              <input
                type="number"
                min={1}
                max={10}
                value={numClips}
                onChange={(e) => setNumClips(parseInt(e.target.value))}
                className="w-full bg-zinc-800 p-2 rounded-lg mt-1"
              />
            </label>
            <label className="block">
              <span className="text-sm text-zinc-400">Bahasa audio</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-800 p-2 rounded-lg mt-1"
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
                <option value="auto">Auto detect</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addMusic}
              onChange={(e) => setAddMusic(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Tambah background music (taruh file di public/music/)</span>
          </label>

          <button
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-lg font-semibold"
          >
            {submitting ? "Submitting..." : "🚀 Generate Klip Viral"}
          </button>

          {err && <p className="text-red-400 text-sm">{err}</p>}
        </form>
      )}

      {jobId && job && (
        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-sm text-zinc-400">Job {jobId.slice(0, 8)}</span>
              <span className="px-3 py-1 rounded-full text-xs bg-zinc-800">{job.status}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-sm text-zinc-400">{job.message || "..."}</p>
            {job.error && <p className="text-red-400 text-sm mt-2">Error: {job.error}</p>}
          </div>

          {job.clips.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.clips.map((c) => (
                <div key={c.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                  <video src={c.file} controls className="w-full aspect-[9/16] bg-black" />
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold leading-tight">{c.title}</h3>
                    <p className="text-sm text-zinc-400 italic">&ldquo;{c.hook}&rdquo;</p>
                    <p className="text-xs text-blue-400">
                      {c.hashtags.map((h) => `#${h}`).join(" ")}
                    </p>
                    <a
                      href={c.file}
                      download
                      className="block text-center bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm"
                    >
                      ⬇ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(job.status === "done" || job.status === "error") && (
            <button onClick={reset} className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg">
              Bikin lagi
            </button>
          )}
        </div>
      )}
    </main>
  );
}
