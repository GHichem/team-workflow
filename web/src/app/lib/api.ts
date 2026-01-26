import { AuditItem, RequestItem, CommentItem } from "./types";



const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export async function getRequests(): Promise<{ items: RequestItem[] }> {
  const res = await fetch(`${base}/api/requests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load requests (${res.status})`);
  return res.json();
}

export async function getAudit(limit = 50): Promise<{ items: AuditItem[] }> {
  const res = await fetch(`${base}/api/audit?limit=${limit}`, { cache: "no-store" });
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
