import { describe, expect, it } from "vitest";
import { supabasePublicConfig } from "./env";

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
});
