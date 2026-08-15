"use client";

import { useState } from "react";
import { ADD_LISTING_NOT_PUBLISHED, submitAddListing } from "@/lib/catalog/add-listing";
import { ALL_REGIONS, ALL_SECTORS, ALL_STAGES, SECTOR_LABEL, STAGE_LABEL } from "@/lib/catalog/map-filters";

const empty = {
  name: "",
  website: "",
  description: "",
  sector: "Software",
  stage: "Seed",
  region: "Wasatch Front",
  city: "",
  fullAddress: "",
  submitterEmail: "",
};

export function AddListingForm() {
  const [form, setForm] = useState(empty);
  const [phase, setPhase] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  if (phase === "sent") {
    return (
      <div className="rounded-lg border border-primary/40 bg-accent-soft/30 p-4">
        <p className="text-sm font-semibold">Details received. Not published.</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
          {message ?? ADD_LISTING_NOT_PUBLISHED}
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPhase("submitting");
        setMessage(null);
        const local = submitAddListing(form);
        if (!local.ok) {
          setMessage(local.error);
          setPhase("error");
          return;
        }
        try {
          const response = await fetch("/api/startups/add", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          });
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
          };
          if (!response.ok) {
            setMessage(body.error ?? "Submit failed");
            setPhase("error");
            return;
          }
          setMessage(body.message ?? ADD_LISTING_NOT_PUBLISHED);
          setPhase("sent");
        } catch {
          setMessage("Network error");
          setPhase("error");
        }
      }}
    >
      <label className="block space-y-1.5 text-sm font-semibold">
        Company name
        <input
          required
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
          className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
          placeholder="Acme Industries"
          disabled={phase === "submitting"}
        />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold">
        Website
        <input
          required
          value={form.website}
          onChange={(event) => set("website", event.target.value)}
          className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
          placeholder="acme.com"
          disabled={phase === "submitting"}
        />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold">
        Description
        <textarea
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2 text-sm font-normal"
          placeholder="What does your company do? One sentence."
          disabled={phase === "submitting"}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5 text-sm font-semibold">
          Sector
          <select
            value={form.sector}
            onChange={(event) => set("sector", event.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
            disabled={phase === "submitting"}
          >
            {ALL_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {SECTOR_LABEL[sector]}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-semibold">
          Stage
          <select
            value={form.stage}
            onChange={(event) => set("stage", event.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
            disabled={phase === "submitting"}
          >
            {ALL_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5 text-sm font-semibold">
          Region
          <select
            value={form.region}
            onChange={(event) => set("region", event.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
            disabled={phase === "submitting"}
          >
            {ALL_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-semibold">
          City
          <input
            value={form.city}
            onChange={(event) => set("city", event.target.value)}
            className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
            placeholder="Lehi"
            disabled={phase === "submitting"}
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-sm font-semibold">
        Your email
        <input
          required
          type="email"
          value={form.submitterEmail}
          onChange={(event) => set("submitterEmail", event.target.value)}
          className="h-10 w-full rounded-md border border-border px-3 text-sm font-normal"
          placeholder="you@acme.com"
          disabled={phase === "submitting"}
        />
      </label>
      {phase === "error" && message ? <p className="text-xs text-red-600">{message}</p> : null}
      <button
        type="submit"
        disabled={phase === "submitting"}
        className="h-10 w-full rounded-md bg-midnight text-sm font-semibold text-white disabled:opacity-40"
      >
        {phase === "submitting" ? "Submitting" : "Submit for review"}
      </button>
    </form>
  );
}
