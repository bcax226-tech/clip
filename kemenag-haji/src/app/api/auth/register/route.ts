import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { usersDb, type User } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nik = String(body.nik ?? "").trim();
  const nama = String(body.nama ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!/^\d{16}$/.test(nik)) return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
  if (nama.length < 2) return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });

  const users = await usersDb.all();
  if (users.some((u) => u.email === email)) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  if (users.some((u) => u.nik === nik)) return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });

  const { hash, salt } = hashPassword(password);
  const user: User = {
    id: randomBytes(8).toString("hex"),
    nik,
    nama,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    role: "jamaah",
    createdAt: new Date().toISOString(),
  };
  await usersDb.save([...users, user]);
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
}
