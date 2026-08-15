import { readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import { supabasePublicConfig } from "./env";
import { parseResourceList, parseStartupList } from "./parse";
import type { CatalogResource, CatalogStartup } from "./types";

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(dataPath(rel), "utf8"));
}

async function fetchSupabaseTable(table: "resources" | "startups"): Promise<unknown[] | null> {
  const config = supabasePublicConfig();
  if (!config) return null;
  const url = `${config.url}/rest/v1/${table}?select=*&order=${table === "resources" ? "title" : "name"}`;
  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return Array.isArray(body) && body.length > 0 ? body : null;
  } catch {
    return null;
  }
}

export function applyCommittedHiringFlags(
  live: CatalogStartup[],
  committed: CatalogStartup[],
): CatalogStartup[] {
  const flags = new Map(committed.map((row) => [row.slug, row]));
  return live.map((row) => {
    const fallback = flags.get(row.slug);
    if (!fallback) return row;
    return {
      ...row,
      isHiring: fallback.isHiring,
      careersUrl: row.careersUrl ?? fallback.careersUrl,
    };
  });
}

export async function loadCatalogResources(): Promise<CatalogResource[]> {
  const live = await fetchSupabaseTable("resources");
  return parseResourceList(live ?? readJson("catalog/resources.json"));
}

export async function loadCatalogStartups(): Promise<CatalogStartup[]> {
  const committed = parseStartupList(readJson("catalog/startups.json"));
  const live = await fetchSupabaseTable("startups");
  if (!live) return committed;
  return applyCommittedHiringFlags(parseStartupList(live), committed);
}
