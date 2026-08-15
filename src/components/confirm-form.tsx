"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MustHaveField } from "@/components/must-have-field";
import { INTAKE_LANDING_EYEBROW, INTAKE_LANDING_TITLE } from "@/lib/copy";
import {
  applyMustHaveDraft,
  confirmInferredMustHaves,
  inferredMustHaves,
  missingMustHaves,
  seedLocationDefaults,
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
    const seeded = seedLocationDefaults(stored);
    if (inferredMustHaves(seeded).length === 0) {
      router.replace(missingMustHaves(seeded).length > 0 ? "/ask" : "/map");
      return;
    }
    setProfile(seeded);
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
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "url(/brand/topography-tile.webp)",
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-14 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-bright-green">
          {INTAKE_LANDING_EYEBROW}
        </p>
        <h1 className="mt-3 font-display text-3xl font-black uppercase text-white sm:text-5xl">
          {INTAKE_LANDING_TITLE}
        </h1>
        <div className="mt-8 overflow-hidden rounded-lg bg-white text-foreground shadow-lg">
          <div className="border-b border-border px-8 py-6">
            <h2 className="font-display text-2xl font-extrabold text-midnight">
              Check this before we rank.
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground-muted">
              These must-have fields came from what you gave us. Edit if needed, then run the
              map. Nothing is marked known until you continue.
            </p>
          </div>
          <form
            className="px-8 py-6"
            onSubmit={(event) => {
              event.preventDefault();
              continueToNext();
            }}
          >
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-midnight">
              Needed before the map runs
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((key) => (
                <div key={key} className="min-w-0">
                  <MustHaveField fieldKey={key} profile={profile} onDraft={onDraft} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="rounded-full bg-vibrant-green px-7 py-3 text-base font-bold text-white hover:bg-primary-hover"
              >
                Run the Opportunity Map →
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="border-b border-platinum bg-transparent p-0 text-[13px] font-bold text-foreground-muted"
              >
                Start over
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
