import { SurfaceHero } from "@/components/catalog/surface-hero";
import { NEWS_ITEMS } from "@/lib/catalog/news";

export const metadata = {
  title: "Utah startup news",
  description: "Curated headlines from startup.utah.gov/news.",
};

export default function NewsPage() {
  const [feature, ...rest] = NEWS_ITEMS;
  return (
    <>
      <SurfaceHero
        eyebrow="News and announcements"
        title={
          <>
            What is happening in <span className="serif-italic text-bright-green">Utah&apos;s startup ecosystem.</span>
          </>
        }
      >
        <p>
          Curated from{" "}
          <a
            href="https://startup.utah.gov/news/"
            className="font-semibold text-bright-green underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            startup.utah.gov/news
          </a>
          . Each headline opens the official article.
        </p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] space-y-8 px-6 py-12">
        <a
          href={feature.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-border bg-white p-8 hover:border-primary/40 hover:shadow-md"
        >
          <p className="eyebrow !mb-3 !text-primary">Featured</p>
          <h2 className="h-display text-2xl leading-tight sm:text-3xl">{feature.title}</h2>
          <p className="mt-3 max-w-3xl text-foreground-muted">{feature.summary}</p>
          <p className="mt-4 flex items-center gap-3 text-xs text-foreground-muted">
            <span>{feature.date}</span>
            <span className="opacity-50">·</span>
            <span className="font-semibold text-primary">Read on startup.utah.gov</span>
          </p>
        </a>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-xl border border-border p-5 hover:border-primary/40"
              >
                <p className="text-[11px] text-foreground-muted">{item.date}</p>
                <h3 className="mt-2 font-display font-bold leading-snug">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-foreground-muted">{item.summary}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
