import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getCustomerById, toPublicCustomer, type PublicCustomer } from "@/lib/db";

/** Storefront customer session: HMAC-signed cookie carrying the customer id. */
const COOKIE = "lien_customer";
const SECRET = (process.env.ADMIN_SESSION_SECRET ?? "lien-dev-secret-change-me") + ":customer";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function parse(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!safeEqual(sign(`${id}.${exp}`), sig)) return null;
  if (Number(exp) < Date.now()) return null;
  return id;
}

export async function getCurrentCustomer(): Promise<PublicCustomer | null> {
  const jar = await cookies();
  const id = parse(jar.get(COOKIE)?.value);
  if (!id) return null;
  const c = await getCustomerById(id);
  return c ? toPublicCustomer(c) : null;
}

export async function startCustomerSession(customerId: string, remember = true): Promise<void> {
  const jar = await cookies();
  const exp = Date.now() + (remember ? TTL_MS : 1000 * 60 * 60 * 12);
  const payload = `${customerId}.${exp}`;
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor((exp - Date.now()) / 1000),
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endCustomerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
