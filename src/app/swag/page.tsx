import Image from "next/image";
import { SWAG_ITEMS } from "@/lib/catalog/swag";

export const metadata = {
  title: "Startup State swag",
  description: "Official Startup State merch produced for GOED partners.",
};

export default function SwagPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-off-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[120%] w-[60%] opacity-30"
          style={{
            backgroundImage: "url(/brand/large-gradient-pattern.svg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right top",
            backgroundSize: "auto 100%",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-24 sm:py-28">
          <p className="eyebrow !mb-3">Brand at work</p>
          <h1 className="h-display max-w-3xl text-5xl sm:text-7xl">
            Swag worth <span className="serif-italic text-primary">earning.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
            The Startup State brand at human scale. Stickers, hoodies, hats, mugs, and packs
            founders can wear into a meeting or a demo day. Produced on demand for GOED partners.
          </p>
        </div>
      </section>
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SWAG_ITEMS.map((item) => (
              <li
                key={item.src}
                className="overflow-hidden rounded-2xl border border-border bg-white hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative aspect-[5/4] bg-background-alt">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
                <div className="p-5">
                  <p className="eyebrow !mb-1.5 !text-[0.6rem]">{item.tag}</p>
                  <h2 className="font-display text-lg font-extrabold tracking-tight">{item.title}</h2>
                  <p className="mt-1.5 text-sm text-foreground-muted">{item.caption}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="relative overflow-hidden border-b border-white/10 bg-midnight text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: "url(/brand/topography-tile.webp)",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-3">
          <div>
            <p className="eyebrow !mb-2 !text-bright-green">The patterns</p>
            <h2 className="h-display mb-3 text-3xl sm:text-4xl">
              Three brand patterns. One identity.
            </h2>
            <p className="leading-relaxed text-white/75">
              Topographical lines for backgrounds. Large gradient for statement art. Small icon
              repeat for surfaces and packaging.
            </p>
          </div>
          <article className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="eyebrow !mb-2 !text-[0.6rem] !text-bright-green">Topographical lines</p>
            <div
              className="mb-3 aspect-[3/2] overflow-hidden rounded-md"
              style={{
                backgroundImage: "url(/brand/topography-tile.webp)",
                backgroundSize: "cover",
              }}
            />
            <p className="text-sm leading-snug text-white/75">
              Contour lines on midnight. Used for hero backgrounds and landing surfaces.
            </p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="eyebrow !mb-2 !text-[0.6rem] !text-bright-green">Small icon</p>
            <div
              className="mb-3 aspect-[3/2] overflow-hidden rounded-md"
              style={{
                backgroundImage: "url(/brand/small-icon-pattern.svg)",
                backgroundRepeat: "repeat",
                backgroundSize: "120px 120px",
                backgroundColor: "#414042",
              }}
            />
            <p className="text-sm leading-snug text-white/75">
              Mark glyphs in alternating rows. Used on sticker packaging and bag linings.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
