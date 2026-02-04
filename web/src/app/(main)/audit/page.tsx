import { getAudit, getUsers } from "../../lib/api";
import PaginationControls from "./PaginationControls";
import FilterControls from "./FilterControls";
import type { AuditItem } from "../../lib/types";

function getStatusFromJson(json?: Record<string, unknown> | null) {
  if (!json) return "?";
  const s = json["status"];
  return typeof s === "string" ? s : String(s ?? "?");
}

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function AuditPage({ searchParams }: Props) {
  // `searchParams` may be a Promise when navigated client-side; await it
  const sp = (await (searchParams as unknown)) as Props["searchParams"] | undefined;
  const perPage = 10;
  const pageRaw = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const offset = (page - 1) * perPage;

  let data: { items: AuditItem[]; _usersMap?: Map<string, string> } | null = null;
  let error: string | null = null;

  try {
    // fetch one extra to detect `next` page
    const filters: { action?: string; actor_id?: string; q?: string } = {};
    if (sp?.action) filters.action = Array.isArray(sp.action) ? sp.action[0] : sp.action;
    if (sp?.actor_id) filters.actor_id = Array.isArray(sp.actor_id) ? sp.actor_id[0] : sp.actor_id;
    if (sp?.q) filters.q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

    // fetch audit entries and user list in parallel so we can display friendly names
    const [auditRes, usersRes] = await Promise.all([getAudit(perPage + 1, offset, filters), getUsers()]);
    data = auditRes;
    const usersMap = new Map<string, string>((usersRes.items ?? []).map((u) => [u.id, u.name]));
    // for any actor ids in the fetched audit items that aren't present in the
    // initial users list, try a targeted lookup so we can show the correct name
    const itemsNow = auditRes.items ?? [];
    const missing = Array.from(new Set(itemsNow.map((it) => it.actor_id).filter(Boolean as unknown as (v: unknown) => v is string))).filter((id) => !usersMap.has(id as string));
    if (missing.length > 0) {
      try {
        const lookups = await Promise.all(missing.map((id) => getUsers(id)));
        lookups.forEach((res) => {
          (res.items ?? []).forEach((u) => usersMap.set(u.id, u.name));
        });
      } catch {
        // ignore lookup failures, we'll fall back to id
      }
    }
    // ensure the special demo admin id is shown as "Admin" in the UI
    usersMap.set("u_demo", "Admin");
    // attach usersMap to data for use when rendering
    data = { ...(data ?? { items: auditRes.items ?? [] }), _usersMap: usersMap };
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
            <FilterControls />
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
                      <td className="py-3 px-4 align-top font-mono text-site-muted">{(data?._usersMap?.get(x.actor_id ?? "") ?? (x.actor_id === "u_demo" ? "Admin" : undefined) ?? x.actor_id) ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationControls page={page} hasNext={hasNext} />
        </>
      )}
    </section>
  );
}
