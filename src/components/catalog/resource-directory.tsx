"use client";

import { useMemo, useState } from "react";
import { filterResources, resourceTopics } from "@/lib/catalog/filter";
import { rankResourcesForNeedles } from "@/lib/catalog/leftover-test-case";
import type { CatalogResource } from "@/lib/catalog/types";

export function ResourceDirectory({
  resources,
  needles = [],
}: {
  resources: CatalogResource[];
  needles?: string[];
}) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const topics = useMemo(() => resourceTopics(resources), [resources]);
  const shown = useMemo(() => {
    const filtered = filterResources(resources, { q, topic });
    return rankResourcesForNeedles(filtered, needles);
  }, [resources, q, topic, needles]);

  return (
    <section className="mx-auto max-w-[1200px] space-y-6 px-6 py-12">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block flex-1 text-sm font-semibold">
          Search programs
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border px-3 text-sm font-normal"
            placeholder="SBIR, APEX, microloan"
          />
        </label>
        <p className="text-sm text-foreground-muted">
          Showing {shown.length} of {resources.length}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <TopicChip label="All topics" active={!topic} onClick={() => setTopic("")} />
        {topics.map((item) => (
          <TopicChip
            key={item}
            label={item}
            active={topic === item}
            onClick={() => setTopic(item === topic ? "" : item)}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {shown.map((row) => (
          <li key={row.id}>
            <article className="h-full rounded-xl border border-border bg-white p-5">
              <h2 className="font-display text-lg font-extrabold tracking-tight">{row.title}</h2>
              {row.description ? (
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground-muted">
                  {row.description}
                </p>
              ) : null}
              {row.topics.length > 0 ? (
                <p className="mt-3 text-xs text-foreground-muted">{row.topics.join(" · ")}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                {row.link ? (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Official site
                  </a>
                ) : null}
                {row.email ? (
                  <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                    {row.email}
                  </a>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TopicChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-midnight text-white" : "bg-background-alt text-foreground-muted"
      }`}
    >
      {label}
    </button>
  );
}
