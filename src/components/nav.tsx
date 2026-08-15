"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAV, navItemIsActive } from "@/lib/site-nav";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
            className="hidden items-center border-l border-border pl-3 hover:opacity-80 lg:inline-flex"
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
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {SITE_NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} active={navItemIsActive(pathname, item.href)} />
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-semibold xl:hidden"
          aria-expanded={open}
          aria-controls="site-nav-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav id="site-nav-menu" className="border-t border-border bg-background px-4 py-3 xl:hidden" aria-label="Primary">
          <ul className="grid grid-cols-2 gap-2">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex h-10 items-center rounded-md px-3 text-sm font-semibold ${
                    navItemIsActive(pathname, item.href)
                      ? "bg-midnight text-white"
                      : "bg-background-alt text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center rounded-md px-2.5 text-[13px] font-semibold ${
        active
          ? "bg-midnight text-white"
          : "text-foreground-muted hover:bg-background-alt hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
