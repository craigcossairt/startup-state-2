"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  leftoverFixtureHref,
  LEFTOVER_FIXTURE_STORAGE_KEY,
  parseLeftoverFixtureId,
} from "@/lib/catalog/leftover-test-case";
import { FIXTURE_CHIPS, TEST_CASES_LABEL } from "@/lib/copy";

export function LeftoverTestCaseBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const active = parseLeftoverFixtureId(params.get("fixture"));

  useEffect(() => {
    if (active) {
      window.localStorage.setItem(LEFTOVER_FIXTURE_STORAGE_KEY, active);
      return;
    }
    const stored = parseLeftoverFixtureId(
      window.localStorage.getItem(LEFTOVER_FIXTURE_STORAGE_KEY),
    );
    if (stored) router.replace(leftoverFixtureHref(pathname, stored));
  }, [active, pathname, router]);

  return (
    <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <p className="eyebrow !mb-0 mr-2">{TEST_CASES_LABEL}</p>
        {FIXTURE_CHIPS.map((chip) => {
          const selected = active === chip.id;
          return (
            <Link
              key={chip.id}
              href={leftoverFixtureHref(pathname, chip.id)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                selected
                  ? "bg-midnight text-white"
                  : "border border-border bg-white text-foreground hover:border-midnight"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
