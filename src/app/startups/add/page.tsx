import Link from "next/link";
import { AddListingForm } from "@/components/catalog/add-listing-form";
import { FOOTER_EMAIL } from "@/lib/copy";

export const metadata = {
  title: "Add your startup",
  description: "Submit a Utah startup for the GOED catalog. Listings are not published from this form.",
};

export default function AddListingPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Link
        href="/startups"
        className="inline-flex text-sm font-semibold text-foreground-muted hover:text-foreground"
      >
        ← Back to map
      </Link>
      <div className="space-y-2">
        <p className="eyebrow !mb-0">Add your startup</p>
        <h1 className="h-display text-4xl">Put your company on the Utah map.</h1>
        <p className="serif-italic text-foreground-muted">
          Submit the basics. This form does not publish a listing. Email {FOOTER_EMAIL} so GOED can
          add it to the catalog, then claim it from the map.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6">
        <AddListingForm />
      </div>
    </section>
  );
}
