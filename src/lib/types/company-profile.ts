export type UsdAmount = number;

export type UsdRange = {
  minUsd: UsdAmount;
  maxUsd: UsdAmount;
};

export type IntRange = {
  min: number;
  max: number;
};

export type FieldStatus = "known" | "inferred" | "missing";

export type ProfileField<T> = {
  status: FieldStatus;
  value?: T;
  confidence?: number;
  note?: string;
};

export type RevenueBasis = "arr" | "annual_revenue" | "unknown";

export type CompanyStage = "pre_revenue" | "early_revenue" | "growth" | "scale";

export type RdIntensity = "none" | "some" | "core";

export type ProductMaturity = "idea" | "prototype" | "beta" | "production";

export type CustomerType =
  | "b2b"
  | "b2c"
  | "b2g"
  | "hospitals"
  | "municipalities"
  | "defense"
  | "consumers"
  | "parents"
  | "youth";

export type SectorTag =
  | "healthcare"
  | "ai"
  | "saas"
  | "aerospace"
  | "manufacturing"
  | "defense"
  | "water"
  | "climate"
  | "environment"
  | "infrastructure"
  | "cybersecurity"
  | "marketplace"
  | "education"
  | "youth"
  | "workforce";

export type UseOfFundsTag =
  | "product_development"
  | "pilots"
  | "scale_up"
  | "r_and_d"
  | "hiring"
  | "equipment"
  | "expansion"
  | "commercial_growth"
  | "manufacturing_scale";

export type FixtureId =
  | "fixture-1"
  | "fixture-2"
  | "fixture-3"
  | "fixture-4"
  | "fixture-5";

export type CompanyProfile = {
  fixtureId?: FixtureId;
  whatTheyDo: ProfileField<string>;
  technologies: ProfileField<string[]>;
  sectors: ProfileField<SectorTag[]>;
  hqCountry: ProfileField<string>;
  hqState: ProfileField<string>;
  employeeCount: ProfileField<IntRange>;
  revenue: ProfileField<{ basis: RevenueBasis; amountUsd: UsdAmount }>;
  capitalRaisedUsd: ProfileField<UsdAmount>;
  capitalNeedUsd: ProfileField<UsdRange>;
  useOfFunds: ProfileField<UseOfFundsTag[]>;
  useOfFundsNotes: ProfileField<string>;
  hqCity: ProfileField<string>;
  stage: ProfileField<CompanyStage>;
  rdIntensity: ProfileField<RdIntensity>;
  productMaturity: ProfileField<ProductMaturity>;
  customerTypes: ProfileField<CustomerType[]>;
  operatesInUtah: ProfileField<boolean>;
};

export const MUST_HAVE_KEYS = [
  "whatTheyDo",
  "technologies",
  "sectors",
  "hqCountry",
  "hqState",
  "employeeCount",
  "revenue",
  "capitalRaisedUsd",
  "capitalNeedUsd",
  "useOfFunds",
] as const;

export type MustHaveKey = (typeof MUST_HAVE_KEYS)[number];
