import { z } from "zod";

export const FinnhubProfile2Schema = z.object({
  name: z.string().optional(),
  ticker: z.string().optional(),
  exchange: z.string().optional(),
  ipo: z.string().optional(),
  marketCapitalization: z.number().optional(),
  shareOutstanding: z.number().optional(),
  logo: z.string().optional(),
  finnhubIndustry: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  weburl: z.string().optional(),
});

export const FinnhubQuoteSchema = z.object({
  c: z.number(),  // Current price
  d: z.number(),  // Change
  dp: z.number(), // Percent change
  h: z.number(),  // High
  l: z.number(),  // Low
  o: z.number(),  // Open
  pc: z.number(), // Previous close
  t: z.number(),  // Timestamp
});

export const FinnhubCandlesSchema = z.object({
  c: z.array(z.number()),
  h: z.array(z.number()).optional(),
  l: z.array(z.number()).optional(),
  o: z.array(z.number()).optional(),
  v: z.array(z.number()).optional(),
  t: z.array(z.number()),
  s: z.enum(["ok", "no_data"]),
});

export const FinnhubBasicFinancialsSchema = z.object({
  metric: z.record(z.string(), z.union([z.number(), z.string(), z.null()])).optional(),
  series: z.unknown().optional(),
});

export const FinnhubCompanyNewsSchema = z.array(
  z.object({
    category: z.string().optional(),
    datetime: z.number(),
    headline: z.string(),
    id: z.number(),
    image: z.string().optional(),
    related: z.string().optional(),
    source: z.string().optional(),
    summary: z.string().optional(),
    url: z.string().optional(),
  })
);

export const FinnhubEarningsCalendarSchema = z.object({
  earningsCalendar: z.array(
    z.object({
      date: z.string().optional(),
      epsActual: z.number().nullable().optional(),
      epsEstimate: z.number().nullable().optional(),
      hour: z.string().optional(),
      quarter: z.number().optional(),
      revenueActual: z.number().nullable().optional(),
      revenueEstimate: z.number().nullable().optional(),
      symbol: z.string().optional(),
      year: z.number().optional(),
    })
  ).optional(),
});

export type FinnhubProfile2 = z.infer<typeof FinnhubProfile2Schema>;
export type FinnhubQuote = z.infer<typeof FinnhubQuoteSchema>;
export type FinnhubCandles = z.infer<typeof FinnhubCandlesSchema>;
export type FinnhubBasicFinancials = z.infer<typeof FinnhubBasicFinancialsSchema>;
export type FinnhubCompanyNews = z.infer<typeof FinnhubCompanyNewsSchema>;
export type FinnhubEarningsCalendar = z.infer<typeof FinnhubEarningsCalendarSchema>;
