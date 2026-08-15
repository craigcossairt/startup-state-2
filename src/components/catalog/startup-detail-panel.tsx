"use client";

import Link from "next/link";
import { CompanyLogo } from "./company-logo";
import { withWebsiteProtocol } from "@/lib/catalog/filter";
import { sectorColor, sectorLabel, stageLabel } from "@/lib/catalog/map-filters";
import type { CatalogStartup } from "@/lib/catalog/types";

export function StartupDetailPanel({
  startup,
  onBack,
}: {
  startup: CatalogStartup;
  onBack: () => void;
}) {
  const website = startup.website ? withWebsiteProtocol(startup.website) : null;
  const careers = startup.careersUrl ? withWebsiteProtocol(startup.careersUrl) : null;
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-foreground-muted hover:text-foreground"
        >
          Back to filters
        </button>
        <Link
          href={`/claim/${startup.id}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Claim this listing
        </Link>
      </header>
      <div
        className="shrink-0 border-b border-border px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${sectorColor(startup.sector)}1a 0%, transparent 70%)`,
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <CompanyLogo
            website={startup.website}
            name={startup.name}
            color={sectorColor(startup.sector)}
            className="h-12 w-12"
          />
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-extrabold leading-tight">
              {startup.name}
            </h2>
            {startup.city ? (
              <p className="mt-0.5 text-[11px] text-foreground-muted">
                {startup.city}
                {startup.region ? ` · ${startup.region}` : ""}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
            {sectorLabel(startup.sector)}
          </span>
          {stageLabel(startup.stage) ? (
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
              {stageLabel(startup.stage)}
            </span>
          ) : null}
          {startup.isHiring ? (
            <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] font-semibold text-primary">
              Hiring
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {startup.description ? (
          <p className="text-sm leading-relaxed">{startup.description}</p>
        ) : null}
        {startup.fullAddress ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
              Address
            </p>
            <p className="mt-1 text-sm">{startup.fullAddress}</p>
          </div>
        ) : null}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
            At a glance
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-foreground-muted">Employees</dt>
              <dd className="font-semibold">{startup.employeesBucket}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-muted">Revenue</dt>
              <dd className="font-semibold">{startup.revenueBucket}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-muted">Founded</dt>
              <dd className="font-semibold">{startup.foundingYear ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground-muted">Region</dt>
              <dd className="font-semibold">{startup.region ?? "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          {website ? (
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Website
            </a>
          ) : null}
          {startup.linkedinUrl ? (
            <a
              href={startup.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
          ) : null}
          {careers ? (
            <a href={careers} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Open roles
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
