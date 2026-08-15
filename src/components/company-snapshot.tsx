"use client";

import { useState } from "react";
import { MustHaveField, MUST_HAVE_LABELS } from "@/components/must-have-field";
import { similarCompaniesFromCards } from "@/lib/bonus/similar-companies";
import { SECTOR_LABELS, USE_OF_FUNDS_LABELS } from "@/lib/labels";
import { formatUsdCompact } from "@/lib/map-metrics";
import { applyMustHaveDraft } from "@/lib/profile/must-haves";
import { MUST_HAVE_KEYS, type CompanyProfile, type MustHaveKey } from "@/lib/types/company-profile";
import type { RankedCard } from "@/lib/types/opportunity";

export function CompanySnapshot({
  profile,
  cards,
  onSave,
}: {
  profile: CompanyProfile;
  cards: RankedCard[];
  onSave: (next: CompanyProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const similar = similarCompaniesFromCards(cards);

  function onDraft<K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) {
    setDraft((current) => applyMustHaveDraft(current, key, value));
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Company used for this map</p>
          <h2 className="mt-1 font-display text-xl font-extrabold">
            {profile.whatTheyDo.value ?? "Company profile"}
          </h2>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold"
              onClick={() => {
                setDraft(profile);
                setEditing(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-midnight px-3 py-1.5 text-sm font-bold text-white"
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
            >
              Update search
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-md border border-midnight px-3 py-1.5 text-sm font-semibold"
            onClick={() => {
              setDraft(profile);
              setEditing(true);
            }}
          >
            Edit profile
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {MUST_HAVE_KEYS.map((key) => (
            <MustHaveField key={key} fieldKey={key} profile={draft} onDraft={onDraft} />
          ))}
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {MUST_HAVE_KEYS.filter((key) => key !== "whatTheyDo").map((key) => (
            <div key={key}>
              <dt className="eyebrow">{MUST_HAVE_LABELS[key]}</dt>
              <dd className="mt-1">{formatField(profile, key)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="eyebrow">Similar companies</p>
        {similar.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">
            None attached. Names only appear when USAspending or SBIR history joined a card.
          </p>
        ) : (
          <ul className="mt-2 columns-1 gap-x-6 text-sm sm:columns-2">
            {similar.map((row) => (
              <li key={`${row.source}:${row.name}:${row.year ?? ""}`} className="break-inside-avoid py-1">
                {row.name}
                {row.state ? ` (${row.state})` : ""}
                {row.year ? ` · ${row.year}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatField(profile: CompanyProfile, key: MustHaveKey): string {
  const field = profile[key];
  const value = field.value;
  if (value == null) return "Not set";
  if (key === "technologies" && Array.isArray(value)) return value.join(", ");
  if (key === "sectors" && Array.isArray(value)) {
    return value.map((tag) => SECTOR_LABELS[tag as keyof typeof SECTOR_LABELS] ?? String(tag)).join(", ");
  }
  if (key === "useOfFunds" && Array.isArray(value)) {
    return value
      .map((tag) => USE_OF_FUNDS_LABELS[tag as keyof typeof USE_OF_FUNDS_LABELS] ?? String(tag))
      .join(", ");
  }
  if (key === "employeeCount" && typeof value === "object" && "min" in value) {
    return String(value.min);
  }
  if (key === "revenue" && typeof value === "object" && "amountUsd" in value) {
    return formatUsdCompact(value.amountUsd);
  }
  if (key === "capitalRaisedUsd" && typeof value === "number") {
    return formatUsdCompact(value);
  }
  if (key === "capitalNeedUsd" && typeof value === "object" && "minUsd" in value) {
    return `${formatUsdCompact(value.minUsd)} to ${formatUsdCompact(value.maxUsd)}`;
  }
  return String(value);
}
