import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createJob } from "@/lib/jobs";
import { runPipeline } from "@/lib/pipeline";
import { Job } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const url = form.get("url") as string | null;
  const file = form.get("file") as File | null;
  const numClips = parseInt((form.get("numClips") as string) || "3", 10);
  const addMusic = form.get("addMusic") === "true";
  const language = (form.get("language") as string) || "id";

  const id = randomUUID();
  let source: Job["source"];

  if (file && file.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const ext = path.extname(file.name) || ".mp4";
    const filename = `${id}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buf);
    source = { type: "upload", filename };
  } else if (url) {
    source = { type: "url", url };
  } else {
    return NextResponse.json({ error: "Wajib kirim file atau url" }, { status: 400 });
  }

  const job: Job = {
    id,
    source,
    status: "queued",
    progress: 0,
    clips: [],
    options: { numClips: Math.max(1, Math.min(10, numClips)), addMusic, language },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await createJob(job);

  // fire-and-forget pipeline
  runPipeline(job).catch((e) => console.error("pipeline error", e));

  return NextResponse.json({ id });
}
