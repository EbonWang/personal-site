/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession, hashPasswordWithSalt } from "../../lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as { password?: string };
  const newPassword = String(b.password ?? "");
  if (newPassword.length < 6) return json({ error: "password_too_short" }, 400);
  const hash = await hashPasswordWithSalt(newPassword);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO admin (id, password_hash, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash, updated_at=excluded.updated_at`
  )
    .bind(hash, now)
    .run();
  return json({ ok: true });
}
