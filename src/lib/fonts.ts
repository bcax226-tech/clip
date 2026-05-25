import { promises as fs } from "fs";

// Cache the resolved font path for the lifetime of the process.
let cached: string | null | undefined;

const CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", // Debian/Ubuntu
  "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", // Fedora/Arch
  "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf", // some Arch
  "/Library/Fonts/Arial Bold.ttf", // macOS
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf", // macOS newer
  "C:/Windows/Fonts/arialbd.ttf", // Windows
];

export async function resolveBoldFont(): Promise<string | null> {
  if (cached !== undefined) return cached;
  for (const candidate of CANDIDATES) {
    try {
      await fs.access(candidate);
      cached = candidate;
      return candidate;
    } catch {
      // try next
    }
  }
  cached = null;
  return null;
}
