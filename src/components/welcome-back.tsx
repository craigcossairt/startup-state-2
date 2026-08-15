"use client";

import { useSyncExternalStore } from "react";
import { restoreLastCompanyProfile } from "@/lib/bonus/welcome-back";
import { inferredMustHaves, missingMustHaves } from "@/lib/profile/must-haves";
import { WELCOME_BACK_ACTION, WELCOME_BACK_BANNER } from "@/lib/copy";

function emptySubscribe() {
  return () => undefined;
}

export function welcomeBackHref(): string | null {
  const profile = restoreLastCompanyProfile(sessionStorage);
  if (!profile) return null;
  if (inferredMustHaves(profile).length > 0) return "/confirm";
  if (missingMustHaves(profile).length > 0) return "/ask";
  return "/map";
}

export function WelcomeBack() {
  const href = useSyncExternalStore(emptySubscribe, welcomeBackHref, () => null);
  if (!href) return null;

  return (
    <div className="relative z-20 border-b border-primary/30 bg-primary text-white">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-3 px-6 text-sm">
        <span className="font-medium">{WELCOME_BACK_BANNER}</span>
        <a
          href={href}
          className="ml-auto inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline"
        >
          {WELCOME_BACK_ACTION}
        </a>
      </div>
    </div>
  );
}
