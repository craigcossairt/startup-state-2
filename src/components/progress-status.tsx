import type { RankProgressStage } from "@/lib/map-metrics";

const INTAKE_STAGES: { id: string; label: string }[] = [
  { id: "scrape", label: "Reading your website" },
  { id: "infer", label: "Filling the company profile" },
];

const MAP_STAGES: { id: RankProgressStage; label: string }[] = [
  { id: "retrieve", label: "Searching federal and Utah programs" },
  { id: "rank", label: "Ranking programs by fit" },
  { id: "history", label: "Attaching similar awards" },
];

export function ProgressStatus({
  kind,
  active,
  message,
}: {
  kind: "intake" | "map";
  active: string;
  message?: string;
}) {
  const stages = kind === "intake" ? INTAKE_STAGES : MAP_STAGES;
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === active),
  );

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm" role="status">
      <div className="ss2-progress-track">
        <div className="ss2-progress-bar" />
      </div>
      <p className="mt-4 text-sm font-semibold">
        {message ?? stages[activeIndex]?.label ?? "Working"}
      </p>
      <ol className="mt-3 space-y-2">
        {stages.map((stage, index) => {
          const state =
            index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";
          return (
            <li
              key={stage.id}
              className={`flex items-center gap-2 text-sm ${
                state === "pending" ? "text-foreground-muted" : "text-foreground"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  state === "done"
                    ? "bg-vibrant-green text-white"
                    : state === "active"
                      ? "bg-midnight text-white"
                      : "bg-off-white text-foreground-muted"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              {stage.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
