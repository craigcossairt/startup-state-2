const POSTGRES_DSN_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const;

export function stripPostgresSslMode(dsn: string): string {
  return dsn
    .replace(/([?&])sslmode=[^&]*/i, "$1")
    .replace(/[?&]+$/, "")
    .replace(/\?&/, "?")
    .replace(/&&+/g, "&");
}

export function postgresDsnCandidates(
  env: Record<string, string | undefined> = process.env,
): string[] {
  const out: string[] = [];
  for (const key of POSTGRES_DSN_KEYS) {
    const value = (env[key] ?? "").trim();
    if (!value.startsWith("postgres")) continue;
    out.push(value);
  }
  return out;
}

export function supabasePublicConfig(
  env: Record<string, string | undefined> = process.env,
): { url: string; anonKey: string } | null {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").trim();
  const anonKey = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!url.startsWith("https://") || !anonKey) return null;
  return { url, anonKey };
}
