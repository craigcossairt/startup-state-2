"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { filterResources, resourceCommunities, resourceTopics } from "@/lib/catalog/filter";
import {
  filterResourcesByRegion,
  matchResources,
  type MatchReason,
  type ScoredResource,
} from "@/lib/catalog/match-resources";
import { paramsToPersona, personaIsFilled } from "@/lib/catalog/you-persona";
import type { CatalogResource } from "@/lib/catalog/types";

export function ResourceDirectory({ resources }: { resources: CatalogResource[] }) {
  const params = useSearchParams();
  const persona = personaIsFilled(params) ? paramsToPersona(params) : null;
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [limit, setLimit] = useState(24);

  const scored = useMemo<ScoredResource[]>(() => {
    const regioned = filterResourcesByRegion(resources, persona);
    if (!persona) {
      return regioned.map((resource) => ({ resource, score: 0, reasons: [] }));
    }
    return matchResources(persona, regioned);
  }, [resources, persona]);

  const topics = useMemo(
    () => resourceTopics(scored.map((item) => item.resource)),
    [scored],
  );
  const communities = useMemo(
    () => resourceCommunities(scored.map((item) => item.resource)),
    [scored],
  );
  const filtered = useMemo(() => {
    const keep = new Set(
      filterResources(
        scored.map((item) => item.resource),
        { q, topic, community: communityFilter },
      ).map((row) => row.id),
    );
    return scored.filter((item) => keep.has(item.resource.id));
  }, [scored, q, topic, communityFilter]);

  useEffect(() => {
    setLimit(24);
  }, [q, topic, communityFilter, persona?.region]);

  const shown = filtered.slice(0, limit);
  const more = filtered.length - limit;

  return (
    <section className="mx-auto max-w-[1200px] space-y-6 px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 min-w-[260px] flex-1 rounded-md border border-border px-3 text-sm"
          placeholder="Search programs by name or description"
        />
        <FilterDropdown label="Topic" value={topic} onChange={setTopic} options={topics} />
        <FilterDropdown
          label="Community"
          value={communityFilter}
          onChange={setCommunityFilter}
          options={communities}
        />
      </div>
      <p className="text-xs text-foreground-muted">
        {persona ? (
          <>
            <span className="font-semibold text-foreground">{shown.length}</span> of {filtered.length}{" "}
            program{filtered.length === 1 ? "" : "s"} sorted for {persona.stage.toLowerCase()}-stage{" "}
            {persona.sector.toLowerCase()} founders in {persona.region}.
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{shown.length}</span> of {filtered.length}{" "}
            programs. Set You above to sort by relevance.
          </>
        )}
      </p>
      {shown.length === 0 ? (
        <p className="py-8 text-sm text-foreground-muted">
          No programs match these filters. Try clearing your search or widening the filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((row) => (
            <li key={row.resource.id}>
              <ResourceCard scored={row} />
            </li>
          ))}
        </ul>
      )}
      {more > 0 ? (
        <button
          type="button"
          onClick={() => setLimit((value) => value + 24)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Show {Math.min(24, more)} more
        </button>
      ) : null}
    </section>
  );
}

function ResourceCard({ scored }: { scored: ScoredResource }) {
  const row = scored.resource;
  const desc = row.description?.replace(/^"+|"+$/g, "").slice(0, 220);
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-white p-5">
      <h2 className="font-display text-lg font-extrabold tracking-tight">{row.title}</h2>
      {desc ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
          {desc}
          {row.description && row.description.length > 220 ? "…" : ""}
        </p>
      ) : null}
      {scored.reasons.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {scored.reasons.slice(0, 3).map((reason) => (
            <ReasonChip key={`${reason.kind}-${reason.label}`} reason={reason} />
          ))}
        </div>
      ) : row.topics.length > 0 ? (
        <p className="mt-3 text-xs text-foreground-muted">{row.topics.join(" · ")}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-3 pt-4 text-sm font-semibold">
        {row.link ? (
          <a
            href={row.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Visit
          </a>
        ) : null}
        {row.email ? (
          <a href={`mailto:${row.email}`} className="text-primary hover:underline">
            {row.email}
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ReasonChip({ reason }: { reason: MatchReason }) {
  const styles =
    {
      goal: "border-primary/30 bg-accent-soft/40 text-midnight",
      community: "border-purple-500/30 bg-purple-50 text-purple-700",
      industry: "border-blue-500/30 bg-blue-50 text-blue-700",
      stage: "border-orange-500/30 bg-orange-50 text-orange-700",
      any: "border-border bg-background-alt text-foreground-muted",
    }[reason.kind] ?? "border-border bg-background-alt text-foreground-muted";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles}`}>
      {reason.label}
    </span>
  );
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-md border bg-white pl-3 pr-2 text-sm ${
          value ? "border-primary text-foreground" : "border-border text-foreground-muted"
        }`}
      >
        <span className="truncate">
          <span className="text-foreground-muted">{label}:</span>{" "}
          <span className="font-medium text-foreground">{value || "All"}</span>
        </span>
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div className="absolute z-40 mt-1 max-h-[60vh] w-64 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold ${
              !value ? "bg-accent-soft/30" : "hover:bg-background-alt"
            }`}
          >
            All
          </button>
          <div className="my-1 border-t border-border" />
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm ${
                value === option ? "bg-accent-soft/30 font-semibold" : "hover:bg-background-alt"
              }`}
            >
              <span className="truncate">{option}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
