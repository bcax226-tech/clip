export type JobStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "clipping"
  | "done"
  | "error";

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type ViralMoment = {
  start: number;
  end: number;
  title: string;
  hook: string;
  hashtags: string[];
  reason: string;
};

export type Clip = {
  id: string;
  file: string;
  title: string;
  hook: string;
  hashtags: string[];
  start: number;
  end: number;
};

export type Job = {
  id: string;
  source: { type: "upload"; filename: string } | { type: "url"; url: string };
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
  clips: Clip[];
  options: { numClips: number; addMusic: boolean; language: string };
  createdAt: number;
  updatedAt: number;
};
