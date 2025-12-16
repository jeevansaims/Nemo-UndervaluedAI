import { getServerRole } from "@/lib/auth/serverRole";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/holdings?fundSlug=...
export async function GET(req: Request) {
  const role = await getServerRole();
  if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const fundSlug = searchParams.get("fundSlug") || "original"; // default

  // Ensure fund exists (or handle error)
  let fund = await (prisma as any).fund.findUnique({ where: { slug: fundSlug } });
  
  // Auto-create mockup fund if not exists (Lazy Seeding)
  if (!fund) {
      fund = await (prisma as any).fund.create({
          data: {
              slug: fundSlug,
              name: "Nemo Undervalued AI",
              description: "AI-driven value investing strategy."
          }
      });
  }

  const holdings = await (prisma as any).holding.findMany({
      where: { fundId: fund.id },
      orderBy: { weightPct: 'desc' }
  });

  return NextResponse.json({ holdings });
}

// POST /api/admin/holdings (Create or Update by ticker)
export async function POST(req: Request) {
    const role = await getServerRole();
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { fundSlug = "original", ticker, name, weightPct, bucket, rationale, pnl, value } = body;

    if (!ticker) return NextResponse.json({ error: "Ticker required" }, { status: 400 });

    const fund = await (prisma as any).fund.findUnique({ where: { slug: fundSlug } });
    if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

    // Upsert
    const holding = await (prisma as any).holding.upsert({
        where: {
            fundId_ticker: {
                fundId: fund.id,
                ticker
            }
        },
        create: {
            fundId: fund.id,
            ticker,
            name,
            weightPct: parseFloat(weightPct), // ensure number
            bucket,
            rationale,
            pnl: pnl ? parseFloat(pnl) : undefined,
            value: value ? parseFloat(value) : undefined
        },
        update: {
            name,
            weightPct: parseFloat(weightPct),
            bucket,
            rationale,
            pnl: pnl ? parseFloat(pnl) : undefined,
            value: value ? parseFloat(value) : undefined
        }
    });

    return NextResponse.json({ holding });
}

// DELETE /api/admin/holdings?id=... or ?ticker=...
export async function DELETE(req: Request) {
    const role = await getServerRole();
    if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const ticker = searchParams.get("ticker");
    const fundSlug = searchParams.get("fundSlug") || "original";

    if (id) {
        await (prisma as any).holding.delete({ where: { id } });
    } else if (ticker) {
        const fund = await (prisma as any).fund.findUnique({ where: { slug: fundSlug } });
        if (fund) {
             await (prisma as any).holding.delete({
                 where: {
                     fundId_ticker: {
                         fundId: fund.id,
                         ticker
                     }
                 }
             });
        }
    } else {
        return NextResponse.json({ error: "ID or Ticker required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
