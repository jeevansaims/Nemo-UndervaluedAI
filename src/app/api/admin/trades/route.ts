import { getServerRole } from "@/lib/auth/serverRole";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/trades
export async function GET(req: Request) {
    const role = await getServerRole();
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const fundSlug = searchParams.get("fundSlug") || "original";

    const fund = await (prisma as any).fund.findUnique({ where: { slug: fundSlug } });
    if (!fund) return NextResponse.json({ trades: [] });

    const trades = await (prisma as any).trade.findMany({
        where: { fundId: fund.id },
        orderBy: { date: 'desc' }
    });

    return NextResponse.json({ trades });
}

// POST /api/admin/trades
export async function POST(req: Request) {
    const role = await getServerRole();
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { fundSlug = "original", ticker, action, date, qty, price, rationale } = body; // action: BUY/SELL

    const fund = await (prisma as any).fund.findUnique({ where: { slug: fundSlug } });
    if (!fund) return NextResponse.json({ error: "Fund not found (Create holding first to seed fund)" }, { status: 404 });

    const trade = await (prisma as any).trade.create({
        data: {
            fundId: fund.id,
            ticker,
            action,
            date: new Date(date),
            qty: qty ? parseFloat(qty) : null,
            price: price ? parseFloat(price) : null,
            rationale
        }
    });

    return NextResponse.json({ trade });
}

// DELETE /api/admin/trades?id=...
export async function DELETE(req: Request) {
    const role = await getServerRole();
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await (prisma as any).trade.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
