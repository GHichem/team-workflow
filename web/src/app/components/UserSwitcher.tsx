"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string };

export default function UserSwitcher({ apiBase }: { apiBase: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [sel, setSel] = useState<{ id: string; name: string } | null>(() => {
    try {
      const v = localStorage.getItem("view_as");
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let mounted = true;
    fetch(`${apiBase}/api/users`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setUsers(d.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setUsers([]);
      });

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  function change(v: string) {
    let payload: { id: string; name: string } | null = null;
    if (v === "ALL") payload = null;
    else if (v === "admin") payload = { id: "admin", name: "Admin" };
    else {
      const u = users.find((x) => x.id === v);
      payload = u ? { id: u.id, name: u.name } : null;
    }

    setSel(payload);
    try {
      localStorage.setItem("view_as", JSON.stringify(payload));
    } catch {}
    window.dispatchEvent(new CustomEvent("view-as-changed", { detail: payload }));
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={sel?.id ?? "ALL"}
        onChange={(e) => change(e.target.value)}
        className="px-3 py-2 rounded-lg border border-site-border bg-transparent text-site-text outline-none"
        aria-label="View as user"
      >
        <option value="ALL">All / Admin</option>
        <option value="admin">Admin</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <div className="text-site-muted text-sm">
        Viewing as: <span className="text-site-text font-semibold">{sel?.name ?? "All"}</span>
      </div>
    </div>
  );
}
