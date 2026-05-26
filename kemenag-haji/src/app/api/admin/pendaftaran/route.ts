import { NextResponse } from "next/server";
import { pendaftaranDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STATUS = new Set(["menunggu", "diproses", "diterima", "ditolak"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!STATUS.has(status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });

  const all = await pendaftaranDb.all();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  all[idx] = { ...all[idx], status: status as any, updatedAt: new Date().toISOString() };
  await pendaftaranDb.save(all);
  return NextResponse.redirect(new URL("/admin/pendaftaran", req.url));
}
