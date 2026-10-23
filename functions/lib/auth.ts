/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  ADMIN_PASSWORD?: string;
}

export const COOKIE_NAME = "session";
const SESSION_MAX_AGE = 7 * 24 * 3600; // 7 天（秒）

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return bufToHex(bits);
}

export async function hashPasswordWithSalt(password: string): Promise<string> {
  const salt = bufToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await hashPassword(password, salt);
  return `pbkdf2$${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const computed = await hashPassword(password, parts[1]);
  return computed === parts[2];
}

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bufToHex(sig);
}

export async function createSession(secret: string): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await hmac(payload, secret);
  return btoa(payload) + "." + sig;
}

export async function verifySession(cookie: string | null, secret: string): Promise<boolean> {
  if (!cookie) return false;
  const idx = cookie.lastIndexOf(".");
  if (idx < 0) return false;
  const b64 = cookie.slice(0, idx);
  const sig = cookie.slice(idx + 1);
  try {
    const payload = atob(b64);
    const expected = await hmac(payload, secret);
    if (expected !== sig) return false;
    const ts = Number(payload.split(":")[1]);
    return Date.now() - ts < SESSION_MAX_AGE * 1000;
  } catch {
    return false;
  }
}
