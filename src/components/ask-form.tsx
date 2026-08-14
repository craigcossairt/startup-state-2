"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MustHaveField } from "@/components/must-have-field";
import {
  applyMustHaveDraft,
  missingMustHaves,
  promoteFilledMustHaves,
} from "@/lib/profile/must-haves";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type { CompanyProfile, MustHaveKey } from "@/lib/types/company-profile";

export function AskForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const stored = loadStoredProfile();
    if (!stored) {
      router.replace("/");
      return;
    }
    if (missingMustHaves(stored).length === 0) {
      router.replace("/map");
      return;
    }
    setProfile(stored);
  }, [router]);

  if (!profile) return <p className="p-8">Loading...</p>;
  const missing = missingMustHaves(profile);

  function onDraft<K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) {
    setProfile((current) =>
      current ? applyMustHaveDraft(current, key, value) : current,
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    const next = promoteFilledMustHaves(profile);
    saveProfile(next);
    router.push(missingMustHaves(next).length > 0 ? "/ask" : "/map");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">A few more facts</p>
      <h1 className="h-display mt-2 text-3xl">Fill the remaining must-haves</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {missing.map((key) => (
          <MustHaveField
            key={key}
            fieldKey={key}
            profile={profile}
            onDraft={onDraft}
          />
        ))}
        <button
          type="submit"
          className="rounded-md bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white"
        >
          See the Opportunity Map
        </button>
      </form>
    </div>
  );
}
