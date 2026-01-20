export default function HomePage() {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        background: "var(--card)",
      }}
    >
      <h1 style={{ fontSize: 34, margin: 0 }}>Team Workflow</h1>
      <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.5 }}>
        A small internal tool that demonstrates real-world fullstack work:
        Requests + Audit Log, backed by a REST API and PostgreSQL.
      </p>

      <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
        <li>Create and track requests</li>
        <li>Update status and priority</li>
        <li>See an audit trail of changes</li>
      </ul>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <a
          href="/requests"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--c-pink)",
            color: "#111",
            fontWeight: 800,
          }}
        >
          View Requests
        </a>
        <a
          href="/audit"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "transparent",
            fontWeight: 700,
          }}
        >
          View Audit Log
        </a>
      </div>

    </section>
  );
}
