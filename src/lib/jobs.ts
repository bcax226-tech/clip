import { promises as fs } from "fs";
import path from "path";
import { Job, JobStatus } from "./types";

const JOBS_DIR = path.join(process.cwd(), "data", "jobs");

async function ensureDir() {
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

function filePath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

export async function createJob(job: Job): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath(job.id), JSON.stringify(job, null, 2));
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    const data = await fs.readFile(filePath(id), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function updateJob(
  id: string,
  patch: Partial<Job> & { status?: JobStatus }
): Promise<Job | null> {
  const job = await getJob(id);
  if (!job) return null;
  const next: Job = { ...job, ...patch, updatedAt: Date.now() };
  await fs.writeFile(filePath(id), JSON.stringify(next, null, 2));
  return next;
}
