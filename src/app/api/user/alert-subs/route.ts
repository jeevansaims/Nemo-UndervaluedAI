import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/user/alert-subs
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const items = await prisma.alertSubscription.findMany({
    where: { userId: session.user.id },
    orderBy: { ticker: "asc" },
  });

  return NextResponse.json({ 
    subs: items.map((i) => ({ ticker: i.ticker })) 
  });
}

// POST /api/user/alert-subs (upsert)
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

    await prisma.alertSubscription.upsert({
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
    console.error("Failed to add alert sub", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/user/alert-subs?ticker=...
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
    await prisma.alertSubscription.deleteMany({
      where: {
        userId: session.user.id,
        ticker: ticker,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove alert sub", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
