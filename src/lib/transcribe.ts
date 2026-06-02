import { spawn } from "child_process";
import path from "path";
import { runFfmpeg } from "./ffmpeg";
import { TranscriptSegment } from "./types";

export async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  await runFfmpeg([
    "-i",
    videoPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "64k",
    audioPath,
  ]);
}

const PY_BIN = process.env.PYTHON_BIN || "python3";
const WHISPER_MODEL = process.env.WHISPER_MODEL || "base";
const WHISPER_DEVICE = process.env.WHISPER_DEVICE || "cpu";
const WHISPER_COMPUTE = process.env.WHISPER_COMPUTE || "int8";
const SCRIPT = path.join(process.cwd(), "scripts", "transcribe_fast.py");

export async function transcribe(
  audioPath: string,
  language: string
): Promise<TranscriptSegment[]> {
  return new Promise((resolve, reject) => {
    const proc = spawn(PY_BIN, [
      SCRIPT,
      audioPath,
      "--language",
      language,
      "--model",
      WHISPER_MODEL,
      "--device",
      WHISPER_DEVICE,
      "--compute-type",
      WHISPER_COMPUTE,
    ]);

    const segments: TranscriptSegment[] = [];
    let stdoutBuf = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
      let nl: number;
      while ((nl = stdoutBuf.indexOf("\n")) >= 0) {
        const line = stdoutBuf.slice(0, nl).trim();
        stdoutBuf = stdoutBuf.slice(nl + 1);
        if (!line) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.done) continue;
          if (typeof obj.start === "number" && typeof obj.end === "number" && obj.text) {
            segments.push({ start: obj.start, end: obj.end, text: String(obj.text) });
          }
        } catch {
          // ignore non-JSON noise
        }
      }
    });

    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (e) =>
      reject(new Error(`Gagal jalankan ${PY_BIN}: ${e.message}. Install Python 3 + faster-whisper.`))
    );

    proc.on("close", (code) => {
      if (code === 0) return resolve(segments);
      const tail = stderr.trim().split("\n").slice(-5).join("\n");
      reject(new Error(`faster-whisper exit ${code}: ${tail}`));
    });
  });
}
