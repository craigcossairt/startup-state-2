export function hasPublicMapboxToken(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const token = env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  return token.startsWith("pk.");
}

export const MAPBOX_MISSING_COPY =
  "The Utah map needs a Mapbox public token. The company list still works.";
