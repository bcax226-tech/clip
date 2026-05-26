"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nik: "", nama: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Pendaftaran gagal");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="container-wide max-w-md py-16">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold text-brand-800">Daftar Akun Jamaah</h1>
        <p className="mb-6 text-sm text-slate-600">Sudah punya akun? <Link href="/login" className="text-brand-700 hover:underline">Masuk di sini</Link>.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">NIK</label>
            <input
              className="field"
              required
              minLength={16}
              maxLength={16}
              pattern="\d{16}"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })}
              placeholder="16 digit angka"
            />
          </div>
          <div>
            <label className="label">Nama Lengkap</label>
            <input className="field" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="field" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Kata Sandi</label>
            <input type="password" className="field" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>
      </div>
    </section>
  );
}
