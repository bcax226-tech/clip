import Link from "next/link";
import { beritaDb } from "@/lib/db";

export default async function HomePage() {
  const berita = (await beritaDb.all())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="p" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#p)" />
          </svg>
        </div>
        <div className="container-wide relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider">
              Portal Resmi
            </div>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Melayani Jamaah Haji & Umrah <span className="text-gold-400">dengan Amanah</span>
            </h1>
            <p className="mt-4 max-w-xl text-brand-50/90">
              Selamat datang di portal resmi Kementerian Haji dan Umrah Republik Indonesia.
              Akses informasi pendaftaran, layanan jamaah, dan berita terbaru di sini.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-md bg-gold-400 px-5 py-3 font-semibold text-brand-900 hover:bg-gold-500">
                Daftar Sekarang
              </Link>
              <Link href="/profil" className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
                Tentang Kami
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            <Stat label="Kuota Haji 2026" value="221.000" sub="Jamaah" />
            <Stat label="Jamaah Umrah" value="1,4 Jt" sub="per tahun" />
            <Stat label="PPIU Terdaftar" value="1.842" sub="Penyelenggara" />
            <Stat label="Kantor Layanan" value="34" sub="Provinsi" />
          </div>
        </div>
      </section>

      <section className="container-wide py-16">
        <h2 className="mb-2 text-2xl font-bold text-brand-800">Layanan Utama</h2>
        <p className="mb-8 text-slate-600">Akses cepat ke layanan pendaftaran dan informasi jamaah.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <Service
            title="Haji Reguler"
            desc="Daftar dan dapatkan nomor porsi haji reguler sesuai antrian."
            href="/dashboard/pendaftaran?jenis=haji-reguler"
          />
          <Service
            title="Haji Khusus"
            desc="Layanan haji khusus melalui Penyelenggara Ibadah Haji Khusus (PIHK)."
            href="/dashboard/pendaftaran?jenis=haji-khusus"
          />
          <Service
            title="Umrah"
            desc="Informasi dan registrasi melalui PPIU resmi yang terdaftar."
            href="/dashboard/pendaftaran?jenis=umrah"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-wide">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-800">Berita & Pengumuman</h2>
              <p className="text-slate-600">Informasi terbaru dari Kementerian Haji & Umrah.</p>
            </div>
            <Link href="/berita" className="btn-outline">Lihat Semua</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {berita.map((b) => (
              <Link key={b.id} href={`/berita/${b.slug}`} className="card overflow-hidden transition hover:shadow-md">
                <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-50" />
                <div className="p-5">
                  <div className="mb-2 text-xs uppercase tracking-wider text-brand-600">{b.kategori}</div>
                  <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">{b.judul}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600">{b.ringkasan}</p>
                  <div className="mt-3 text-xs text-slate-500">
                    {new Date(b.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-5 backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-brand-100/80">{label}</div>
      <div className="mt-1 text-2xl font-bold md:text-3xl">{value}</div>
      <div className="text-xs text-brand-100/70">{sub}</div>
    </div>
  );
}

function Service({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="card group p-6 transition hover:border-brand-500 hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.8 6.5 19.5l1-6.3L3 8.9 9 8z" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
      <div className="mt-3 text-sm font-medium text-brand-700">Mulai →</div>
    </Link>
  );
}
