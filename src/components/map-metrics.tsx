import { formatUsdCompact, type MapMetrics } from "@/lib/map-metrics";
import { NOT_PUBLISHED } from "@/lib/copy";

export function MapMetrics({ metrics }: { metrics: MapMetrics }) {
  const items = [
    { label: "official ids retrieved", value: String(metrics.retrieved) },
    { label: "ranked", value: String(metrics.ranked) },
    { label: "Federal / Utah", value: `${metrics.federal} / ${metrics.utah}` },
    { label: "likely", value: String(metrics.likely) },
    { label: "potential-verify", value: String(metrics.potentialVerify) },
    { label: "adjacent", value: String(metrics.adjacent) },
    { label: "probably not", value: String(metrics.probablyNot) },
    {
      label: "published funding",
      value:
        metrics.publishedMaxUsd == null
          ? NOT_PUBLISHED
          : formatUsdCompact(metrics.publishedMaxUsd),
    },
    { label: "deadlines in 90 days", value: String(metrics.deadlinesWithin90Days) },
  ];

  return (
    <section
      className="border-b border-border bg-white"
      aria-label="Opportunity metrics"
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-7 px-6 py-3.5 sm:px-8">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-2 py-1">
            <span className="font-display text-base font-extrabold text-midnight">
              {item.value}
            </span>
            <span className="text-[13px] text-foreground-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
