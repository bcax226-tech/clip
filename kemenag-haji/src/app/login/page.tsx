"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Login gagal");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="container-wide max-w-md py-16">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold text-brand-800">Masuk Akun Jamaah</h1>
        <p className="mb-6 text-sm text-slate-600">Belum punya akun? <Link href="/register" className="text-brand-700 hover:underline">Daftar di sini</Link>.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="field" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Kata Sandi</label>
            <input type="password" className="field" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <div className="mt-6 rounded-md bg-brand-50 p-3 text-xs text-brand-800">
          <strong>Akun demo admin:</strong> admin@kemenaghaji.go.id / admin123
        </div>
      </div>
    </section>
  );
}
