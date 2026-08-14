import type { CompanyProfile, ProfileField } from "@/lib/types/company-profile";

function missing<T>(): ProfileField<T> {
  return { status: "missing" };
}

export function emptyCompanyProfile(): CompanyProfile {
  return {
    whatTheyDo: missing(),
    technologies: missing(),
    sectors: missing(),
    hqCountry: missing(),
    hqState: missing(),
    employeeCount: missing(),
    revenue: missing(),
    capitalRaisedUsd: missing(),
    capitalNeedUsd: missing(),
    useOfFunds: missing(),
    useOfFundsNotes: missing(),
    hqCity: missing(),
    stage: missing(),
    rdIntensity: missing(),
    productMaturity: missing(),
    customerTypes: missing(),
    operatesInUtah: missing(),
  };
}
