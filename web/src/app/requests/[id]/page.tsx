import { getComments, getRequest } from "../../lib/api";
import type { CommentItem, RequestItem } from "../../lib/types";
import CommentForm from "../../components/CommentForm";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  } catch (e: unknown) {
    if (e instanceof Error) error = e.message;
    else error = String(e ?? "Failed to load request");
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Request</h1>
        <p className="text-site-muted">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6 font-sans">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="md:flex-1">
          <h1 className="text-2xl font-bold mb-2">{item!.title}</h1>
          {item!.description && <p className="text-site-muted leading-6">{item!.description}</p>}
          <div className="mt-3 text-site-muted">Assignee: <span className="text-site-text font-semibold">{item!.assignee_name ?? '-'}</span></div>
        </div>

        <aside className="md:w-56 md:text-right">
          <div className="text-site-muted">Status: <span className="text-site-text font-semibold">{item!.status}</span></div>
          <div className="text-site-muted mt-1">Priority: <span className="text-site-text font-semibold">{item!.priority}</span></div>
        </aside>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>

        <CommentForm apiBase={base} requestId={id} />

        {comments.length === 0 ? (
          <p className="text-site-muted">No comments yet.</p>
        ) : (
          <ul className="grid gap-3 list-none p-0">
            {comments.map((c) => (
              <li key={c.id} className="border border-site-border rounded-lg p-3 bg-site-card">
                <div className="text-site-muted text-sm">{new Date(c.created_at).toLocaleString()} · {c.author_id}</div>
                <div className="mt-2">{c.message}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
