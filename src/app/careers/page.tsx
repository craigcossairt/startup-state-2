import Link from "next/link";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { hiringStartups, officialJobBoards, withWebsiteProtocol } from "@/lib/catalog/filter";
import { loadCatalogResources, loadCatalogStartups } from "@/lib/catalog/load";

export const metadata = {
  title: "Utah startup careers",
  description: "Utah startups that are hiring, plus official workforce boards.",
};

export default async function CareersPage() {
  const [startups, resources] = await Promise.all([
    loadCatalogStartups(),
    loadCatalogResources(),
  ]);
  const hiring = hiringStartups(startups);
  const boards = officialJobBoards(resources);
  return (
    <>
      <SurfaceHero
        eyebrow="For job seekers"
        title={
          <>
            Utah startups that are <span className="serif-italic text-bright-green">hiring</span>.
          </>
        }
      >
        <p>
          Companies flag hiring in the live catalog. The committed snapshot has no hiring flags
          yet, so official workforce boards stay on this page either way.
        </p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] space-y-10 px-6 py-12">
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
        <div>
          <h2 className="h-display text-2xl">Companies hiring now</h2>
          {hiring.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-background-alt p-6 text-sm">
              No company in the current catalog has flagged hiring. Browse the{" "}
              <Link href="/startups" className="font-semibold text-primary hover:underline">
                startups directory
              </Link>{" "}
              or mark hiring on a listing in Supabase.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {hiring.map((row) => (
                <li key={row.id} className="rounded-xl border border-border p-5">
                  <h3 className="font-display font-extrabold">{row.name}</h3>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {[row.city, row.sector].filter(Boolean).join(" · ")}
                  </p>
                  {row.careersUrl ? (
                    <a
                      href={withWebsiteProtocol(row.careersUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                    >
                      Open roles
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
