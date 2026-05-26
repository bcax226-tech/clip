import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) return NextResponse.json({ error: "Email & kata sandi wajib" }, { status: 400 });

  const users = await usersDb.all();
  const user = users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
}
