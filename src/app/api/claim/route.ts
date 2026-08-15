import { NextResponse } from "next/server";
import { submitClaimRequest } from "@/lib/catalog/claim";
import { loadCatalogStartups } from "@/lib/catalog/load";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    startupId?: string;
    email?: string;
  } | null;
  if (!body?.startupId?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Invalid email or startup id" }, { status: 400 });
  }
  const result = submitClaimRequest({
    startups: await loadCatalogStartups(),
    startupId: body.startupId.trim(),
    email: body.email.trim(),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
