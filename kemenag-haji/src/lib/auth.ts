import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sessionsDb, usersDb, type User } from "./db";

const COOKIE_NAME = "kh_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, s, 100_000, 32, "sha256").toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const cmp = pbkdf2Sync(password, salt, 100_000, 32, "sha256").toString("hex");
  const a = Buffer.from(cmp, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const sessions = await sessionsDb.all();
  sessions.push({ token, userId, expiresAt });
  await sessionsDb.save(sessions);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const sessions = await sessionsDb.all();
    await sessionsDb.save(sessions.filter((s) => s.token !== token));
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const sessions = await sessionsDb.all();
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  const users = await usersDb.all();
  return users.find((u) => u.id === session.userId) ?? null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") throw new Error("FORBIDDEN");
  return u;
}
