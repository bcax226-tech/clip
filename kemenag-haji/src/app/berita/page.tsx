import Link from "next/link";
import { beritaDb } from "@/lib/db";

export const metadata = { title: "Berita & Pengumuman — Kementerian Haji & Umrah" };
export const dynamic = "force-dynamic";

const KATEGORI_LABEL: Record<string, string> = {
  pengumuman: "Pengumuman",
  berita: "Berita",
  "siaran-pers": "Siaran Pers",
};

export default async function BeritaListPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const sp = await searchParams;
  const all = (await beritaDb.all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filtered = sp.kategori ? all.filter((b) => b.kategori === sp.kategori) : all;

  return (
    <>
      <section className="bg-brand-700 py-12 text-white">
        <div className="container-wide">
          <h1 className="text-3xl font-bold md:text-4xl">Berita & Pengumuman</h1>
          <p className="mt-2 text-brand-100/90">Informasi resmi dari Kementerian Haji & Umrah RI.</p>
        </div>
      </section>

      <section className="container-wide py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/berita" className={chip(!sp.kategori)}>Semua</Link>
          {(["pengumuman", "berita", "siaran-pers"] as const).map((k) => (
            <Link key={k} href={`/berita?kategori=${k}`} className={chip(sp.kategori === k)}>
              {KATEGORI_LABEL[k]}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-500">Belum ada berita pada kategori ini.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <Link key={b.id} href={`/berita/${b.slug}`} className="card overflow-hidden transition hover:shadow-md">
                <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-50" />
                <div className="p-5">
                  <div className="mb-2 text-xs uppercase tracking-wider text-brand-600">
                    {KATEGORI_LABEL[b.kategori]}
                  </div>
                  <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">{b.judul}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600">{b.ringkasan}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{b.penulis}</span>
                    <span>
                      {new Date(b.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function chip(active: boolean) {
  return `rounded-full border px-4 py-1.5 text-sm transition ${
    active
      ? "border-brand-600 bg-brand-600 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700"
  }`;
}
