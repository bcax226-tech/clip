# Kementerian Haji & Umrah RI — Portal Resmi (Demo)

Situs Next.js untuk Kementerian Haji & Umrah RI. Fitur:

- Landing page (visi, statistik, layanan, berita terbaru)
- Halaman **Profil** (sambutan menteri, visi & misi, struktur organisasi, dasar hukum)
- Halaman **Berita & Pengumuman** (list + filter kategori + detail)
- **Auth** jamaah (register/login/logout) — password di-hash PBKDF2, sesi cookie HTTP-only
- **Dashboard Jamaah** — daftar pendaftaran, ajukan pendaftaran haji reguler / haji khusus / umrah
- **Dashboard Admin** — kelola berita, verifikasi pendaftaran (ubah status)

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS
- Storage: JSON file di `data/` (users, pendaftaran, berita, sessions)
- Password hash: `node:crypto` PBKDF2

## Menjalankan

```bash
cd kemenag-haji
npm install
npm run dev
```

Buka http://localhost:3001

### Akun demo admin

Otomatis di-seed saat pertama kali aplikasi dijalankan:

- Email: `admin@kemenaghaji.go.id`
- Password: `admin123`

Login sebagai admin → menu **Admin** muncul di navbar (kelola berita & pendaftaran).

Jamaah baru bisa daftar lewat halaman `/register`.

## Struktur

```
kemenag-haji/
  src/
    app/
      page.tsx                       # Beranda
      profil/page.tsx                # Profil kementerian
      berita/page.tsx                # List berita
      berita/[slug]/page.tsx         # Detail berita
      login/page.tsx, register/page.tsx
      dashboard/page.tsx             # Dashboard jamaah
      dashboard/pendaftaran/page.tsx # Form pendaftaran
      admin/berita/                  # Admin: berita
      admin/pendaftaran/             # Admin: verifikasi pendaftaran
      api/
        auth/{login,register,logout}/route.ts
        pendaftaran/route.ts
        admin/{berita,pendaftaran}/route.ts
    lib/
      db.ts       # JSON file store
      auth.ts     # PBKDF2 hash + cookie session
      seed.ts     # seed admin & berita awal
    components/Navbar.tsx, Footer.tsx
  data/           # tempat penyimpanan JSON (di-gitignore)
```

## Catatan

- Storage JSON cocok untuk demo. Untuk produksi, ganti `src/lib/db.ts` ke Postgres/MySQL.
- Tidak ada CSRF token pada form `<form method="post">` admin — ini scope demo. Tambahkan CSRF / origin check sebelum produksi.
- Folder `data/` di-gitignore (kecuali `.gitkeep`). Saat pertama jalan, `seed.ts` akan membuat akun admin & 3 berita contoh.
