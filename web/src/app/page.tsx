import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-site-card border border-site-border rounded-2xl p-6 md:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl m-0 font-extrabold leading-tight">Team Workflow</h1>
            <p className="mt-3 text-site-muted leading-7 text-lg md:text-base">
              A small internal tool that demonstrates real-world fullstack work: Requests + Audit Log, backed by a REST API and PostgreSQL.
            </p>

            <ul className="mt-4 text-site-muted list-disc pl-6 space-y-2">
              <li>Create and track requests</li>
              <li>Update status and priority</li>
              <li>See an audit trail of changes</li>
            </ul>

            <div className="flex gap-3 mt-6">
              <Link href="/requests" className="btn-primary no-underline inline-flex items-center">View Requests</Link>
              <Link href="/audit" className="btn-outline no-underline inline-flex items-center">View Audit Log</Link>
            </div>
          </div>

          {/* decorative swatches removed per user request */}
        </div>
      </div>
    </section>
  );
}
