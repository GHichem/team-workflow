import Image from "next/image";

export default function Home() {
  return (
     <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Team Workflow</h1>
      <p style={{ marginBottom: 16 }}>
        A mini SaaS: requests, approvals, and an audit log. Demo + Email login.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <a
          href="http://localhost:3000/demo"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Try Demo
        </a>

        <a
          href="/signin"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Sign in (Email link)
        </a>
      </div>
    </main>
  );
}