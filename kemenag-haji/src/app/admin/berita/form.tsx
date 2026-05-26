"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminBeritaForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    judul: "",
    ringkasan: "",
    konten: "",
    kategori: "berita",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/admin/berita", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Gagal menyimpan berita");
      return;
    }
    setForm({ judul: "", ringkasan: "", konten: "", kategori: "berita" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h2 className="font-semibold text-brand-800">Tambah Berita</h2>
      <div>
        <label className="label">Judul</label>
        <input required className="field" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
      </div>
      <div>
        <label className="label">Kategori</label>
        <select className="field" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
          <option value="berita">Berita</option>
          <option value="pengumuman">Pengumuman</option>
          <option value="siaran-pers">Siaran Pers</option>
        </select>
      </div>
      <div>
        <label className="label">Ringkasan</label>
        <textarea required rows={2} className="field" value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} />
      </div>
      <div>
        <label className="label">Konten</label>
        <textarea required rows={6} className="field" value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} placeholder="Pisahkan paragraf dengan baris kosong." />
      </div>
      {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      <button disabled={loading} className="btn-primary w-full" type="submit">
        {loading ? "Menyimpan..." : "Publikasikan"}
      </button>
    </form>
  );
}
