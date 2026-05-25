import Anthropic from "@anthropic-ai/sdk";
import { TranscriptSegment, ViralMoment } from "./types";

const SYSTEM = `Kamu adalah editor video viral untuk TikTok/Reels/Shorts.
Dari transcript podcast/talkshow, pilih momen-momen paling menarik untuk dijadikan klip pendek 30-60 detik.

Kriteria momen viral:
- Cerita pribadi yang mengejutkan, lucu, atau emosional
- Insight tajam / hot take / opini kontroversial
- Punchline atau plot twist
- Tips actionable yang nyentil
- Momen drama atau tegang

Selalu panggil tool 'submit_moments' dengan hasilnya. Untuk SETIAP momen:
- start & end (detik, sesuai range segment yang tersedia)
- title: judul clickbait 5-8 kata (Bahasa Indonesia, KAPITAL di kata kunci)
- hook: 1 kalimat hook pembuka super menarik untuk 3 detik pertama (max 60 karakter)
- hashtags: 3-5 hashtag relevan tanpa #
- reason: 1 kalimat kenapa ini viral`;

export async function analyzeTranscript(
  segments: TranscriptSegment[],
  numClips: number
): Promise<ViralMoment[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const transcriptText = segments
    .map((s) => `[${s.start.toFixed(1)}-${s.end.toFixed(1)}] ${s.text}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 8000,
    system: SYSTEM,
    tools: [
      {
        name: "submit_moments",
        description: "Submit momen viral yang dipilih dari transcript",
        input_schema: {
          type: "object",
          properties: {
            moments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start: { type: "number", description: "Waktu mulai dalam detik" },
                  end: { type: "number", description: "Waktu selesai dalam detik" },
                  title: { type: "string" },
                  hook: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                },
                required: ["start", "end", "title", "hook", "hashtags", "reason"],
              },
            },
          },
          required: ["moments"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_moments" },
    messages: [
      {
        role: "user",
        content: `Pilih ${numClips} momen paling viral dari transcript berikut. Setiap clip 30-60 detik.\n\nTRANSCRIPT:\n${transcriptText}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude tidak mengembalikan tool_use");
  }
  const input = toolUse.input as { moments: ViralMoment[] };
  return input.moments;
}
