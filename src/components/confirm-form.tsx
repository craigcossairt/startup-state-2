"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MustHaveField } from "@/components/must-have-field";
import {
  applyMustHaveDraft,
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

  function onDraft<K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) {
    setProfile((current) =>
      current ? applyMustHaveDraft(current, key, value) : current,
    );
  }

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
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          continueToNext();
        }}
      >
        {fields.map((key) => (
          <div key={key} className="rounded-lg border border-border p-4">
            <MustHaveField fieldKey={key} profile={profile} onDraft={onDraft} />
          </div>
        ))}
        <button
          type="submit"
          className="mt-4 rounded-md bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
