import { spawn } from "child_process";

export function downloadVideo(url: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "-f",
      "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
      "--merge-output-format",
      "mp4",
      "-o",
      outPath,
      url,
    ]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exit ${code}: ${stderr}`));
    });
    proc.on("error", reject);
  });
}
