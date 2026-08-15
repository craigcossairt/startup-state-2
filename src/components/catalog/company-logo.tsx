"use client";

import { sectorColor } from "@/lib/catalog/map-filters";

export function CompanyLogo({
  website,
  name,
  color,
  className = "h-8 w-8",
}: {
  website: string | null;
  name: string;
  color?: string;
  className?: string;
}) {
  const domain = website
    ? website
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase()
    : null;
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-md bg-background-alt text-xs font-extrabold text-white ${className}`}
      style={{ background: color ?? sectorColor("Other") }}
    >
      {initial}
      {domain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/favicon?domain=${encodeURIComponent(domain)}`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}
