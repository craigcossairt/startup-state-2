import { buildAdminSnapshot } from "@/lib/admin-snapshot";
import { loadCatalogResources, loadCatalogStartups } from "@/lib/catalog/load";
import { LEFTOVER_WATCH_STORAGE_KEY } from "@/lib/catalog/leftover-watch";
import { PLAYBOOK_STEPS } from "@/lib/catalog/playbook";

export const metadata = {
  title: "GOED Operations",
  description: "Read-only catalog inventory for GOED staff.",
};

export default async function AdminPage() {
  const [resources, startups] = await Promise.all([
    loadCatalogResources(),
    loadCatalogStartups(),
  ]);
  const snapshot = buildAdminSnapshot({
    resources: resources.length,
    startups: startups.length,
    playbookSteps: PLAYBOOK_STEPS.length,
  });

  const sections = [
    { id: "catalog", label: "Catalog inventory", count: snapshot.resources + snapshot.startups },
    { id: "pending", label: "Pending listings", count: 0 },
    { id: "claims", label: "Claim queue", count: 0 },
    { id: "watches", label: "Leftover watches", count: 0 },
  ];

  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[15rem_1fr]">
      <aside className="self-start lg:sticky lg:top-20">
        <div className="space-y-1">
          <p className="eyebrow !mb-2 !text-[0.6rem]">Admin · GOED</p>
          <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">Operations</h1>
          <nav className="space-y-0.5">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-alt hover:text-foreground"
              >
                <span>{section.label}</span>
                <span className="text-xs tabular-nums opacity-70">{section.count}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 space-y-8">
        <p className="serif-italic text-foreground-muted">
          A read-only window for GOED staff. Production would be GOED-domain SSO.
        </p>

        <section
          id="catalog"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header>
            <h2 className="font-display text-lg font-extrabold">Catalog inventory</h2>
          </header>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CountCard label="Resources" value={snapshot.resources} />
            <CountCard label="Startups" value={snapshot.startups} />
            <CountCard label="Playbook steps" value={snapshot.playbookSteps} />
          </dl>
        </section>

        <section
          id="pending"
          className="scroll-mt-20 space-y-3 rounded-2xl border border-border bg-background p-6"
        >
          <h2 className="font-display text-lg font-extrabold">Pending listings</h2>
          <p className="text-sm text-foreground-muted">
            Add listing does not publish, so there is no review queue yet. Email
            submissions still go to GOED directly.
          </p>
        </section>

        <section
          id="claims"
          className="scroll-mt-20 space-y-3 rounded-2xl border border-border bg-background p-6"
        >
          <h2 className="font-display text-lg font-extrabold">Claim queue</h2>
          <p className="text-sm text-foreground-muted">
            Claim checks the listing website domain in this session. Nothing is stored for staff
            review yet.
          </p>
        </section>

        <section
          id="watches"
          className="scroll-mt-20 space-y-3 rounded-2xl border border-border bg-background p-6"
        >
          <h2 className="font-display text-lg font-extrabold">Leftover watches</h2>
          <p className="text-sm text-foreground-muted">
            Saved searches stay on the visitor&apos;s device under{" "}
            <code className="font-mono">{LEFTOVER_WATCH_STORAGE_KEY}</code>. Mail is not wired.
          </p>
        </section>
      </div>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
