"use client";

import { useMemo, useState } from "react";
import {
  filterStartups,
  startupRegions,
  startupSectors,
  withWebsiteProtocol,
} from "@/lib/catalog/filter";
import { hasPublicMapboxToken, MAPBOX_MISSING_COPY } from "@/lib/catalog/mapbox";
import type { CatalogStartup } from "@/lib/catalog/types";
import { UtahStartupMap } from "./utah-startup-map";

export function StartupDirectory({
  startups,
  mapboxEnabled,
}: {
  startups: CatalogStartup[];
  mapboxEnabled: boolean;
}) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [region, setRegion] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sectors = useMemo(() => startupSectors(startups), [startups]);
  const regions = useMemo(() => startupRegions(startups), [startups]);
  const shown = useMemo(
    () => filterStartups(startups, { q, sector, region }),
    [startups, q, sector, region],
  );

  return (
    <section className="mx-auto max-w-[1200px] space-y-6 px-6 py-12">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="block text-sm font-semibold md:col-span-2">
          Search companies
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border px-3 text-sm font-normal"
            placeholder="Name, city, or sector"
          />
        </label>
        <label className="block text-sm font-semibold">
          Sector
          <select
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border px-3 text-sm font-normal"
          >
            <option value="">All</option>
            {sectors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Region
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border px-3 text-sm font-normal"
          >
            <option value="">All</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-sm text-foreground-muted">
        Showing {shown.length} of {startups.length} Utah companies
      </p>
      {mapboxEnabled && hasPublicMapboxToken() ? (
        <UtahStartupMap startups={shown} selectedId={selectedId} onSelect={setSelectedId} />
      ) : (
        <p className="rounded-xl border border-border bg-background-alt px-4 py-3 text-sm">
          {MAPBOX_MISSING_COPY}
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {shown.map((row) => (
          <li key={row.id}>
            <article
              className={`h-full rounded-xl border p-5 ${
                selectedId === row.id ? "border-primary" : "border-border"
              }`}
            >
              <button
                type="button"
                className="text-left"
                onClick={() => setSelectedId(row.id)}
              >
                <h2 className="font-display text-lg font-extrabold tracking-tight">{row.name}</h2>
                <p className="mt-1 text-xs text-foreground-muted">
                  {[row.city, row.region, row.sector].filter(Boolean).join(" · ")}
                </p>
              </button>
              {row.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-foreground-muted">{row.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                {row.website ? (
                  <a
                    href={withWebsiteProtocol(row.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                ) : null}
                {row.linkedinUrl ? (
                  <a
                    href={row.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
