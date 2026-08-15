import { describe, expect, it } from "vitest";
import { navigatorCatalogHint } from "./navigator";

describe("navigatorCatalogHint", () => {
  it("matches a funding question even when it ends with a question mark", () => {
    const reply = navigatorCatalogHint("How do I get funding?");
    expect(reply).toMatch(/Obtain funding|Growth-stage funding/);
    expect(reply).toContain("startup.utah.gov");
    expect(reply).not.toMatch(/eligible/i);
  });
});
