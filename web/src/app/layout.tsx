import "./globals.css";
import Link from "next/link";
import UserSwitcher from "./components/UserSwitcher";

export const metadata = {
  title: "Team Workflow",
  description: "Requests + Audit Log (Next.js + Node + Postgres)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  return (
    <html lang="en">
      <body className="min-h-screen bg-site-bg text-site-text">
        <header className="sticky top-0 z-20 border-b border-site-border">
          <div
            className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
          >
            <Link href="/" className="flex items-center gap-2 font-extrabold no-underline hover:opacity-80 transition-opacity">
              <span className="text-xl text-palette-pink">●</span>
              <span className="text-lg">Team Workflow</span>
            </Link>

            <nav className="flex gap-6 items-center">
              <Link
                href="/requests"
                className="px-3 py-1.5 rounded-lg border border-site-border text-sm font-medium transition-all hover:border-palette-pink hover:bg-palette-pink/10 hover:text-palette-pink"
              >
                Requests
              </Link>
              <Link
                href="/audit"
                className="px-3 py-1.5 rounded-lg border border-site-border text-sm font-medium transition-all hover:border-palette-pink hover:bg-palette-pink/10 hover:text-palette-pink"
              >
                Audit
              </Link>
            </nav>
            <UserSwitcher apiBase={base} />
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-16" style={{ marginTop: "5px", marginBottom: "0px" }}>{children}</main>
      </body>
    </html>
  );
}
