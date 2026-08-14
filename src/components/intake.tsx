"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FIXTURE_CHIPS, INTAKE_HERO } from "@/lib/copy";
import { inferredMustHaves, missingMustHaves } from "@/lib/profile/must-haves";
import { saveProfile } from "@/lib/session-profile";
import type { CompanyProfile } from "@/lib/types/company-profile";

export function Intake() {
  const router = useRouter();
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onInfer(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/infer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sentence }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const profile = (await response.json()) as CompanyProfile;
      saveProfile(profile);
      if (inferredMustHaves(profile).length > 0) {
        router.push("/confirm");
        return;
      }
      if (missingMustHaves(profile).length > 0) {
        router.push("/ask");
        return;
      }
      router.push("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Infer failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <section className="bg-midnight text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="eyebrow text-bright-green">Opportunity Map</p>
          <h1 className="h-display mt-4 max-w-3xl text-4xl sm:text-6xl">
            {INTAKE_HERO}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-platinum">
            One sentence, or pick a fixture. We rank retrieved federal and Utah
            programs by fit. This is not a determination that you can apply.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <form onSubmit={onInfer} className="space-y-4">
          <label htmlFor="sentence" className="block text-sm font-semibold">
            In one sentence, what does the company do?
          </label>
          <textarea
            id="sentence"
            required
            rows={3}
            value={sentence}
            onChange={(event) => setSentence(event.target.value)}
            placeholder="We build AI tools that cut paperwork for hospital nurses."
            className="w-full rounded-lg border border-border px-4 py-3 text-base shadow-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? "Reading that sentence..." : "See the Opportunity Map"}
          </button>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>

        <div className="mt-10">
          <p className="eyebrow">Official fixtures</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FIXTURE_CHIPS.map((chip) => (
              <a
                key={chip.id}
                href={`/map?fixture=${chip.id}`}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-midnight hover:bg-off-white"
              >
                {chip.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
