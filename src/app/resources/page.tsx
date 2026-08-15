import { Suspense } from "react";
import { ResourceDirectory } from "@/components/catalog/resource-directory";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { YouBar } from "@/components/catalog/you-bar";
import { loadCatalogResources } from "@/lib/catalog/load";

export const metadata = {
  title: "Utah resources",
  description: "The full GOEO program directory for Utah founders.",
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
            <span className="serif-italic text-bright-green">{resources.length}</span> programs
            in the GOEO directory.
          </>
        }
      >
        <p>
          Accelerators, grants, counseling, workforce, and trade. Filter by topic or search.
          Rank a company on Intake when you want these programs fitted to one business.
        </p>
      </SurfaceHero>
      <Suspense fallback={null}>
        <ResourceDirectory resources={resources} />
      </Suspense>
    </>
  );
}
