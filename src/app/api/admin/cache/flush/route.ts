import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { flushResilientCache } from "@/lib/api/resilientFetch";

export const runtime = "nodejs";

export async function POST() {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  flushResilientCache();
  
  return NextResponse.json({ ok: true, message: "Cache flushed" });
}
