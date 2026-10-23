/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../lib/auth";

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const rows = await env.DB.prepare("SELECT * FROM projects ORDER BY order_index ASC, id ASC").all();
  const list = (rows.results ?? []).map((r: { tags?: string }) => {
    const row = r as { tags?: string };
    try {
      (row as { tags: unknown }).tags = JSON.parse(row.tags || "[]");
    } catch {
      (row as { tags: unknown }).tags = [];
    }
    return row;
  });
  return json(list);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as {
    title?: string;
    description?: string;
    image_url?: string;
    project_url?: string;
    repo_url?: string;
    tags?: unknown;
    order_index?: number;
  };
  let tags = "[]";
  try {
    tags = JSON.stringify(b.tags ?? []);
  } catch {
    tags = "[]";
  }
  const info = await env.DB.prepare(
    "INSERT INTO projects (title, description, image_url, project_url, repo_url, tags, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      String(b.title ?? ""),
      String(b.description ?? ""),
      String(b.image_url ?? ""),
      String(b.project_url ?? ""),
      String(b.repo_url ?? ""),
      tags,
      Number(b.order_index ?? 0),
      Date.now()
    )
    .run();
  return json({ ok: true, id: Number(info.meta?.last_row_id ?? 0) });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const b = (await request.json()) as {
    id: number;
    title?: string;
    description?: string;
    image_url?: string;
    project_url?: string;
    repo_url?: string;
    tags?: unknown;
    order_index?: number;
  };
  let tags = "[]";
  try {
    tags = JSON.stringify(b.tags ?? []);
  } catch {
    tags = "[]";
  }
  await env.DB.prepare(
    "UPDATE projects SET title=?, description=?, image_url=?, project_url=?, repo_url=?, tags=?, order_index=? WHERE id=?"
  )
    .bind(
      String(b.title ?? ""),
      String(b.description ?? ""),
      String(b.image_url ?? ""),
      String(b.project_url ?? ""),
      String(b.repo_url ?? ""),
      tags,
      Number(b.order_index ?? 0),
      Number(b.id)
    )
    .run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "missing_id" }, 400);
  await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(Number(id)).run();
  return json({ ok: true });
}
