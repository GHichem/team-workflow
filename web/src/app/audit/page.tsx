import Link from "next/link";
import { getAudit } from "../lib/api";
import type { AuditItem } from "../lib/types";

function getStatusFromJson(json?: Record<string, unknown> | null) {
  if (!json) return "?";
  const s = json["status"];
  return typeof s === "string" ? s : String(s ?? "?");
}

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function AuditPage({ searchParams }: Props) {
  const perPage = 10;
  const pageRaw = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page;
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const offset = (page - 1) * perPage;

  let data: { items: AuditItem[] } | null = null;
  let error: string | null = null;

  try {
    // fetch one extra to detect `next` page
    data = await getAudit(perPage + 1, offset);
  } catch (e: unknown) {
    if (e instanceof Error) error = e.message;
    else error = String(e ?? "Failed to load audit logs");
  }

  const items = data?.items ?? [];
  const hasNext = items.length > perPage;
  const pageItems = hasNext ? items.slice(0, perPage) : items;

  return (
    <section className="bg-site-card border border-site-border rounded-2xl p-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      {error ? (
        <p className="text-site-muted mt-2">{error}</p>
      ) : pageItems.length === 0 ? (
        <p className="text-site-muted mt-2">No audit entries yet. Next: we will write audit entries when creating or updating requests.</p>
      ) : (
        <>
          <div className="overflow-x-auto mt-3">
            <table className="audit-table w-full">
              <thead>
                <tr className="text-left text-site-muted">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Request</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Actor</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((x) => {
                  const requestName = x.entity_label ?? x.entity_id ?? "-";
                  const change =
                    x.action === "STATUS_CHANGE"
                      ? `${getStatusFromJson(x.before_json)} → ${getStatusFromJson(x.after_json)}`
                      : x.action === "CREATE"
                      ? "Created"
                      : "-";

                  return (
                    <tr key={x.id} className="even:bg-site-card/40 hover:shadow-sm">
                      <td className="py-3 px-4 align-top">{new Date(x.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 align-top font-semibold">{x.action}</td>
                      <td className="py-3 px-4 align-top">{x.entity_type}</td>
                      <td className="py-3 px-4 align-top">{requestName}</td>
                      <td className="py-3 px-4 align-top">{change}</td>
                      <td className="py-3 px-4 align-top font-mono text-site-muted">{x.actor_id ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {page > 1 ? (
              <Link href={`/audit?page=${page - 1}`} className="btn-outline no-underline">← Previous</Link>
            ) : (
              <button className="btn-outline opacity-50 cursor-default" disabled>← Previous</button>
            )}

            <div className="text-site-muted">Page {page}</div>

            {hasNext ? (
              <Link href={`/audit?page=${page + 1}`} className="btn-outline no-underline">Next →</Link>
            ) : (
              <button className="btn-outline opacity-50 cursor-default" disabled>Next →</button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
