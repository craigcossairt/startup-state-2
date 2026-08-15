"use client";

import dynamic from "next/dynamic";
import { mappableStartups } from "@/lib/catalog/filter";
import { hasPublicMapboxToken } from "@/lib/catalog/mapbox";
import type { CatalogStartup } from "@/lib/catalog/types";

const UtahMapCanvas = dynamic(() => import("./utah-map-canvas"), { ssr: false });

const UTAH = { minLat: 36.9, maxLat: 42.1, minLng: -114.2, maxLng: -108.9 };

export function UtahStartupMap({
  startups,
  selectedId,
  onSelect,
}: {
  startups: CatalogStartup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const points = mappableStartups(startups);
  if (hasPublicMapboxToken()) {
    return (
      <UtahMapCanvas startups={points} selectedId={selectedId} onSelect={onSelect} />
    );
  }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-midnight">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/brand/topography-tile.webp)",
          backgroundSize: "cover",
        }}
      />
      <div className="relative min-h-[22rem] w-full sm:min-h-[28rem]">
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
                selected
                  ? "z-10 h-3.5 w-3.5 bg-bright-green"
                  : "h-2.5 w-2.5 bg-bright-green/90"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
