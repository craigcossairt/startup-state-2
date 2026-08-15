import { describe, expect, it } from "vitest";
import { postgresDsnCandidates, stripPostgresSslMode, supabasePublicConfig } from "./env";

describe("supabase public config", () => {
  it("stays off until both a https url and an anon key are present", () => {
    expect(supabasePublicConfig({})).toBeNull();
    expect(
      supabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://jcyiqxdneyamxhkvhfvv.supabase.co",
      }),
    ).toBeNull();
    expect(
      supabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://jcyiqxdneyamxhkvhfvv.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toEqual({
      url: "https://jcyiqxdneyamxhkvhfvv.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("skips empty and placeholder postgres urls, then prefers the direct host", () => {
    expect(
      postgresDsnCandidates({
        POSTGRES_URL: "[SENSITIVE]",
        POSTGRES_URL_NON_POOLING: "",
        POSTGRES_PRISMA_URL: "not-a-postgres-url",
      }),
    ).toEqual([]);
    expect(
      postgresDsnCandidates({
        POSTGRES_URL: "postgres://pooler.example/postgres",
        POSTGRES_URL_NON_POOLING: "postgresql://db.example/postgres",
        POSTGRES_PRISMA_URL: "postgres://prisma.example/postgres?pgbouncer=true",
      }),
    ).toEqual([
      "postgresql://db.example/postgres",
      "postgres://pooler.example/postgres",
      "postgres://prisma.example/postgres?pgbouncer=true",
    ]);
  });

  it("drops sslmode so pg can use rejectUnauthorized false", () => {
    expect(
      stripPostgresSslMode(
        "postgres://u:p@db.example/postgres?sslmode=require&pgbouncer=true",
      ),
    ).toBe("postgres://u:p@db.example/postgres?pgbouncer=true");
    expect(stripPostgresSslMode("postgres://u:p@db.example/postgres")).toBe(
      "postgres://u:p@db.example/postgres",
    );
  });
});
