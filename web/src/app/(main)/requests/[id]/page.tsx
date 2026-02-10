import { getComments, getRequest, getUsers } from "../../../lib/api";
import type { CommentItem, RequestItem } from "../../../lib/types";
import CommentForm from "../../../components/CommentForm";

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

  // fetch user list to resolve author names for comments (server-side)
  let usersMap: Map<string, string> | null = null;
  try {
    const u = await getUsers();
    usersMap = new Map((u.items ?? []).map((x: { id: string; name: string }) => [x.id, x.name]));
  } catch {
    usersMap = null;
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
          <div className="mt-3 text-site-muted">Assignee: <span className="text-site-text font-semibold">{item!.assignee_name ?? 'Unassigned'}</span></div>
        </div>

        <aside className="md:w-56 md:text-right">
          <div className="text-site-muted">Status: <span className="text-site-text font-semibold">{item!.status}</span></div>
          <div className="text-site-muted mt-1">Priority: <span className="text-site-text font-semibold">{item!.priority}</span></div>
        </aside>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>

        <div className="max-w-5xl w-full">
          <CommentForm apiBase={base} requestId={id} />

          {comments.length === 0 ? (
            <p className="text-site-muted">No comments yet.</p>
          ) : (
            <ul className="flex flex-col gap-6 list-none p-0 m-0 mt-4">
              {comments.map((c) => {
                const authorName = usersMap?.get(c.author_id ?? "") ?? c.author_id;
                return (
                  <li
                    key={c.id}
                    className="bg-site-card rounded-lg shadow-sm p-6 border border-transparent hover:shadow-md"
                  >
                    <div className="flex items-baseline justify-between gap-3" style={{ borderLeft: "6px solid rgba(240,117,174,0.08)" }}>
                      <div className="text-xl font-semibold text-site-text">{authorName}</div>
                      <div className="text-site-muted text-sm">{formatRelative(c.created_at)}</div>
                    </div>

                    <div className="mt-4 bg-[rgba(255,255,255,0.02)] p-6 rounded-md">
                      <div className="text-site-text text-lg leading-8 whitespace-pre-wrap break-words">{c.message}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function formatRelative(iso?: string | null) {
  if (!iso) return "";
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const s = Math.max(0, Math.floor((now - then) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  } catch {
    return "";
  }
}
