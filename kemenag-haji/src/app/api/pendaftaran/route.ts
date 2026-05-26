import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { pendaftaranDb, type Pendaftaran } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const JENIS = new Set(["haji-reguler", "haji-khusus", "umrah"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Harus login" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const jenis = String(body.jenis ?? "");
  if (!JENIS.has(jenis)) return NextResponse.json({ error: "Jenis tidak valid" }, { status: 400 });
  const tanggalLahir = String(body.tanggalLahir ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir)) return NextResponse.json({ error: "Tanggal lahir tidak valid" }, { status: 400 });
  const alamat = String(body.alamat ?? "").trim();
  if (alamat.length < 5) return NextResponse.json({ error: "Alamat tidak valid" }, { status: 400 });
  const noHp = String(body.noHp ?? "").trim();
  if (!/^[\d+]{8,15}$/.test(noHp)) return NextResponse.json({ error: "No HP tidak valid" }, { status: 400 });

  const now = new Date().toISOString();
  const item: Pendaftaran = {
    id: randomBytes(8).toString("hex"),
    userId: user.id,
    jenis: jenis as Pendaftaran["jenis"],
    tanggalLahir,
    alamat,
    noHp,
    paspor: body.paspor ? String(body.paspor).trim() : undefined,
    catatan: body.catatan ? String(body.catatan).trim() : undefined,
    status: "menunggu",
    createdAt: now,
    updatedAt: now,
  };
  const all = await pendaftaranDb.all();
  await pendaftaranDb.save([...all, item]);
  return NextResponse.json({ ok: true, item });
}
