import Link from "next/link";
import { notFound } from "next/navigation";
import { beritaDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await beritaDb.all();
  const b = all.find((x) => x.slug === slug);
  if (!b) notFound();

  return (
    <article className="container-wide max-w-3xl py-12">
      <Link href="/berita" className="text-sm text-brand-700 hover:underline">← Kembali ke Berita</Link>
      <div className="mt-4 text-xs uppercase tracking-wider text-brand-600">{b.kategori}</div>
      <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">{b.judul}</h1>
      <div className="mt-2 text-sm text-slate-500">
        Oleh {b.penulis} ·{" "}
        {new Date(b.createdAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </div>
      <div className="mt-6 h-48 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50" />
      <div className="prose prose-slate mt-6 max-w-none">
        {b.konten.split("\n\n").map((p, i) => (
          <p key={i} className="mb-4 text-slate-700 leading-relaxed">{p}</p>
        ))}
      </div>
    </article>
  );
}
