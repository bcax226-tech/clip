export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-brand-900 text-brand-50">
      <div className="container-wide grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-700 font-bold">
              HU
            </div>
            <div>
              <div className="text-sm font-bold">Kementerian Haji & Umrah</div>
              <div className="text-xs text-brand-100/80">Republik Indonesia</div>
            </div>
          </div>
          <p className="text-sm text-brand-100/80">
            Melayani jamaah haji dan umrah Indonesia dengan amanah, transparan, dan profesional.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Layanan</div>
          <ul className="space-y-1 text-sm text-brand-100/80">
            <li>Pendaftaran Haji Reguler</li>
            <li>Pendaftaran Haji Khusus</li>
            <li>Layanan Umrah</li>
            <li>Pengaduan Jamaah</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Informasi</div>
          <ul className="space-y-1 text-sm text-brand-100/80">
            <li>Berita & Pengumuman</li>
            <li>Siaran Pers</li>
            <li>Statistik Haji</li>
            <li>Regulasi</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Kontak</div>
          <ul className="space-y-1 text-sm text-brand-100/80">
            <li>Jl. Lapangan Banteng Barat No. 3-4</li>
            <li>Jakarta Pusat 10710</li>
            <li>Telp: (021) 3811 642</li>
            <li>Email: info@kemenaghaji.go.id</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-100/70">
        © {new Date().getFullYear()} Kementerian Haji & Umrah Republik Indonesia.
      </div>
    </footer>
  );
}
