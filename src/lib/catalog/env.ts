export function supabasePublicConfig(
  env: Record<string, string | undefined> = process.env,
): { url: string; anonKey: string } | null {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").trim();
  const anonKey = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!url.startsWith("https://") || !anonKey) return null;
  return { url, anonKey };
}
