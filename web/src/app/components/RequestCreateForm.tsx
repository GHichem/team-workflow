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
  const [actorId, setActorId] = useState<string>("u_demo");
  const [actorName, setActorName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
  fetch(`${apiBase}/api/users`)
    .then((r) => r.json())
    .then((d) => setUsers(d.items ?? []))
    .catch(() => setUsers([]));
}, [apiBase]);

  useEffect(() => {
    // determine actor and whether admin from view_as saved selection
    try {
      const v = localStorage.getItem("view_as");
      if (!v) {
        // default to admin/all view
        setIsAdmin(true);
        setActorId("u_demo");
        setActorName("Demo User");
        setAssigneeId("u_demo");
        return;
      }
      const p = JSON.parse(v);
      const id = p?.id ?? null;
      const name = p?.name ?? null;
      if (!id || id === "ALL") {
        setIsAdmin(true);
        setActorId("u_demo");
        setActorName("Demo User");
        setAssigneeId("u_demo");
        return;
      }
      if (id === "admin") {
        setIsAdmin(true);
        setActorId("u_demo");
        setActorName("Demo User");
        setAssigneeId("u_demo");
        return;
      }

      setIsAdmin(false);
      setActorId(id);
      setActorName(name ?? null);
      setAssigneeId(id);
    } catch {
      setIsAdmin(true);
      setActorId("u_demo");
      setActorName("Demo User");
      setAssigneeId("u_demo");
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ev = e as CustomEvent<{ id: string; name: string } | null>;
        const p = ev.detail;
        if (!p) {
          setIsAdmin(true);
          setActorId("u_demo");
          setActorName("Demo User");
          setAssigneeId("u_demo");
          return;
        }
        const id = p.id;
        const name = p.name ?? null;
        if (!id || id === "ALL" || id === "admin") {
          setIsAdmin(true);
          setActorId("u_demo");
          setActorName("Demo User");
          setAssigneeId("u_demo");
          return;
        }

        setIsAdmin(false);
        setActorId(id);
        setActorName(name);
        setAssigneeId(id);
      } catch {
        // ignore
      }
    };

    window.addEventListener("view-as-changed", handler as EventListener);
    return () => window.removeEventListener("view-as-changed", handler as EventListener);
  }, []);



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
      const actorHeader = actorId || (function getActorId() {
        try {
          const v = localStorage.getItem("view_as");
          if (!v) return "u_demo";
          const p = JSON.parse(v);
          const id = p?.id ?? null;
          if (!id || id === "ALL" || id === "admin") return "u_demo";
          return id;
        } catch {
          return "u_demo";
        }
      })();
      const res = await fetch(`${apiBase}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": actorHeader },
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
    if (isAdmin === false) {
      return (
        <div className="mb-4 p-4 max-w-2xl mx-auto bg-site-card border border-site-border rounded-lg">
          <div className="text-site-muted">Viewing as <span className="text-site-text font-semibold">{actorName ?? actorId}</span> — showing their requests.</div>
        </div>
      );
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
            {isAdmin ? (
              <>
                <option value="u_demo">Demo User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </>
            ) : (
              // non-admins may only assign to themselves
              <>
                <option value={actorId}>{actorName ?? actorId}</option>
              </>
            )}
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
