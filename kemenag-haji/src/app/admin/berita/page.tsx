import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { beritaDb } from "@/lib/db";
import AdminBeritaForm from "./form";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const all = (await beritaDb.all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="container-wide py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Admin — Berita</h1>
          <p className="text-slate-600">Kelola berita dan pengumuman.</p>
        </div>
        <Link href="/admin/pendaftaran" className="btn-outline">Kelola Pendaftaran →</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AdminBeritaForm />
        </div>
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {all.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada berita.</td></tr>
                ) : all.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/berita/${b.slug}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {b.judul}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.kategori}</td>
                    <td className="px-4 py-3 text-right">
                      <form action="/api/admin/berita" method="post">
                        <input type="hidden" name="_method" value="DELETE" />
                        <input type="hidden" name="id" value={b.id} />
                        <button className="text-sm text-red-600 hover:underline">Hapus</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
