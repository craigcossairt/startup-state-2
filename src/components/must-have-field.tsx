"use client";

import { TypeaheadSelect } from "@/components/typeahead-select";
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

const SECTORS = Object.keys(SECTOR_LABELS) as SectorTag[];
const USES = Object.keys(USE_OF_FUNDS_LABELS) as UseOfFundsTag[];

export const MUST_HAVE_LABELS: Record<MustHaveKey, string> = {
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
};

export function MustHaveField({
  fieldKey,
  profile,
  onDraft,
}: {
  fieldKey: MustHaveKey;
  profile: CompanyProfile;
  onDraft: <K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) => void;
}) {
  const label = MUST_HAVE_LABELS[fieldKey];
  const field = profile[fieldKey];

  return (
    <div className="block space-y-2">
      {fieldKey !== "hqCountry" && fieldKey !== "hqState" ? (
        <span className="text-sm font-semibold">{label}</span>
      ) : null}
      {fieldKey === "whatTheyDo" ? (
        <input
          required
          className="w-full rounded-md border border-border px-3 py-2"
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(event) => onDraft("whatTheyDo", event.target.value)}
        />
      ) : null}
      {fieldKey === "technologies" ? (
        <input
          required
          className="w-full rounded-md border border-border px-3 py-2"
          value={Array.isArray(field.value) ? (field.value as string[]).join(", ") : ""}
          onChange={(event) =>
            onDraft(
              "technologies",
              event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
            )
          }
        />
      ) : null}
      {fieldKey === "sectors" ? (
        <ChipGroup
          options={SECTORS.map((tag) => ({ value: tag, label: SECTOR_LABELS[tag] }))}
          selected={Array.isArray(field.value) ? (field.value as string[]) : []}
          onChange={(values) => onDraft("sectors", values as SectorTag[])}
        />
      ) : null}
      {fieldKey === "hqCountry" ? (
        <TypeaheadSelect
          id="hq-country"
          label={label}
          required
          options={COUNTRIES}
          value={typeof field.value === "string" ? field.value : DEFAULT_HQ_COUNTRY}
          onChange={(code) => onDraft("hqCountry", code)}
        />
      ) : null}
      {fieldKey === "hqState" ? (
        <TypeaheadSelect
          id="hq-state"
          label={label}
          required
          options={US_STATES}
          value={typeof field.value === "string" ? field.value : DEFAULT_HQ_STATE}
          onChange={(code) => onDraft("hqState", code)}
        />
      ) : null}
      {fieldKey === "employeeCount" ? (
        <input
          required
          type="number"
          min={1}
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
      ) : null}
      {fieldKey === "revenue" ? (
        <input
          required
          type="number"
          min={0}
          className="w-full rounded-md border border-border px-3 py-2"
          value={
            field.value && typeof field.value === "object" && "amountUsd" in field.value
              ? String((field.value as { amountUsd: number }).amountUsd)
              : ""
          }
          onChange={(event) =>
            onDraft("revenue", {
              basis: "annual_revenue",
              amountUsd: Number(event.target.value),
            })
          }
        />
      ) : null}
      {fieldKey === "capitalRaisedUsd" ? (
        <input
          required
          type="number"
          min={0}
          className="w-full rounded-md border border-border px-3 py-2"
          value={typeof field.value === "number" ? String(field.value) : ""}
          onChange={(event) => onDraft("capitalRaisedUsd", Number(event.target.value))}
        />
      ) : null}
      {fieldKey === "capitalNeedUsd" ? (
        <input
          required
          type="number"
          min={0}
          className="w-full rounded-md border border-border px-3 py-2"
          value={
            field.value && typeof field.value === "object" && "minUsd" in field.value
              ? String((field.value as { minUsd: number }).minUsd)
              : ""
          }
          onChange={(event) => {
            const n = Number(event.target.value);
            onDraft("capitalNeedUsd", { minUsd: n, maxUsd: n });
          }}
        />
      ) : null}
      {fieldKey === "useOfFunds" ? (
        <ChipGroup
          options={USES.map((tag) => ({ value: tag, label: USE_OF_FUNDS_LABELS[tag] }))}
          selected={Array.isArray(field.value) ? (field.value as string[]) : []}
          onChange={(values) => onDraft("useOfFunds", values as UseOfFundsTag[])}
        />
      ) : null}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
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
