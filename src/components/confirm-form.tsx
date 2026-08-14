"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confirmInferredMustHaves,
  inferredMustHaves,
  missingMustHaves,
} from "@/lib/profile/must-haves";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type { CompanyProfile, MustHaveKey } from "@/lib/types/company-profile";

export function ConfirmForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const stored = loadStoredProfile();
    if (!stored) {
      router.replace("/");
      return;
    }
    if (inferredMustHaves(stored).length === 0) {
      router.replace(missingMustHaves(stored).length > 0 ? "/ask" : "/map");
      return;
    }
    setProfile(stored);
  }, [router]);

  if (!profile) return <p className="p-8">Loading...</p>;

  const fields = inferredMustHaves(profile);

  function continueToNext() {
    if (!profile) return;
    const confirmed = confirmInferredMustHaves(profile);
    saveProfile(confirmed);
    router.push(missingMustHaves(confirmed).length > 0 ? "/ask" : "/map");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Confirm</p>
      <h1 className="h-display mt-2 text-3xl">Check what we inferred</h1>
      <p className="mt-2 text-foreground-muted">
        These must-have fields came from your sentence. Edit if needed, then
        continue. Nothing is marked known until you continue.
      </p>
      <ul className="mt-8 space-y-4">
        {fields.map((key) => (
          <li key={key} className="rounded-lg border border-border p-4">
            <p className="text-sm font-bold">{labelFor(key)}</p>
            <p className="mt-1 text-sm">{formatField(profile, key)}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={continueToNext}
        className="mt-8 rounded-md bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white"
      >
        Continue
      </button>
    </div>
  );
}

function labelFor(key: MustHaveKey): string {
  return {
    whatTheyDo: "What they do",
    technologies: "Technologies",
    sectors: "Sectors",
    hqCountry: "Country",
    hqState: "State",
    employeeCount: "Employees",
    revenue: "Revenue",
    capitalRaisedUsd: "Capital raised",
    capitalNeedUsd: "Capital need",
    useOfFunds: "Use of funds",
  }[key];
}

function formatField(profile: CompanyProfile, key: MustHaveKey): string {
  const value = profile[key].value;
  return value === undefined ? "Missing" : JSON.stringify(value);
}
