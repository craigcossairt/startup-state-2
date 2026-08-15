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
    expect(editor).toContain("OpenTokenPicker");
    expect(editor).toContain("UsdField");
    expect(editor).toContain("MUST_HAVE_COPY");
    expect(editor).toContain("onDraft");
    expect(editor).toContain("export { MUST_HAVE_LABELS }");
    expect(editor).toContain("draftRevenueAmount");
    expect(editor).not.toMatch(/status:\s*"known"/);
    expect(editor).not.toMatch(/basis:\s*"annual_revenue"/);
    expect(editor).not.toMatch(/split\(",\"\)/);
    const copy = read("src/lib/intake/must-have-copy.ts");
    expect(copy).toContain("What they do");
    expect(copy).toContain("Spaces are allowed.");
  });

  it("uses typeahead pickers for country and state, and human use-of-funds labels", () => {
    const editor = read("src/components/must-have-field.tsx");
    expect(editor).toContain("TypeaheadSelect");
    expect(editor).toContain("describedBy");
    expect(editor).toContain("USE_OF_FUNDS_LABELS");
    expect(editor).toContain("DEFAULT_HQ_COUNTRY");
    expect(editor).toContain("DEFAULT_HQ_STATE");
    expect(editor).not.toMatch(/>\s*product_development\s*</);
  });

  it("locks the value-space modules and widgets", () => {
    expect(read("src/lib/intake/must-have-copy.ts")).toContain("MUST_HAVE_COPY");
    expect(read("src/lib/intake/tech-tokens.ts")).toContain("TECH_TOKEN_SUGGESTIONS");
    expect(read("src/lib/intake/usd-draft.ts")).toContain("formatUsdDraft");
    const picker = read("src/components/open-token-picker.tsx");
    expect(picker).toContain("commitTechToken");
    expect(picker).toContain("suggestTechTokens");
    expect(picker).toContain("describedBy");
    const money = read("src/components/usd-field.tsx");
    expect(money).toContain("parseUsdDraft");
    expect(money).toContain("describedBy");
    expect(money).not.toContain("useEffect");
  });
});
