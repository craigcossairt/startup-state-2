import type { RevenueBasis } from "@/lib/types/company-profile";

export function draftRevenueAmount(
  previous: { basis: RevenueBasis; amountUsd: number } | undefined,
  amount: number | undefined,
): { basis: RevenueBasis; amountUsd: number } | undefined {
  if (amount === undefined) return undefined;
  return {
    basis: previous?.basis ?? "annual_revenue",
    amountUsd: amount,
  };
}

export function formatUsdDraft(amount: number | undefined): string {
  if (amount === undefined) return "";
  return `$${amount}`;
}

export function parseUsdDraft(text: string): number | undefined {
  const digits = text.replace(/[$\s,]/g, "");
  if (!/^\d+$/.test(digits)) return undefined;
  return Number(digits);
}
