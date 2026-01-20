import "./globals.css";

export const metadata = {
  title: "Team Workflow",
  description: "Requests + Audit Log (Next.js + Node + Postgres)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(11,11,15,0.85)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <a href="/" style={{ textDecoration: "none", fontWeight: 800 }}>
              <span style={{ color: "var(--c-pink)" }}>●</span> Team Workflow
            </a>

            <nav style={{ display: "flex", gap: 10 }}>
              <a
                href="/requests"
                style={{
                  textDecoration: "none",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                Requests
              </a>
              <a
                href="/audit"
                style={{
                  textDecoration: "none",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                Audit Log
              </a>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "18px 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
