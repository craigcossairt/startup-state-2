import Link from "next/link";
import { AdminIcon } from "@/components/admin/admin-icon";
import { AuditLog } from "@/components/admin/audit-log";
import { PendingSubmissions } from "@/components/admin/pending-submissions";
import { TylerCard } from "@/components/admin/tyler-card";
import {
  ADMIN_PAGE_SIZE,
  loadAdminOperations,
  paginateRows,
} from "@/lib/admin-operations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "GOED Operations",
  description: "Read-only window for GOED staff.",
};

type SearchParams = {
  audit_page?: string;
};

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const auditPage = parsePage(params.audit_page);
  const ops = loadAdminOperations();
  const auditSlice = paginateRows(ops.audits, auditPage);

  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[15rem_1fr]">
      <aside className="self-start lg:sticky lg:top-20">
        <div className="space-y-1">
          <p className="eyebrow !mb-2 !text-[0.6rem]">Admin · GOED</p>
          <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">Operations</h1>
          <nav className="space-y-0.5">
            {ops.sections.map((section) => (
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
          A read-only window for GOED staff. In production this would be gated by GOED-domain SSO.
        </p>

        <section
          id="pending"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header className="flex items-center gap-2">
            <AdminIcon name="inbox" />
            <h2 className="font-display text-lg font-extrabold">Pending submissions</h2>
            <span className="ml-auto text-xs text-foreground-muted">
              {ops.pending.length} awaiting review
            </span>
          </header>
          <PendingSubmissions pending={ops.pending} />
        </section>

        <section
          id="claims"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header className="flex items-center gap-2">
            <AdminIcon name="search" />
            <h2 className="font-display text-lg font-extrabold">Claim queue</h2>
            <span className="ml-auto text-xs text-foreground-muted">
              {ops.claims.length} most recent
            </span>
          </header>
          <div className="-mx-6 overflow-x-auto px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-foreground-muted">
                  <th className="px-3 py-2 font-semibold">Startup</th>
                  <th className="px-3 py-2 font-semibold">Requester</th>
                  <th className="px-3 py-2 font-semibold">Domain</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Requested</th>
                </tr>
              </thead>
              <tbody>
                {ops.claims.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-3 py-2.5">{row.startupName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{row.requesterEmail}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{row.requesterDomain}</td>
                    <td className="px-3 py-2.5 text-foreground-muted">{row.status}</td>
                    <td className="px-3 py-2.5 text-xs text-foreground-muted">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="outreach"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header className="flex items-center gap-2">
            <AdminIcon name="megaphone" />
            <h2 className="font-display text-lg font-extrabold">
              Investor + talent outreach lists
            </h2>
            <span className="ml-auto text-xs text-foreground-muted">
              {ops.outreach.length} curated
            </span>
          </header>
          <p className="text-xs leading-relaxed text-foreground-muted">
            GOED-curated, shareable read-only landing pages. Each one filters the startup catalog
            by the saved criteria and renders with the current data.
          </p>
          <ul className="space-y-2">
            {ops.outreach.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{row.title}</p>
                  <p className="text-[11px] text-foreground-muted">
                    Audience: {row.audience} · /list/{row.slug}
                  </p>
                </div>
                <Link
                  href={`/list/${row.slug}`}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="saved-searches"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header className="flex items-center gap-2">
            <AdminIcon name="bell" />
            <h2 className="font-display text-lg font-extrabold">Saved-search subscribers</h2>
            <span className="ml-auto text-xs text-foreground-muted">{ops.savedTotal} active</span>
          </header>
          <p className="py-2 text-sm text-foreground-muted">No subscribers yet.</p>
          <p className="border-t border-border pt-2 text-[11px] text-foreground-muted">
            Digests run via a Supabase cron job when mail is wired. The leftover watch chip still
            saves on the visitor&apos;s device only.
          </p>
        </section>

        <section
          id="audit"
          className="scroll-mt-20 space-y-4 rounded-2xl border border-border bg-background p-6"
        >
          <header className="flex items-center gap-2">
            <AdminIcon name="shield" />
            <h2 className="font-display text-lg font-extrabold">Startup edit audit log</h2>
            <span className="ml-auto text-xs text-foreground-muted">{ops.auditTotal} total</span>
          </header>
          <AuditLog audits={auditSlice} />
          <AuditPagination page={auditPage} total={ops.auditTotal} />
        </section>

        <TylerCard />
      </div>
    </div>
  );
}

function AuditPagination({ page, total }: { page: number; total: number }) {
  const lastPage = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (lastPage <= 1) return null;
  const start = (page - 1) * ADMIN_PAGE_SIZE + 1;
  const end = Math.min(page * ADMIN_PAGE_SIZE, total);
  return (
    <div className="flex items-center justify-between gap-3 pt-2 text-xs text-foreground-muted">
      <span>
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={`?audit_page=${page - 1}#audit`} scroll={false} className="h-7 rounded-md px-2 hover:bg-background-alt">
            Prev
          </Link>
        ) : (
          <span className="h-7 px-2 opacity-40">Prev</span>
        )}
        <span className="px-2 tabular-nums">
          Page {page} of {lastPage}
        </span>
        {page < lastPage ? (
          <Link href={`?audit_page=${page + 1}#audit`} scroll={false} className="h-7 rounded-md px-2 hover:bg-background-alt">
            Next
          </Link>
        ) : (
          <span className="h-7 px-2 opacity-40">Next</span>
        )}
      </div>
    </div>
  );
}
