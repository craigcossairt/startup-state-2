import {
  DIRECTORY_HELP,
  DIRECTORY_LABEL,
  FIT_HEADING,
  FIT_HELP,
  FIT_LABELS,
  GOEO_KEY_LABELS,
  RETRIEVE_HEADING,
  RETRIEVE_HELP,
} from "@/lib/copy";
import type { FitLabel, GoeoKey } from "@/lib/types/opportunity";

const GOEO_KEYS = Object.keys(GOEO_KEY_LABELS) as GoeoKey[];
const FIT_FILTERS: FitLabel[] = [
  "likely",
  "potential-verify",
  "adjacent",
  "probably_not",
];

const FIT_DOT: Record<FitLabel, string> = {
  likely: "bg-vibrant-green",
  "potential-verify": "bg-[#ffad00]",
  adjacent: "bg-platinum",
  probably_not: "border border-platinum bg-white",
};

export function MapFilterBar({
  lane,
  extraKeys,
  directory,
  fits,
  firedKeys,
  dirty,
  busy,
  onLane,
  onToggleKey,
  onDirectory,
  onToggleFit,
  onRerank,
}: {
  lane: "all" | "federal" | "state";
  extraKeys: GoeoKey[];
  directory: boolean;
  fits: Record<FitLabel, boolean>;
  firedKeys: GoeoKey[];
  dirty: boolean;
  busy: boolean;
  onLane: (lane: "all" | "federal" | "state") => void;
  onToggleKey: (key: GoeoKey) => void;
  onDirectory: () => void;
  onToggleFit: (fit: FitLabel) => void;
  onRerank: () => void;
}) {
  const lanes = [
    { id: "all" as const, label: "Federal and Utah" },
    { id: "federal" as const, label: "Federal only" },
    { id: "state" as const, label: "Utah only" },
  ];

  return (
    <aside className="sticky top-6 max-h-[calc(100vh-48px)] space-y-4 overflow-y-auto">
      <div className="rounded border border-border bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight">
          {RETRIEVE_HEADING}
        </p>
        <p className="mt-1.5 mb-4 text-xs leading-snug text-foreground-muted">
          {RETRIEVE_HELP}
        </p>

        <p className="mb-2 text-xs font-bold text-foreground">Lane</p>
        <div className="mb-5 flex flex-col gap-1.5">
          {lanes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLane(item.id)}
              className={`rounded px-3 py-2 text-left text-[13px] text-midnight ${
                lane === item.id
                  ? "border border-midnight bg-background-alt font-bold"
                  : "border border-border bg-white font-normal"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-bold text-foreground">Utah topics</p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {GOEO_KEYS.map((key) => {
            const on = extraKeys.includes(key) || firedKeys.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleKey(key)}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  extraKeys.includes(key)
                    ? "border border-vibrant-green bg-[#f0fbf3] font-bold text-[#00713a]"
                    : on
                      ? "border border-vibrant-green/40 bg-white font-semibold text-[#00713a]"
                      : "border border-border bg-white font-normal text-foreground-muted"
                }`}
              >
                {GOEO_KEY_LABELS[key]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onDirectory}
          className="mb-4 flex w-full items-start gap-2.5 bg-transparent p-0 text-left text-xs text-foreground"
        >
          <span
            className={`mt-0.5 inline-block h-4 w-4 shrink-0 rounded-[3px] border ${
              directory ? "border-midnight bg-midnight" : "border-platinum bg-white"
            }`}
          />
          <span className="leading-snug">
            <span className="font-bold">{DIRECTORY_LABEL}</span>
            <br />
            <span className="text-[11px] text-foreground-muted">{DIRECTORY_HELP}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onRerank}
          disabled={busy}
          className={`w-full rounded-full py-2.5 text-sm font-bold ${
            dirty && !busy
              ? "bg-vibrant-green text-white"
              : "bg-background-alt text-foreground-muted"
          }`}
        >
          {busy ? "Running" : dirty ? "Update ranking" : "Rank again"}
        </button>
      </div>

      <div className="rounded border border-border bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight">
          {FIT_HEADING}
        </p>
        <p className="mt-1.5 mb-3.5 text-xs leading-snug text-foreground-muted">{FIT_HELP}</p>
        <div className="flex flex-col gap-0.5">
          {FIT_FILTERS.map((fit) => {
            const on = fits[fit];
            return (
              <button
                key={fit}
                type="button"
                onClick={() => onToggleFit(fit)}
                className="flex items-center gap-2.5 bg-transparent py-1.5 text-left text-sm text-foreground"
              >
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border text-[11px] font-bold text-white ${
                    on ? "border-midnight bg-midnight" : "border-platinum bg-white"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${FIT_DOT[fit]}`} />
                <span>{FIT_LABELS[fit]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
