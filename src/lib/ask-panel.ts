export type AskCard = {
  opportunity: { id: string };
};

export type AskSendResult =
  | { kind: "replied"; reply: string }
  | { kind: "error"; message: string };

export function canSendAsk(input: { draft: string }): boolean {
  return input.draft.trim().length > 0;
}

export function buildAskRequest(input: { message: string; cards: AskCard[] }): {
  message: string;
  cards: AskCard[];
} {
  return { message: input.message.trim(), cards: input.cards };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
