import { NextResponse } from "next/server";
import { aggregateAlerts } from "@/lib/alerts/alertsService";

// Cache for 5 minutes
export const revalidate = 300; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickersParam = searchParams.get("tickers");
  
  // Default fallback if no tickers provided (Option A)
  const defaultTickers = ["SPY", "AAPL", "NVDA", "MSFT"];
  const tickers = tickersParam ? tickersParam.split(",").filter(Boolean) : defaultTickers;

  try {
    const alerts = await aggregateAlerts(tickers);
    return NextResponse.json({ alerts });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to fetch alerts", detail: String(e?.message ?? e) }, 
      { status: 500 }
    );
  }
}
