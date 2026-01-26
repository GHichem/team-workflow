import { getAudit } from "../lib/api";
import type { AuditItem } from "../lib/types";

export default async function AuditPage() {
  let data: { items: AuditItem[] } | null = null;
let error: string | null = null;

try {
  data = await getAudit(50);
} catch (e: any) {
  error = e?.message ?? "Failed to load audit logs";
}

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

{error ? (
  <p style={{ color: "var(--muted)" }}>{error}</p>
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
  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Request</th>
  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Change</th>
  <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>Actor</th>
</tr>

            </thead>
            <tbody>
  {data!.items.map((x) => {
    const requestName = x.entity_label ?? x.entity_id ?? "-";

    const change =
      x.action === "STATUS_CHANGE"
        ? `${x.before_json?.status ?? "?"} → ${x.after_json?.status ?? "?"}`
        : x.action === "CREATE"
        ? "Created"
        : "-";

    return (
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
        <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
          {requestName}
        </td>
        <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
          {change}
        </td>
        <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)", fontFamily: "ui-monospace, Menlo, monospace" }}>
          {x.actor_id ?? "-"}
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        </div>
      )}
    </section>
  );
}
