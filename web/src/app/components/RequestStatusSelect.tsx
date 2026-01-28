"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


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
  const router = useRouter();

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
        const body = await res.json().catch(() => null);
        setMsg(body?.error ?? `Failed (${res.status})`);
        setLoading(false);
        return;
      }

      setStatus(next);
      // simplest: reload so server-rendered list stays consistent
      router.refresh();
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => update(e.target.value)}
        className={`px-3 py-2 rounded-lg border border-site-border bg-transparent text-site-text outline-none ${loading ? 'opacity-70' : 'opacity-100'}`}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {msg && <span className="text-site-muted text-sm">{msg}</span>}
    </div>
  );
}
