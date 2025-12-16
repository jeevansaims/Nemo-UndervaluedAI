const KEY = "nemo_alert_subs_v1";

export function loadAlertSubs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x).toUpperCase());
  } catch {
    return [];
  }
}

export function saveAlertSubs(tickers: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(tickers));
}

export function toggleAlertSub(ticker: string) {
  const t = ticker.toUpperCase();
  const items = loadAlertSubs();
  const isOn = items.includes(t);
  const next = isOn ? items.filter((x) => x !== t) : [t, ...items];
  saveAlertSubs(next);
  return { next, isOn: !isOn };
}
