import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("Ask and Confirm forms", () => {
  it("Ask drafts with applyMustHaveDraft so missing fields stay mounted", () => {
    const ask = read("src/components/ask-form.tsx");
    expect(ask).toContain("applyMustHaveDraft");
    expect(ask).not.toMatch(/status:\s*"known"/);
  });

  it("Confirm renders editable must-have fields, not read-only JSON", () => {
    const confirm = read("src/components/confirm-form.tsx");
    expect(confirm).toContain("applyMustHaveDraft");
    expect(confirm).toContain("MustHaveField");
    expect(confirm).not.toContain("JSON.stringify");
    const editor = read("src/components/must-have-field.tsx");
    expect(editor).toContain("<input");
    expect(editor).toContain("What they do");
  });
});
