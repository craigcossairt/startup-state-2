import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { fireGoeoKeys } from "./goeo-keys";

describe("fireGoeoKeys", () => {
  it("fires sbir-help for fixture-1 (Healthcare AI)", () => {
    const keys = fireGoeoKeys(loadCompanyFixture("fixture-1"));
    expect(keys).toContain("sbir-help");
  });

  it("fires workforce and counseling for fixture-5 (Youth marketplace)", () => {
    const keys = fireGoeoKeys(loadCompanyFixture("fixture-5"));
    expect(keys).toContain("workforce");
    expect(keys).toContain("counseling");
  });

  it("does not fire trade on any of the five official fixtures", () => {
    for (const id of [
      "fixture-1",
      "fixture-2",
      "fixture-3",
      "fixture-4",
      "fixture-5",
    ] as const) {
      expect(fireGoeoKeys(loadCompanyFixture(id))).not.toContain("trade");
    }
  });

  it("fires contracting when the company sells to defense or aerospace", () => {
    const keys = fireGoeoKeys(loadCompanyFixture("fixture-2"));
    expect(keys).toContain("contracting");
  });
});
