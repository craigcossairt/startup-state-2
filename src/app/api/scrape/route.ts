import { NextResponse } from "next/server";
import { fetchWebsiteText, isPublicHttpUrl, normalizeWebsiteUrl } from "@/lib/scrape/website";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !isPublicHttpUrl(normalizeWebsiteUrl(url))) {
    return NextResponse.json(
      { error: "Enter a public http or https website URL." },
      { status: 400 },
    );
  }
  try {
    const site = await fetchWebsiteText(url);
    return NextResponse.json(site);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read that website.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
