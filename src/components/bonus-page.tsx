"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BonusBar } from "@/components/bonus-bar";
import { loadMapPayload } from "@/lib/session-map";
import type { OpportunityMapPayload } from "@/lib/types/opportunity";

export function BonusPage({
  title,
  active,
  children,
}: {
  title: string;
  active: string;
  children: (payload: OpportunityMapPayload) => React.ReactNode;
}) {
  const [payload, setPayload] = useState<OpportunityMapPayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPayload(loadMapPayload());
    setReady(true);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Opportunity Map</p>
      <h1 className="h-display mt-2 text-3xl">{title}</h1>
      <div className="mt-6">
        <BonusBar active={active} />
      </div>
      <p className="mt-4">
        <Link href="/map" className="text-sm font-semibold text-vibrant-green">
          Back to ranked cards
        </Link>
      </p>
      {!ready ? <p className="mt-8 text-sm">Loading...</p> : null}
      {ready && !payload ? (
        <p className="mt-8 text-sm">
          Open the Opportunity Map first so this view can use the current ranked
          cards.
        </p>
      ) : null}
      {payload ? <div className="mt-8">{children(payload)}</div> : null}
    </div>
  );
}
