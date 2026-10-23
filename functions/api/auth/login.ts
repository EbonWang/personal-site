/// <reference types="@cloudflare/workers-types" />
import { Env, json, setSessionCookie, verifyPassword, createSession } from "../../lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  let ok = false;
  const admin = await env.DB.prepare("SELECT password_hash FROM admin WHERE id = 1").first<{ password_hash: string }>();
  if (admin && admin.password_hash) {
    ok = await verifyPassword(password, admin.password_hash);
  } else if (env.ADMIN_PASSWORD) {
    ok = password === env.ADMIN_PASSWORD;
  }

  if (!ok) return json({ error: "invalid_password" }, 401);

  const token = await createSession(env.SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": setSessionCookie(token),
    },
  });
}
