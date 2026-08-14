import { NextResponse } from "next/server";
import { inferCompanyProfile } from "@/lib/grok/infer";
import type { CompanyProfile } from "@/lib/types/company-profile";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sentence?: string;
    known?: Partial<CompanyProfile>;
  };
  if (!body.sentence?.trim()) {
    return NextResponse.json({ error: "sentence is required" }, { status: 400 });
  }
  try {
    const profile = await inferCompanyProfile(body.sentence.trim(), body.known);
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Infer failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
