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
      <body className="min-h-screen bg-site-bg text-site-text" style={{ fontFamily: 'system-ui' }}>
        <header className="sticky top-0 z-20 bg-site-card/80 backdrop-blur-sm border-b border-site-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-extrabold no-underline">
              <span className="text-palette-pink">●</span>
              <span>Team Workflow</span>
            </Link>

            <nav className="flex gap-2">
              <Link
                href="/requests"
                className="px-3 py-1 rounded-xl border border-site-border hover:bg-site-card/50"
              >
                Requests
              </Link>
              <Link
                href="/audit"
                className="px-3 py-1 rounded-xl border border-site-border hover:bg-site-card/50"
              >
                Audit Log
              </Link>
            </nav>
            <UserSwitcher apiBase={base} />
          </div>
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-palette-pink border border-site-border" />
              <div className="w-8 h-8 rounded-full bg-palette-sand border border-site-border" />
              <div className="w-8 h-8 rounded-full bg-palette-cream border border-site-border" />
              <div className="w-8 h-8 rounded-full bg-palette-green border border-site-border" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
