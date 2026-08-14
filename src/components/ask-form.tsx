"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { missingMustHaves } from "@/lib/profile/must-haves";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type {
  CompanyProfile,
  MustHaveKey,
  SectorTag,
  UseOfFundsTag,
} from "@/lib/types/company-profile";

const SECTORS: SectorTag[] = [
  "healthcare",
  "ai",
  "saas",
  "aerospace",
  "manufacturing",
  "defense",
  "water",
  "climate",
  "environment",
  "infrastructure",
  "cybersecurity",
  "marketplace",
  "education",
  "youth",
  "workforce",
];

const USES: UseOfFundsTag[] = [
  "product_development",
  "pilots",
  "scale_up",
  "r_and_d",
  "hiring",
  "equipment",
  "expansion",
  "commercial_growth",
  "manufacturing_scale",
];

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

  function setKnown<K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) {
    setProfile((current) =>
      current
        ? {
            ...current,
            [key]: { status: "known", value },
          }
        : current,
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    saveProfile(profile);
    router.push("/map");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">A few more facts</p>
      <h1 className="h-display mt-2 text-3xl">Fill the remaining must-haves</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {missing.includes("whatTheyDo") ? (
          <Field label="What they do">
            <input
              required
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) => setKnown("whatTheyDo", event.target.value)}
            />
          </Field>
        ) : null}
        {missing.includes("technologies") ? (
          <Field label="Technologies (comma separated)">
            <input
              required
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) =>
                setKnown(
                  "technologies",
                  event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                )
              }
            />
          </Field>
        ) : null}
        {missing.includes("sectors") ? (
          <Field label="Sectors">
            <select
              multiple
              required
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) =>
                setKnown(
                  "sectors",
                  Array.from(event.target.selectedOptions).map(
                    (option) => option.value as SectorTag,
                  ),
                )
              }
            >
              {SECTORS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        {missing.includes("hqCountry") ? (
          <Field label="Country">
            <input
              required
              defaultValue="US"
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) => setKnown("hqCountry", event.target.value)}
            />
          </Field>
        ) : null}
        {missing.includes("hqState") ? (
          <Field label="State (two letters)">
            <input
              required
              maxLength={2}
              className="w-full rounded-md border border-border px-3 py-2 uppercase"
              onChange={(event) => setKnown("hqState", event.target.value.toUpperCase())}
            />
          </Field>
        ) : null}
        {missing.includes("employeeCount") ? (
          <Field label="Employees">
            <input
              required
              type="number"
              min={1}
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) => {
                const n = Number(event.target.value);
                setKnown("employeeCount", { min: n, max: n });
              }}
            />
          </Field>
        ) : null}
        {missing.includes("revenue") ? (
          <Field label="Annual revenue (USD)">
            <input
              required
              type="number"
              min={0}
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) =>
                setKnown("revenue", {
                  basis: "annual_revenue",
                  amountUsd: Number(event.target.value),
                })
              }
            />
          </Field>
        ) : null}
        {missing.includes("capitalRaisedUsd") ? (
          <Field label="Capital raised (equity + convertibles)">
            <input
              required
              type="number"
              min={0}
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) => setKnown("capitalRaisedUsd", Number(event.target.value))}
            />
          </Field>
        ) : null}
        {missing.includes("capitalNeedUsd") ? (
          <Field label="Capital need (USD)">
            <input
              required
              type="number"
              min={0}
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) => {
                const n = Number(event.target.value);
                setKnown("capitalNeedUsd", { minUsd: n, maxUsd: n });
              }}
            />
          </Field>
        ) : null}
        {missing.includes("useOfFunds") ? (
          <Field label="Use of funds">
            <select
              multiple
              required
              className="w-full rounded-md border border-border px-3 py-2"
              onChange={(event) =>
                setKnown(
                  "useOfFunds",
                  Array.from(event.target.selectedOptions).map(
                    (option) => option.value as UseOfFundsTag,
                  ),
                )
              }
            >
              {USES.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
