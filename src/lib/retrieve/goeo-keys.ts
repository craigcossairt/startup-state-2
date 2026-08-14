import type { CompanyProfile } from "@/lib/types/company-profile";
import type { GoeoKey } from "@/lib/types/opportunity";

const SBIR_SECTORS = new Set([
  "ai",
  "healthcare",
  "aerospace",
  "cybersecurity",
  "water",
  "climate",
  "environment",
]);

const WORKFORCE_USE = new Set(["hiring", "pilots", "manufacturing_scale"]);
const WORKFORCE_SECTORS = new Set(["workforce", "education", "youth", "marketplace"]);

export function fireGoeoKeys(profile: CompanyProfile): GoeoKey[] {
  const sectors = profile.sectors.value ?? [];
  const use = profile.useOfFunds.value ?? [];
  const customers = profile.customerTypes.value ?? [];
  const rd = profile.rdIntensity.value;
  const stage = profile.stage.value;

  const sbirHelp =
    rd === "core" ||
    rd === "some" ||
    use.includes("r_and_d") ||
    sectors.some((s) => SBIR_SECTORS.has(s));

  const contracting =
    sectors.includes("defense") ||
    sectors.includes("aerospace") ||
    customers.includes("b2g") ||
    customers.includes("defense");

  const stateCapital = profile.capitalNeedUsd.status === "known";

  const workforce =
    use.some((tag) => WORKFORCE_USE.has(tag)) ||
    sectors.some((s) => WORKFORCE_SECTORS.has(s));

  const marketplaceYouth =
    sectors.includes("marketplace") &&
    (sectors.includes("youth") || sectors.includes("education"));

  const counseling =
    stage === "pre_revenue" ||
    stage === "early_revenue" ||
    marketplaceYouth ||
    (!sbirHelp && !contracting);

  const trade = looksLikeExport(profile);

  const fired: GoeoKey[] = [];
  if (sbirHelp) fired.push("sbir-help");
  if (contracting) fired.push("contracting");
  if (stateCapital) fired.push("state-capital");
  if (workforce) fired.push("workforce");
  if (counseling) fired.push("counseling");
  if (trade) fired.push("trade");
  return fired;
}

function looksLikeExport(profile: CompanyProfile): boolean {
  const blob = [
    profile.whatTheyDo.value ?? "",
    ...(profile.customerTypes.value ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return /\b(export|exports|international|overseas|global market)\b/.test(blob);
}
