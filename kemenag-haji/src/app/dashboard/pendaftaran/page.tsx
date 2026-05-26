"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FormPendaftaran() {
  const router = useRouter();
  const sp = useSearchParams();
  const jenisQuery = sp.get("jenis");

  const [form, setForm] = useState({
    jenis: "haji-reguler",
    tanggalLahir: "",
    alamat: "",
    noHp: "",
    paspor: "",
    catatan: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jenisQuery && ["haji-reguler", "haji-khusus", "umrah"].includes(jenisQuery)) {
      setForm((f) => ({ ...f, jenis: jenisQuery }));
    }
  }, [jenisQuery]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/pendaftaran", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Gagal mengajukan pendaftaran");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="container-wide max-w-2xl py-10">
      <h1 className="mb-1 text-2xl font-bold text-brand-800">Ajukan Pendaftaran</h1>
      <p className="mb-6 text-sm text-slate-600">
        Isi data berikut untuk mengajukan pendaftaran haji atau umrah. Permohonan akan diverifikasi oleh petugas.
      </p>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Jenis Pendaftaran</label>
          <select className="field" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
            <option value="haji-reguler">Haji Reguler</option>
            <option value="haji-khusus">Haji Khusus</option>
            <option value="umrah">Umrah</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Tanggal Lahir</label>
            <input type="date" required className="field" value={form.tanggalLahir}
              onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })} />
          </div>
          <div>
            <label className="label">No. HP</label>
            <input required className="field" value={form.noHp} placeholder="08xxxxxxxxxx"
              onChange={(e) => setForm({ ...form, noHp: e.target.value.replace(/[^\d+]/g, "") })} />
          </div>
        </div>
        <div>
          <label className="label">Alamat Lengkap</label>
          <textarea required rows={3} className="field" value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
        </div>
        <div>
          <label className="label">No. Paspor (opsional)</label>
          <input className="field" value={form.paspor}
            onChange={(e) => setForm({ ...form, paspor: e.target.value })} />
        </div>
        <div>
          <label className="label">Catatan (opsional)</label>
          <textarea rows={2} className="field" value={form.catatan}
            onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
        </div>
        {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => router.back()}>Batal</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Memproses..." : "Ajukan Pendaftaran"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function PendaftaranPage() {
  return (
    <Suspense fallback={<div className="container-wide py-10">Memuat...</div>}>
      <FormPendaftaran />
    </Suspense>
  );
}
