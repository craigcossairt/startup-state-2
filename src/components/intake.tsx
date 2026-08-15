"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { PlaybookStageGrid } from "@/components/catalog/playbook-stage-grid";
import { ProgressStatus } from "@/components/progress-status";
import { WelcomeBack } from "@/components/welcome-back";
import {
  FIXTURE_CHIPS,
  INTAKE_CTA,
  INTAKE_HERO,
  INTAKE_LANDING_EYEBROW,
  INTAKE_LANDING_LEAD,
  INTAKE_LANDING_TITLE,
  INTAKE_LEAD,
  INTAKE_ROLE_FOUNDER,
  INTAKE_ROLE_INVESTOR,
  INTAKE_ROLE_WORK,
  INTAKE_SHAPE_HINT,
  INTAKE_TEST_CASES_OR,
  TEST_CASES_LABEL,
  INTAKE_WHAT_THEY_DO_HINT,
  INTAKE_WHAT_THEY_DO_LABEL,
  INTAKE_WEBSITE_HELP,
  INTAKE_WEBSITE_HINT,
  INTAKE_WEBSITE_LABEL,
  JOURNEY_EYEBROW,
  JOURNEY_LEAD,
  JOURNEY_TITLE,
} from "@/lib/copy";
import { DEFAULT_HQ_COUNTRY, DEFAULT_HQ_STATE } from "@/lib/labels";
import {
  inferredMustHaves,
  locationKnownFields,
  missingMustHaves,
} from "@/lib/profile/must-haves";
import { saveProfile } from "@/lib/session-profile";
import type { CompanyProfile } from "@/lib/types/company-profile";

type Role = "founder" | "investor" | "work";

export function Intake({
  counts,
}: {
  counts: { resources: number; startups: number; hiring: number };
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("founder");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"scrape" | "infer">("infer");
  const country = DEFAULT_HQ_COUNTRY;
  const state = DEFAULT_HQ_STATE;
  const canSubmit = websiteUrl.trim().length > 0 || sentence.trim().length > 0;

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
    <div className="bg-off-white">
      <WelcomeBack />
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_78%_-10%,rgba(19,223,129,0.10),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-[1320px] px-6 py-14 sm:px-8 sm:py-16">
          <div className="mb-9 max-w-[820px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-bright-green">
              {INTAKE_LANDING_EYEBROW}
            </p>
            <h1 className="mt-[18px] font-display text-4xl font-black uppercase leading-[1.05] tracking-[-0.01em] sm:text-[60px]">
              {INTAKE_LANDING_TITLE}
            </h1>
            <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-platinum">
              {INTAKE_LANDING_LEAD}
            </p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(150px,300px)] lg:gap-14">
            <div>
              <div className="flex flex-wrap gap-1.5">
                <RoleTab
                  label={INTAKE_ROLE_FOUNDER}
                  active={role === "founder"}
                  onClick={() => setRole("founder")}
                />
                <RoleTab
                  label={INTAKE_ROLE_INVESTOR}
                  active={role === "investor"}
                  onClick={() => setRole("investor")}
                />
                <RoleTab
                  label={INTAKE_ROLE_WORK}
                  active={role === "work"}
                  onClick={() => setRole("work")}
                />
              </div>

              <div className="overflow-hidden rounded-b-lg rounded-tr-lg bg-white text-foreground shadow-lg">
                {role === "investor" ? (
                  <AltCard
                    title="See who is building here."
                    body={`${counts.startups} Utah companies on the map, with sector, stage, and location. Investors use it to find the ones worth a call.`}
                    primary={{ href: "/startups", label: "Open the Startups map" }}
                    secondary={{ href: "https://cdn.forms-content.sg-form.com/06b418c5-1057-11ee-9a80-ca5180dad175", label: "Subscribe to the newsletter" }}
                  />
                ) : null}
                {role === "work" ? (
                  <AltCard
                    title="Find a job at a Utah startup."
                    body={`${counts.hiring} companies on the map are hiring right now. Roles link straight to the company's own posting.`}
                    primary={{ href: "/careers", label: "See who is hiring" }}
                    secondary={{ href: "/startups", label: "Browse by community" }}
                  />
                ) : null}
                {role === "founder" ? (
                  <form onSubmit={onInfer} className="px-8 py-8">
                    <h2 className="font-display text-[26px] font-extrabold leading-tight text-midnight">
                      {INTAKE_HERO}
                    </h2>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-foreground-muted">
                      {INTAKE_LEAD}
                    </p>

                    {busy ? (
                      <div className="mt-6">
                        <ProgressStatus
                          kind="intake"
                          active={stage}
                          message={
                            stage === "scrape"
                              ? "Reading your website"
                              : "Filling the company profile"
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <label className="mt-6 block" htmlFor="websiteUrl">
                          <span className="block text-sm font-bold text-midnight">
                            {INTAKE_WEBSITE_LABEL}
                          </span>
                          <span className="mt-1 block text-[13px] text-foreground-muted">
                            {INTAKE_WEBSITE_HELP}
                          </span>
                          <span className="mt-2 flex gap-2">
                            <input
                              id="websiteUrl"
                              type="text"
                              inputMode="url"
                              placeholder={INTAKE_WEBSITE_HINT}
                              value={websiteUrl}
                              onChange={(event) => setWebsiteUrl(event.target.value)}
                              className="min-w-0 flex-1 rounded-md border border-platinum px-3 py-2.5 text-[15px] text-midnight"
                            />
                            <button
                              type="submit"
                              className={`whitespace-nowrap rounded-md border px-4 py-2.5 text-sm font-bold ${
                                websiteUrl.trim()
                                  ? "border-midnight text-midnight"
                                  : "border-border text-[#9aa0a8]"
                              }`}
                            >
                              Read my site
                            </button>
                          </span>
                        </label>

                        <label className="mt-6 block" htmlFor="sentence">
                          <span className="mb-2 block text-sm font-bold text-midnight">
                            {INTAKE_WHAT_THEY_DO_LABEL}
                          </span>
                          <textarea
                            id="sentence"
                            rows={6}
                            value={sentence}
                            onChange={(event) => setSentence(event.target.value)}
                            placeholder={INTAKE_WHAT_THEY_DO_HINT}
                            className="w-full resize-y rounded-md border border-platinum px-3 py-3 text-[15px] leading-relaxed text-midnight"
                          />
                        </label>
                        <p className="mt-2 text-[13px] leading-relaxed text-foreground-muted">
                          {INTAKE_SHAPE_HINT}
                        </p>

                        <button
                          type="submit"
                          disabled={!canSubmit}
                          className={`mt-6 w-full rounded-full py-3 text-base font-bold ${
                            canSubmit
                              ? "bg-vibrant-green text-white hover:bg-primary-hover"
                              : "cursor-not-allowed bg-background-alt text-[#9aa0a8]"
                          }`}
                        >
                          {INTAKE_CTA} →
                        </button>
                      </>
                    )}
                    {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

                    <div className="mt-7 border-t border-border pt-4" aria-label={TEST_CASES_LABEL}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        {INTAKE_TEST_CASES_OR}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {FIXTURE_CHIPS.map((chip) => (
                          <a
                            key={chip.id}
                            href={`/map?fixture=${chip.id}`}
                            className="rounded-full border border-platinum bg-white px-3.5 py-1.5 text-[13px] font-semibold text-midnight hover:border-midnight"
                          >
                            {chip.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-[22px] pt-2">
              <Stat label="Resources" value={counts.resources} />
              <Stat label="Startups" value={counts.startups} />
              <Stat label="Currently hiring" value={counts.hiring} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-14 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            {JOURNEY_EYEBROW}
          </p>
          <h2 className="mt-3.5 max-w-[640px] font-display text-[34px] font-extrabold leading-tight text-midnight">
            {JOURNEY_TITLE}
          </h2>
          <p className="mt-3 max-w-[620px] text-base leading-relaxed text-foreground-muted">
            {JOURNEY_LEAD}
          </p>
          <div className="mt-10">
            <Suspense fallback={null}>
              <PlaybookStageGrid />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-t-lg px-[22px] py-3 text-[15px] ${
        active
          ? "bg-white font-extrabold text-midnight"
          : "bg-white/10 font-semibold text-platinum hover:bg-white/15"
      }`}
    >
      {label}
    </button>
  );
}

function AltCard({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <div className="px-8 py-8">
      <h2 className="font-display text-[26px] font-extrabold leading-tight text-midnight">
        {title}
      </h2>
      <p className="mt-2.5 max-w-[560px] text-[15px] leading-relaxed text-foreground-muted">
        {body}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={primary.href}
          className="inline-flex rounded-full bg-vibrant-green px-6 py-3 text-[15px] font-bold text-white hover:bg-primary-hover"
        >
          {primary.label} →
        </Link>
        <Link
          href={secondary.href}
          className="inline-flex rounded-full border border-platinum bg-white px-6 py-3 text-[15px] font-semibold text-midnight"
        >
          {secondary.label}
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b93a0]">{label}</p>
      <p className="font-display text-[34px] font-extrabold text-white">{value}</p>
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
