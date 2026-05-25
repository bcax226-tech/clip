import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";
import { runFfmpeg } from "./ffmpeg";
import { TranscriptSegment } from "./types";

export async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  await runFfmpeg(["-i", videoPath, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libmp3lame", "-b:a", "64k", audioPath]);
}

export async function transcribe(
  audioPath: string,
  language: string
): Promise<TranscriptSegment[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const fileBlob = new Blob([await fs.readFile(audioPath)]);
  const file = new File([fileBlob], path.basename(audioPath), { type: "audio/mpeg" });

  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: language === "auto" ? undefined : language,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments = (result as unknown as { segments?: Array<{ start: number; end: number; text: string }> }).segments;
  if (!segments) return [];
  return segments.map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }));
}
