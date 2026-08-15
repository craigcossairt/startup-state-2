"use client";

import { useState } from "react";
import {
  FIT_LABELS,
  NONE_ATTACHED,
  NOT_PUBLISHED,
  SIMILAR_HEADING,
  VERIFY_HEADING,
  WHY_HEADING,
} from "@/lib/copy";
import { formatDeadline, formatInstrument } from "@/lib/display";
import { formatUsdCompact } from "@/lib/map-metrics";
import type { FitLabel, RankedCard } from "@/lib/types/opportunity";

const FIT_PILL: Record<FitLabel, string> = {
  likely: "bg-vibrant-green text-white border-vibrant-green",
  "potential-verify": "bg-[#ffad00] text-midnight border-[#ffad00]",
  adjacent: "bg-platinum text-foreground border-platinum",
  probably_not: "bg-white text-foreground-muted border-platinum",
};

function money(value: { minUsd: number; maxUsd: number } | null): string {
  if (!value) return NOT_PUBLISHED;
  if (value.minUsd === value.maxUsd) return formatUsdCompact(value.maxUsd);
  return `${formatUsdCompact(value.minUsd)} to ${formatUsdCompact(value.maxUsd)}`;
}

export function RankedOpportunityCard({ card }: { card: RankedCard }) {
  const [descOpen, setDescOpen] = useState(false);
  const sourceLabel = card.opportunity.lane === "federal" ? "Federal" : "Utah";
  const publishedValue = Boolean(card.opportunity.value);
  const publishedDeadline = Boolean(card.opportunity.deadline);

  return (
    <article className="rounded border border-border bg-white px-[26px] py-6">
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <span
          className={`rounded-[3px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white ${
            card.opportunity.lane === "federal" ? "bg-midnight" : "bg-vibrant-green"
          }`}
        >
          {sourceLabel}
        </span>
        {card.ranking ? null : (
          <>
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-foreground-muted">
              {formatInstrument(card.opportunity.instrument)}
            </span>
            <span className="inline-block h-0.5 w-0.5 rounded-full bg-platinum" />
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-foreground-muted">
              {card.opportunity.status}
            </span>
            <span
              className={`ml-auto rounded-full border px-3 py-1 text-xs font-bold tracking-[0.04em] ${FIT_PILL[card.fit]}`}
            >
              {FIT_LABELS[card.fit]}
            </span>
          </>
        )}
      </div>

      <h3 className="max-w-[820px] font-display text-[19px] font-extrabold leading-snug text-midnight text-pretty">
        {card.opportunity.program}
      </h3>

      <div className="mt-2.5 mb-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <span className="text-sm text-foreground">{card.opportunity.agency.name}</span>
        {card.opportunity.agency.code ? (
          <span className="rounded-[3px] bg-background-alt px-1.5 py-0.5 font-mono text-xs text-foreground-muted">
            {card.opportunity.agency.code}
          </span>
        ) : null}
        {card.opportunity.opportunityNumber ? (
          <span className="rounded-[3px] bg-background-alt px-1.5 py-0.5 font-mono text-xs text-midnight">
            {card.opportunity.opportunityNumber}
          </span>
        ) : null}
      </div>

      <dl className="mb-[18px] grid grid-cols-2 gap-x-7 gap-y-4 border-y border-border py-3.5">
        <div>
          <dt className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
            Value
          </dt>
          <dd
            className={`text-[15px] leading-snug ${
              publishedValue ? "font-semibold text-midnight" : "text-foreground-muted"
            }`}
          >
            {money(card.opportunity.value)}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
            Deadline
          </dt>
          <dd
            className={`text-[15px] leading-snug ${
              publishedDeadline ? "font-semibold text-midnight" : "text-foreground-muted"
            }`}
          >
            {formatDeadline(card.opportunity.deadline)}
          </dd>
        </div>
      </dl>

      {card.ranking ? (
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-vibrant-green" />
          <span className="text-sm font-bold text-midnight">Ranking by fit</span>
        </div>
      ) : (
        <>
          <div className="mb-[18px]">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-vibrant-green">
              {WHY_HEADING}
            </p>
            <p className="max-w-[760px] font-serif text-[17px] leading-relaxed text-midnight text-pretty">
              {card.why}
            </p>
          </div>

          {card.concerns.length > 0 ? (
            <div className="mb-[18px]">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                {VERIFY_HEADING}
              </p>
              <ul className="flex flex-col gap-1.5">
                {card.concerns.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[15px] leading-snug text-foreground"
                  >
                    <span className="absolute top-2 left-0 inline-block h-1.5 w-1.5 bg-[#ffad00]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mb-[18px] rounded bg-off-white px-[18px] py-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
              {SIMILAR_HEADING}
            </p>
            {card.similarAwardees.length === 0 ? (
              <p className="text-sm text-foreground-muted">{NONE_ATTACHED}.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {card.similarAwardees.map((row, index) => (
                  <div key={`${row.source}:${row.name}:${row.year ?? ""}:${index}`}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-[15px] font-bold text-midnight">{row.name}</span>
                      {row.amountUsd !== undefined ? (
                        <span className="text-sm font-bold text-vibrant-green">
                          {formatUsdCompact(row.amountUsd)}
                        </span>
                      ) : null}
                      <span className="text-[13px] text-foreground-muted">
                        {[row.year, row.city, row.state].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {row.summary ? (
                      <p className="mt-1 max-w-[700px] text-sm leading-snug text-foreground">
                        {row.summary}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {card.nextStep.url ? (
              <a
                href={card.nextStep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
              >
                {card.nextStep.label}
              </a>
            ) : (
              <span className="inline-flex rounded-full border border-platinum px-5 py-2.5 text-sm font-bold text-midnight">
                {card.nextStep.label}
              </span>
            )}
            {card.opportunity.description ? (
              <button
                type="button"
                onClick={() => setDescOpen((value) => !value)}
                className="border-b border-platinum bg-transparent p-0 text-[13px] font-bold text-foreground-muted"
              >
                {descOpen ? "Hide official description" : "Official description"}
              </button>
            ) : null}
          </div>
          {descOpen && card.opportunity.description ? (
            <p className="mt-4 max-w-[820px] border-t border-border pt-4 text-sm leading-relaxed text-foreground-muted">
              {card.opportunity.description}
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}
