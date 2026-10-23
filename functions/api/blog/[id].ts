/// <reference types="@cloudflare/workers-types" />
import { Env, json } from "../../lib/auth";

export async function onRequestGet({ params, env }: { params: { id: string }; env: Env }): Promise<Response> {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ error: "bad_id" }, 400);
  const row = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
  if (!row) return json({ error: "not_found" }, 404);
  return json(row);
}
