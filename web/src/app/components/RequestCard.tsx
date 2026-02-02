"use client";

import React from "react";
import Link from "next/link";
import type { RequestItem } from "../lib/types";

export default function RequestCard({ item }: { item: RequestItem }) {
	const [dateStr, setDateStr] = React.useState<string>(item.created_at);

	React.useEffect(() => {
		try {
			setDateStr(new Date(item.created_at).toLocaleString());
		} catch {
			setDateStr(item.created_at);
		}
	}, [item.created_at]);

	return (
		<div className="flex items-start justify-between gap-4">
			<div className="content">
				<div className="font-bold text-lg">{item.title}</div>
				{item.description && <div className="mt-2 text-site-muted">{item.description}</div>}
				<div className="mt-3 text-site-muted">Assignee: <span className="text-site-text font-semibold">{item.assignee_name ?? '-'}</span></div>
			</div>

			<div className="aside">
				<div className="meta">Status: <b>{item.status}</b></div>
				<div className="meta">Priority: <b>{item.priority}</b></div>
				<div className="meta text-sm">Created: {dateStr}</div>
			</div>
		</div>
	);
}

