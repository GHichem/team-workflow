type RequestItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export default async function RequestsPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const res = await fetch(`${base}/api/requests`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Requests</h1>
        <p>Failed to load requests. Status: {res.status}</p>
      </main>
    );
  }

  const data = (await res.json()) as { items: RequestItem[] };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Requests</h1>

      <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
        {data.items.map((r) => (
          <li
            key={r.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{r.title}</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Status: <b>{r.status}</b> · Priority: <b>{r.priority}</b>
            </div>
            <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
              Created: {new Date(r.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
