"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

export function YouParamLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <Link href={href} className={className}>
          {children}
        </Link>
      }
    >
      <YouParamLinkInner href={href} className={className}>
        {children}
      </YouParamLinkInner>
    </Suspense>
  );
}

function YouParamLinkInner({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const params = useSearchParams();
  const query = params.toString();
  const next = query ? `${href}${href.includes("?") ? "&" : "?"}${query}` : href;
  return (
    <Link href={next} className={className}>
      {children}
    </Link>
  );
}
