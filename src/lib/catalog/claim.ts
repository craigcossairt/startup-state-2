import { FOOTER_EMAIL } from "@/lib/copy";
import type { CatalogStartup } from "./types";

export const CLAIM_MAIL_UNAVAILABLE = `Your email matches this listing. A sign-in link is not available yet. Email ${FOOTER_EMAIL} to finish the claim with GOED.`;

export function websiteDomain(website: string | null | undefined): string | null {
  if (!website?.trim()) return null;
  try {
    const host = new URL(website.includes("://") ? website : `https://${website}`).hostname
      .replace(/^www\./i, "")
      .toLowerCase();
    return host || null;
  } catch {
    return null;
  }
}

export type ClaimEvaluation =
  | { ok: true; domain: string }
  | { ok: false; error: string };

export function evaluateClaim(input: {
  website: string | null | undefined;
  email: string;
  name: string;
}): ClaimEvaluation {
  const domain = websiteDomain(input.website);
  if (!domain) {
    return {
      ok: false,
      error:
        "This listing has no website on file. We can't verify ownership by email domain. Reach out to GOED directly.",
    };
  }
  const email = input.email.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  const emailDomain = at >= 0 ? email.slice(at + 1) : "";
  if (emailDomain !== domain) {
    return {
      ok: false,
      error: `Your email must be at @${domain} to verify ownership of ${input.name}.`,
    };
  }
  return { ok: true, domain };
}

export function findCatalogStartup(
  rows: CatalogStartup[],
  id: string,
): CatalogStartup | null {
  return rows.find((row) => row.id === id || row.slug === id) ?? null;
}

export type ClaimSubmitResult =
  | { ok: true; domain: string; mailed: false; message: string }
  | { ok: false; error: string; status: 400 | 404 };

export function submitClaimRequest(input: {
  startups: CatalogStartup[];
  startupId: string;
  email: string;
}): ClaimSubmitResult {
  const startup = findCatalogStartup(input.startups, input.startupId);
  if (!startup) return { ok: false, error: "Startup not found", status: 404 };
  const result = evaluateClaim({
    website: startup.website,
    email: input.email,
    name: startup.name,
  });
  if (!result.ok) return { ok: false, error: result.error, status: 400 };
  return {
    ok: true,
    domain: result.domain,
    mailed: false,
    message: CLAIM_MAIL_UNAVAILABLE,
  };
}
