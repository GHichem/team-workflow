import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-site-card border border-site-border rounded-2xl p-6 md:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl m-0 font-extrabold leading-tight">Team Workflow</h1>
            <p className="mt-3 text-site-muted leading-7 text-lg md:text-base">
              A compact internal app for tracking requests, collaborating with teammates, and auditing changes. Built to illustrate
              practical full‑stack patterns: REST API, database-backed audit logs, and simple role-based flows.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-site-border bg-transparent">
                <div className="font-semibold">📝 Requests</div>
                <div className="text-site-muted text-sm">Create, assign and update requests with priorities.</div>
              </div>
              <div className="p-3 rounded-lg border border-site-border bg-transparent">
                <div className="font-semibold">🔁 Status</div>
                <div className="text-site-muted text-sm">Move requests through review and approval stages.</div>
              </div>
              <div className="p-3 rounded-lg border border-site-border bg-transparent">
                <div className="font-semibold">📜 Audit</div>
                <div className="text-site-muted text-sm">See who changed what and when — full audit trail.</div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link href="/requests" className="btn-primary no-underline inline-flex items-center">Get started</Link>
              <Link href="/audit" className="btn-outline no-underline inline-flex items-center">Open audit log</Link>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">How it works</h2>
            <ol className="list-decimal list-inside text-site-muted space-y-2">
              <li>Create a request and add details.</li>
              <li>Assign or change status; every change is recorded.</li>
              <li>Review the audit log to see activity and authors.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Quick tips</h2>
            <ul className="text-site-muted space-y-2">
              <li><strong>View as:</strong> use the user switcher in the header to act as a user or admin.</li>
              <li><strong>Create:</strong> Admins can create requests and assign others.</li>
              <li><strong>Comments:</strong> Click a request tile to open it and post comments.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
