import { Suspense } from "react";
import { StartupMapClient } from "@/components/catalog/startup-map-client";
import { loadCatalogStartups } from "@/lib/catalog/load";
import { readMapboxPublicToken } from "@/lib/catalog/mapbox";

export const metadata = {
  title: "Utah startups",
  description: "A map and directory of Utah startups from the Startup State catalog.",
};

export default async function StartupsPage() {
  const startups = await loadCatalogStartups();
  return (
    <Suspense fallback={null}>
      <StartupMapClient startups={startups} mapboxToken={readMapboxPublicToken()} />
    </Suspense>
  );
}
