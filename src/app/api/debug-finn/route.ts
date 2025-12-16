import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const raw = process.env.FINNHUB_API_KEY;
  const token = (raw || "").trim();

  // Safety: never leak full key
  const masked =
    token.length >= 8 ? `${token.slice(0, 4)}…${token.slice(-4)}` : "(missing)";

  return NextResponse.json({
    env: process.env.NODE_ENV,
    hasKey: Boolean(raw),
    rawLength: raw?.length ?? 0,
    trimmedLength: token.length,
    maskedKey: masked,
    hasQuotes: raw?.includes('"') ?? false,
    hasNewline: raw?.includes('\n') ?? false,
  });
}
