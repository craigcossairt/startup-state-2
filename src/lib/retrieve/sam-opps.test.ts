import { describe, expect, it } from "vitest";
import { capRetrieved } from "./retrieve";
import { mapSamOppNotice } from "./sam-opps";

describe("SAM Contract Opportunities adapter", () => {
  it("mints sam_opps:{noticeId} and includes that id in the retrieved set", () => {
    const mapped = mapSamOppNotice({
      noticeId: "abc123",
      title: "AI clinical workflow software",
      fullParentPathName: "HEALTH AND HUMAN SERVICES",
      responseDeadLine: "10/19/2026",
      uiLink: "https://sam.gov/opp/abc123/view",
    });
    expect(mapped?.id).toBe("sam_opps:abc123");
    expect(mapped?.source).toBe("sam_opps");
    expect(mapped?.lane).toBe("federal");
    expect(mapped?.instrument).toBe("procurement");
    expect(mapped?.deadline).toBe("2026-10-19");
    const retrieved = capRetrieved({
      curated: [],
      goeo: [],
      federal: mapped ? [mapped] : [],
      cap: 50,
    });
    expect(retrieved.map((row) => row.id)).toContain("sam_opps:abc123");
  });

  it("drops notices that have no official noticeId", () => {
    expect(mapSamOppNotice({ title: "Missing id" })).toBeNull();
  });
});
