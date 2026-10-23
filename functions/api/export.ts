/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../lib/auth";

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await verifySession(getCookie(request, "session"), env.SESSION_SECRET))) return json({ error: "unauthorized" }, 401);
  const profile = await env.DB.prepare("SELECT * FROM profile WHERE id = 1").first();
  const skills = (await env.DB.prepare("SELECT * FROM skills ORDER BY order_index, id").all()).results;
  const projects = (await env.DB.prepare("SELECT * FROM projects ORDER BY order_index, id").all()).results;
  const blog_posts = (await env.DB.prepare("SELECT * FROM blog_posts ORDER BY id").all()).results;
  return json({ profile, skills, projects, blog_posts, exported_at: Date.now() });
}
