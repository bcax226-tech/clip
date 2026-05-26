export const metadata = { title: "Profil — Kementerian Haji & Umrah" };

export default function ProfilPage() {
  return (
    <>
      <section className="bg-brand-700 py-12 text-white">
        <div className="container-wide">
          <h1 className="text-3xl font-bold md:text-4xl">Profil Kementerian</h1>
          <p className="mt-2 text-brand-100/90">Visi, misi, struktur, dan sambutan Menteri Haji & Umrah RI.</p>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2 space-y-10">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-brand-800">Sambutan Menteri</h2>
              <div className="card p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Prof. Dr. H. Nama Menteri, M.Si.</div>
                    <div className="text-sm text-slate-500">Menteri Haji dan Umrah Republik Indonesia</div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Assalamu&apos;alaikum warahmatullahi wabarakatuh. Selamat datang di portal resmi Kementerian Haji dan Umrah
                  Republik Indonesia. Kementerian ini hadir sebagai wujud komitmen pemerintah dalam memberikan
                  pelayanan terbaik kepada jamaah haji dan umrah Indonesia.
                </p>
                <p className="mt-3 text-slate-700 leading-relaxed">
                  Kami berkomitmen untuk terus meningkatkan kualitas pelayanan dengan mengedepankan prinsip amanah,
                  transparan, profesional, dan inovatif. Mari kita wujudkan penyelenggaraan ibadah haji dan umrah
                  yang aman, nyaman, dan penuh berkah. Wassalamu&apos;alaikum warahmatullahi wabarakatuh.
                </p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold text-brand-800">Visi & Misi</h2>
              <div className="card p-6">
                <h3 className="font-semibold text-brand-700">Visi</h3>
                <p className="mt-1 italic text-slate-700">
                  &quot;Terwujudnya penyelenggaraan ibadah haji dan umrah yang aman, nyaman, lancar, dan penuh kepastian
                  bagi seluruh jamaah Indonesia.&quot;
                </p>
                <h3 className="mt-5 font-semibold text-brand-700">Misi</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-700">
                  <li>Meningkatkan kualitas pelayanan jamaah haji dan umrah.</li>
                  <li>Memperkuat manajemen dan tata kelola penyelenggaraan haji & umrah.</li>
                  <li>Mengoptimalkan pemanfaatan teknologi informasi untuk pelayanan jamaah.</li>
                  <li>Mewujudkan akuntabilitas dan transparansi pengelolaan keuangan haji.</li>
                  <li>Memperkuat kerja sama bilateral dengan Pemerintah Kerajaan Arab Saudi.</li>
                </ol>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold text-brand-800">Struktur Organisasi</h2>
              <div className="card p-6">
                <ul className="space-y-3 text-slate-700">
                  <Org level={0} title="Menteri Haji dan Umrah" />
                  <Org level={1} title="Wakil Menteri" />
                  <Org level={1} title="Sekretariat Jenderal" />
                  <Org level={2} title="Biro Perencanaan & Keuangan" />
                  <Org level={2} title="Biro Umum & SDM" />
                  <Org level={2} title="Biro Hukum & Hubungan Masyarakat" />
                  <Org level={1} title="Direktorat Jenderal Penyelenggaraan Haji" />
                  <Org level={2} title="Direktorat Pelayanan Haji Dalam Negeri" />
                  <Org level={2} title="Direktorat Pelayanan Haji Luar Negeri" />
                  <Org level={1} title="Direktorat Jenderal Penyelenggaraan Umrah & Haji Khusus" />
                  <Org level={2} title="Direktorat Bina Umrah" />
                  <Org level={2} title="Direktorat Bina Haji Khusus" />
                  <Org level={1} title="Inspektorat Jenderal" />
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h3 className="mb-2 font-semibold text-brand-800">Dasar Hukum</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• UU No. 8 Tahun 2019 tentang Penyelenggaraan Ibadah Haji & Umrah</li>
                <li>• Perpres tentang Kementerian Haji dan Umrah</li>
                <li>• PMA tentang Tata Kelola Haji & Umrah</li>
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 font-semibold text-brand-800">Hubungi Kami</h3>
              <p className="text-sm text-slate-700">
                Jl. Lapangan Banteng Barat No. 3-4<br />
                Jakarta Pusat 10710
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Call Center: <strong>1500-852</strong><br />
                Email: info@kemenaghaji.go.id
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Org({ level, title }: { level: number; title: string }) {
  return (
    <li className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.25}rem` }}>
      <span className={`h-2 w-2 rounded-full ${level === 0 ? "bg-brand-600" : level === 1 ? "bg-brand-500" : "bg-slate-400"}`} />
      <span className={level === 0 ? "font-bold text-brand-800" : level === 1 ? "font-semibold" : ""}>{title}</span>
    </li>
  );
}
