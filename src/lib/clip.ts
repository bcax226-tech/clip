import { promises as fs } from "fs";
import path from "path";
import { runFfmpeg } from "./ffmpeg";
import { TranscriptSegment, ViralMoment, Clip } from "./types";

function fmtTime(t: number): string {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t - Math.floor(t)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function buildSrt(segments: TranscriptSegment[], clipStart: number, clipEnd: number): string {
  const filtered = segments
    .filter((s) => s.end > clipStart && s.start < clipEnd)
    .map((s) => ({
      start: Math.max(0, s.start - clipStart),
      end: Math.min(clipEnd - clipStart, s.end - clipStart),
      text: s.text,
    }));

  return filtered
    .map((s, i) => `${i + 1}\n${fmtTime(s.start)} --> ${fmtTime(s.end)}\n${s.text}\n`)
    .join("\n");
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "’")
    .replace(/:/g, "\\:")
    .replace(/,/g, "\\,")
    .replace(/%/g, "\\%");
}

export async function makeClip(args: {
  sourceVideo: string;
  segments: TranscriptSegment[];
  moment: ViralMoment;
  outDir: string;
  clipId: string;
  musicFile?: string;
}): Promise<Clip> {
  const { sourceVideo, segments, moment, outDir, clipId, musicFile } = args;
  const duration = moment.end - moment.start;
  const srtPath = path.join(outDir, `${clipId}.srt`);
  const outFile = path.join(outDir, `${clipId}.mp4`);

  await fs.writeFile(srtPath, buildSrt(segments, moment.start, moment.end));

  // Subtitle style: bold white text with black outline, positioned at center-bottom
  const subStyle =
    "FontName=Arial,FontSize=14,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=80,Bold=1";
  const srtEscaped = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");

  const hookText = escapeDrawtext(moment.hook);
  const titleText = escapeDrawtext(moment.title);

  // Pipeline:
  // 1. Trim source to moment range
  // 2. Crop+scale to 9:16 (1080x1920) - center crop
  // 3. Burn subtitles
  // 4. Hook banner (top, full 3s) + title (middle, first 3s)
  const vf = [
    // crop to center-square-ish then pad to 9:16
    "crop='min(iw\\,ih*9/16)':'min(ih\\,iw*16/9)'",
    "scale=1080:1920:force_original_aspect_ratio=increase",
    "crop=1080:1920",
    `subtitles='${srtEscaped}':force_style='${subStyle}'`,
    // Hook badge at top - shown for first 3 seconds
    `drawbox=x=0:y=200:w=1080:h=180:color=red@0.85:t=fill:enable='lt(t,3)'`,
    `drawtext=text='${hookText}':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=240:box=0:enable='lt(t,3)':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
    // Title big in middle - first 3s
    `drawtext=text='${titleText}':fontcolor=yellow:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2:borderw=4:bordercolor=black:enable='lt(t,3)':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
  ].join(",");

  const ffArgs = [
    "-ss",
    String(moment.start),
    "-i",
    sourceVideo,
  ];

  if (musicFile) {
    ffArgs.push("-stream_loop", "-1", "-i", musicFile);
  }

  ffArgs.push("-t", String(duration), "-vf", vf);

  if (musicFile) {
    // mix original audio with music at low volume
    ffArgs.push(
      "-filter_complex",
      "[0:a]volume=1.0[a0];[1:a]volume=0.12[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=0[aout]",
      "-map",
      "0:v",
      "-map",
      "[aout]"
    );
  }

  ffArgs.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outFile
  );

  await runFfmpeg(ffArgs);
  await fs.unlink(srtPath).catch(() => {});

  return {
    id: clipId,
    file: outFile,
    title: moment.title,
    hook: moment.hook,
    hashtags: moment.hashtags,
    start: moment.start,
    end: moment.end,
  };
}
