export function fmtPct(x: number | null | undefined, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return "n/a";
  return `${(x * 100).toFixed(digits)}%`;
}

export function fmtNum(x: number | null | undefined, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return "n/a";
  return x.toFixed(digits);
}

export function fmtCurrency(x: number | null | undefined, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(x);
}
