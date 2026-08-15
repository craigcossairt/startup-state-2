import Link from "next/link";

export const BONUS_CONTROLS = [
  { href: "/map/plan", label: "Plan" },
  { href: "/map/graph", label: "Graph" },
] as const;

export function BonusBar({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BONUS_CONTROLS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
            active === item.href
              ? "border-midnight bg-midnight text-white"
              : "border-border bg-white hover:border-midnight"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
