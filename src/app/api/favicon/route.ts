import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain");
  if (!domain || !/^[a-z0-9.-]+$/i.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }
  const upstream = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  try {
    const response = await fetch(upstream, {
      headers: { "user-agent": "StartupState/1.0" },
      cache: "force-cache",
    });
    if (!response.ok) return new NextResponse(null, { status: 404 });
    const buf = await response.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") ?? "image/png",
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "access-control-allow-origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
