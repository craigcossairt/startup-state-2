import type { RankStreamEvent } from "@/lib/map-metrics";

export type { RankStreamEvent };

export function encodeRankStreamEvent(event: RankStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function parseRankStreamBlock(block: string): RankStreamEvent | null {
  const line = block
    .trim()
    .split("\n")
    .find((row) => row.startsWith("data: "));
  if (!line) return null;
  return JSON.parse(line.slice("data: ".length)) as RankStreamEvent;
}

export async function readRankStream(
  response: Response,
  onEvent: (event: RankStreamEvent) => void,
): Promise<void> {
  if (!response.body) {
    throw new Error("Rank stream had no body");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const event = parseRankStreamBlock(part);
      if (event) onEvent(event);
    }
  }
  const trailing = parseRankStreamBlock(buffer);
  if (trailing) onEvent(trailing);
}
