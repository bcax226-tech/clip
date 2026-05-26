import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white font-bold">
            HU
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-brand-700">Kementerian Haji & Umrah</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Republik Indonesia</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link className="btn-ghost" href="/">Beranda</Link>
          <Link className="btn-ghost" href="/profil">Profil</Link>
          <Link className="btn-ghost" href="/berita">Berita</Link>
          {user && <Link className="btn-ghost" href="/dashboard">Dashboard</Link>}
          {user?.role === "admin" && <Link className="btn-ghost" href="/admin/berita">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi, <strong>{user.nama.split(" ")[0]}</strong>
              </span>
              <form action="/api/auth/logout" method="post">
                <button className="btn-outline" type="submit">Keluar</button>
              </form>
            </>
          ) : (
            <>
              <Link className="btn-ghost" href="/login">Masuk</Link>
              <Link className="btn-primary" href="/register">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
