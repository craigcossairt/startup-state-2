"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LocationOption } from "@/lib/locations";

export function TypeaheadSelect({
  id,
  label,
  value,
  options,
  onChange,
  required,
}: {
  id: string;
  label?: string;
  value: string;
  options: LocationOption[];
  onChange: (code: string) => void;
  required?: boolean;
}) {
  const selected = options.find((row) => row.code === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const display = open ? query : selected?.name ?? query;

  const matches = useMemo(() => {
    const needle = (open ? query : "").trim().toLowerCase();
    const list = needle
      ? options.filter(
          (row) =>
            row.name.toLowerCase().includes(needle) ||
            row.code.toLowerCase().includes(needle),
        )
      : options;
    return list.slice(0, 12);
  }, [open, options, query]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  function choose(code: string) {
    const row = options.find((item) => item.code === code);
    onChange(code);
    setQuery(row?.name ?? code);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        autoComplete="off"
        required={required}
        className="w-full rounded-md border border-border bg-white px-3 py-2"
        value={display}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(selected?.name ?? "");
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && matches[0]) {
            event.preventDefault();
            choose(matches[0].code);
          }
        }}
      />
      {open ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-white shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-foreground-muted">No matches</li>
          ) : (
            matches.map((row) => (
              <li key={row.code} role="option" aria-selected={row.code === value}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    row.code === value ? "bg-accent-soft" : "hover:bg-off-white"
                  }`}
                  onClick={() => choose(row.code)}
                >
                  {row.name}
                  <span className="ml-2 text-foreground-muted">{row.code}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
