"use client";

import { useState } from "react";
import { BonusPage } from "@/components/bonus-page";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <BonusPage title="Follow-up chat" active="/map/chat">
      {(payload) => (
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            try {
              const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ message, cards: payload.cards }),
              });
              if (!response.ok) throw new Error(await response.text());
              const body = (await response.json()) as { reply: string };
              setReply(body.reply);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Chat failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="text-sm text-foreground-muted">
            Ask about programs on this map. Unknown program ids are refused.
          </p>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2"
            placeholder="What should I do first on curated:nucleus-grow?"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-vibrant-green px-4 py-2 text-sm font-bold text-white"
          >
            {busy ? "Thinking..." : "Ask"}
          </button>
          {reply ? <p className="rounded-lg bg-off-white p-4">{reply}</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </form>
      )}
    </BonusPage>
  );
}
