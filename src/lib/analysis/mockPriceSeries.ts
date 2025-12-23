export type PricePoint = {
  date: string;   // YYYY-MM-DD
  price: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromTicker(ticker: string) {
  let s = 0;
  for (let i = 0; i < ticker.length; i++) s = (s * 31 + ticker.charCodeAt(i)) >>> 0;
  return s || 1;
}

export function buildMockPriceSeries(ticker: string, days = 120): PricePoint[] {
  const rand = mulberry32(seedFromTicker(ticker.toUpperCase()));
  const out: PricePoint[] = [];

  const today = new Date();
  let price = 50 + rand() * 250; // base

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // random walk
    const drift = (rand() - 0.48) * 1.5;
    const shock = (rand() - 0.5) * 3.0;
    price = Math.max(5, price + drift + shock);

    out.push({
      date: d.toISOString().slice(0, 10),
      price: Number(price.toFixed(2)),
    });
  }

  return out;
}
