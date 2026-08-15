import type { ReactNode } from "react";

export function SurfaceHero({
  eyebrow,
  title,
  children,
  after,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "url(/brand/topography-tile.webp)",
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 py-16 sm:py-20">
        <p className="eyebrow !mb-3 !text-bright-green">{eyebrow}</p>
        <h1 className="h-display max-w-3xl text-4xl sm:text-6xl">{title}</h1>
        <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          {children}
        </div>
        {after}
      </div>
    </section>
  );
}
