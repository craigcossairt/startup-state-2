"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapFilterPanel } from "./map-filter-panel";
import { StartupDetailPanel } from "./startup-detail-panel";
import { UtahStartupMap } from "./utah-startup-map";
import {
  applyStartupMapFilters,
  filtersToParams,
  paramsToFilters,
} from "@/lib/catalog/map-filters";
import type { CatalogStartup } from "@/lib/catalog/types";

export function StartupMapClient({
  startups,
  mapboxToken,
}: {
  startups: CatalogStartup[];
  mapboxToken: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);
  const filtered = useMemo(() => applyStartupMapFilters(startups, filters), [startups, filters]);
  const selectedId = searchParams.get("startup");
  const selected = useMemo(
    () => startups.find((row) => row.id === selectedId) ?? null,
    [startups, selectedId],
  );
  const [mobilePanelOpen, setMobilePanelOpen] = useState(Boolean(selectedId));

  const setFilters = useCallback(
    (next: typeof filters) => {
      router.replace(`/startups?${filtersToParams(next, searchParams).toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (id) params.set("startup", id);
      else params.delete("startup");
      router.replace(`/startups?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[22rem_1fr] lg:grid-cols-[26rem_1fr]"
      style={{ height: "calc(100vh - 3.5rem)" }}
    >
      <aside
        className={
          "relative z-30 flex flex-col overflow-hidden border-r border-border bg-background " +
          "fixed inset-x-0 bottom-0 top-14 sm:static sm:inset-auto sm:top-auto sm:z-auto " +
          (mobilePanelOpen ? "" : "hidden sm:flex")
        }
      >
        {selected ? (
          <StartupDetailPanel
            startup={selected}
            onBack={() => {
              select(null);
              setMobilePanelOpen(false);
            }}
          />
        ) : (
          <MapFilterPanel
            state={filters}
            onChange={setFilters}
            total={startups.length}
            shown={filtered.length}
            startups={startups}
            filtered={filtered}
            onSelectStartup={(id) => {
              select(id);
              setMobilePanelOpen(true);
            }}
          />
        )}
      </aside>
      <div className="relative h-full">
        <UtahStartupMap
          startups={filtered}
          selectedId={selectedId}
          onSelect={select}
          mapboxToken={mapboxToken}
        />
        {mobilePanelOpen ? null : (
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="fixed bottom-4 left-4 z-30 inline-flex h-10 items-center rounded-full bg-midnight px-4 text-xs font-semibold text-white shadow-lg sm:hidden"
          >
            {selected ? `${selected.name} · Details` : `${filtered.length} startups · Filters`}
          </button>
        )}
      </div>
    </div>
  );
}
