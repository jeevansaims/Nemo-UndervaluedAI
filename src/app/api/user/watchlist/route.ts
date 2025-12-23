import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    include: { stock: { select: { ticker: true } } },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({ tickers: items.map((i) => i.stock.ticker) });
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

    // Find or create the stock
    let stock = await prisma.stock.findUnique({ where: { ticker } });
    
    if (!stock) {
      // Create a placeholder stock - will be enriched later
      stock = await prisma.stock.create({
        data: {
          ticker,
          companyName: ticker, // Placeholder
          currentPrice: 0,
        },
      });
    }

    await prisma.watchlistItem.upsert({
      where: {
        userId_stockId: {
          userId: session.user.id,
          stockId: stock.id,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        stockId: stock.id,
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
    // Find the stock first
    const stock = await prisma.stock.findUnique({ where: { ticker } });
    
    if (stock) {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId: session.user.id,
          stockId: stock.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from watchlist", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
