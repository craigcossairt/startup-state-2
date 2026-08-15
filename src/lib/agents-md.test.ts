import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const agents = readFileSync(path.join(root, "AGENTS.md"), "utf8");

describe("AGENTS.md", () => {
  it("does not freeze a stage label or a Vitest count", () => {
    expect(agents).not.toMatch(/\*\*Stage:\*\*/);
    expect(agents).not.toMatch(/\d+ tests/);
  });

  it("does not keep a project brain", () => {
    expect(existsSync(path.join(root, "brain"))).toBe(false);
    expect(agents).not.toMatch(/brain\//);
  });
});
