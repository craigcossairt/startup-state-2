const XAI_URL = "https://api.x.ai/v1/chat/completions";

export type GrokCall = {
  system: string;
  user: string;
  reasoningEffort: "low" | "medium";
};

export async function callGrokJson(call: GrokCall): Promise<unknown> {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new Error("XAI_API_KEY is missing");
  }
  const response = await fetch(XAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-4.6",
      temperature: 0,
      reasoning_effort: call.reasoningEffort,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: call.system },
        { role: "user", content: call.user },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Grok request failed (${response.status}): ${detail.slice(0, 400)}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Grok returned an empty message");
  return JSON.parse(content);
}

export function hasXaiKey(): boolean {
  return Boolean(process.env.XAI_API_KEY);
}
