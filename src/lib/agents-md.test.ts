import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const agents = readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf8");

describe("AGENTS.md", () => {
  it("does not freeze a stage label or a Vitest count", () => {
    expect(agents).not.toMatch(/\*\*Stage:\*\*/);
    expect(agents).not.toMatch(/\d+ tests/);
  });
});
