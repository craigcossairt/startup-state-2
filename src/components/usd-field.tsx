"use client";

import { useState } from "react";
import { formatUsdDraft, parseUsdDraft } from "@/lib/intake/usd-draft";

export function UsdField({
  id,
  value,
  onChange,
  required,
  describedBy,
}: {
  id: string;
  value: number | undefined;
  onChange: (amount: number | undefined) => void;
  required?: boolean;
  describedBy?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [buffer, setBuffer] = useState("");
  const display = focused ? buffer : formatUsdDraft(value).replace(/^\$/, "");

  return (
    <div className="flex w-full items-center rounded-md border border-border bg-white">
      <span className="pl-3 text-foreground-muted" aria-hidden>
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        required={required}
        aria-describedby={describedBy}
        autoComplete="off"
        className="w-full rounded-md border-0 bg-transparent px-2 py-2"
        value={display}
        onFocus={() => {
          setBuffer(value === undefined ? "" : String(value));
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
          if (parseUsdDraft(buffer) === undefined) {
            onChange(undefined);
            setBuffer("");
          }
        }}
        onChange={(event) => {
          const text = event.target.value;
          setBuffer(text);
          onChange(parseUsdDraft(text));
        }}
      />
    </div>
  );
}
