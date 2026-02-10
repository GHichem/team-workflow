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
        const actorId = (function getActorId() {
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

        const res = await fetch(`${apiBase}/api/requests/${requestId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-actor-id": actorId },
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
      <div className="flex gap-3 flex-wrap items-center">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 min-w-0 px-5 py-4 rounded-md border border-site-border bg-[rgba(255,255,255,0.02)] text-site-text outline-none text-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-md bg-[rgba(255,255,255,0.03)] text-site-text border border-site-border hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-60 text-lg"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {msg && <div className="mt-2 text-site-muted text-sm">{msg}</div>}
    </form>
  );
}
