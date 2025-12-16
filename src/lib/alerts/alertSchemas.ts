export type AlertType = "NEWS" | "EARNINGS" | "INSIDER" | "MACRO" | "SYSTEM";
export type AlertSeverity = "LOW" | "MED" | "HIGH";

export type AlertItem = {
  id: string;
  ts: number; // unix seconds
  ticker?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  summary?: string; // HTML-safe or plain text
  url?: string;
  source?: string;
};
