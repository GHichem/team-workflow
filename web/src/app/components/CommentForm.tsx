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
    <form onSubmit={onSubmit} className="mb-3">
      <div className="flex gap-3 flex-wrap">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a comment..." className="flex-1 min-w-[280px] px-3 py-2 rounded-lg border border-site-border bg-transparent text-site-text outline-none" />
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-palette-pink text-black font-extrabold disabled:opacity-60">
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {msg && <div className="mt-2 text-site-muted text-sm">{msg}</div>}
    </form>
  );
}
