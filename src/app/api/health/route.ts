import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolveBoldFont } from "@/lib/fonts";

export const runtime = "nodejs";

function checkBinary(bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(bin, ["-version"]);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

export async function GET() {
  const [ffmpeg, ffprobe, ytDlp, fontPath] = await Promise.all([
    checkBinary("ffmpeg"),
    checkBinary("ffprobe"),
    checkBinary("yt-dlp"),
    resolveBoldFont(),
  ]);

  const checks = {
    ffmpeg,
    ffprobe,
    ytDlp,
    font: fontPath !== null,
    anthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    openaiKey: Boolean(process.env.OPENAI_API_KEY),
  };

  const ok = checks.ffmpeg && checks.ffprobe && checks.anthropicKey && checks.openaiKey;

  return NextResponse.json({
    ok,
    checks,
    fontPath,
    notes: {
      ytDlp: ytDlp ? null : "Opsional, hanya dibutuhkan untuk download dari URL YouTube",
      font: fontPath ? null : "Font bold tidak ketemu — drawtext akan pakai default font (mungkin terlihat lebih kecil)",
    },
  });
}
