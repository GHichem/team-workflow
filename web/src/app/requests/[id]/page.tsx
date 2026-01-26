import { getComments, getRequest } from "../../lib/api";
import type { CommentItem, RequestItem } from "../../lib/types";
import CommentForm from "../../components/CommentForm";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  const { id } = await params;


  let item: RequestItem | null = null;
  let comments: CommentItem[] = [];
  let error: string | null = null;

  try {
    const r = await getRequest(id);
    const c = await getComments(id);
    item = r.item;
    comments = c.items;
  } catch (e: any) {
    error = e?.message ?? "Failed to load request";
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Request</h1>
        <p style={{ color: "var(--muted)" }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>{item!.title}</h1>

      {item!.description && (
        <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
          {item!.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, color: "var(--muted)", marginTop: 10 }}>
        <div>Status: <b style={{ color: "var(--text)" }}>{item!.status}</b></div>
        <div>Priority: <b style={{ color: "var(--text)" }}>{item!.priority}</b></div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>Comments</h2>

        <CommentForm apiBase={base} requestId={id} />

        {comments.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No comments yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
            {comments.map((c) => (
              <li
                key={c.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  background: "var(--card)",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  {new Date(c.created_at).toLocaleString()} · {c.author_id}
                </div>
                <div style={{ marginTop: 6 }}>{c.message}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
