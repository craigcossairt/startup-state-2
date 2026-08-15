"use client";

import { useEffect, useState, type SVGProps } from "react";
import {
  LEFTOVER_WATCH_MAIL_UNAVAILABLE,
  persistLeftoverWatch,
  type LeftoverWatchScope,
} from "@/lib/catalog/leftover-watch";

export function SaveSearchButton({
  scope,
  defaultLabel,
  filter,
  triggerClassName,
}: {
  scope: LeftoverWatchScope;
  defaultLabel: string;
  filter: Record<string, unknown>;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState(defaultLabel);
  const [cadence, setCadence] = useState<"daily" | "weekly">("weekly");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLabel(defaultLabel);
  }, [defaultLabel]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex h-9 items-center gap-1.5 rounded-full bg-midnight px-3.5 text-xs font-semibold text-white hover:bg-onyx"
        }
      >
        <BellPlusIcon className="h-3.5 w-3.5" />
        Email me when this changes
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-midnight/30 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setStatus("idle");
                setMessage(null);
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md hover:bg-background-alt"
              aria-label="Close"
            >
              ×
            </button>
            {status === "saved" ? (
              <div className="space-y-3">
                <h2 className="font-display text-xl font-extrabold">Saved on this device.</h2>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {message ?? LEFTOVER_WATCH_MAIL_UNAVAILABLE}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setStatus("idle");
                    setEmail("");
                    setMessage(null);
                  }}
                  className="mt-2 h-10 w-full rounded-md bg-midnight text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setStatus("saving");
                  setMessage(null);
                  try {
                    const local = persistLeftoverWatch(
                      { scope, email, label, filter, cadence },
                      window.localStorage,
                    );
                    if (!local.ok) {
                      setMessage(local.error);
                      setStatus("error");
                      return;
                    }
                    try {
                      await fetch("/api/leftover-watch", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ scope, email, label, filter, cadence }),
                      });
                    } catch {
                      /* Device storage is the record. The POST is optional. */
                    }
                    setMessage(local.message);
                    setStatus("saved");
                  } catch {
                    setMessage("Could not save on this device.");
                    setStatus("error");
                  }
                }}
              >
                <div>
                  <h2 className="mb-1 font-display text-xl font-extrabold">
                    {scope === "talent"
                      ? "Email me when new companies start hiring"
                      : "Email me when new startups match these filters"}
                  </h2>
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    Name the search. We save it on this device. Email delivery is not wired yet.
                  </p>
                </div>
                <label className="block space-y-1.5 text-sm font-semibold">
                  Search name
                  <input
                    required
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-semibold">
                  Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">Cadence</p>
                  <div className="flex gap-2">
                    {(["weekly", "daily"] as const).map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setCadence(item)}
                        className={`h-9 rounded-md border px-3 text-xs font-semibold capitalize ${
                          cadence === item
                            ? "border-primary bg-accent-soft/40 text-foreground"
                            : "border-border text-foreground-muted hover:bg-background-alt"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                {status === "error" && message ? (
                  <p className="text-xs text-red-600">{message}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={status === "saving" || !email}
                  className="h-10 w-full rounded-md bg-midnight text-sm font-semibold text-white disabled:opacity-40"
                >
                  {status === "saving" ? "Saving" : `Email me ${cadence}`}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function BellPlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M15 8h6" />
      <path d="M18 5v6" />
      <path d="M20.092 8.5A11 11 0 0 1 20.9 8a1 1 0 0 0-1.1-1 8 8 0 0 0-7.8-6 8 8 0 0 0-7.8 6 1 1 0 0 0-1.1 1 8 8 0 0 0 2.3 5.2L4 17h16l.4-1" />
    </svg>
  );
}
