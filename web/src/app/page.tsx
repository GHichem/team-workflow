import Image from "next/image";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Team Workflow</h1>
      <p style={{ opacity: 0.85, marginBottom: 18 }}>
        Mini SaaS demo: Requests + Audit Log (Next.js + Node/Express + Postgres).
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <a
          href="/requests"
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          View Requests
        </a>

        <a
          href="/audit"
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          View Audit Log
        </a>
      </div>

      <div style={{ fontSize: 13, opacity: 0.7 }}>
        Stack: Next.js (React) · Node.js (Express) · PostgreSQL (Docker) · REST API
      </div>
    </main>
  );
}
