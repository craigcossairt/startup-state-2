import { FIXTURE_CHIPS } from "@/lib/copy";
import type { FixtureId } from "@/lib/types/company-profile";

export function FixtureRail({ active }: { active?: FixtureId }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FIXTURE_CHIPS.map((chip) => {
        const isActive = chip.id === active;
        return (
          <a
            key={chip.id}
            href={`/map?fixture=${chip.id}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              isActive
                ? "border-midnight bg-midnight text-white"
                : "border-border bg-white hover:border-midnight"
            }`}
          >
            {chip.label}
          </a>
        );
      })}
    </div>
  );
}
