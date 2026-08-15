import { describe, expect, it } from "vitest";
import { followUpChat, refuseUnknownProgramIds } from "./chat";

describe("follow-up chat grounding", () => {
  it("refuses a program id that is not in the ranked set", () => {
    const rankedIds = ["curated:nucleus-grow", "grants_gov:359671"];
    expect(
      refuseUnknownProgramIds(["curated:not-a-program", "curated:nucleus-grow"], rankedIds),
    ).toEqual(["curated:not-a-program"]);

    const turn = followUpChat({
      message: "Is curated:not-a-program a good fit?",
      rankedIds,
      cardSummaries: [
        {
          id: "curated:nucleus-grow",
          program: "Nucleus Grow",
          why: "SBIR help for this R&D company.",
        },
      ],
    });
    expect(turn.refused).toEqual(["curated:not-a-program"]);
    expect(turn.reply).toContain("curated:not-a-program");
    expect(turn.reply).not.toMatch(/eligible/i);
  });

  it("points at the playbook when no ranked cards are present", () => {
    const turn = followUpChat({
      message: "How do I get funding?",
      rankedIds: [],
      cardSummaries: [],
    });
    expect(turn.refused).toEqual([]);
    expect(turn.reply).toMatch(/funding|playbook|Opportunity Map/i);
    expect(turn.reply).not.toMatch(/eligible/i);
  });
});
