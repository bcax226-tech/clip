import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { pendaftaranDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = {
  "haji-reguler": "Haji Reguler",
  "haji-khusus": "Haji Khusus",
  umrah: "Umrah",
};

const STATUS_STYLE: Record<string, string> = {
  menunggu: "bg-amber-100 text-amber-800",
  diproses: "bg-blue-100 text-blue-800",
  diterima: "bg-emerald-100 text-emerald-800",
  ditolak: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const all = await pendaftaranDb.all();
  const mine = all.filter((p) => p.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="container-wide py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Dashboard Jamaah</h1>
          <p className="text-slate-600">Selamat datang, <strong>{user.nama}</strong>.</p>
        </div>
        <Link href="/dashboard/pendaftaran" className="btn-primary">+ Ajukan Pendaftaran</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total Pendaftaran" value={mine.length.toString()} />
        <Stat label="Sedang Diproses" value={mine.filter((p) => p.status === "diproses" || p.status === "menunggu").length.toString()} />
        <Stat label="Diterima" value={mine.filter((p) => p.status === "diterima").length.toString()} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Riwayat Pendaftaran</h2>
        {mine.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            Belum ada pendaftaran. <Link href="/dashboard/pendaftaran" className="text-brand-700 hover:underline">Ajukan sekarang</Link>.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">No. HP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mine.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{JENIS_LABEL[p.jenis]}</td>
                    <td className="px-4 py-3 text-slate-700">{p.noHp}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-brand-700">{value}</div>
    </div>
  );
}
