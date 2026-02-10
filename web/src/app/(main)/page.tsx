import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <div className="mb-20" style={{marginBottom: "10px"}}>
        <h1 className="text-5xl font-bold mb-8">Team Workflow</h1>
        <p className="text-base text-site-muted mb-12 max-w-2xl leading-relaxed">
          A simple app for managing requests, tracking status changes, and viewing the audit log.
        </p>
        <div className="flex gap-4">
          <Link href="/requests" className="btn-primary mr-4">Get started</Link>
          <Link href="/audit" className="btn-outline">View audit log</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="site-card">
          <h3 className="card-title">Requests</h3>
          <p className="text-sm muted">Create and manage requests with priorities and assignments.</p>
        </div>

        <div className="site-card">
          <h3 className="card-title">Status</h3>
          <p className="text-sm muted">Track request status changes through different stages.</p>
        </div>

        <div className="site-card">
          <h3 className="card-title">Audit</h3>
          <p className="text-sm muted">View complete record of who changed what and when.</p>
        </div>
      </div>
    </div>
  );
}
