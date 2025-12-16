import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { ticker: "asc" },
  });

  return NextResponse.json({ tickers: items.map((i) => i.ticker) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const ticker = body.ticker?.toUpperCase().trim();

    if (!ticker || ticker.length > 10) {
      return new NextResponse("Invalid ticker", { status: 400 });
    }

    await prisma.watchlistItem.upsert({
      where: {
        userId_ticker: {
          userId: session.user.id,
          ticker: ticker,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        ticker: ticker,
      },
    });

    return NextResponse.json({ success: true, ticker });
  } catch (error) {
    console.error("Failed to add to watchlist", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return new NextResponse("Missing ticker", { status: 400 });
  }

  try {
    // Check if exists first to avoid error if already deleted
    // Or just deleteMany to be safe and idempotent
    await prisma.watchlistItem.deleteMany({
      where: {
        userId: session.user.id,
        ticker: ticker,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from watchlist", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
