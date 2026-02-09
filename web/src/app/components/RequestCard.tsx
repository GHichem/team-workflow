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

	const statusColors: Record<string, string> = {
		"DRAFT": "bg-palette-sand/20 text-palette-sand border-palette-sand/30",
		"REVIEW": "bg-palette-pink/20 text-palette-pink border-palette-pink/30",
		"APPROVED": "bg-palette-green/20 text-palette-green border-palette-green/30",
	};

	return (
		<div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-6 w-full">
			<div className="flex-1 mb-3 md:mb-0">
				<h3 className="text-lg font-bold text-site-text mb-1">{item.title}</h3>
				{item.description && <p className="text-sm text-site-muted">{item.description}</p>}
				<p className="text-sm text-site-muted mt-2">
					Assigned to <span className="font-semibold text-site-text">{item.assignee_name ?? '-'}</span>
				</p>
			</div>

			<div className="flex items-center gap-3 flex-wrap">
				<div className={`px-3 py-1 rounded-full border text-sm font-semibold ${statusColors[item.status as keyof typeof statusColors] || 'bg-site-border/20 text-site-muted border-site-border'}`}>
					{item.status}
				</div>
				<span className="text-sm text-site-muted px-2 py-1">
					<span className="font-semibold text-site-text">{item.priority}</span>
				</span>
				<span className="text-xs text-site-muted whitespace-nowrap">{dateStr}</span>
			</div>
		</div>
	);
}

