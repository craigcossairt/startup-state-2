"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { sectorColor } from "@/lib/catalog/map-filters";
import type { CatalogStartup } from "@/lib/catalog/types";

const UTAH_CENTER = { latitude: 39.6, longitude: -111.5, zoom: 6.4 };
const WASATCH_CLOSEUP = { latitude: 40.55, longitude: -111.8, zoom: 9.2 };

function domainOf(website: string | null): string | null {
  if (!website) return null;
  return (
    website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim()
      .toLowerCase() || null
  );
}

function logoIconId(row: CatalogStartup): string {
  return `logo-${row.id}`;
}

export default function UtahMap({
  token,
  startups,
  selectedId,
  onSelect,
}: {
  token: string;
  startups: CatalogStartup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const loadedIconsRef = useRef<Set<string>>(new Set());
  const [, forceRepaint] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    let cancelled = false;
    async function loadIcons() {
      const loadImg = (url: string) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      for (const row of startups) {
        if (cancelled) return;
        const id = logoIconId(row);
        if (loadedIconsRef.current.has(id)) continue;
        const domain = domainOf(row.website);
        if (!domain) continue;
        const img = await loadImg(`/api/favicon?domain=${encodeURIComponent(domain)}`);
        if (!img || cancelled) continue;
        try {
          if (!map!.hasImage(id)) map!.addImage(id, img, { pixelRatio: 2 });
          loadedIconsRef.current.add(id);
          forceRepaint();
        } catch {
          /* ignore */
        }
      }
    }
    loadIcons();
    return () => {
      cancelled = true;
    };
  }, [mapLoaded, startups]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: startups.map((row) => ({
        type: "Feature" as const,
        properties: {
          id: row.id,
          name: row.name,
          sector: row.sector,
          color: sectorColor(row.sector),
          isHiring: row.isHiring,
          isSelected: row.id === selectedId,
          iconId: domainOf(row.website) ? logoIconId(row) : "",
        },
        geometry: {
          type: "Point" as const,
          coordinates: [row.lng, row.lat],
        },
      })),
    }),
    [startups, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    const row = startups.find((item) => item.id === selectedId);
    if (!row || row.lng == null || row.lat == null) return;
    mapRef.current?.flyTo({
      center: [row.lng, row.lat],
      zoom: 12,
      duration: 1200,
      easing: easeOutCubic,
    });
  }, [selectedId, startups]);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["clusters", "unclustered-point", "logo-symbol", "fallback-point"],
      });
      if (!features.length) {
        onSelect(null);
        return;
      }
      const feature = features[0] as {
        layer?: { id?: string };
        properties?: { cluster_id?: number; id?: string };
        geometry?: { type: string; coordinates: [number, number] };
      };
      if (feature.layer?.id === "clusters") {
        const clusterId = feature.properties?.cluster_id as number;
        const source = map.getSource("startups") as unknown as {
          getClusterExpansionZoom: (
            id: number,
            cb: (err: Error | null, zoom?: number) => void,
          ) => void;
        };
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === undefined) return;
          const coordinates = feature.geometry?.coordinates;
          if (!coordinates) return;
          mapRef.current?.flyTo({
            center: coordinates,
            zoom: Math.min(zoom + 0.5, 13),
            duration: 700,
            easing: easeOutCubic,
          });
        });
        return;
      }
      onSelect(feature.properties?.id ?? null);
    },
    [onSelect],
  );

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      initialViewState={UTAH_CENTER}
      style={{ width: "100%", height: "100%" }}
      interactiveLayerIds={["clusters", "unclustered-point", "logo-symbol", "fallback-point"]}
      onClick={handleClick}
      onLoad={() => {
        setMapLoaded(true);
        setTimeout(() => {
          mapRef.current?.flyTo({
            center: [WASATCH_CLOSEUP.longitude, WASATCH_CLOSEUP.latitude],
            zoom: WASATCH_CLOSEUP.zoom,
            duration: 2400,
            easing: easeOutCubic,
          });
        }, 350);
      }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id="startups" type="geojson" data={geojson} cluster clusterMaxZoom={11} clusterRadius={42}>
        <Layer {...clusterCircleLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...hiringHaloLayer} />
        <Layer {...sectorRingLayer} />
        <Layer {...logoSymbolLayer} />
        <Layer {...fallbackPointLayer} />
        <Layer {...selectedRingLayer} />
      </Source>
    </Map>
  );
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const clusterCircleLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "startups",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#00A24C",
    "circle-opacity": 0.9,
    "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 32, 80, 42],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#0A192E",
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "startups",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
    "text-size": 13,
  },
  paint: { "text-color": "#FFFFFF" },
};

const sectorRingLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "startups",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#FFFFFF",
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 3.5, 8, 6, 11, 9, 14, 13],
    "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 6, 1.2, 11, 2.4, 14, 3],
    "circle-stroke-color": ["get", "color"],
    "circle-opacity": 1,
  },
};

const logoSymbolLayer: LayerProps = {
  id: "logo-symbol",
  type: "symbol",
  source: "startups",
  filter: ["all", ["!", ["has", "point_count"]], ["!=", ["get", "iconId"], ""]],
  layout: {
    "icon-image": ["get", "iconId"],
    "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.12, 8, 0.18, 11, 0.28, 14, 0.4],
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  },
};

const fallbackPointLayer: LayerProps = {
  id: "fallback-point",
  type: "circle",
  source: "startups",
  filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "iconId"], ""]],
  paint: {
    "circle-color": ["get", "color"],
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 2, 8, 3.5, 11, 5, 14, 7],
    "circle-opacity": 1,
  },
};

const hiringHaloLayer: LayerProps = {
  id: "hiring-halo",
  type: "circle",
  source: "startups",
  filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "isHiring"], true]],
  paint: {
    "circle-color": "rgba(0,0,0,0)",
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 6, 8, 9, 11, 12, 14, 16],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#13DF81",
    "circle-stroke-opacity": 0.55,
  },
};

const selectedRingLayer: LayerProps = {
  id: "selected-ring",
  type: "circle",
  source: "startups",
  filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "isSelected"], true]],
  paint: {
    "circle-color": "rgba(0,0,0,0)",
    "circle-radius": 16,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#13DF81",
  },
};
