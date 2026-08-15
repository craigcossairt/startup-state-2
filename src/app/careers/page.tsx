import Link from "next/link";
import { Suspense } from "react";
import { TalentFilters } from "@/components/catalog/talent-filters";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { CompanyLogo } from "@/components/catalog/company-logo";
import { hiringStartups, officialJobBoards, withWebsiteProtocol } from "@/lib/catalog/filter";
import { loadCatalogResources, loadCatalogStartups } from "@/lib/catalog/load";
import { ALL_REGIONS, ALL_SECTORS, sectorColor, sectorLabel, stageLabel } from "@/lib/catalog/map-filters";

export const metadata = {
  title: "Utah startup careers",
  description: "Utah startups that are hiring, plus official workforce boards.",
};

type Props = {
  searchParams: Promise<{ sector?: string | string[]; region?: string | string[] }>;
};

function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CareersPage({ searchParams }: Props) {
  const params = await searchParams;
  const sectorFilter = new Set(
    asList(params.sector).filter((item) => (ALL_SECTORS as readonly string[]).includes(item)),
  );
  const regionFilter = new Set(
    asList(params.region).filter((item) => (ALL_REGIONS as readonly string[]).includes(item)),
  );
  const [startups, resources] = await Promise.all([
    loadCatalogStartups(),
    loadCatalogResources(),
  ]);
  const hiring = hiringStartups(startups);
  const filtered = hiring.filter((row) => {
    if (sectorFilter.size && !sectorFilter.has(row.sector)) return false;
    if (regionFilter.size && (!row.region || !regionFilter.has(row.region))) return false;
    return true;
  });
  const boards = officialJobBoards(resources);
  return (
    <>
      <SurfaceHero
        eyebrow="For job seekers"
        title={
          <>
            Utah startups that are <span className="serif-italic text-bright-green">hiring right now.</span>
          </>
        }
      >
        <p>
          {hiring.length} companies have flagged themselves as actively hiring. Filter by what you
          do. Click a company to see open roles or jump to the map.
        </p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] space-y-10 px-6 py-12">
        <Suspense fallback={null}>
          <TalentFilters
            activeSectors={[...sectorFilter]}
            activeRegions={[...regionFilter]}
            shown={filtered.length}
            total={hiring.length}
          />
        </Suspense>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background-alt p-10 text-center text-foreground-muted">
            No companies match those filters.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => {
              const careersHref =
                row.careersUrl ?? (row.website ? `${withWebsiteProtocol(row.website)}/careers` : null);
              return (
                <li key={row.id}>
                  <article className="group h-full rounded-xl border border-border bg-background p-5 hover:border-primary/40 hover:shadow-md">
                    <div className="mb-4 flex items-start gap-3">
                      <CompanyLogo
                        website={row.website}
                        name={row.name}
                        color={sectorColor(row.sector)}
                        className="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-extrabold leading-tight">
                          {row.name}
                        </h3>
                        {row.city ? (
                          <p className="mt-0.5 text-xs text-foreground-muted">
                            {row.city}
                            {row.region ? ` · ${row.region}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        {sectorLabel(row.sector)}
                      </span>
                      {stageLabel(row.stage) ? (
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                          {stageLabel(row.stage)}
                        </span>
                      ) : null}
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        {row.employeesBucket}
                      </span>
                    </div>
                    {row.description ? (
                      <p className="mb-4 line-clamp-3 text-sm text-foreground-muted">{row.description}</p>
                    ) : null}
                    <div className="flex items-center justify-between text-xs">
                      {careersHref ? (
                        <a
                          href={careersHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          View open roles
                        </a>
                      ) : (
                        <span className="text-foreground-muted italic">No careers link yet.</span>
                      )}
                      <Link
                        href={`/startups?startup=${row.id}`}
                        className="text-foreground-muted group-hover:text-primary"
                      >
                        Map view
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        <div>
          <h2 className="h-display text-2xl">Official job boards</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {boards.map((row) => (
              <li key={row.id} className="rounded-xl border border-border p-5">
                <h3 className="font-display font-extrabold">{row.title}</h3>
                {row.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-foreground-muted">{row.description}</p>
                ) : null}
                {row.link ? (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    Open board
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
