import RequestCreateForm from "../components/RequestCreateForm";
import RequestStatusSelect from "../components/RequestStatusSelect";
import { getRequests } from "../lib/api";
import type { RequestItem } from "../lib/types";
import Link from "next/link";

export default async function RequestsPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";


let data: { items: RequestItem[] } | null = null;
let error: string | null = null;

try {
  data = await getRequests();
} catch (e: any) {
  error = e?.message ?? "Failed to load requests";
}


return (
  <main style={{ padding: 24, fontFamily: "system-ui" }}>
    <h1 style={{ fontSize: 28, marginBottom: 12 }}>Requests</h1>

    {error ? (
      <p style={{ color: "var(--muted)" }}>{error}</p>
    ) : !data ? (
      <p style={{ color: "var(--muted)" }}>Loading...</p>
    ) : (
      <>
        <RequestCreateForm apiBase={base} />

        <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
          {data.items.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                background: "var(--card)",
              }}
            >
              <div style={{ fontWeight: 700 }}>
  <Link href={`/requests/${r.id}`} style={{ textDecoration: "none" }}>
    {r.title}
  </Link>
</div>

              {r.description && (
  <div style={{ marginTop: 6, color: "var(--muted)" }}>
    {r.description}
  </div>
)}


              <div style={{ marginTop: 8 }}>
                <RequestStatusSelect
                  apiBase={base}
                  requestId={r.id}
                  initialStatus={r.status}
                />
              </div>

              <div style={{ opacity: 0.8, marginTop: 6 }}>
                Status: <b>{r.status}</b> · Priority: <b>{r.priority}</b>
              </div>

              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                Created: {new Date(r.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </>
    )}
  </main>
);}
