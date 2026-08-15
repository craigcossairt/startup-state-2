import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RANK_SYSTEM } from "./prompts";

describe("RANK_SYSTEM", () => {
  it("tells rank that same-sector NIH NSF HHS or SBIR overlap is at least potential-verify", () => {
    expect(RANK_SYSTEM).toMatch(/potential-verify/);
    expect(RANK_SYSTEM).toMatch(/SBIR\/STTR|SBIR or STTR/i);
    expect(RANK_SYSTEM).toMatch(/same sector|same-sector/i);
    expect(RANK_SYSTEM).toMatch(/diplomatic|embassy|U\.S\. Mission/i);
    expect(RANK_SYSTEM).toMatch(/generic SBIR\/STTR parent|not a fit by itself/i);
    expect(RANK_SYSTEM).toMatch(/marketplace/i);
    const spec = readFileSync(
      path.join(process.cwd(), "docs", "spec", "infer-rank-explain-prompts.md"),
      "utf8",
    );
    expect(spec).toMatch(/same-sector NIH, NSF, HHS, or SBIR\/STTR/i);
  });
});
