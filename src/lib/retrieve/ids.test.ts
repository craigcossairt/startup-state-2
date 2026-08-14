import { describe, expect, it } from "vitest";
import { mintOpportunityId } from "./ids";

describe("mintOpportunityId", () => {
  it("mints Grants.gov ids from the search2 integer id", () => {
    expect(mintOpportunityId("grants_gov", "359671")).toBe("grants_gov:359671");
  });

  it("mints GOEO ids from the WordPress external_id", () => {
    expect(mintOpportunityId("goeo", "2543")).toBe("goeo:2543");
  });

  it("mints curated ids from the locked slug", () => {
    expect(mintOpportunityId("curated", "nucleus-grow")).toBe(
      "curated:nucleus-grow",
    );
  });

  it("mints SAM Contract Opportunities ids from the notice id", () => {
    expect(mintOpportunityId("sam_opps", "abc123")).toBe("sam_opps:abc123");
  });
});

