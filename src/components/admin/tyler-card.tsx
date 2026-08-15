"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const MESSAGE_LINES = [
  "Since you didn't get the card you were hoping for yesterday,",
  "I made one for you.",
  "Thanks for hosting this event!",
];

const TYPE_SPEED_MS_PER_CHAR = 28;

export function TylerCard() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section
      aria-label="A small thank-you to the AI Builder Day host"
      className="relative isolate mt-12 overflow-hidden rounded-2xl border border-white/10 bg-midnight p-10 text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/brand/topography-tile.webp)",
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative grid min-h-[280px] place-items-center">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative aspect-[4/3] w-[280px] rounded-lg shadow-[0_18px_42px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "linear-gradient(140deg, #f6f3ec 0%, #ece5d3 60%, #d9cfb5 100%)",
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Image
                src="/brand/startup-state-mark.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 opacity-80"
              />
              <span className="font-display text-sm tracking-wide text-midnight/85">For Tyler</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/45">
                TAP TO OPEN
              </span>
            </div>
          </button>
        ) : (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="A thank-you note for Tyler"
            className="relative w-[min(560px,90vw)] rounded-xl p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] sm:p-12"
            style={{
              background: "linear-gradient(160deg, #fdfaf3 0%, #f6f1e3 100%)",
              color: "#0d142b",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-md text-midnight/60 hover:bg-midnight/10"
            >
              ×
            </button>
            <Image
              src="/brand/startup-state-mark.svg"
              alt=""
              width={28}
              height={28}
              className="mb-4 h-7 w-7 opacity-90"
            />
            <h3 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-[#00A24C] sm:text-4xl">
              Tyler,
            </h3>
            <div className="space-y-2 font-serif text-base leading-snug italic sm:text-lg">
              {MESSAGE_LINES.map((line, index) => (
                <TypingLine
                  key={line}
                  text={line}
                  delayMs={index === 0 ? 250 : index * 1200 + 250}
                />
              ))}
            </div>
            <p className="mt-8 font-display text-sm font-extrabold tracking-tight">
              - Craig <span className="font-normal text-midnight/55">(and Claude)</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TypingLine({ text, delayMs }: { text: string; delayMs: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const startTimer = setTimeout(() => {
      let index = 0;
      const tick = () => {
        index += 1;
        setShown(index);
        if (index < text.length) setTimeout(tick, TYPE_SPEED_MS_PER_CHAR);
      };
      tick();
    }, delayMs);
    return () => clearTimeout(startTimer);
  }, [text, delayMs]);

  return (
    <p>
      <span>{text.slice(0, shown)}</span>
      {shown < text.length ? (
        <span className="mb-[-0.125rem] inline-block w-[1ch] animate-pulse text-primary">|</span>
      ) : null}
    </p>
  );
}
