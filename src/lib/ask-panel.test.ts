import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASK_FAB_LABEL,
  ASK_NEEDS_MAP,
  ASK_PLACEHOLDER,
} from "@/lib/copy";
import {
  buildAskRequest,
  canSendAsk,
  readAskResponse,
} from "@/lib/ask-panel";

describe("Ask panel", () => {
  it("sends only a trimmed message plus ranked cards", () => {
    expect(canSendAsk({ draft: "  ", hasCards: true })).toBe(false);
    expect(canSendAsk({ draft: "What first?", hasCards: false })).toBe(false);
    expect(canSendAsk({ draft: "What first?", hasCards: true })).toBe(true);
    expect(
      buildAskRequest({
        message: "  What first?  ",
        cards: [{ opportunity: { id: "curated:nucleus-grow" } }],
      }),
    ).toEqual({
      message: "What first?",
      cards: [{ opportunity: { id: "curated:nucleus-grow" } }],
    });
  });

  it("reads the chat route body and keeps needs-map distinct from errors", () => {
    expect(readAskResponse({ ok: true, body: { reply: "Start with Nucleus." } })).toEqual({
      kind: "replied",
      reply: "Start with Nucleus.",
    });
    expect(readAskResponse({ ok: false, body: { error: "message and cards are required" } })).toEqual({
      kind: "error",
      message: "message and cards are required",
    });
    expect(readAskResponse({ ok: true, body: {} })).toEqual({
      kind: "error",
      message: "Ask failed",
    });
  });

  it("keeps the floating panel on the Part 2 chat route", () => {
    expect(ASK_FAB_LABEL).toBe("Ask the map");
    expect(ASK_NEEDS_MAP).toContain("Opportunity Map");
    expect(ASK_PLACEHOLDER).toContain("this map");
    const panel = readFileSync(
      path.join(process.cwd(), "src/components/ask-fab.tsx"),
      "utf8",
    );
    expect(panel).toContain("/api/chat");
    expect(panel).toContain("loadMapPayload");
    expect(panel).toContain("ASK_FAB_LABEL");
    expect(panel).toContain("canSendAsk");
    expect(panel).not.toMatch(/matchResources|DEMO_PERSONAS|useChat|Tyler/i);
  });
});
