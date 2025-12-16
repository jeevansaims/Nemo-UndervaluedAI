const KEY = "nemo_daily_brief_emails_v1";

export function loadBriefEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x));
  } catch {
    return [];
  }
}

export function saveBriefEmail(email: string) {
  if (typeof window === "undefined") return;
  const items = loadBriefEmails();
  const norm = email.trim().toLowerCase();
  if (!norm) return;
  if (items.includes(norm)) return;
  window.localStorage.setItem(KEY, JSON.stringify([norm, ...items]));
}
