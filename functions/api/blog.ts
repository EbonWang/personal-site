/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../lib/auth";

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  let sql = "SELECT id, title, summary, published_at, created_at FROM blog_posts";
  const args: string[] = [];
  if (q) {
    sql += " WHERE title LIKE ? OR summary LIKE ? OR content LIKE ?";
    const like = `%${q}%`;
    args.push(like, like, like);
  }
  sql += " ORDER BY published_at DESC, id DESC";
  const rows = await env.DB.prepare(sql).bind(...args).all();
  return json(rows.results ?? []);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as { title?: string; summary?: string; content?: string; published_at?: number };
  const now = Date.now();
  const pub = b.published_at ? Number(b.published_at) : now;
  const info = await env.DB.prepare(
    "INSERT INTO blog_posts (title, summary, content, published_at, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(String(b.title ?? ""), String(b.summary ?? ""), String(b.content ?? ""), pub, now)
    .run();
  return json({ ok: true, id: Number(info.meta?.last_row_id ?? 0) });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as { id: number; title?: string; summary?: string; content?: string; published_at?: number };
  const pub = b.published_at ? Number(b.published_at) : Date.now();
  await env.DB.prepare("UPDATE blog_posts SET title=?, summary=?, content=?, published_at=? WHERE id=?")
    .bind(String(b.title ?? ""), String(b.summary ?? ""), String(b.content ?? ""), pub, Number(b.id))
    .run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "missing_id" }, 400);
  await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(Number(id)).run();
  return json({ ok: true });
}
