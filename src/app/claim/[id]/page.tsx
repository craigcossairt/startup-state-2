import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimForm } from "@/components/catalog/claim-form";
import { findCatalogStartup, websiteDomain } from "@/lib/catalog/claim";
import { loadCatalogStartups } from "@/lib/catalog/load";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const startup = findCatalogStartup(await loadCatalogStartups(), id);
  if (!startup) notFound();
  const domain = websiteDomain(startup.website);

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Link
        href="/startups"
        className="inline-flex text-sm font-semibold text-foreground-muted hover:text-foreground"
      >
        Back to map
      </Link>
      <div className="space-y-1.5">
        <p className="eyebrow !mb-0">Claim listing</p>
        <h1 className="h-display text-3xl">{startup.name}</h1>
        <p className="serif-italic text-foreground-muted">
          Verify you represent this company with an email at{" "}
          <span className="font-mono text-foreground">{domain ?? "your-company.com"}</span>.
        </p>
      </div>
      <div className="space-y-5 rounded-2xl border border-border bg-white p-6">
        <div className="text-sm leading-relaxed text-foreground-muted">
          <p className="mb-1 font-semibold text-foreground">How verification works</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>You enter an email at the company&apos;s website domain.</li>
            <li>We check that domain against this listing.</li>
            <li>If mail is configured, we send a one-time sign-in link.</li>
            <li>If mail is not configured, we tell you that and how to finish with GOED.</li>
          </ol>
        </div>
        <ClaimForm startupId={startup.id} domain={domain} />
      </div>
    </section>
  );
}
