"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getUsers } from "../../lib/api";
import React from "react";

export default function FilterControls() {
  const router = useRouter();
  const sp = useSearchParams();

  const [actor, setActor] = useState<string | null>(sp.get("actor_id"));
  const [action, setAction] = useState<string | null>(sp.get("action"));
  const [q, setQ] = useState<string | null>(sp.get("q"));
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ actor?: string; actorName?: string; action?: string; q?: string }>({});
  const fetchTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  

  // fetch full users list for the select-style actor control
  useEffect(() => {
    let mounted = true;
    getUsers()
      .then((res) => {
        if (mounted) setSuggestions(res.items ?? []);
      })
      .catch(() => {
        if (mounted) setSuggestions([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // when suggestions load, if an actor id is present in the applied filters
  // try to set a readable actor name so the chip shows a friendly label
  useEffect(() => {
    if (!appliedFilters.actor) return;
    if (appliedFilters.actorName) return;
    const found = suggestions.find((s) => s.id === appliedFilters.actor);
    if (found) {
      setAppliedFilters((prev) => ({ ...prev, actorName: found.name }));
    }
  }, [suggestions, appliedFilters.actor, appliedFilters.actorName]);

  function apply() {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (actor) params.set("actor_id", actor);
    if (q) params.set("q", q);
    params.set("page", "1");
    const url = `/audit?${params.toString()}`;

    // store applied filters for the chip UI
    setAppliedFilters((prev) => ({
      ...prev,
      action: action ?? undefined,
      q: q ?? undefined,
      actor: actor ?? undefined,
      // try to find name for actor in suggestions
      actorName: suggestions.find((s) => s.id === actor)?.name ?? prev.actorName,
    }));

    // after applying, clear the actor text input (but keep the filter applied)
    setActor("");
    // reset the action select back to "All actions" while keeping the appliedFilters state
    setAction(null);
    // keep suggestions so the user can select another actor immediately

    router.push(url);
    router.refresh();
  }

  function clearAll() {
    setActor("");
    setAction("");
    setQ("");
    setAppliedFilters({});
    // re-populate users suggestions so the actor select has options again
    getUsers()
      .then((res) => setSuggestions(res.items ?? []))
      .catch(() => setSuggestions([]));

    router.push(`/audit?page=1`);
    router.refresh();
  }

  // initialise appliedFilters from current searchParams
  useEffect(() => {
    setAppliedFilters({
      action: sp.get("action") ?? undefined,
      q: sp.get("q") ?? undefined,
      actor: sp.get("actor_id") ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function removeFilter(key: "actor" | "action" | "q") {
    const next = { ...appliedFilters } as Record<string, string | undefined>;
    delete next[key];
    setAppliedFilters(next as { actor?: string; actorName?: string; action?: string; q?: string });

    // if removing actor filter, also reset the local actor input so user can pick another
    if (key === "actor") {
      setActor("");
      // re-populate suggestions so the actor select shows options again
      getUsers()
        .then((res) => setSuggestions(res.items ?? []))
        .catch(() => setSuggestions([]));
    }

    const params = new URLSearchParams();
    if (next.action) params.set("action", next.action);
    if (next.actor) params.set("actor_id", next.actor);
    if (next.q) params.set("q", next.q);
    params.set("page", "1");
    const url = `/audit?${params.toString()}`;
    router.push(url);
    router.refresh();
  }

  useEffect(() => {
    // when typing in the main actor value, fetch suggestions (debounced)
    if (!actor || actor.length < 1) {
      // keep existing suggestions (full list) when input is empty
      return;
    }

    // if the current actor value matches an existing suggestion id,
    // don't refetch (that would search by id and typically return only that user)
    if (suggestions.some((s) => s.id === actor)) {
      return;
    }

    if (fetchTimer.current) window.clearTimeout(fetchTimer.current);
    fetchTimer.current = window.setTimeout(async () => {
      try {
        const res = await getUsers(actor);
        setSuggestions(res.items ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => {
      if (fetchTimer.current) window.clearTimeout(fetchTimer.current);
    };
  }, [actor, suggestions]);

  // close suggestions when clicking outside the control
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        // no-op: dropdown suggestions not used in current UI
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // suggestion selection and dropdown helpers removed (not used)

  return (
    <div ref={containerRef} className="flex flex-col gap-3 mb-3 w-full">
      {/* Top row: filters inline */}
      <div className="flex items-center gap-3">
        <select value={action ?? ""} onChange={(e) => setAction(e.target.value || null)} className="px-2 py-1 rounded border border-site-border bg-transparent w-40">
          <option value="">All actions</option>
          <option value="CREATE">CREATE</option>
          <option value="COMMENT_CREATE">COMMENT_CREATE</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          <option value="ASSIGN_CHANGE">ASSIGN_CHANGE</option>
        </select>

        <select
          value={actor ?? ""}
          onChange={(e) => setActor(e.target.value || null)}
          className="px-2 py-1 rounded border border-site-border bg-transparent w-48"
        >
          <option value="">Actor</option>
          {suggestions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input placeholder="Search audit (text, title, comment)" value={q ?? ""} onChange={(e) => setQ(e.target.value || null)} className="px-2 py-1 rounded border border-site-border bg-transparent flex-1 max-w-lg" />
      </div>

      {/* Buttons row */}
      <div className="flex items-center gap-2">
        <button onClick={apply} className="btn-outline px-3 py-1">Apply</button>
        <button onClick={clearAll} className="btn-outline px-3 py-1">Clear</button>
      </div>

      {/* Applied filters chips (below buttons) */}
      <div className="flex items-center gap-2">
        {appliedFilters.action && (
          <div className="flex items-center gap-2 bg-site-card/70 border border-site-border text-sm px-2 py-1 rounded">
            <span className="font-semibold">Action:</span>
            <span className="font-mono">{appliedFilters.action}</span>
            <button title="Remove action filter" aria-label="Remove action filter" onClick={() => removeFilter("action")} className="ml-2 text-site-muted rounded-full w-6 h-6 flex items-center justify-center hover:bg-site-border/30">×</button>
          </div>
        )}
        {appliedFilters.actor && (
          <div className="flex items-center gap-2 bg-site-card/70 border border-site-border text-sm px-2 py-1 rounded">
            <span className="font-semibold">Actor:</span>
            <div className="text-sm">
              <div className="truncate max-w-xs">{appliedFilters.actorName ?? appliedFilters.actor}</div>
              <div className="text-site-muted font-mono text-xs">{appliedFilters.actor}</div>
            </div>
            <button title="Remove actor filter" aria-label="Remove actor filter" onClick={() => removeFilter("actor")} className="ml-2 text-site-muted rounded-full w-6 h-6 flex items-center justify-center hover:bg-site-border/30">×</button>
          </div>
        )}
        {appliedFilters.q && (
          <div className="flex items-center gap-2 bg-site-card/70 border border-site-border text-sm px-2 py-1 rounded">
            <span className="font-semibold">Search:</span>
            <span className="">{appliedFilters.q}</span>
            <button title="Remove search filter" aria-label="Remove search filter" onClick={() => removeFilter("q")} className="ml-2 text-site-muted rounded-full w-6 h-6 flex items-center justify-center hover:bg-site-border/30">×</button>
          </div>
        )}
      </div>
    </div>
  );
}
