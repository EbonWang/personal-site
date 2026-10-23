/// <reference types="@cloudflare/workers-types" />
import { Env, json, getCookie, verifySession } from "../../lib/auth";

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const authed = await verifySession(getCookie(request, "session"), env.SESSION_SECRET);
  return json({ authed });
}
