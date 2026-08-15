"use client";

import { useState } from "react";
import type { AdminPendingStartup } from "@/lib/admin-operations";

export function PendingSubmissions({ pending }: { pending: AdminPendingStartup[] }) {
  const [note, setNote] = useState<string | null>(null);

  if (pending.length === 0) {
    return <p className="py-2 text-sm text-foreground-muted">No submissions awaiting review.</p>;
  }

  return (
    <div className="space-y-3">
      {pending.map((row) => (
        <article
          key={row.id}
          className="grid grid-cols-1 items-start gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_auto]"
        >
          <div className="min-w-0">
            <div className="mb-1 flex items-baseline gap-2">
              <h3 className="truncate font-display text-base font-bold">{row.name}</h3>
              {row.website ? (
                <a
                  href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  {row.website.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                </a>
              ) : null}
            </div>
            <p className="text-xs text-foreground-muted">
              {row.sector} · {row.stage ?? "—"} · {row.city ?? "—"}
              {row.region ? `, ${row.region}` : ""} ·{" "}
              <span className="opacity-70">{new Date(row.createdAt).toLocaleString()}</span>
            </p>
            {row.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-snug text-foreground-muted">
                {row.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-stretch gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => setNote("Approve is not wired on this demo.")}
              className="inline-flex items-center justify-center gap-1 rounded-md bg-vibrant-green px-3 py-1.5 text-sm font-semibold text-white"
            >
              <span aria-hidden>✓</span>
              Approve
            </button>
            <button
              type="button"
              onClick={() => setNote("Reject is not wired on this demo.")}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              <span aria-hidden className="text-red-600">
                ×
              </span>
              Reject
            </button>
          </div>
        </article>
      ))}
      {note ? <p className="text-xs text-foreground-muted">{note}</p> : null}
    </div>
  );
}
