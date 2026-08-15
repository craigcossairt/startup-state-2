"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();
  const onMap = pathname.startsWith("/map");
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Startup State home" className="shrink-0 hover:opacity-80">
            <Image
              src="/brand/ss-horiz-color.png"
              alt="Startup State"
              width={140}
              height={36}
              priority
              className="hidden h-7 w-auto sm:block"
            />
            <Image
              src="/brand/startup-state-mark.svg"
              alt="Startup State"
              width={28}
              height={28}
              priority
              className="h-7 w-7 sm:hidden"
            />
          </Link>
          <a
            href="https://business.utah.gov/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Governor's Office of Economic Opportunity"
            className="hidden items-center border-l border-border pl-3 hover:opacity-80 md:inline-flex"
          >
            <Image
              src="/brand/goeo-only-color.png"
              alt="Governor's Office of Economic Opportunity"
              width={170}
              height={36}
              className="h-7 w-auto"
            />
          </a>
        </div>
        <nav>
          <Link
            href={onMap ? "/map" : "/"}
            className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold ${
              onMap
                ? "bg-midnight text-white"
                : "text-foreground-muted hover:bg-background-alt hover:text-foreground"
            }`}
          >
            Opportunity Map
          </Link>
        </nav>
      </div>
    </header>
  );
}
