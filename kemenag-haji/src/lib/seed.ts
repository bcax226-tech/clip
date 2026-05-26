import { beritaDb, usersDb, type Berita, type User } from "./db";
import { hashPassword } from "./auth";
import { randomBytes } from "node:crypto";

function id() {
  return randomBytes(8).toString("hex");
}

async function seedAdmin() {
  const users = await usersDb.all();
  if (users.some((u) => u.email === "admin@kemenaghaji.go.id")) return;
  const { hash, salt } = hashPassword("admin123");
  const admin: User = {
    id: id(),
    nik: "0000000000000000",
    nama: "Administrator",
    email: "admin@kemenaghaji.go.id",
    passwordHash: hash,
    passwordSalt: salt,
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  await usersDb.save([...users, admin]);
}

async function seedBerita() {
  const berita = await beritaDb.all();
  if (berita.length > 0) return;
  const now = Date.now();
  const seed: Berita[] = [
    {
      id: id(),
      slug: "kuota-haji-2026-ditetapkan",
      judul: "Kuota Haji Indonesia 2026 Ditetapkan 221.000 Jamaah",
      ringkasan:
        "Pemerintah Arab Saudi resmi memberikan kuota haji untuk Indonesia tahun 1447 H sebanyak 221.000 jamaah.",
      konten:
        "Kementerian Haji dan Umrah Republik Indonesia mengumumkan bahwa kuota haji untuk musim haji 1447 H / 2026 M telah ditetapkan sebanyak 221.000 jamaah. Kuota ini terdiri dari 203.320 jamaah haji reguler dan 17.680 jamaah haji khusus.\n\nMenteri Haji dan Umrah menyampaikan apresiasi kepada Pemerintah Kerajaan Arab Saudi atas kepercayaan yang diberikan. Persiapan operasional haji 2026 sudah mulai dilakukan, termasuk penyediaan layanan akomodasi, transportasi, dan konsumsi yang lebih baik dibanding tahun sebelumnya.",
      penulis: "Humas Kemenag Haji",
      kategori: "pengumuman",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: id(),
      slug: "pendaftaran-haji-online-resmi-dibuka",
      judul: "Pendaftaran Haji Reguler Online Resmi Dibuka",
      ringkasan:
        "Calon jamaah kini dapat mendaftar haji reguler melalui portal online tanpa perlu datang ke kantor.",
      konten:
        "Kementerian Haji dan Umrah resmi membuka layanan pendaftaran haji reguler secara online melalui portal resmi. Layanan ini bertujuan untuk memudahkan masyarakat dalam proses pendaftaran tanpa harus datang langsung ke kantor Kementerian Agama kabupaten/kota.\n\nCalon jamaah cukup membuat akun, mengisi formulir, dan mengunggah dokumen pendukung. Setelah verifikasi, calon jamaah akan menerima nomor porsi sesuai dengan urutan pendaftaran.",
      penulis: "Direktorat Pelayanan Haji",
      kategori: "berita",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: id(),
      slug: "siaran-pers-evaluasi-umrah",
      judul: "Siaran Pers: Evaluasi Penyelenggaraan Umrah Tahun 1446 H",
      ringkasan:
        "Kementerian melakukan evaluasi menyeluruh terhadap penyelenggaraan umrah dan menerbitkan rekomendasi perbaikan.",
      konten:
        "Pada hari ini Kementerian Haji dan Umrah menggelar konferensi pers evaluasi penyelenggaraan umrah tahun 1446 H. Total jamaah umrah Indonesia mencapai 1,4 juta orang sepanjang musim.\n\nBeberapa rekomendasi yang diterbitkan antara lain: peningkatan sistem pengawasan PPIU, standardisasi layanan akomodasi, serta penguatan perlindungan jamaah melalui asuransi yang lebih komprehensif.",
      penulis: "Biro Humas",
      kategori: "siaran-pers",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ];
  await beritaDb.save(seed);
}

let seeded = false;
export async function seedOnce() {
  if (seeded) return;
  seeded = true;
  await seedAdmin();
  await seedBerita();
}
