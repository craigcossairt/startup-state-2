"use client";

import type { ReactNode } from "react";
import { OpenTokenPicker } from "@/components/open-token-picker";
import { TypeaheadSelect } from "@/components/typeahead-select";
import { UsdField } from "@/components/usd-field";
import { MUST_HAVE_COPY } from "@/lib/intake/must-have-copy";
import { draftRevenueAmount } from "@/lib/intake/usd-draft";
import {
  DEFAULT_HQ_COUNTRY,
  DEFAULT_HQ_STATE,
  SECTOR_LABELS,
  USE_OF_FUNDS_LABELS,
} from "@/lib/labels";
import { COUNTRIES, US_STATES } from "@/lib/locations";
import type {
  CompanyProfile,
  MustHaveKey,
  SectorTag,
  UseOfFundsTag,
} from "@/lib/types/company-profile";

export { MUST_HAVE_LABELS } from "@/lib/intake/must-have-copy";

const SECTORS = Object.keys(SECTOR_LABELS) as SectorTag[];
const USES = Object.keys(USE_OF_FUNDS_LABELS) as UseOfFundsTag[];

export function MustHaveField({
  fieldKey,
  profile,
  onDraft,
}: {
  fieldKey: MustHaveKey;
  profile: CompanyProfile;
  onDraft: <K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) => void;
}) {
  const { label, hint } = MUST_HAVE_COPY[fieldKey];
  const hintId = `${fieldKey}-hint`;
  const ownsLabel = fieldKey === "hqCountry" || fieldKey === "hqState";

  return (
    <FieldFrame label={label} hint={hint} hintId={hintId} ownsLabel={ownsLabel} htmlFor={controlId(fieldKey)}>
      {renderControl(fieldKey, profile, onDraft, hintId)}
    </FieldFrame>
  );
}

function controlId(fieldKey: MustHaveKey): string | undefined {
  if (fieldKey === "sectors" || fieldKey === "useOfFunds") return undefined;
  return `must-have-${fieldKey}`;
}

function renderControl(
  fieldKey: MustHaveKey,
  profile: CompanyProfile,
  onDraft: <K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) => void,
  hintId: string,
): ReactNode {
  const field = profile[fieldKey];

  if (fieldKey === "whatTheyDo") {
    return (
      <input
        id={controlId(fieldKey)}
        required
        aria-describedby={hintId}
        className="w-full rounded-md border border-border px-3 py-2"
        value={typeof field.value === "string" ? field.value : ""}
        onChange={(event) => onDraft("whatTheyDo", event.target.value)}
      />
    );
  }

  if (fieldKey === "technologies") {
    return (
      <OpenTokenPicker
        id="must-have-technologies"
        required
        describedBy={hintId}
        selected={Array.isArray(field.value) ? (field.value as string[]) : []}
        onChange={(tokens) => onDraft("technologies", tokens)}
      />
    );
  }

  if (fieldKey === "sectors") {
    return (
      <ChipGroup
        describedBy={hintId}
        options={SECTORS.map((tag) => ({ value: tag, label: SECTOR_LABELS[tag] }))}
        selected={Array.isArray(field.value) ? (field.value as string[]) : []}
        onChange={(values) => onDraft("sectors", values as SectorTag[])}
      />
    );
  }

  if (fieldKey === "hqCountry") {
    return (
      <TypeaheadSelect
        id="hq-country"
        label={MUST_HAVE_COPY.hqCountry.label}
        required
        describedBy={hintId}
        options={COUNTRIES}
        value={typeof field.value === "string" ? field.value : DEFAULT_HQ_COUNTRY}
        onChange={(code) => onDraft("hqCountry", code)}
      />
    );
  }

  if (fieldKey === "hqState") {
    return (
      <TypeaheadSelect
        id="hq-state"
        label={MUST_HAVE_COPY.hqState.label}
        required
        describedBy={hintId}
        options={US_STATES}
        value={typeof field.value === "string" ? field.value : DEFAULT_HQ_STATE}
        onChange={(code) => onDraft("hqState", code)}
      />
    );
  }

  if (fieldKey === "employeeCount") {
    return (
      <input
        id={controlId(fieldKey)}
        required
        type="number"
        min={1}
        aria-describedby={hintId}
        className="w-full rounded-md border border-border px-3 py-2"
        value={
          field.value && typeof field.value === "object" && "min" in field.value
            ? String((field.value as { min: number }).min)
            : ""
        }
        onChange={(event) => {
          const n = Number(event.target.value);
          onDraft("employeeCount", { min: n, max: n });
        }}
      />
    );
  }

  if (fieldKey === "revenue") {
    const revenue = profile.revenue.value;
    return (
      <UsdField
        id="must-have-revenue"
        required
        describedBy={hintId}
        value={revenue?.amountUsd}
        onChange={(amount) => onDraft("revenue", draftRevenueAmount(revenue, amount))}
      />
    );
  }

  if (fieldKey === "capitalRaisedUsd") {
    return (
      <UsdField
        id="must-have-capitalRaisedUsd"
        required
        describedBy={hintId}
        value={typeof field.value === "number" ? field.value : undefined}
        onChange={(amount) => onDraft("capitalRaisedUsd", amount)}
      />
    );
  }

  if (fieldKey === "capitalNeedUsd") {
    const range = profile.capitalNeedUsd.value;
    return (
      <UsdField
        id="must-have-capitalNeedUsd"
        required
        describedBy={hintId}
        value={range?.minUsd}
        onChange={(amount) =>
          onDraft("capitalNeedUsd", amount === undefined ? undefined : { minUsd: amount, maxUsd: amount })
        }
      />
    );
  }

  return (
    <ChipGroup
      describedBy={hintId}
      options={USES.map((tag) => ({ value: tag, label: USE_OF_FUNDS_LABELS[tag] }))}
      selected={Array.isArray(field.value) ? (field.value as string[]) : []}
      onChange={(values) => onDraft("useOfFunds", values as UseOfFundsTag[])}
    />
  );
}

function FieldFrame({
  label,
  hint,
  hintId,
  ownsLabel,
  htmlFor,
  children,
}: {
  label: string;
  hint: string;
  hintId: string;
  ownsLabel?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="block space-y-2">
      {ownsLabel ? null : htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </label>
      ) : (
        <span className="text-sm font-semibold">{label}</span>
      )}
      {children}
      <p id={hintId} className="text-sm text-foreground-muted">
        {hint}
      </p>
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
  describedBy,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  describedBy?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-describedby={describedBy}>
      <input
        required
        tabIndex={-1}
        className="sr-only"
        value={selected.join(",")}
        onChange={() => undefined}
      />
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              active
                ? "border-vibrant-green bg-accent-soft text-midnight"
                : "border-border bg-white"
            }`}
            onClick={() =>
              onChange(
                active
                  ? selected.filter((item) => item !== option.value)
                  : [...selected, option.value],
              )
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
