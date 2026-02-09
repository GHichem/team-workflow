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
    <div className="flex flex-row items-center gap-3">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={`btn-outline ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        ← Previous
      </button>

      <span className="text-sm font-medium text-site-muted px-3 py-1.5">Page {page}</span>

      <button
        onClick={() => go(page + 1)}
        disabled={!hasNext}
        className={`btn-outline ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Next →
      </button>
    </div>
  );
}
