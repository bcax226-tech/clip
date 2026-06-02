import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolveBoldFont } from "@/lib/fonts";

export const runtime = "nodejs";

function checkBinary(bin: string, args: string[] = ["-version"]): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(bin, args);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

function checkPythonModule(py: string, mod: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(py, ["-c", `import ${mod}`]);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

export async function GET() {
  const pyBin = process.env.PYTHON_BIN || "python3";
  const [ffmpeg, ffprobe, ytDlp, python, fasterWhisper, fontPath] = await Promise.all([
    checkBinary("ffmpeg"),
    checkBinary("ffprobe"),
    checkBinary("yt-dlp"),
    checkBinary(pyBin, ["--version"]),
    checkPythonModule(pyBin, "faster_whisper"),
    resolveBoldFont(),
  ]);

  const checks = {
    ffmpeg,
    ffprobe,
    ytDlp,
    python,
    fasterWhisper,
    font: fontPath !== null,
    anthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  };

  const ok =
    checks.ffmpeg && checks.ffprobe && checks.python && checks.fasterWhisper && checks.anthropicKey;

  return NextResponse.json({
    ok,
    checks,
    fontPath,
    notes: {
      ytDlp: ytDlp ? null : "Opsional, hanya dibutuhkan untuk download dari URL YouTube",
      fasterWhisper: fasterWhisper ? null : "Install: pip install faster-whisper",
      font: fontPath
        ? null
        : "Font bold tidak ketemu — drawtext akan pakai default font (mungkin terlihat lebih kecil)",
    },
  });
}
