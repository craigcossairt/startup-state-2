import { Suspense } from "react";
import { LeftoverTestCaseBar } from "@/components/catalog/leftover-test-case-bar";
import { ResourceDirectory } from "@/components/catalog/resource-directory";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import {
  leftoverFixtureNeedles,
  parseLeftoverFixtureId,
} from "@/lib/catalog/leftover-test-case";
import { loadCatalogResources } from "@/lib/catalog/load";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";

export const metadata = {
  title: "Utah resources",
  description: "The full GOEO program directory for Utah founders.",
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string }>;
}) {
  const resources = await loadCatalogResources();
  const fixture = parseLeftoverFixtureId((await searchParams).fixture);
  const needles = fixture ? leftoverFixtureNeedles(loadCompanyFixture(fixture)) : [];
  return (
    <>
      <Suspense fallback={null}>
        <LeftoverTestCaseBar />
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
      <ResourceDirectory resources={resources} needles={needles} />
    </>
  );
}
