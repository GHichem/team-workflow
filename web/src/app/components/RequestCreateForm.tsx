"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type Props = {
  apiBase: string;
};

export default function RequestCreateForm({ apiBase }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
const [assigneeId, setAssigneeId] = useState("u_demo");

  const router = useRouter();

  useEffect(() => {
  fetch(`${apiBase}/api/users`)
    .then((r) => r.json())
    .then((d) => setUsers(d.items ?? []))
    .catch(() => setUsers([]));
}, [apiBase]);



  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setMsg("Title is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  title: cleanTitle,
  priority,
  description: description.trim() ? description.trim() : null,
  assignee_id: assigneeId,
}),

      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setMsg(body?.error ?? `Failed (${res.status})`);
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
setMsg("Created ✅");
router.refresh();
setTimeout(() => setMsg(null), 1200);

    } catch  {
      setMsg("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 p-0 max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 items-center w-full">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Request title..."
            className="flex-1 min-w-0 px-3 py-3 rounded-lg border border-site-border bg-transparent text-site-text outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-28 px-3 py-2 rounded-lg border border-site-border bg-transparent text-site-text outline-none"
            aria-label="Priority"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-40 px-3 py-2 rounded-lg border border-site-border bg-transparent text-site-text outline-none" aria-label="Assignee">
            <option value="u_demo">Demo User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (details, acceptance criteria, UI notes...)" rows={5} className="w-full px-3 py-3 rounded-lg border border-site-border bg-transparent text-site-text outline-none resize-y" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Creating..." : "Create"}
          </button>
          {msg && (
            <div className="text-site-muted text-sm">{msg}</div>
          )}
        </div>
      </div>
    </form>
  );
}
