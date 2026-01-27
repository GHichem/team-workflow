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
        const err = await res.json().catch(() => null);
        setMsg(err?.error ?? `Failed (${res.status})`);
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
setMsg("Created ✅");
router.refresh();
setTimeout(() => setMsg(null), 1200);

    } catch (err) {
      setMsg("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "var(--card)",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Request title..."
          style={{
            flex: "1 1 260px",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
            outline: "none",
          }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
            outline: "none",
          }}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <select
  value={assigneeId}
  onChange={(e) => setAssigneeId(e.target.value)}
  style={{
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    outline: "none",
  }}
>
  <option value="u_demo">Demo User</option>
  {users.map((u) => (
    <option key={u.id} value={u.id}>
      {u.name}
    </option>
  ))}
</select>


        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "var(--c-green)",
            color: "#111",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating..." : "Create"}
        </button>
        <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Description (details, acceptance criteria, UI notes...)"
  rows={3}
  style={{
    width: "100%",
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    outline: "none",
    resize: "vertical",
  }}
/>

      </div>

      {msg && (
        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
          {msg}
        </div>
      )}
    </form>
  );
}
