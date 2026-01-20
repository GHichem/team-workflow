type AuditItem = {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string | null;
};

export default async function AuditPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(`${base}/api/audit?limit=50`, { cache: "no-store" });

  const data = res.ok ? ((await res.json()) as { items: AuditItem[] }) : null;

  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        background: "var(--card)",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Audit Log</h1>

      {!res.ok ? (
        <p style={{ color: "var(--muted)" }}>
          Failed to load audit logs. Status: {res.status}
        </p>
      ) : data!.items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          No audit entries yet. Next: we will write audit entries when creating
          or updating requests.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Time</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Action</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Entity</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Entity ID</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Actor</th>
              </tr>
            </thead>
            <tbody>
              {data!.items.map((x) => (
                <tr key={x.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                    {new Date(x.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                    {x.action}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                    {x.entity_type}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)", fontFamily: "ui-monospace, Menlo, monospace" }}>
                    {x.entity_id ?? "-"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)", fontFamily: "ui-monospace, Menlo, monospace" }}>
                    {x.actor_id ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
