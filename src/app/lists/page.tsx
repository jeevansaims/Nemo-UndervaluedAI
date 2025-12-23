import Link from "next/link";
import { STOCK_LISTS, getListsByCategory } from "@/lib/lists/stockLists";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListsPage() {
  const sizeList = getListsByCategory("size");
  const sectorLists = getListsByCategory("sector");

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-4xl font-bold">Stock Lists</h1>
          <p className="mt-2 text-white/60">
            Curated lists of stocks organized by market cap and sector
          </p>
        </div>

        {/* By Size */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">By Market Cap</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sizeList.map((list) => (
              <Link key={list.slug} href={`/lists/${list.slug}`}>
                <Card className="h-full border-white/10 bg-white/5 transition hover:bg-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <CardDescription className="text-white/50">
                      {list.tickers.length} stocks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/60">{list.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* By Sector */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">By Sector</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectorLists.map((list) => (
              <Link key={list.slug} href={`/lists/${list.slug}`}>
                <Card className="h-full border-white/10 bg-white/5 transition hover:bg-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <CardDescription className="text-white/50">
                      {list.tickers.length} stocks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/60">{list.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
