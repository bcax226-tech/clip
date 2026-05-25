import { promises as fs } from "fs";
import path from "path";
import { Job } from "./types";
import { updateJob } from "./jobs";
import { downloadVideo } from "./download";
import { extractAudio, transcribe } from "./transcribe";
import { analyzeTranscript } from "./analyze";
import { makeClip } from "./clip";

async function pickMusic(): Promise<string | undefined> {
  const musicDir = path.join(process.cwd(), "public", "music");
  try {
    const files = await fs.readdir(musicDir);
    const tracks = files.filter((f) => /\.(mp3|m4a|wav)$/i.test(f));
    if (tracks.length === 0) return undefined;
    return path.join(musicDir, tracks[Math.floor(Math.random() * tracks.length)]);
  } catch {
    return undefined;
  }
}

export async function runPipeline(job: Job): Promise<void> {
  const workDir = path.join(process.cwd(), "data", "work", job.id);
  const outDir = path.join(process.cwd(), "public", "clips", job.id);
  await fs.mkdir(workDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  try {
    // 1. Get source video
    let videoPath: string;
    if (job.source.type === "url") {
      await updateJob(job.id, { status: "downloading", progress: 5, message: "Download video..." });
      videoPath = path.join(workDir, "source.mp4");
      await downloadVideo(job.source.url, videoPath);
    } else {
      videoPath = path.join(process.cwd(), "public", "uploads", job.source.filename);
    }

    // 2. Extract audio + transcribe
    await updateJob(job.id, { status: "transcribing", progress: 25, message: "Transcribe audio..." });
    const audioPath = path.join(workDir, "audio.mp3");
    await extractAudio(videoPath, audioPath);
    const segments = await transcribe(audioPath, job.options.language);
    if (segments.length === 0) throw new Error("Tidak ada hasil transcribe — audio mungkin kosong");

    // 3. Analyze with Claude
    await updateJob(job.id, { status: "analyzing", progress: 50, message: "Cari momen viral pakai Claude..." });
    const moments = await analyzeTranscript(segments, job.options.numClips);
    if (moments.length === 0) throw new Error("Claude tidak menemukan momen viral");

    // 4. Make clips
    await updateJob(job.id, { status: "clipping", progress: 65, message: `Bikin ${moments.length} klip...` });
    const musicFile = job.options.addMusic ? await pickMusic() : undefined;

    const clips = [];
    for (let i = 0; i < moments.length; i++) {
      const clipId = `clip-${i + 1}`;
      const clip = await makeClip({
        sourceVideo: videoPath,
        segments,
        moment: moments[i],
        outDir,
        clipId,
        musicFile,
      });
      // store web-relative path
      clips.push({ ...clip, file: `/clips/${job.id}/${clipId}.mp4` });
      const prog = 65 + Math.round(((i + 1) / moments.length) * 30);
      await updateJob(job.id, { progress: prog, clips, message: `Klip ${i + 1}/${moments.length} selesai` });
    }

    await updateJob(job.id, { status: "done", progress: 100, clips, message: "Selesai!" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateJob(job.id, { status: "error", error: msg, message: msg });
    throw err;
  } finally {
    // cleanup work dir
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
