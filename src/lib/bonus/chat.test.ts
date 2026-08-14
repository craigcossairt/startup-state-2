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
});
