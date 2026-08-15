import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MUST_HAVE_KEYS } from "@/lib/types/company-profile";
import { MUST_HAVE_COPY, MUST_HAVE_LABELS } from "./must-have-copy";

describe("must-have copy registry", () => {
  it("gives every MustHaveKey a non-empty label and hint", () => {
    for (const key of MUST_HAVE_KEYS) {
      expect(MUST_HAVE_COPY[key].label.length).toBeGreaterThan(0);
      expect(MUST_HAVE_COPY[key].hint.length).toBeGreaterThan(0);
    }
  });

  it("keeps hints free of em dashes", () => {
    for (const key of MUST_HAVE_KEYS) {
      expect(MUST_HAVE_COPY[key].hint).not.toMatch(/—/);
    }
  });

  it("derives MUST_HAVE_LABELS from MUST_HAVE_COPY", () => {
    for (const key of MUST_HAVE_KEYS) {
      expect(MUST_HAVE_LABELS[key]).toBe(MUST_HAVE_COPY[key].label);
    }
    expect(MUST_HAVE_LABELS.whatTheyDo).toBe("What they do");
    const source = readFileSync(
      path.join(process.cwd(), "src/lib/intake/must-have-copy.ts"),
      "utf8",
    );
    expect(source).toMatch(/MUST_HAVE_LABELS[\s\S]*MUST_HAVE_COPY/);
    expect(source).not.toMatch(/export const MUST_HAVE_LABELS: Record<MustHaveKey, string> = \{/);
  });
});
