#!/usr/bin/env node
/**
 * Apply leftover-surface schema and seed on production builds.
 * No-ops when Vercel has not injected a postgres URL (local, CI, preview).
 * Prints counts only. Never prints a DSN or password.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const DSN_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
];

function stripSslMode(dsn) {
  return dsn
    .replace(/([?&])sslmode=[^&]*/i, "$1")
    .replace(/[?&]+$/, "")
    .replace(/\?&/, "?")
    .replace(/&&+/g, "&");
}

function dsnCandidates(env) {
  const out = [];
  for (const key of DSN_KEYS) {
    const value = (env[key] ?? "").trim();
    if (!value.startsWith("postgres")) continue;
    out.push(value);
  }
  return out;
}

function asList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim());
}

function resourceValues(row) {
  return [
    typeof row.external_id === "string" ? row.external_id : null,
    row.title,
    typeof row.description === "string" ? row.description : null,
    asList(row.communities),
    asList(row.industries),
    asList(row.locations),
    asList(row.topics),
    typeof row.link === "string" ? row.link : null,
    typeof row.email === "string" ? row.email : null,
  ];
}

function startupValues(row) {
  return [
    typeof row.slug === "string" ? row.slug : null,
    row.name,
    typeof row.website === "string" ? row.website : null,
    typeof row.linkedin_url === "string" ? row.linkedin_url : null,
    typeof row.description === "string" ? row.description : null,
    typeof row.full_address === "string" ? row.full_address : null,
    typeof row.city === "string" ? row.city : null,
    typeof row.region === "string" ? row.region : null,
    typeof row.lat === "number" ? row.lat : null,
    typeof row.lng === "number" ? row.lng : null,
    typeof row.sector === "string" && row.sector ? row.sector : "Other",
    typeof row.stage === "string" ? row.stage : null,
    typeof row.employees_bucket === "string" && row.employees_bucket
      ? row.employees_bucket
      : "Undisclosed",
    typeof row.revenue_bucket === "string" && row.revenue_bucket
      ? row.revenue_bucket
      : "Undisclosed",
    row.is_hiring === true,
  ];
}

async function applyOne(dsn) {
  const schema = readFileSync(path.join(root, "supabase/schema.sql"), "utf8");
  const resources = JSON.parse(
    readFileSync(path.join(root, "data/catalog/resources.json"), "utf8"),
  );
  const startups = JSON.parse(
    readFileSync(path.join(root, "data/catalog/startups.json"), "utf8"),
  );

  const stripped = stripSslMode(dsn);
  const client = new pg.Client({
    connectionString: `${stripped}${stripped.includes("?") ? "&" : "?"}sslmode=no-verify`,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(schema);
    const resourceCount = Number(
      (await client.query("select count(*)::int as n from public.resources")).rows[0].n,
    );
    const startupCount = Number(
      (await client.query("select count(*)::int as n from public.startups")).rows[0].n,
    );
    console.log("apply-catalog-schema before", resourceCount, startupCount);

    if (resourceCount === 0) {
      for (const row of resources) {
        await client.query(
          `insert into public.resources
            (external_id, title, description, communities, industries, locations, topics, link, email)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          resourceValues(row),
        );
      }
    }

    if (startupCount === 0) {
      for (const row of startups) {
        await client.query(
          `insert into public.startups
            (slug, name, website, linkedin_url, description, full_address, city, region,
             lat, lng, sector, stage, employees_bucket, revenue_bucket, is_hiring)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          startupValues(row),
        );
      }
    }

    for (const row of startups) {
      if (typeof row.slug !== "string" || !row.slug) continue;
      await client.query(
        `update public.startups
            set is_hiring = $1
          where slug = $2`,
        [row.is_hiring === true, row.slug],
      );
    }

    const afterR = Number(
      (await client.query("select count(*)::int as n from public.resources")).rows[0].n,
    );
    const afterS = Number(
      (await client.query("select count(*)::int as n from public.startups")).rows[0].n,
    );
    const rls = await client.query(
      `select c.relname, c.relrowsecurity
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('resources', 'startups')
        order by 1`,
    );
    const policies = await client.query(
      `select tablename, policyname, cmd
         from pg_policies
        where schemaname = 'public' and tablename in ('resources', 'startups')
        order by 1, 2`,
    );
    console.log("apply-catalog-schema after", afterR, afterS);
    console.log("apply-catalog-schema rls", rls.rows);
    console.log("apply-catalog-schema policies", policies.rows);
    if (afterR !== 213 || afterS !== 220) {
      throw new Error(`unexpected catalog counts ${afterR} ${afterS}`);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  const candidates = dsnCandidates(process.env);
  if (candidates.length === 0) {
    console.log("apply-catalog-schema skip (no postgres url)");
    return;
  }

  const errors = [];
  for (const dsn of candidates) {
    try {
      await applyOne(dsn);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      console.warn("apply-catalog-schema candidate failed:", message);
    }
  }

  console.warn(
    "apply-catalog-schema could not apply; leftover pages will use data/catalog JSON",
    errors.length,
  );
}

await main();
