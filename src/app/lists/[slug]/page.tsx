import Link from "next/link";
import { getListBySlug } from "@/lib/lists/stockLists";
import { fetchQuote } from "@/lib/market/yahoo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ListDetailPage({ params }: Props) {
  const { slug } = await params;
  const list = getListBySlug(slug);

  if (!list) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link href="/lists" className="text-sm text-white/50 hover:text-white">
            ← Back to Lists
          </Link>
          <h1 className="mt-4 text-2xl">List not found</h1>
        </div>
      </main>
    );
  }

  // Fetch quotes for all tickers
  const stockData = await Promise.all(
    list.tickers.map(async (ticker) => {
      try {
        const quote = await fetchQuote(ticker);
        return {
          ticker,
          price: quote?.price ?? 0,
          change: quote?.change ?? 0,
          changePercent: quote?.changePercent ?? 0,
        };
      } catch (error) {
        console.error(`Failed to fetch quote for ${ticker}:`, error);
        return {
          ticker,
          price: 0,
          change: 0,
          changePercent: 0,
        };
      }
    })
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/lists" className="text-sm text-white/50 hover:text-white">
          ← Back to Lists
        </Link>

        <div className="mt-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">{list.name}</h1>
            <Badge variant="outline" className="border-white/20 text-white/60">
              {list.category}
            </Badge>
          </div>
          <p className="mt-2 text-white/60">{list.description}</p>
          <p className="mt-1 text-sm text-white/40">{list.tickers.length} stocks</p>
        </div>

        <Card className="mt-8 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-white/50">
                      Ticker
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase text-white/50">
                      Price
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase text-white/50">
                      Change
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase text-white/50">
                      Change %
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase text-white/50">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((stock) => (
                    <tr key={stock.ticker} className="border-b border-white/5">
                      <td className="py-4">
                        <span className="font-mono font-semibold">{stock.ticker}</span>
                      </td>
                      <td className="py-4 text-right">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className={`py-4 text-right ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)}
                      </td>
                      <td className={`py-4 text-right ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/ai-analysis?ticker=${stock.ticker}`}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Analyze →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
