import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { beritaDb, type Berita } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const KATEGORI = new Set(["berita", "pengumuman", "siaran-pers"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Harus login" }, { status: 401 });

  const ct = req.headers.get("content-type") ?? "";
  let body: any = {};
  if (ct.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  if (body._method === "DELETE") {
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const id = String(body.id ?? "");
    const all = await beritaDb.all();
    await beritaDb.save(all.filter((b) => b.id !== id));
    return NextResponse.redirect(new URL("/admin/berita", req.url));
  }

  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const judul = String(body.judul ?? "").trim();
  const ringkasan = String(body.ringkasan ?? "").trim();
  const konten = String(body.konten ?? "").trim();
  const kategori = String(body.kategori ?? "berita");
  if (!judul) return NextResponse.json({ error: "Judul wajib" }, { status: 400 });
  if (!ringkasan) return NextResponse.json({ error: "Ringkasan wajib" }, { status: 400 });
  if (!konten) return NextResponse.json({ error: "Konten wajib" }, { status: 400 });
  if (!KATEGORI.has(kategori)) return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });

  const all = await beritaDb.all();
  let slug = slugify(judul);
  if (!slug) slug = randomBytes(4).toString("hex");
  if (all.some((b) => b.slug === slug)) slug = `${slug}-${randomBytes(2).toString("hex")}`;

  const item: Berita = {
    id: randomBytes(8).toString("hex"),
    slug,
    judul,
    ringkasan,
    konten,
    penulis: user.nama,
    kategori: kategori as Berita["kategori"],
    createdAt: new Date().toISOString(),
  };
  await beritaDb.save([item, ...all]);
  return NextResponse.json({ ok: true, item });
}
