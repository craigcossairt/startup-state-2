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
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
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
        <select
          multiple
          required
          className="w-full rounded-md border border-border px-3 py-2"
          value={Array.isArray(field.value) ? (field.value as string[]) : []}
          onChange={(event) =>
            onDraft(
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
      ) : null}
      {fieldKey === "hqCountry" ? (
        <input
          required
          className="w-full rounded-md border border-border px-3 py-2"
          value={typeof field.value === "string" ? field.value : "US"}
          onChange={(event) => onDraft("hqCountry", event.target.value)}
        />
      ) : null}
      {fieldKey === "hqState" ? (
        <input
          required
          maxLength={2}
          className="w-full rounded-md border border-border px-3 py-2 uppercase"
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(event) => onDraft("hqState", event.target.value.toUpperCase())}
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
        <select
          multiple
          required
          className="w-full rounded-md border border-border px-3 py-2"
          value={Array.isArray(field.value) ? (field.value as string[]) : []}
          onChange={(event) =>
            onDraft(
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
      ) : null}
    </label>
  );
}
