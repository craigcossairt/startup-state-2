"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { CatalogStartup } from "@/lib/catalog/types";

export default function UtahMapCanvas({
  startups,
  selectedId,
  onSelect,
}: {
  startups: CatalogStartup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Map
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={{ latitude: 39.6, longitude: -111.5, zoom: 6.2 }}
        style={{ width: "100%", height: 420 }}
      >
        <NavigationControl position="top-right" />
        {startups.map((row) => (
          <Marker
            key={row.id}
            latitude={row.lat!}
            longitude={row.lng!}
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              onSelect(row.id);
            }}
          >
            <span
              title={row.name}
              className={`block h-2.5 w-2.5 rounded-full ${
                selectedId === row.id ? "h-3.5 w-3.5 bg-bright-green" : "bg-vibrant-green"
              }`}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
