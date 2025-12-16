export type RangeKey = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export function rangeToFromTo(range: RangeKey): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  const days =
    range === "1W" ? 7 :
    range === "1M" ? 30 :
    range === "3M" ? 90 :
    range === "6M" ? 180 :
    range === "1Y" ? 365 :
    3650; // ALL ~10Y

  const from = to - days * 24 * 60 * 60;
  return { from, to };
}

// Finnhub candle resolutions: 1,5,15,30,60,D,W,M
export function rangeToResolution(range: RangeKey): "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M" {
  if (range === "1W") return "60";
  if (range === "1M") return "60";
  if (range === "3M") return "D";
  if (range === "6M") return "D";
  if (range === "1Y") return "D";
  return "W";
}
