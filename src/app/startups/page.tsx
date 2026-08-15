import { StartupDirectory } from "@/components/catalog/startup-directory";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { loadCatalogStartups } from "@/lib/catalog/load";
import { hasPublicMapboxToken } from "@/lib/catalog/mapbox";

export const metadata = {
  title: "Utah startups",
  description: "A map and directory of Utah startups from the Startup State catalog.",
};

export default async function StartupsPage() {
  const startups = await loadCatalogStartups();
  return (
    <>
      <SurfaceHero
        eyebrow="Utah startup map"
        title={
          <>
            <span className="serif-italic text-bright-green">{startups.length}</span> companies
            on the ground.
          </>
        }
      >
        <p>
          Browse by sector and region. The pin map uses Mapbox when a public token is present.
          Without it, you still get the schematic plot and the full list.
        </p>
      </SurfaceHero>
      <StartupDirectory startups={startups} mapboxEnabled={hasPublicMapboxToken()} />
    </>
  );
}
