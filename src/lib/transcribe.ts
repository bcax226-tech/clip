import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";
import { runFfmpeg, probeDuration } from "./ffmpeg";
import { TranscriptSegment } from "./types";

// Whisper API hard limit is 25MB. With 64kbps mono mp3 we get ~8KB/s,
// so 25MB ≈ 52 minutes. Use 10-minute chunks for a comfortable margin
// and to keep individual requests fast.
const CHUNK_SECONDS = 600;

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

async function transcribeFile(
  client: OpenAI,
  filePath: string,
  language: string
): Promise<TranscriptSegment[]> {
  const fileBlob = new Blob([await fs.readFile(filePath)]);
  const file = new File([fileBlob], path.basename(filePath), { type: "audio/mpeg" });

  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: language === "auto" ? undefined : language,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments = (result as unknown as { segments?: Array<{ start: number; end: number; text: string }> })
    .segments;
  if (!segments) return [];
  return segments.map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }));
}

export async function transcribe(
  audioPath: string,
  language: string
): Promise<TranscriptSegment[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const duration = await probeDuration(audioPath);

  // Short audio: single request
  if (duration <= CHUNK_SECONDS) {
    return transcribeFile(client, audioPath, language);
  }

  // Long audio: split into chunks, transcribe each, offset timestamps
  const dir = path.dirname(audioPath);
  const chunks: string[] = [];
  const numChunks = Math.ceil(duration / CHUNK_SECONDS);

  for (let i = 0; i < numChunks; i++) {
    const chunkPath = path.join(dir, `chunk-${i}.mp3`);
    await runFfmpeg([
      "-ss",
      String(i * CHUNK_SECONDS),
      "-t",
      String(CHUNK_SECONDS),
      "-i",
      audioPath,
      "-c",
      "copy",
      chunkPath,
    ]);
    chunks.push(chunkPath);
  }

  const allSegments: TranscriptSegment[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const offset = i * CHUNK_SECONDS;
    const segments = await transcribeFile(client, chunks[i], language);
    for (const s of segments) {
      allSegments.push({ start: s.start + offset, end: s.end + offset, text: s.text });
    }
    await fs.unlink(chunks[i]).catch(() => {});
  }

  return allSegments;
}
