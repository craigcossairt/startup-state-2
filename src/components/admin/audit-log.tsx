"use client";

import { useMemo, useState } from "react";
import type { AdminAuditRow } from "@/lib/admin-operations";

export function AuditLog({ audits }: { audits: AdminAuditRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return audits;
    return audits.filter((row) => {
      const actor = (row.actorEmail ?? "system").toLowerCase();
      return row.startupName.toLowerCase().includes(needle) || actor.includes(needle);
    });
  }, [query, audits]);

  if (audits.length === 0) {
    return <p className="py-2 text-sm text-foreground-muted">No edits recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by company or actor email..."
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-2 text-sm text-foreground-muted">No matches for &quot;{query}&quot;.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => (
            <li key={row.id} className="space-y-2 rounded-lg border border-border p-4 text-sm">
              <div className="flex items-center justify-between gap-3 text-xs text-foreground-muted">
                <span className="font-mono">
                  #{row.id} · {row.startupName}
                </span>
                <span>
                  {new Date(row.createdAt).toLocaleString()}
                  {row.actorEmail ? ` · ${row.actorEmail}` : " · system"}
                </span>
              </div>
              <Diff before={row.before} after={row.after} />
            </li>
          ))}
        </ul>
      )}
      <p className="pt-1 text-[11px] text-foreground-muted">
        Showing {filtered.length} of {audits.length} entries.
      </p>
    </div>
  );
}

function Diff({
  before,
  after,
}: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  if (!before && after) {
    return (
      <p className="text-xs text-primary">
        Created{after.name ? ` "${String(after.name)}"` : ""}.
      </p>
    );
  }
  if (before && !after) return <p className="text-xs text-red-600">Deleted.</p>;
  if (!before || !after) return null;
  const changed = Object.keys(after).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]) && key !== "updated_at",
  );
  if (changed.length === 0) {
    return <p className="text-xs text-foreground-muted">No field-level changes.</p>;
  }
  return (
    <ul className="space-y-1 text-xs">
      {changed.map((key) => (
        <li key={key} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-foreground-muted">{key}:</span>
          <span className="break-all font-mono text-red-700/80 line-through">{fmt(before[key])}</span>
          <span className="text-foreground-muted">→</span>
          <span className="break-all font-mono text-primary">{fmt(after[key])}</span>
        </li>
      ))}
    </ul>
  );
}

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "(null)";
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 77)}...` : value;
  return JSON.stringify(value);
}
