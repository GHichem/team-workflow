import RequestCreateForm from "../../components/RequestCreateForm";
import RequestList from "../../components/RequestList";
import { getRequests } from "../../lib/api";
import type { RequestItem } from "../../lib/types";

export default async function RequestsPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

  let data: { items: RequestItem[] } | null = null;
  let error: string | null = null;

  try {
    data = await getRequests();
  } catch (e: unknown) {
    if (e instanceof Error) error = e.message;
    else error = String(e ?? "Failed to load requests");
  }

  return (
    <>
      <h1 className="text-4xl md:text-5xl mb-8 font-extrabold">Requests</h1>

      {error ? (
        <p className="text-site-muted text-lg">{error}</p>
      ) : !data ? (
        <p className="text-site-muted">Loading...</p>
      ) : (
        <>
          <div className="site-card mb-8">
            <h2 className="text-lg font-bold mb-6 block">Create a new request</h2>
            <RequestCreateForm apiBase={base} />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">All requests</h2>
            <RequestList items={data.items} />
          </div>
        </>
      )}
    </>
  );
}
