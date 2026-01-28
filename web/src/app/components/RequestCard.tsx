"use client";

import Link from "next/link";
import type { RequestItem } from "../lib/types";

export default function RequestCard({ item }: { item: RequestItem }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<div className="content">
				<div className="font-bold text-lg">
					<Link href={`/requests/${item.id}`} className="no-underline text-inherit">{item.title}</Link>
				</div>
				{item.description && <div className="mt-2 text-site-muted">{item.description}</div>}
				<div className="mt-3 text-site-muted">Assignee: <span className="text-site-text font-semibold">{item.assignee_name ?? '-'}</span></div>
			</div>

			<div className="aside">
				<div className="meta">Status: <b>{item.status}</b></div>
				<div className="meta">Priority: <b>{item.priority}</b></div>
				<div className="meta text-sm">Created: {new Date(item.created_at).toLocaleString()}</div>
			</div>
		</div>
	);
}

