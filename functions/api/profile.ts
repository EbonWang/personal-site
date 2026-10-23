/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../lib/auth";

function defaultProfile() {
  return {
    id: 1,
    name: "你的名字",
    title: "",
    avatar_url: "",
    bio: "",
    social_links: [],
    updated_at: null,
  };
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const row = await env.DB.prepare("SELECT * FROM profile WHERE id = 1").first();
  if (!row) return json(defaultProfile());
  try {
    (row as { social_links: unknown }).social_links = JSON.parse(
      (row as { social_links: string }).social_links || "[]"
    );
  } catch {
    (row as { social_links: unknown }).social_links = [];
  }
  return json(row);
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) {
    return json({ error: "unauthorized" }, 401);
  }
  const b = (await request.json()) as {
    name?: string;
    title?: string;
    avatar_url?: string;
    bio?: string;
    social_links?: unknown;
  };
  let social_links = "[]";
  try {
    social_links = JSON.stringify(b.social_links ?? []);
  } catch {
    social_links = "[]";
  }
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO profile (id, name, title, avatar_url, bio, social_links, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, title=excluded.title, avatar_url=excluded.avatar_url,
       bio=excluded.bio, social_links=excluded.social_links, updated_at=excluded.updated_at`
  )
    .bind(String(b.name ?? ""), String(b.title ?? ""), String(b.avatar_url ?? ""), String(b.bio ?? ""), social_links, now)
    .run();
  return json({ ok: true });
}
