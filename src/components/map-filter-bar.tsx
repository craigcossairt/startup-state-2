import Link from "next/link";
import { FIT_LABELS, GOEO_KEY_LABELS } from "@/lib/copy";
import type { FitLabel, GoeoKey } from "@/lib/types/opportunity";

const GOEO_KEYS = Object.keys(GOEO_KEY_LABELS) as GoeoKey[];
const FIT_FILTERS: FitLabel[] = [
  "likely",
  "potential-verify",
  "adjacent",
  "probably_not",
];

export function MapFilterBar({
  ranked,
  retrieved,
  lane,
  extraKeys,
  directory,
  fitFilter,
  firedKeys,
  watching,
  newCount,
  topicsOpen,
  onLane,
  onToggleKey,
  onDirectory,
  onFit,
  onWatch,
  onTopics,
}: {
  ranked: number;
  retrieved: number;
  lane: "all" | "federal" | "state";
  extraKeys: GoeoKey[];
  directory: boolean;
  fitFilter: FitLabel | "all";
  firedKeys: GoeoKey[];
  watching: boolean;
  newCount: number;
  topicsOpen: boolean;
  onLane: (lane: "all" | "federal" | "state") => void;
  onToggleKey: (key: GoeoKey) => void;
  onDirectory: () => void;
  onFit: (fit: FitLabel | "all") => void;
  onWatch: () => void;
  onTopics: () => void;
}) {
  return (
    <div className="sticky top-14 z-20 -mx-4 border-y border-white/10 bg-midnight text-white sm:-mx-6">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="eyebrow !mb-0 mr-1 !text-white/60">Filter</span>
        <span className="mr-1 text-xs font-medium text-white/85">
          <span className="text-sm font-extrabold text-white">{ranked}</span>
          <span className="text-white/55"> / {retrieved}</span>
        </span>

        {FIT_FILTERS.map((fit) => (
          <button
            key={fit}
            type="button"
            onClick={() => onFit(fitFilter === fit ? "all" : fit)}
            className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
              fitFilter === fit ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {FIT_LABELS[fit]}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onLane(lane === "federal" ? "all" : "federal")}
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
            lane === "federal" ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
          }`}
        >
          Federal
        </button>
        <button
          type="button"
          onClick={() => onLane(lane === "state" ? "all" : "state")}
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
            lane === "state" ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
          }`}
        >
          Utah
        </button>

        <button
          type="button"
          onClick={onTopics}
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
            topicsOpen || extraKeys.length > 0 || directory
              ? "bg-primary text-white"
              : "bg-white/10 text-white/80 hover:bg-white/15"
          }`}
        >
          Search topics
        </button>

        {watching ? (
          <Link
            href="/map/alerts"
            className="inline-flex h-8 items-center rounded-full bg-bright-green/20 px-3 text-xs font-semibold text-bright-green hover:bg-bright-green/30"
          >
            Watching this search
            {newCount > 0 ? ` · ${newCount} new` : ""}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onWatch}
            className="inline-flex h-8 items-center rounded-full bg-bright-green/20 px-3 text-xs font-semibold text-bright-green hover:bg-bright-green/30"
          >
            Watch this search
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/map/plan"
            className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-white/85 hover:bg-white/10"
          >
            Plan
          </Link>
          <Link
            href="/map/graph"
            className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-white/85 hover:bg-white/10"
          >
            Graph
          </Link>
        </div>
      </div>

      {topicsOpen ? (
        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
          {GOEO_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onToggleKey(key)}
              className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
                extraKeys.includes(key) || firedKeys.includes(key)
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              {GOEO_KEY_LABELS[key]}
            </button>
          ))}
          <button
            type="button"
            onClick={onDirectory}
            className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
              directory ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            directory
          </button>
        </div>
      ) : null}
    </div>
  );
}
