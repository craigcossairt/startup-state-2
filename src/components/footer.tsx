import type { ReactNode, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FOOTER_CONNECT_EYEBROW,
  FOOTER_EMAIL,
  FOOTER_GOED_ADDRESS_1,
  FOOTER_GOED_ADDRESS_2,
  FOOTER_GOED_NAME,
  FOOTER_NEWSLETTER_BODY,
  FOOTER_NEWSLETTER_CTA,
  FOOTER_NEWSLETTER_EYEBROW,
  FOOTER_NEWSLETTER_URL,
  FOOTER_OFFICIAL_LINE,
} from "@/lib/copy";
import { FOOTER_LEGAL_LINKS } from "@/lib/site-nav";

export function Footer() {
  return (
    <footer id="site-footer" className="border-t border-white/10 bg-midnight text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1200px] items-center gap-5 px-6 py-3">
          <span className="eyebrow !mb-0 !text-white/60">{FOOTER_CONNECT_EYEBROW}</span>
          <div className="flex items-center gap-2.5 text-white/70">
            <SocialLink href="https://www.facebook.com/BusinessUtah/" label="Facebook">
              <FacebookIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href="https://www.instagram.com/businessutah/" label="Instagram">
              <InstagramIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href="https://twitter.com/BusinessUtah" label="X / Twitter">
              <XIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href="https://www.linkedin.com/company/businessutah/" label="LinkedIn">
              <LinkedinIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href="https://www.youtube.com/c/BusinessUtah" label="YouTube">
              <YoutubeIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href={`mailto:${FOOTER_EMAIL}`} label="Email">
              <MailIcon className="h-3.5 w-3.5" />
            </SocialLink>
            <SocialLink href="tel:+18014691600" label="Phone">
              <PhoneIcon className="h-3.5 w-3.5" />
            </SocialLink>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-10 px-6 py-12 md:grid-cols-3">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="mx-auto flex w-[10.5rem] flex-col items-center gap-5">
            <Link href="/" aria-label="Startup State home" className="block w-full hover:opacity-90">
              <Image
                src="/brand/ss-stacked-white.png"
                alt="Startup State"
                width={1058}
                height={735}
                className="h-auto w-full"
              />
            </Link>
            <div className="h-px w-1/2 bg-white/30" aria-hidden />
            <a
              href="https://business.utah.gov/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Governor's Office of Economic Development"
              className="block w-full hover:opacity-90"
            >
              <Image
                src="/brand/goed-only-white.svg"
                alt="Governor's Office of Economic Development"
                width={560}
                height={80}
                className="h-auto w-full"
              />
            </a>
          </div>
        </div>

        <div className="space-y-2 text-sm leading-relaxed text-white/80">
          <p>{FOOTER_GOED_NAME}</p>
          <p>
            {FOOTER_GOED_ADDRESS_1}
            <br />
            {FOOTER_GOED_ADDRESS_2}
          </p>
          <a
            href={`mailto:${FOOTER_EMAIL}`}
            className="mt-2 inline-flex items-center gap-1.5 text-bright-green hover:underline"
          >
            <MailIcon className="h-3.5 w-3.5" />
            {FOOTER_EMAIL}
          </a>
        </div>

        <div>
          <p className="eyebrow !mb-2 !text-bright-green">{FOOTER_NEWSLETTER_EYEBROW}</p>
          <p className="mb-4 text-sm leading-relaxed text-white/80">{FOOTER_NEWSLETTER_BODY}</p>
          <a
            href={FOOTER_NEWSLETTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full border-2 border-bright-green px-5 text-sm font-semibold text-bright-green hover:bg-bright-green hover:text-midnight"
          >
            {FOOTER_NEWSLETTER_CTA}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-3 px-6 py-5 text-[11px] text-white/50 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-extrabold tracking-tight text-white/85">
              UTAH
            </span>
            <span>{FOOTER_OFFICIAL_LINE}</span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4">
            {FOOTER_LEGAL_LINKS.map((item) =>
              item.kind === "internal" ? (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {item.label}
                </a>
              ),
            )}
            <span className="opacity-60">Built for AI Builder Day Part 2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.34 2.69.93 3.36.62 4.15.32 4.91.12 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.25 2.14.55 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.55C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.14-.25 2.91-.55.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.55-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.25-2.14-.55-2.91-.31-.79-.72-1.46-1.39-2.13C20.31 1.34 19.64.93 18.85.62c-.76-.3-1.64-.5-2.91-.55C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16S15.4 5.84 12 5.84zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.27 2.36 4.27 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51A3.02 3.02 0 0 0 23.5 17.8c.5-1.87.5-5.8.5-5.8s0-3.93-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3c0 1-1 2-2 2C9 19.5 4.5 15 4.5 5.5c0-1 1-2 2-2z" />
    </svg>
  );
}
