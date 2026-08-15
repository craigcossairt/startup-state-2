"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/startups" || pathname.startsWith("/startups/")) return null;
  return children;
}
