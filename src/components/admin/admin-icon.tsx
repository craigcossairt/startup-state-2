import type { JSX, SVGProps } from "react";

type IconName = "inbox" | "search" | "megaphone" | "bell" | "shield";

function InboxGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="m8 8 4-4 4 4" />
    </svg>
  );
}

function SearchGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
      <path d="M8 11h6" />
    </svg>
  );
}

function MegaphoneGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 10v4l8-2V8L4 10Z" />
      <path d="M12 8v8l7 3V5l-7 3Z" />
      <path d="M7 14v3a2 2 0 0 0 2 2h1" />
    </svg>
  );
}

function BellGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 7H4s2 0 2-7Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

function ShieldGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const GLYPHS: Record<IconName, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  inbox: InboxGlyph,
  search: SearchGlyph,
  megaphone: MegaphoneGlyph,
  bell: BellGlyph,
  shield: ShieldGlyph,
};

export function AdminIcon({ name }: { name: IconName }) {
  const Glyph = GLYPHS[name];
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vibrant-green text-white">
      <Glyph className="h-4 w-4" aria-hidden />
    </span>
  );
}
