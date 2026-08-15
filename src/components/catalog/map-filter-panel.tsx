"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CompanyLogo } from "./company-logo";
import { SaveSearchButton } from "./save-search-button";
import {
  ALL_REGIONS,
  ALL_REVENUES,
  ALL_SECTORS,
  ALL_STAGES,
  emptyStartupMapFilters,
  SECTOR_COLORS,
  SECTOR_LABEL,
  STAGE_LABEL,
  sectorColor,
  type StartupMapFilters,
} from "@/lib/catalog/map-filters";
import type { CatalogStartup } from "@/lib/catalog/types";

export function MapFilterPanel({
  state,
  onChange,
  total,
  shown,
  startups,
  filtered,
  onSelectStartup,
}: {
  state: StartupMapFilters;
  onChange: (next: StartupMapFilters) => void;
  total: number;
  shown: number;
  startups: CatalogStartup[];
  filtered: CatalogStartup[];
  onSelectStartup: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const activeCount =
    state.sectors.size +
    state.stages.size +
    state.regions.size +
    state.revenues.size +
    (state.hiringOnly ? 1 : 0);

  const searchMatches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return null;
    return startups
      .filter((row) =>
        [row.name, row.description, row.city, row.sector]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle)),
      )
      .slice(0, 50);
  }, [query, startups]);

  const visible = searchMatches ?? filtered;
  const update = (next: Partial<StartupMapFilters>) => onChange({ ...state, ...next });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-5 pb-3 pt-5">
        <div className="relative mb-3">
          <input
            type="search"
            value={query}
            placeholder="Search company name, sector, or city"
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>
            <span className="tabular-nums font-extrabold text-foreground">{visible.length}</span> of{" "}
            {total} startups
          </span>
          {searchMatches ? <span className="font-semibold text-primary">searching</span> : null}
          <Link
            href="/startups/add"
            className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            + Add
          </Link>
        </div>
      </header>

      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex w-full items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted hover:text-foreground"
          aria-expanded={filtersOpen}
        >
          Filter
          {activeCount > 0 ? (
            <span className="text-[11px] font-semibold normal-case text-primary">{activeCount} active</span>
          ) : null}
        </button>
        {filtersOpen ? (
          <div className="space-y-2.5 px-5 pb-3">
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={() => onChange(emptyStartupMapFilters())}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Clear all filters
              </button>
            ) : null}
            <FilterRow label="Sector">
              {ALL_SECTORS.map((sector) => (
                <Chip
                  key={sector}
                  active={state.sectors.has(sector)}
                  onClick={() => update({ sectors: toggle(state.sectors, sector) })}
                  dot={SECTOR_COLORS[sector]}
                >
                  {SECTOR_LABEL[sector]}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Stage">
              {ALL_STAGES.map((stage) => (
                <Chip
                  key={stage}
                  active={state.stages.has(stage)}
                  onClick={() => update({ stages: toggle(state.stages, stage) })}
                >
                  {STAGE_LABEL[stage]}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Region">
              {ALL_REGIONS.map((region) => (
                <Chip
                  key={region}
                  active={state.regions.has(region)}
                  onClick={() => update({ regions: toggle(state.regions, region) })}
                >
                  {region}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Revenue">
              {ALL_REVENUES.map((revenue) => (
                <Chip
                  key={revenue}
                  active={state.revenues.has(revenue)}
                  onClick={() => update({ revenues: toggle(state.revenues, revenue) })}
                >
                  {revenue}
                </Chip>
              ))}
            </FilterRow>
            <button
              type="button"
              onClick={() => update({ hiringOnly: !state.hiringOnly })}
              className={`inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-semibold ${
                state.hiringOnly
                  ? "border-primary bg-primary text-white"
                  : "border-border text-foreground-muted hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Currently hiring only
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-b border-border px-5 py-3">
        <SaveSearchButton
          scope="map"
          defaultLabel={describeMapFilter(state)}
          filter={{
            sectors: [...state.sectors],
            stages: [...state.stages],
            regions: [...state.regions],
            revenues: [...state.revenues],
            hiringOnly: state.hiringOnly,
          }}
          triggerClassName="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-accent-soft/30 text-xs font-semibold hover:bg-accent-soft/60"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-foreground-muted">No startups match.</p>
        ) : (
          <ul className="space-y-1">
            {visible.slice(0, 50).map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelectStartup(row.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left hover:bg-background-alt"
                >
                  <CompanyLogo
                    website={row.website}
                    name={row.name}
                    color={sectorColor(row.sector)}
                    className="h-7 w-7"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{row.name}</p>
                    <p className="truncate text-[11px] text-foreground-muted">
                      {sectorLabelSafe(row.sector)} · {row.city ?? "Utah"}
                    </p>
                  </div>
                  {row.isHiring ? (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Hiring
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {visible.length > 50 ? (
              <li className="px-3 py-2 text-center text-[11px] text-foreground-muted">
                Showing first 50 of {visible.length}. Use filters or search to narrow.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}

function sectorLabelSafe(sector: string): string {
  return SECTOR_LABEL[sector as keyof typeof SECTOR_LABEL] ?? sector;
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      {dot ? <span className="h-2 w-2 rounded-full" style={{ background: dot }} /> : null}
      {children}
    </button>
  );
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function describeMapFilter(state: {
  sectors: Set<string>;
  stages: Set<string>;
  regions: Set<string>;
  revenues: Set<string>;
  hiringOnly: boolean;
}): string {
  const bits: string[] = [];
  if (state.sectors.size) bits.push([...state.sectors].join(", "));
  if (state.stages.size) bits.push(`${[...state.stages].join("/")} stage`);
  if (state.regions.size) bits.push([...state.regions].join(", "));
  if (state.revenues.size) bits.push(`revenue ${[...state.revenues].join(", ")}`);
  if (state.hiringOnly) bits.push("hiring");
  return bits.length ? `Map: ${bits.join(" · ")}` : "Map: all Utah startups";
}
