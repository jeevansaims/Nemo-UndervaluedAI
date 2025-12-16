export function fmtPct(n: number, digits = 2) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtMoney(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

/**
 * In public mode: hide money, show only a placeholder.
 * In private mode: show money.
 */
export function fmtMoneyMaybe(n: number, isPublic: boolean) {
  return isPublic ? "—" : fmtMoney(n);
}
