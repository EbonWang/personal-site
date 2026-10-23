/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../lib/auth";

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const rows = await env.DB.prepare("SELECT * FROM skills ORDER BY order_index ASC, id ASC").all();
  return json(rows.results ?? []);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as { name?: string; category?: string; level?: number; order_index?: number };
  const info = await env.DB.prepare(
    "INSERT INTO skills (name, category, level, order_index, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(String(b.name ?? ""), String(b.category ?? ""), Number(b.level ?? 0), Number(b.order_index ?? 0), Date.now())
    .run();
  return json({ ok: true, id: Number(info.meta?.last_row_id ?? 0) });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as { id: number; name?: string; category?: string; level?: number; order_index?: number };
  await env.DB.prepare("UPDATE skills SET name=?, category=?, level=?, order_index=? WHERE id=?")
    .bind(String(b.name ?? ""), String(b.category ?? ""), Number(b.level ?? 0), Number(b.order_index ?? 0), Number(b.id))
    .run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "missing_id" }, 400);
  await env.DB.prepare("DELETE FROM skills WHERE id = ?").bind(Number(id)).run();
  return json({ ok: true });
}
