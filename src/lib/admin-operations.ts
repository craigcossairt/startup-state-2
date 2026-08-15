import { readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import { parseStartupList } from "@/lib/catalog/parse";
import type { CatalogStartup } from "@/lib/catalog/types";

export const ADMIN_PAGE_SIZE = 20;

export type AdminPendingStartup = {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  city: string | null;
  region: string | null;
  sector: string;
  stage: string | null;
  createdAt: string;
};

export type AdminClaim = {
  id: string;
  startupId: string;
  startupName: string;
  requesterEmail: string;
  requesterDomain: string;
  status: string;
  createdAt: string;
};

export type AdminOutreachFilter = {
  sectors?: string[];
  regions?: string[];
  hiringOnly?: boolean;
};

export type AdminOutreachList = {
  id: string;
  slug: string;
  title: string;
  audience: string;
  filter: AdminOutreachFilter;
};

export type AdminAuditRow = {
  id: number;
  startupId: string;
  startupName: string;
  actorEmail: string | null;
  createdAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

export type AdminSection = {
  id: "pending" | "claims" | "outreach" | "saved-searches" | "audit";
  label: string;
  count: number;
};

export type AdminOperations = {
  pending: AdminPendingStartup[];
  claims: AdminClaim[];
  outreach: AdminOutreachList[];
  saved: [];
  savedTotal: 0;
  audits: AdminAuditRow[];
  auditTotal: number;
  sections: AdminSection[];
};

type FixtureFile = {
  pending: AdminPendingStartup[];
  claims: Array<{
    id: string;
    startupSlug: string;
    requesterEmail: string;
    requesterDomain: string;
    status: string;
    createdAt: string;
  }>;
  outreach: AdminOutreachList[];
  auditEdits: AdminAuditRow[];
};

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(dataPath(rel), "utf8"));
}

export function filterStartupsForList(
  startups: CatalogStartup[],
  filter: AdminOutreachFilter,
): CatalogStartup[] {
  return startups.filter((row) => {
    if (filter.sectors?.length && !filter.sectors.includes(row.sector)) return false;
    if (filter.regions?.length && (!row.region || !filter.regions.includes(row.region))) {
      return false;
    }
    if (filter.hiringOnly && !row.isHiring) return false;
    return true;
  });
}

export function paginateRows<T>(rows: T[], page: number, pageSize = ADMIN_PAGE_SIZE): T[] {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const start = (safePage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function loadAdminOperations(): AdminOperations {
  const fixture = readJson("catalog/admin-operations.json") as FixtureFile;
  const startups = parseStartupList(readJson("catalog/startups.json"));
  const bySlug = new Map(startups.map((row) => [row.slug, row]));

  const pending = fixture.pending;
  const claims = fixture.claims.map((row) => ({
    id: row.id,
    startupId: row.startupSlug,
    startupName: bySlug.get(row.startupSlug)?.name ?? row.startupSlug,
    requesterEmail: row.requesterEmail,
    requesterDomain: row.requesterDomain,
    status: row.status,
    createdAt: row.createdAt,
  }));
  const outreach = fixture.outreach;

  const created: AdminAuditRow[] = startups.map((row, index) => ({
    id: index + 1,
    startupId: row.slug,
    startupName: row.name,
    actorEmail: null,
    createdAt: new Date(Date.parse("2026-05-08T12:00:00.000Z") - index * 60_000).toISOString(),
    before: null,
    after: { name: row.name, city: row.city, sector: row.sector },
  }));
  const audits = [...fixture.auditEdits, ...created].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : b.id - a.id,
  );

  return {
    pending,
    claims,
    outreach,
    saved: [],
    savedTotal: 0,
    audits,
    auditTotal: audits.length,
    sections: [
      { id: "pending", label: "Pending submissions", count: pending.length },
      { id: "claims", label: "Claim queue", count: claims.length },
      { id: "outreach", label: "Outreach lists", count: outreach.length },
      { id: "saved-searches", label: "Saved-search subscribers", count: 0 },
      { id: "audit", label: "Audit log", count: audits.length },
    ],
  };
}
