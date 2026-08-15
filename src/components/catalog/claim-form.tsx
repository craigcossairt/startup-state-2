"use client";

import { useState } from "react";
import { CLAIM_MAIL_UNAVAILABLE } from "@/lib/catalog/claim";

export function ClaimForm({
  startupId,
  domain,
}: {
  startupId: string;
  domain: string | null;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-primary/40 bg-background-alt p-4">
        <p className="text-sm font-semibold">Email domain matches</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
          {message ?? CLAIM_MAIL_UNAVAILABLE}
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("submitting");
        setMessage(null);
        try {
          const response = await fetch("/api/claim", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ startupId, email }),
          });
          const body: unknown = await response.json().catch(() => ({}));
          const error =
            body && typeof body === "object" && "error" in body && typeof body.error === "string"
              ? body.error
              : null;
          const mailed =
            body && typeof body === "object" && "mailed" in body && body.mailed === true;
          const nextMessage =
            body &&
            typeof body === "object" &&
            "message" in body &&
            typeof body.message === "string"
              ? body.message
              : null;
          if (!response.ok) {
            setMessage(error ?? "Could not verify this claim.");
            setStatus("error");
            return;
          }
          if (mailed) {
            setMessage(nextMessage ?? `We sent a sign-in link to ${email}.`);
          } else {
            setMessage(nextMessage ?? CLAIM_MAIL_UNAVAILABLE);
          }
          setStatus("sent");
        } catch {
          setMessage("Network error");
          setStatus("error");
        }
      }}
    >
      <label className="block text-sm font-semibold">
        Your work email
        {domain ? (
          <span className="font-normal text-foreground-muted">
            {" "}
            (must be at <span className="font-mono">@{domain}</span>)
          </span>
        ) : null}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={domain ? `you@${domain}` : "you@your-company.com"}
          disabled={status === "submitting"}
          className="mt-1.5 h-11 w-full rounded-md border border-border px-3 text-sm font-normal"
        />
      </label>
      {message && status === "error" ? <p className="text-xs text-red-600">{message}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-midnight px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Checking email..." : "Verify work email"}
      </button>
      <p className="text-[10px] leading-snug text-foreground-muted">
        We check that your email sits on this listing&apos;s website domain. We do not store a
        password.
      </p>
    </form>
  );
}
