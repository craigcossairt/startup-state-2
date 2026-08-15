import Link from "next/link";
import { notFound } from "next/navigation";
import { filterStartupsForList, loadAdminOperations } from "@/lib/admin-operations";
import { loadCatalogStartups } from "@/lib/catalog/load";

export const dynamic = "force-dynamic";

export default async function OutreachListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ops = loadAdminOperations();
  const list = ops.outreach.find((row) => row.slug === slug);
  if (!list) notFound();
  const startups = filterStartupsForList(await loadCatalogStartups(), list.filter);

  return (
    <div className="bg-off-white">
      <section className="bg-midnight text-white">
        <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-8">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-bright-green">
            Outreach list
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight">
            {list.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-platinum">
            Audience: {list.audience}. {startups.length} companies from the current catalog.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-8">
        <ul className="space-y-3">
          {startups.map((row) => (
            <li key={row.slug} className="rounded-xl border border-border bg-white px-5 py-4">
              <p className="font-display text-lg font-extrabold text-midnight">{row.name}</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {row.sector}
                {row.city ? ` · ${row.city}` : ""}
                {row.region ? `, ${row.region}` : ""}
              </p>
              {row.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">{row.description}</p>
              ) : null}
              {row.website ? (
                <a
                  href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                  className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
            Back to GOED admin
          </Link>
        </p>
      </div>
    </div>
  );
}
