"use client";

import { useEffect, useState } from "react";
import { ASK_FAB_LABEL, ASK_NEEDS_MAP, ASK_PANEL_LEAD, ASK_PLACEHOLDER } from "@/lib/copy";
import { buildAskRequest, canSendAsk, readAskResponse } from "@/lib/ask-panel";
import { loadMapPayload } from "@/lib/session-map";

export function AskFab() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dockBottom, setDockBottom] = useState<number | null>(null);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const update = () => {
      const rect = footer.getBoundingClientRect();
      const overlap = window.innerHeight - rect.top;
      setDockBottom(overlap > 0 ? overlap + 16 : null);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const dockStyle = dockBottom == null ? undefined : { bottom: dockBottom };

  return (
    <>
      {open ? (
        <div
          className="fixed right-4 z-40 w-[min(100%-2rem,24rem)] rounded-2xl border border-border bg-white p-4 shadow-2xl sm:right-6"
          style={dockStyle ?? { bottom: "5.5rem" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{ASK_FAB_LABEL}</p>
              <p className="mt-1 text-sm text-foreground-muted">{ASK_PANEL_LEAD}</p>
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
              if (!canSendAsk({ draft: message })) {
                setError(ASK_NEEDS_MAP);
                return;
              }
              setBusy(true);
              setError(null);
              try {
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(
                    buildAskRequest({ message, cards: payload?.cards ?? [] }),
                  ),
                });
                const body: unknown = await response.json().catch(() => ({}));
                const result = readAskResponse({ ok: response.ok, body });
                if (result.kind === "replied") {
                  setReply(result.reply);
                  return;
                }
                setError(result.message);
              } catch {
                setError("Ask failed");
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
              placeholder={ASK_PLACEHOLDER}
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
        aria-label={ASK_FAB_LABEL}
        onClick={() => setOpen((value) => !value)}
        className="fixed right-4 z-40 rounded-full bg-midnight px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-onyx sm:right-6"
        style={dockStyle ?? { bottom: "1.5rem" }}
      >
        {ASK_FAB_LABEL}
      </button>
    </>
  );
}
