export function readMapboxPublicToken(
  env: Record<string, string | undefined> = process.env,
): string | null {
  for (const key of ["NEXT_PUBLIC_MAPBOX_TOKEN", "MAPBOX_TOKEN"] as const) {
    const token = env[key]?.trim() ?? "";
    if (token.startsWith("pk.")) return token;
  }
  return null;
}

export function hasPublicMapboxToken(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return readMapboxPublicToken(env) !== null;
}

export const MAPBOX_MISSING_COPY =
  "The Utah map needs a Mapbox public token. The company list still works.";
