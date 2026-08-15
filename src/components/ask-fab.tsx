"use client";

import { useState } from "react";
import { loadMapPayload } from "@/lib/session-map";

export function AskFab() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-20 z-40 w-[min(100%-2rem,24rem)] rounded-2xl border border-border bg-white p-4 shadow-2xl sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Ask the map</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Questions stay on programs already retrieved for this company.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm font-semibold text-foreground-muted"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <form
            className="mt-3 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const payload = loadMapPayload();
              if (!payload) {
                setError("Open the Opportunity Map first.");
                return;
              }
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
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
              placeholder="Which of these should we start with?"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-midnight px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? "Asking..." : "Ask"}
            </button>
          </form>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          {reply ? <p className="mt-3 text-sm">{reply}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Ask the map"
        onClick={() => setOpen((value) => !value)}
        className="fixed right-4 bottom-4 z-40 rounded-full bg-midnight px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-onyx sm:right-6 sm:bottom-6"
      >
        Ask the map
      </button>
    </>
  );
}
