"use client";

import dynamic from "next/dynamic";
import { mappableStartups } from "@/lib/catalog/filter";
import { MAPBOX_MISSING_COPY } from "@/lib/catalog/mapbox";
import type { CatalogStartup } from "@/lib/catalog/types";

const UtahMap = dynamic(() => import("./utah-map"), { ssr: false });

const UTAH = { minLat: 36.9, maxLat: 42.1, minLng: -114.2, maxLng: -108.9 };

export function UtahStartupMap({
  startups,
  selectedId,
  onSelect,
  mapboxToken,
}: {
  startups: CatalogStartup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  mapboxToken: string | null;
}) {
  const points = mappableStartups(startups);
  if (mapboxToken) {
    return (
      <div className="h-full min-h-[22rem] w-full">
        <UtahMap token={mapboxToken} startups={points} selectedId={selectedId} onSelect={onSelect} />
      </div>
    );
  }
  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden bg-midnight sm:min-h-[28rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/brand/topography-tile.webp)",
          backgroundSize: "cover",
        }}
      />
      <p className="absolute left-4 top-4 z-10 max-w-sm rounded-md bg-midnight/80 px-3 py-2 text-xs text-white/80">
        {MAPBOX_MISSING_COPY}
      </p>
      <div className="relative h-full min-h-[22rem] w-full sm:min-h-[28rem]">
        {points.map((row) => {
          const left = ((row.lng! - UTAH.minLng) / (UTAH.maxLng - UTAH.minLng)) * 100;
          const top = ((UTAH.maxLat - row.lat!) / (UTAH.maxLat - UTAH.minLat)) * 100;
          const selected = selectedId === row.id;
          return (
            <button
              key={row.id}
              type="button"
              title={row.name}
              aria-label={row.name}
              onClick={() => onSelect(row.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_rgba(10,25,46,0.6)] ${
                selected ? "z-10 h-3.5 w-3.5 bg-bright-green" : "h-2.5 w-2.5 bg-bright-green/90"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
