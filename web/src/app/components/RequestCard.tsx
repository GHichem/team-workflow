"use client";

import React from "react";
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

	// status color mapping removed because it's not currently used

	return (
		<div className="w-full">
			<div className="content">
				<div className="font-bold text-lg text-site-text mb-1">{item.title}</div>

				{item.description && <div className="text-sm text-site-muted mb-2">{item.description}</div>}

				<div className="meta">
					Assignee: <b>{item.assignee_name ?? '-'}</b>
					<br />
					Status: <b className="uppercase">{item.status}</b>
					<br />
					Priority: <b>{item.priority}</b>
				</div>

				<div className="text-site-muted text-sm mt-2">Created: {dateStr}</div>
			</div>
		</div>
	);
}

