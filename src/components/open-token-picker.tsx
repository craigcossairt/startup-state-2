"use client";

import { useEffect, useRef, useState } from "react";
import { commitTechToken, normalizeTechToken, suggestTechTokens } from "@/lib/intake/tech-tokens";

export function OpenTokenPicker({
  id,
  selected,
  onChange,
  required,
  describedBy,
}: {
  id: string;
  selected: string[];
  onChange: (tokens: string[]) => void;
  required?: boolean;
  describedBy?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const suggestions = suggestTechTokens(query, selected);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  function commit(raw: string) {
    onChange(commitTechToken(selected, raw));
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <input
        required={required}
        tabIndex={-1}
        className="sr-only"
        value={selected.join(",")}
        onChange={() => undefined}
      />
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((token) => (
            <button
              key={token}
              type="button"
              aria-label={`Remove ${token}`}
              className="rounded-full border border-vibrant-green bg-accent-soft px-3 py-1.5 text-sm font-semibold text-midnight"
              onClick={() => onChange(selected.filter((item) => item !== token))}
            >
              {token}
              <span className="ml-2 text-foreground-muted" aria-hidden>
                x
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-describedby={describedBy}
          autoComplete="off"
          className="w-full rounded-md border border-border bg-white px-3 py-2"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && normalizeTechToken(query) && suggestions[0]) {
              event.preventDefault();
              commit(suggestions[0].token);
            }
          }}
        />
        {open ? (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-white shadow-lg"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-foreground-muted">No matches</li>
            ) : (
              suggestions.map((row, index) => (
                <li
                  key={`${row.kind}:${row.token}`}
                  role="option"
                  aria-selected={index === 0}
                >
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-off-white"
                    onClick={() => commit(row.token)}
                  >
                    {row.kind === "create" ? `Add "${row.token}"` : row.token}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
