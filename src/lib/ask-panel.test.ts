import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASK_FAB_LABEL,
  ASK_NEEDS_MAP,
  ASK_PLACEHOLDER,
} from "@/lib/copy";
import {
  askFabHiddenOn,
  askSuggestions,
  askSurfaceFromPath,
  buildAskRequest,
  canSendAsk,
  dockFabAboveFooter,
  readAskResponse,
  summarizeAskCards,
} from "@/lib/ask-panel";

describe("Ask panel", () => {
  it("docks above the last footer the way Part 1 does after the short-page bug", () => {
    expect(
      dockFabAboveFooter({
        footerTop: 900,
        footerBottom: 1200,
        viewportHeight: 800,
        pageHeight: 2000,
      }),
    ).toBeNull();
    expect(
      dockFabAboveFooter({
        footerTop: 400,
        footerBottom: 700,
        viewportHeight: 800,
        pageHeight: 700,
      }),
    ).toBeNull();
    expect(
      dockFabAboveFooter({
        footerTop: 700,
        footerBottom: 1100,
        viewportHeight: 800,
        pageHeight: 2000,
      }),
    ).toBe(116);
    expect(
      dockFabAboveFooter({
        footerTop: 200,
        footerBottom: 900,
        viewportHeight: 800,
        pageHeight: 2000,
      }),
    ).toBe(400);
  });

  it("names the page surface and hides the FAB on claim, admin, and auth", () => {
    expect(askSurfaceFromPath("/")).toBe("intake");
    expect(askSurfaceFromPath("/map/plan")).toBe("map");
    expect(askSurfaceFromPath("/playbook/starting/find-idea")).toBe("playbook");
    expect(askSurfaceFromPath("/resources")).toBe("resources");
    expect(askSurfaceFromPath("/startups")).toBe("startups");
    expect(askFabHiddenOn("/claim/alcomy")).toBe(true);
    expect(askFabHiddenOn("/admin")).toBe(true);
    expect(askFabHiddenOn("/auth/login")).toBe(true);
    expect(askFabHiddenOn("/startups")).toBe(false);
    expect(askSuggestions("map", null)[0]).toContain("Opportunity Map");
    expect(askSuggestions("playbook", {
      stage: "Growing",
      sector: "Software",
      region: "Wasatch Front",
      goal: "Find funding",
      communities: [],
    })[1]).toContain("funding");
  });

  it("sends trimmed text plus program/why summaries, not id-only cards", () => {
    expect(canSendAsk({ draft: "  " })).toBe(false);
    expect(canSendAsk({ draft: "What first?" })).toBe(true);
    expect(
      summarizeAskCards([
        {
          opportunity: { id: "curated:nucleus-grow", program: "Nucleus Grow" },
          why: "SBIR help for this R&D company.",
        },
      ]),
    ).toEqual([
      {
        id: "curated:nucleus-grow",
        program: "Nucleus Grow",
        why: "SBIR help for this R&D company.",
      },
    ]);
    expect(
      buildAskRequest({
        message: "  What first?  ",
        surface: "map",
        cards: [
          {
            opportunity: { id: "curated:nucleus-grow", program: "Nucleus Grow" },
            why: "SBIR help for this R&D company.",
          },
        ],
        persona: { stage: "Growing", sector: "Software", region: "Wasatch Front", goal: "Find funding", communities: [] },
      }),
    ).toEqual({
      message: "What first?",
      surface: "map",
      cards: [
        {
          id: "curated:nucleus-grow",
          program: "Nucleus Grow",
          why: "SBIR help for this R&D company.",
        },
      ],
      persona: { stage: "Growing", sector: "Software", region: "Wasatch Front", goal: "Find funding", communities: [] },
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
    expect(ASK_FAB_LABEL).toBe("Ask the Navigator");
    expect(ASK_NEEDS_MAP).toContain("Navigator");
    expect(ASK_PLACEHOLDER).toContain("first");
    const panel = readFileSync(
      path.join(process.cwd(), "src/components/ask-fab.tsx"),
      "utf8",
    );
    expect(panel).toContain("/api/chat");
    expect(panel).toContain("loadMapPayload");
    expect(panel).toContain("ASK_FAB_LABEL");
    expect(panel).toContain("canSendAsk");
    expect(panel).toContain("startup-state-mark.svg");
    expect(panel).toContain("dockFabAboveFooter");
    expect(panel).toContain("dockBottom + 56");
    expect(panel).not.toMatch(/matchResources|DEMO_PERSONAS|useChat|Tyler/i);
    expect(panel).toContain("askFabHiddenOn");
  });
});
