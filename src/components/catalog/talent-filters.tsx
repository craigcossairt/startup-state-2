"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SaveSearchButton } from "@/components/catalog/save-search-button";
import {
  ALL_REGIONS,
  ALL_SECTORS,
  SECTOR_COLORS,
  SECTOR_LABEL,
} from "@/lib/catalog/map-filters";

export function TalentFilters({
  activeSectors,
  activeRegions,
  shown,
  total,
}: {
  activeSectors: string[];
  activeRegions: string[];
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const toggle = (key: "sector" | "region", value: string) => {
    const next = new URLSearchParams(params);
    const all = next.getAll(key);
    next.delete(key);
    if (all.includes(value)) {
      for (const item of all) if (item !== value) next.append(key, item);
    } else {
      for (const item of all) next.append(key, item);
      next.append(key, value);
    }
    router.replace(`/careers?${next.toString()}`, { scroll: false });
  };
  const activeCount = activeSectors.length + activeRegions.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-foreground-muted">
        <span>Filter</span>
        <SaveSearchButton
          scope="talent"
          defaultLabel={describeTalentFilter(activeSectors, activeRegions)}
          filter={{ sectors: activeSectors, regions: activeRegions }}
        />
        <span className="ml-auto tabular-nums">
          <span className="font-semibold text-foreground">{shown}</span> of {total} companies
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_SECTORS.map((sector) => {
          const active = activeSectors.includes(sector);
          return (
            <button
              key={sector}
              type="button"
              onClick={() => toggle("sector", sector)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: SECTOR_COLORS[sector] }} />
              {SECTOR_LABEL[sector]}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_REGIONS.map((region) => {
          const active = activeRegions.includes(region);
          return (
            <button
              key={region}
              type="button"
              onClick={() => toggle("region", region)}
              className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {region}
            </button>
          );
        })}
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => router.replace("/careers", { scroll: false })}
            className="inline-flex h-7 items-center rounded-full px-3 text-xs text-foreground-muted hover:text-foreground"
          >
            Clear ({activeCount})
          </button>
        ) : null}
      </div>
    </div>
  );
}

function describeTalentFilter(sectors: string[], regions: string[]): string {
  const bits: string[] = [];
  if (sectors.length) bits.push(sectors.join(", "));
  if (regions.length) bits.push(regions.join(", "));
  return bits.length ? `Hiring: ${bits.join(" · ")}` : "Hiring: any Utah company";
}
