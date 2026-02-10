"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestItem } from "../lib/types";
import RequestCard from "./RequestCard";



export default function RequestList({ items }: { items: RequestItem[] }) {
  const [viewAs, setViewAs] = useState<{ id: string; name: string } | null>(null);

	const router = useRouter();

	useEffect(() => {
		// restore selected view-as from localStorage after mount to avoid
		// hydration mismatch between server and client
		try {
			const v = typeof window !== "undefined" ? localStorage.getItem("view_as") : null;
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (v) setViewAs(JSON.parse(v));
		} catch {}

		const handler = (e: Event) => {
			const ev = e as CustomEvent<{ id: string; name: string } | null>;
			setViewAs(ev.detail || null);
		};
		window.addEventListener("view-as-changed", handler as EventListener);
		return () => window.removeEventListener("view-as-changed", handler as EventListener);
	}, []);

	const filtered = items.filter((it) => {
		if (!viewAs) return true;
		if (viewAs.id === "ALL" || viewAs.id === "admin") return true;
		return (it.assignee_name ?? "") === viewAs.name;
	});

	if (filtered.length === 0) {
		return <p className="text-site-muted">No requests for selected user.</p>;
	}

	function goTo(id: string) {
		router.push(`/requests/${id}`);
	}

	return (
		<ul className="request-list">
			{filtered.map((r) => (
				<li
					key={r.id}
					className="request-item cursor-pointer"
					role="button"
					tabIndex={0}
					onClick={() => goTo(r.id)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") goTo(r.id);
					}}
					aria-label={`Open request ${r.title}`}
				>
					<RequestCard item={r} />
				</li>
			))}
		</ul>
	);
}

