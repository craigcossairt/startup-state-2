"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export function YouParamLink({
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
