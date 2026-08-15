import { Suspense } from "react";
import { OpportunityMap } from "@/components/opportunity-map";
import { YouBar } from "@/components/catalog/you-bar";

export const metadata = {
  title: "Opportunity Map",
  description:
    "Federal and Utah programs ranked by fit for your company.",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <Suspense fallback={null}>
        <YouBar />
      </Suspense>
      <OpportunityMap initialFixture={params.fixture} />
    </>
  );
}
