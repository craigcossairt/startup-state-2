import { FIT_LABELS, NOT_PUBLISHED } from "@/lib/copy";
import type { RankedCard } from "@/lib/types/opportunity";

function money(value: { minUsd: number; maxUsd: number } | null): string {
  if (!value) return NOT_PUBLISHED;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (value.minUsd === value.maxUsd) return fmt(value.maxUsd);
  return `${fmt(value.minUsd)} to ${fmt(value.maxUsd)}`;
}

export function RankedOpportunityCard({ card }: { card: RankedCard }) {
  const sourceLabel = card.opportunity.lane === "federal" ? "Federal" : "Utah";
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <span
          className={
            card.opportunity.lane === "federal"
              ? "rounded-full bg-midnight px-2 py-1 text-white"
              : "rounded-full bg-vibrant-green px-2 py-1 text-white"
          }
        >
          {sourceLabel}
        </span>
        <span className="rounded-full bg-off-white px-2 py-1 text-foreground">
          {card.ranking ? "Ranking" : FIT_LABELS[card.fit]}
        </span>
        {card.ranking ? null : (
          <span className="text-foreground-muted">{card.opportunity.instrument}</span>
        )}
      </div>
      <h2 className="mt-3 font-display text-xl font-extrabold">
        {card.opportunity.program}
      </h2>
      <p className="mt-1 text-sm text-foreground-muted">
        {card.opportunity.agency.name}
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Value</dt>
          <dd className="mt-1">{money(card.opportunity.value)}</dd>
        </div>
        <div>
          <dt className="eyebrow">Deadline</dt>
          <dd className="mt-1">{card.opportunity.deadline ?? NOT_PUBLISHED}</dd>
        </div>
      </dl>
      {card.ranking ? (
        <p className="mt-4 text-sm text-foreground-muted">Ranking by fit</p>
      ) : (
        <>
          <div className="mt-4">
            <p className="eyebrow">Why</p>
            <p className="mt-1">{card.why}</p>
          </div>
          <div className="mt-4">
            <p className="eyebrow">Concerns</p>
            {card.concerns.length === 0 ? (
              <p className="mt-1 text-foreground-muted">None listed</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {card.concerns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-5">
            {card.nextStep.url ? (
              <a
                href={card.nextStep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md bg-midnight px-4 py-2 text-sm font-bold text-white"
              >
                {card.nextStep.label}
              </a>
            ) : (
              <p className="text-sm font-semibold">{card.nextStep.label}</p>
            )}
          </div>
        </>
      )}
    </article>
  );
}
