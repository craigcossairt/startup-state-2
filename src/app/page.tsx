import type { Metadata } from "next";
import { Intake } from "@/components/intake";
import { hiringStartups } from "@/lib/catalog/filter";
import { loadCatalogResources, loadCatalogStartups } from "@/lib/catalog/load";

export const metadata: Metadata = {
  description:
    "Describe your company. We rank federal and Utah programs by fit.",
};

export default async function HomePage() {
  const [resources, startups] = await Promise.all([
    loadCatalogResources(),
    loadCatalogStartups(),
  ]);
  return (
    <Intake
      counts={{
        resources: resources.length,
        startups: startups.length,
        hiring: hiringStartups(startups).length,
      }}
    />
  );
}
