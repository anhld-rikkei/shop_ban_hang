import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Minimal admin authentication: a single admin account configured through env vars
 * (ADMIN_USER / ADMIN_PASSWORD) and an HMAC-signed session cookie.
 * Defaults are for local development only.
 */
const COOKIE = "lien_admin";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "lien-dev-secret-change-me";
const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export const usingDefaultCredentials = !process.env.ADMIN_PASSWORD;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyCredentials(user: string, password: string): boolean {
  return safeEqual(user.trim(), ADMIN_USER) && safeEqual(password, ADMIN_PASSWORD);
}

function makeToken(): string {
  const payload = `${ADMIN_USER}.${Date.now() + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, exp, sig] = parts;
  const payload = `${user}.${exp}`;
  if (!safeEqual(sign(payload), sig)) return false;
  return Number(exp) > Date.now() && user === ADMIN_USER;
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
