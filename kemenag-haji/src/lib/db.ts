import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readFile<T>(name: string, fallback: T): Promise<T> {
  await ensureDir();
  const fp = path.join(DATA_DIR, name);
  try {
    const raw = await fs.readFile(fp, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err?.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeFile(name: string, data: unknown) {
  await ensureDir();
  const fp = path.join(DATA_DIR, name);
  const tmp = `${fp}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, fp);
}

export type Role = "jamaah" | "admin";

export type User = {
  id: string;
  nik: string;
  nama: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: Role;
  createdAt: string;
};

export type Pendaftaran = {
  id: string;
  userId: string;
  jenis: "haji-reguler" | "haji-khusus" | "umrah";
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  paspor?: string;
  catatan?: string;
  status: "menunggu" | "diproses" | "diterima" | "ditolak";
  createdAt: string;
  updatedAt: string;
};

export type Berita = {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  konten: string;
  penulis: string;
  kategori: "pengumuman" | "berita" | "siaran-pers";
  createdAt: string;
};

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

export const usersDb = {
  all: () => readFile<User[]>("users.json", []),
  save: (data: User[]) => writeFile("users.json", data),
};

export const pendaftaranDb = {
  all: () => readFile<Pendaftaran[]>("pendaftaran.json", []),
  save: (data: Pendaftaran[]) => writeFile("pendaftaran.json", data),
};

export const beritaDb = {
  all: () => readFile<Berita[]>("berita.json", []),
  save: (data: Berita[]) => writeFile("berita.json", data),
};

export const sessionsDb = {
  all: () => readFile<Session[]>("sessions.json", []),
  save: (data: Session[]) => writeFile("sessions.json", data),
};
