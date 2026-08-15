import { NextResponse } from "next/server";
import { submitLeftoverWatch, type LeftoverWatchScope } from "@/lib/catalog/leftover-watch";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    scope?: LeftoverWatchScope;
    email?: string;
    label?: string;
    filter?: Record<string, unknown>;
    cadence?: "daily" | "weekly";
  } | null;
  if (!body?.email?.trim() || (body.scope !== "map" && body.scope !== "talent")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  const result = submitLeftoverWatch({
    scope: body.scope,
    email: body.email,
    label: body.label ?? "",
    filter: body.filter ?? {},
    cadence: body.cadence === "daily" ? "daily" : "weekly",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
