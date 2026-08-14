import { OpportunityMap } from "@/components/opportunity-map";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string }>;
}) {
  const params = await searchParams;
  return <OpportunityMap initialFixture={params.fixture} />;
}
