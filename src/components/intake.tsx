"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProgressStatus } from "@/components/progress-status";
import { TypeaheadSelect } from "@/components/typeahead-select";
import { WelcomeBack } from "@/components/welcome-back";
import {
  FIXTURE_CHIPS,
  TEST_CASES_LABEL,
  INTAKE_HERO,
  INTAKE_LEAD,
  INTAKE_WHAT_THEY_DO_HINT,
  INTAKE_WHAT_THEY_DO_LABEL,
  INTAKE_WEBSITE_HINT,
  INTAKE_WEBSITE_LABEL,
} from "@/lib/copy";
import { DEFAULT_HQ_COUNTRY, DEFAULT_HQ_STATE } from "@/lib/labels";
import { COUNTRIES, US_STATES } from "@/lib/locations";
import {
  inferredMustHaves,
  locationKnownFields,
  missingMustHaves,
} from "@/lib/profile/must-haves";
import { saveProfile } from "@/lib/session-profile";
import type { CompanyProfile } from "@/lib/types/company-profile";

export function Intake() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sentence, setSentence] = useState("");
  const [country, setCountry] = useState(DEFAULT_HQ_COUNTRY);
  const [state, setState] = useState(DEFAULT_HQ_STATE);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"scrape" | "infer">("infer");

  async function onInfer(event: React.FormEvent) {
    event.preventDefault();
    const url = websiteUrl.trim();
    const notes = sentence.trim();
    if (!url && !notes) {
      setError("Add a website or describe the company.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      let founderText = notes;
      if (url) {
        setStage("scrape");
        try {
          const scraped = await fetch("/api/scrape", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ url }),
          });
          if (!scraped.ok) {
            throw new Error(await readError(scraped, "Could not read that website."));
          }
          const site = (await scraped.json()) as { text?: string; url?: string };
          const siteText = site.text?.trim() ?? "";
          if (!siteText && !notes) {
            throw new Error("That website did not return readable text.");
          }
          if (siteText) {
            founderText = notes
              ? `Founder notes:\n${notes}\n\nCompany website (${site.url ?? url}):\n${siteText}`
              : `Company website (${site.url ?? url}):\n${siteText}`;
            if (!notes) {
              setSentence(siteText.slice(0, 800));
            }
          }
        } catch (scrapeError) {
          if (!notes) throw scrapeError;
          setError(
            scrapeError instanceof Error
              ? `${scrapeError.message} Using the description you typed.`
              : "Could not read that website. Using the description you typed.",
          );
        }
      }
      setStage("infer");
      const response = await fetch("/api/infer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sentence: founderText,
          known: locationKnownFields(country, state),
        }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Infer failed"));
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
      <WelcomeBack />
      <section className="relative isolate overflow-hidden bg-midnight text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: "url(/brand/topography-tile.webp)",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[80%] bg-[radial-gradient(ellipse_at_top_left,rgba(0,162,76,0.30),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 sm:py-24">
          <p className="eyebrow !text-white/60">Opportunity Map</p>
          <h1 className="h-display mt-4 max-w-3xl text-4xl sm:text-6xl">
            {INTAKE_HERO}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">{INTAKE_LEAD}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <form onSubmit={onInfer} className="space-y-6">
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-semibold">
              {INTAKE_WEBSITE_LABEL}
            </label>
            <p className="mt-1 text-sm text-foreground-muted">
              Optional. We read the public page and fill what we can.
            </p>
            <input
              id="websiteUrl"
              type="text"
              inputMode="url"
              placeholder={INTAKE_WEBSITE_HINT}
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-base shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="sentence" className="block text-sm font-semibold">
              {INTAKE_WHAT_THEY_DO_LABEL}
            </label>
            <textarea
              id="sentence"
              rows={5}
              value={sentence}
              onChange={(event) => setSentence(event.target.value)}
              placeholder={INTAKE_WHAT_THEY_DO_HINT}
              className="mt-2 w-full rounded-lg border border-border px-4 py-3 text-base shadow-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TypeaheadSelect
              id="intake-country"
              label="Country"
              required
              options={COUNTRIES}
              value={country}
              onChange={setCountry}
            />
            <TypeaheadSelect
              id="intake-state"
              label="State"
              required
              options={US_STATES}
              value={state}
              onChange={setState}
            />
          </div>

          {busy ? (
            <ProgressStatus
              kind="intake"
              active={stage}
              message={
                stage === "scrape"
                  ? "Reading your website"
                  : "Filling the company profile"
              }
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {busy ? "Working..." : "See the Opportunity Map"}
            </button>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>

        <div className="mt-10">
          <p className="eyebrow">{TEST_CASES_LABEL}</p>
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

async function readError(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    return json.error ?? fallback;
  } catch {
    return text || fallback;
  }
}
