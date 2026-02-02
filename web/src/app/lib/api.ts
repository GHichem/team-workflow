import { AuditItem, RequestItem, CommentItem } from "./types";



const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export async function getRequests(): Promise<{ items: RequestItem[] }> {
  const res = await fetch(`${base}/api/requests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load requests (${res.status})`);
  return res.json();
}

export async function getAudit(limit = 50, offset = 0, filters?: { action?: string; actor_id?: string; q?: string }): Promise<{ items: AuditItem[] }> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (filters?.action) qs.set("action", filters.action);
  if (filters?.actor_id) qs.set("actor_id", filters.actor_id);
  if (filters?.q) qs.set("q", filters.q);
  const res = await fetch(`${base}/api/audit?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load audit (${res.status})`);
  return res.json();
}

export async function getRequest(id: string): Promise<{ item: RequestItem }> {
  const res = await fetch(`${base}/api/requests/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load request (${res.status})`);
  return res.json();
}

export async function getComments(id: string): Promise<{ items: CommentItem[] }> {
  const res = await fetch(`${base}/api/requests/${id}/comments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load comments (${res.status})`);
  return res.json();
}

export async function getUsers(q?: string): Promise<{ items: { id: string; name: string }[] }> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await fetch(`${base}/api/users${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
  return res.json();
}

