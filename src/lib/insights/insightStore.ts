import type { InsightPost } from "./mockInsights";

const KEY = "nemo_insights_custom_v1";

export function loadCustomInsights(): InsightPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as InsightPost[];
  } catch {
    return [];
  }
}

export function saveCustomInsights(posts: InsightPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(posts));
}

export function addCustomInsight(post: InsightPost) {
  const existing = loadCustomInsights();
  const next = [post, ...existing];
  saveCustomInsights(next);
  return next;
}
