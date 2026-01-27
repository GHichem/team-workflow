"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  apiBase: string;
  requestId: string;
};

export default function CommentForm({ apiBase, requestId }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const clean = message.trim();
    if (!clean) {
      setMsg("Comment is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/requests/${requestId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setMsg(err?.error ?? `Failed (${res.status})`);
        return;
      }

      setMessage("");
      router.refresh();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          style={{
            flex: "1 1 280px",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "var(--c-pink)",
            color: "#111",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {msg && <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>{msg}</div>}
    </form>
  );
}
