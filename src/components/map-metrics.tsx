import { formatUsdCompact, type MapMetrics } from "@/lib/map-metrics";
import { NOT_PUBLISHED } from "@/lib/copy";

export function MapMetrics({ metrics }: { metrics: MapMetrics }) {
  const items = [
    { label: "Programs found", value: String(metrics.retrieved) },
    { label: "Ranked for you", value: String(metrics.ranked) },
    {
      label: "Federal / Utah",
      value: `${metrics.federal} / ${metrics.utah}`,
    },
    { label: "Likely fits", value: String(metrics.likely) },
    {
      label: "Published funding",
      value:
        metrics.publishedMaxUsd == null
          ? NOT_PUBLISHED
          : formatUsdCompact(metrics.publishedMaxUsd),
    },
    {
      label: "Deadlines in 90 days",
      value: String(metrics.deadlinesWithin90Days),
    },
  ];

  return (
    <section className="mt-8" aria-label="Opportunity metrics">
      <p className="eyebrow mb-3">At a glance</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm"
          >
            <p className="eyebrow">{item.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
