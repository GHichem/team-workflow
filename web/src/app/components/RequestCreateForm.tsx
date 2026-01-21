"use client";

import { useState } from "react";

type Props = {
  apiBase: string;
};

export default function RequestCreateForm({ apiBase }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
        body: JSON.stringify({ title: cleanTitle, priority }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setMsg(err?.error ?? `Failed (${res.status})`);
        return;
      }

      setTitle("");
      setPriority("MEDIUM");
      setMsg("Created ✅ Refreshing...");
      // simplest refresh: reload the page to re-fetch server data
      window.location.reload();
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
      </div>

      {msg && (
        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
          {msg}
        </div>
      )}
    </form>
  );
}
