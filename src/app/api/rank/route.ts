import { streamRetrieveThenRank } from "@/lib/pipeline";
import { encodeRankStreamEvent } from "@/lib/rank/stream-events";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { RetrieveChips } from "@/lib/types/opportunity";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    profile?: CompanyProfile;
    chips?: RetrieveChips;
  };
  if (!body.profile) {
    return Response.json({ error: "profile is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const profile = body.profile;
  const chips = body.chips ?? {};
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamRetrieveThenRank(profile, chips)) {
          controller.enqueue(encoder.encode(encodeRankStreamEvent(event)));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Rank failed";
        controller.enqueue(
          encoder.encode(encodeRankStreamEvent({ type: "error", message })),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
