"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ASK_FAB_LABEL, ASK_NEEDS_MAP, ASK_PANEL_LEAD, ASK_PLACEHOLDER } from "@/lib/copy";
import {
  askFabHiddenOn,
  askSuggestions,
  askSurfaceFromPath,
  buildAskRequest,
  canSendAsk,
  dockFabAboveFooter,
  readAskResponse,
  type AskCardInput,
  type AskPersonaHint,
} from "@/lib/ask-panel";
import {
  YOU_CHANGED_EVENT,
  YOU_STORAGE_KEY,
  parseStoredYouPersona,
} from "@/lib/catalog/you-persona";
import { loadMapPayload } from "@/lib/session-map";

type AskTurn = { role: "user" | "assistant"; text: string };

function readPersonaHint(): AskPersonaHint {
  const stored = parseStoredYouPersona(window.localStorage.getItem(YOU_STORAGE_KEY));
  if (!stored) return null;
  return {
    stage: stored.stage,
    sector: stored.sector,
    region: stored.region,
    goal: stored.goal,
    communities: stored.communities,
  };
}

function mapCardsForAsk(): AskCardInput[] {
  return (loadMapPayload()?.cards ?? []).map((card) => ({
    opportunity: { id: card.opportunity.id, program: card.opportunity.program },
    why: card.why,
  }));
}

export function AskFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<AskTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dockBottom, setDockBottom] = useState<number | null>(null);
  const [persona, setPersona] = useState<AskPersonaHint>(null);

  useEffect(() => {
    const sync = () => setPersona(readPersonaHint());
    sync();
    window.addEventListener(YOU_CHANGED_EVENT, sync);
    return () => window.removeEventListener(YOU_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (askFabHiddenOn(pathname)) return;
    const named = document.getElementById("site-footer");
    const footers = document.querySelectorAll("footer");
    const footer = named ?? footers[footers.length - 1];
    if (!footer) return;

    let raf = 0;
    const update = () => {
      const rect = footer.getBoundingClientRect();
      setDockBottom(
        dockFabAboveFooter({
          footerTop: rect.top,
          footerBottom: rect.bottom,
          viewportHeight: window.innerHeight,
          pageHeight: document.documentElement.scrollHeight,
        }),
      );
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const hideOn = askFabHiddenOn(pathname);
  const surface = askSurfaceFromPath(pathname);
  const suggestions = thread.length === 0 ? askSuggestions(surface, persona) : [];
  const dockStyle = dockBottom == null ? undefined : { bottom: `${dockBottom}px` };
  const panelStyle =
    dockBottom == null ? { bottom: "5.5rem" } : { bottom: `${dockBottom + 56}px` };

  async function send(draft: string) {
    if (!canSendAsk({ draft })) {
      setError(ASK_NEEDS_MAP);
      return;
    }
    const text = draft.trim();
    setBusy(true);
    setError(null);
    setMessage("");
    setThread((turns) => [...turns, { role: "user", text }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          buildAskRequest({
            message: text,
            surface,
            cards: mapCardsForAsk(),
            persona: readPersonaHint(),
          }),
        ),
      });
      const body: unknown = await response.json().catch(() => ({}));
      const result = readAskResponse({ ok: response.ok, body });
      if (result.kind === "replied") {
        setThread((turns) => [...turns, { role: "assistant", text: result.reply }]);
        return;
      }
      setError(result.message);
    } catch {
      setError("Ask failed");
    } finally {
      setBusy(false);
    }
  }

  if (hideOn) return null;

  return (
    <>
      {open ? (
        <div
          className="fixed right-4 z-40 w-[min(100%-2rem,24rem)] rounded-2xl border border-border bg-white p-4 shadow-2xl sm:right-6"
          style={panelStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{ASK_FAB_LABEL}</p>
              <p className="mt-1 text-sm text-foreground-muted">{ASK_PANEL_LEAD}</p>
            </div>
            <button
              type="button"
              aria-label="Minimize"
              className="rounded-md px-2 py-1 text-sm font-semibold text-foreground-muted"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          {thread.length > 0 ? (
            <ol className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
              {thread.map((turn, index) => (
                <li key={`${turn.role}-${index}`}>
                  <p className="text-[11px] font-semibold text-foreground-muted">
                    {turn.role === "user" ? "You" : "Navigator"}
                  </p>
                  <p className="mt-0.5">{turn.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="mt-3 space-y-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-background-alt"
                    onClick={() => void send(suggestion)}
                    disabled={busy}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(message);
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
        </div>
      ) : null}
      <button
        type="button"
        aria-label={ASK_FAB_LABEL}
        onClick={() => setOpen((value) => !value)}
        className="fixed right-4 bottom-4 z-40 inline-flex h-11 items-center gap-2 rounded-full bg-midnight pl-2.5 pr-4 text-sm font-bold text-white shadow-lg transition-[bottom] duration-200 hover:bg-onyx sm:right-6 sm:bottom-6 sm:h-12 sm:pl-3 sm:pr-5"
        style={dockStyle}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
          <Image
            src="/brand/startup-state-mark.svg"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
          />
        </span>
        <span className="font-display text-sm font-bold">{ASK_FAB_LABEL}</span>
      </button>
    </>
  );
}
