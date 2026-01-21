"use client";

import { useState } from "react";

type Props = {
  apiBase: string;
  requestId: string;
  initialStatus: string;
};

const statuses = ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED"] as const;

export default function RequestStatusSelect({
  apiBase,
  requestId,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function update(next: string) {
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setMsg(err?.error ?? `Failed (${res.status})`);
        setLoading(false);
        return;
      }

      setStatus(next);
      // simplest: reload so server-rendered list stays consistent
      window.location.reload();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <select
        value={status}
        disabled={loading}
        onChange={(e) => update(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text)",
          outline: "none",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {msg && <span style={{ color: "var(--muted)", fontSize: 12 }}>{msg}</span>}
    </div>
  );
}
