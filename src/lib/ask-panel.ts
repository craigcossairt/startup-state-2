export type AskSurface =
  | "intake"
  | "map"
  | "playbook"
  | "resources"
  | "startups"
  | "careers"
  | "news"
  | "swag"
  | "other";

export type AskCardSummary = {
  id: string;
  program: string;
  why: string;
};

export type AskPersonaHint = {
  stage: string;
  sector: string;
  region: string;
  goal: string;
  communities: string[];
} | null;

export type AskCardInput = {
  opportunity: { id: string; program: string };
  why: string;
};

export type AskRequest = {
  message: string;
  surface: AskSurface;
  cards: AskCardSummary[];
  persona: AskPersonaHint;
};

export type AskSendResult =
  | { kind: "replied"; reply: string }
  | { kind: "error"; message: string };

export type DockMetrics = {
  footerTop: number;
  footerBottom: number;
  viewportHeight: number;
  pageHeight: number;
};

const SURFACE_PREFIXES: Array<[string, AskSurface]> = [
  ["/map", "map"],
  ["/playbook", "playbook"],
  ["/resources", "resources"],
  ["/startups", "startups"],
  ["/careers", "careers"],
  ["/news", "news"],
  ["/swag", "swag"],
];

export function canSendAsk(input: { draft: string }): boolean {
  return input.draft.trim().length > 0;
}

export function askSurfaceFromPath(pathname: string): AskSurface {
  if (pathname === "/") return "intake";
  for (const [prefix, surface] of SURFACE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return surface;
  }
  return "other";
}

export function askFabHiddenOn(pathname: string): boolean {
  return (
    pathname === "/claim" ||
    pathname.startsWith("/claim/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

export function dockFabAboveFooter(metrics: DockMetrics): number | null {
  const gap = 16;
  const pageIsTall = metrics.pageHeight > metrics.viewportHeight + 100;
  if (metrics.footerTop >= metrics.viewportHeight) return null;
  if (metrics.footerBottom <= metrics.viewportHeight && !pageIsTall) return null;
  const desired = metrics.viewportHeight - metrics.footerTop + gap;
  const max = Math.floor(metrics.viewportHeight / 2);
  return Math.max(gap, Math.min(desired, max));
}

export function summarizeAskCards(cards: AskCardInput[]): AskCardSummary[] {
  return cards.map((card) => ({
    id: card.opportunity.id,
    program: card.opportunity.program,
    why: card.why,
  }));
}

export function buildAskRequest(input: {
  message: string;
  surface: AskSurface;
  cards: AskCardInput[];
  persona: AskPersonaHint;
}): AskRequest {
  return {
    message: input.message.trim(),
    surface: input.surface,
    cards: summarizeAskCards(input.cards),
    persona: input.persona,
  };
}

export function readAskResponse(input: { ok: boolean; body: unknown }): AskSendResult {
  if (isRecord(input.body) && typeof input.body.reply === "string" && input.body.reply) {
    return { kind: "replied", reply: input.body.reply };
  }
  if (isRecord(input.body) && typeof input.body.error === "string" && input.body.error) {
    return { kind: "error", message: input.body.error };
  }
  return { kind: "error", message: "Ask failed" };
}

export function askSuggestions(
  surface: AskSurface,
  persona: AskPersonaHint,
): string[] {
  if (surface === "map") {
    return [
      "What should I do first on this Opportunity Map?",
      "Which Utah programs are the stronger start?",
      "Walk me through the top federal fit.",
    ];
  }
  if (surface === "playbook") {
    if (persona?.goal === "Find funding") {
      return [
        "What should I do this week?",
        "Walk me through Utah funding programs in plain English.",
        "Which playbook step is the easiest start?",
      ];
    }
    return [
      "Where should I start?",
      "How do I personalize this for my business?",
      "What resources does Utah have for founders?",
    ];
  }
  if (surface === "resources") {
    return [
      "Which GOED programs match my sector?",
      "Where do I find SBIR help in Utah?",
      "Point me at counseling programs.",
    ];
  }
  if (surface === "startups") {
    return [
      "How do I claim my company's listing?",
      "Which Utah cities have the most startups?",
      "How do I add a listing?",
    ];
  }
  if (surface === "careers") {
    return [
      "Which Utah companies are hiring right now?",
      "What should a founder know about hiring in Utah?",
    ];
  }
  return [
    "What should I do first?",
    "How do I figure out which state programs fit?",
    "How do I claim my company's listing?",
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
