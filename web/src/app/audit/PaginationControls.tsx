"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PaginationControls({ page, hasNext }: { page: number; hasNext: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();

  function go(p: number) {
    // preserve current query params (filters) but set the `page` param
    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("page", String(p));
    const url = `/audit?${params.toString()}`;
    // push new URL and refresh server data
    router.push(url);
    router.refresh();
  }

  return (
    <div className="mt-4 flex items-center gap-3 flex-wrap sm:flex-nowrap justify-center">
      {page > 1 ? (
        <button onClick={() => go(page - 1)} className="btn-outline">← Previous</button>
      ) : (
        <button className="btn-outline opacity-50 cursor-default" disabled>← Previous</button>
      )}

      <div className="text-site-muted">Page {page}</div>

      {hasNext ? (
        <button onClick={() => go(page + 1)} className="btn-outline">Next →</button>
      ) : (
        <button className="btn-outline opacity-50 cursor-default" disabled>Next →</button>
      )}
    </div>
  );
}
