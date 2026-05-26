import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { pendaftaranDb, usersDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = {
  "haji-reguler": "Haji Reguler",
  "haji-khusus": "Haji Khusus",
  umrah: "Umrah",
};

export default async function AdminPendaftaranPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [all, users] = await Promise.all([pendaftaranDb.all(), usersDb.all()]);
  const sorted = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <section className="container-wide py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Admin — Pendaftaran</h1>
          <p className="text-slate-600">Verifikasi & ubah status pendaftaran jamaah.</p>
        </div>
        <Link href="/admin/berita" className="btn-outline">← Kelola Berita</Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Jamaah</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">No. HP</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Belum ada pendaftaran.</td></tr>
            ) : sorted.map((p) => {
              const u = userMap.get(p.userId);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u?.nama ?? "—"}</div>
                    <div className="text-xs text-slate-500">{u?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">{JENIS_LABEL[p.jenis]}</td>
                  <td className="px-4 py-3 text-slate-700">{p.noHp}</td>
                  <td className="px-4 py-3 text-slate-700">{p.status}</td>
                  <td className="px-4 py-3 text-right">
                    <form action="/api/admin/pendaftaran" method="post" className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <select name="status" defaultValue={p.status} className="rounded border border-slate-300 px-2 py-1 text-sm">
                        <option value="menunggu">menunggu</option>
                        <option value="diproses">diproses</option>
                        <option value="diterima">diterima</option>
                        <option value="ditolak">ditolak</option>
                      </select>
                      <button className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
