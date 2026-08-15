import { Suspense } from "react";
import { ResourceDirectory } from "@/components/catalog/resource-directory";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { YouBar } from "@/components/catalog/you-bar";
import { loadCatalogResources } from "@/lib/catalog/load";

export const metadata = {
  title: "Utah resources",
  description: "The full GOED program directory for Utah founders.",
};

export default async function ResourcesPage() {
  const resources = await loadCatalogResources();
  return (
    <>
      <Suspense fallback={null}>
        <YouBar />
      </Suspense>
      <SurfaceHero
        eyebrow="Utah's state-supported programs"
        title={
          <>
            <span className="serif-italic text-bright-green">{resources.length}</span> programs,
            ranked for you.
          </>
        }
      >
        <p>
          Accelerators, grants, counseling, workforce, and trade. Filter by topic, community, or
          search. The You bar re-sorts the list to your stage, sector, and community.
        </p>
      </SurfaceHero>
      <Suspense fallback={null}>
        <ResourceDirectory resources={resources} />
      </Suspense>
    </>
  );
}
