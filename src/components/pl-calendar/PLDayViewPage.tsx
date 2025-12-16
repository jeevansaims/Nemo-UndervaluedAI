"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, Download, MoreVertical } from "lucide-react";
import type { DailyTrade, DaySummary } from "./DayDetailModal";

interface PLDayViewProps {
  summary: DaySummary;
  onBack: () => void;
}

const fmtCompactUsd = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000_000)
    return `${sign}$${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000)
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString()}`;
};

const fmtUsd = (v: number) =>
  `$${Math.abs(v).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export function PLDayViewPage({ summary, onBack }: PLDayViewProps) {
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all");
  const [sort, setSort] = useState<"pl_desc" | "pl_asc" | "time_desc" | "time_asc">("time_asc");

  const { date, netPL, tradeCount, winRate, maxMargin, trades } = summary;

  const filteredTrades = useMemo(() => {
    let list = [...trades];
    if (filter === "wins") list = list.filter((t) => t.pl > 0);
    if (filter === "losses") list = list.filter((t) => t.pl < 0);

    list.sort((a, b) => {
      if (sort === "pl_desc") return b.pl - a.pl;
      if (sort === "pl_asc") return a.pl - b.pl;

      const aTime = a.dateOpened ? new Date(a.dateOpened).getTime() : 0;
      const bTime = b.dateOpened ? new Date(b.dateOpened).getTime() : 0;
      return sort === "time_desc" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [trades, filter, sort]);

  // Group trades by strategy
  const strategyGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        trades: DailyTrade[];
        totalPL: number;
        winCount: number;
        totalMargin: number;
      }
    >();

    trades.forEach((trade) => {
      const strategy = trade.strategy || "Custom";
      if (!groups.has(strategy)) {
        groups.set(strategy, {
          trades: [],
          totalPL: 0,
          winCount: 0,
          totalMargin: 0,
        });
      }
      const group = groups.get(strategy)!;
      group.trades.push(trade);
      group.totalPL += trade.pl;
      if (trade.pl > 0) group.winCount++;
      group.totalMargin += trade.margin || 0;
    });

    return Array.from(groups.entries()).map(([strategy, data]) => {
      const winRate =
        data.trades.length > 0 ? (data.winCount / data.trades.length) * 100 : 0;
      const romPct =
        data.totalMargin > 0 ? (data.totalPL / data.totalMargin) * 100 : undefined;
      const firstTrade = data.trades[0];
      const time = firstTrade?.dateOpened
        ? format(new Date(firstTrade.dateOpened), "HH:mm:ss")
        : undefined;

      return {
        strategy,
        ...data,
        winRate,
        romPct,
        time,
      };
    });
  }, [trades]);

  const winners = strategyGroups.filter((g) => g.totalPL > 0);
  const losers = strategyGroups.filter((g) => g.totalPL <= 0);

  const exportCsv = useCallback(() => {
    const headers = ["Strategy", "Legs", "Premium", "Margin", "P/L", "ROM%"];
    const rows = filteredTrades.map((t) => [
      t.strategy,
      t.legs,
      fmtUsd(t.premium),
      fmtUsd(t.margin),
      fmtUsd(t.pl),
      t.romPct ? `${t.romPct.toFixed(1)}%` : "—",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${format(date, "yyyy-MM-dd")}_trades.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredTrades, date]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-semibold tracking-tight">
            {format(date, "MMMM d, yyyy")}
          </h1>
          <p className="text-xs font-mono uppercase tracking-wide text-neutral-400 mt-1">
            Daily Performance Review
          </p>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs">
          <span className="text-neutral-500">Net P/L</span>
          <span
            className={cn(
              "font-semibold",
              netPL >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {fmtUsd(netPL)}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs">
          <span className="text-neutral-500">Trades</span>
          <span className="font-semibold text-neutral-200">{tradeCount}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs">
          <span className="text-neutral-500">Win Rate</span>
          <span className="font-semibold text-amber-300">{winRate}%</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs">
          <span className="text-neutral-500">Max Margin</span>
          <span className="font-semibold text-neutral-200">
            {fmtCompactUsd(maxMargin)}
          </span>
        </span>
      </div>

      {/* Strategy Cards */}
      {strategyGroups.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300 mb-3">
              Strategy Breakdown
            </h2>
            
            {/* Winners */}
            {winners.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-xs font-medium text-emerald-400/80 uppercase tracking-wide">
                  Winners ({winners.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {winners.map((group) => (
                    <Card
                      key={group.strategy}
                      className="bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-neutral-100 truncate">
                                {group.strategy}
                              </span>
                              {group.time && (
                                <span className="text-xs text-neutral-400 flex-shrink-0">
                                  {group.time}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <div>
                                <span className="text-neutral-400">Trades: </span>
                                <span className="text-neutral-200 font-medium">
                                  {group.trades.length}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400">Win: </span>
                                <span className="text-amber-300 font-medium">
                                  {group.winRate.toFixed(0)}%
                                </span>
                              </div>
                              {group.romPct !== undefined && group.romPct !== 0 && (
                                <div>
                                  <span className="text-neutral-400">ROM: </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      group.romPct > 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                    )}
                                  >
                                    {group.romPct.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-semibold text-emerald-400">
                              {fmtCompactUsd(group.totalPL)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Losers */}
            {losers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-red-400/80 uppercase tracking-wide">
                  {winners.length > 0 ? "Losers" : "All Trades"} ({losers.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {losers.map((group) => (
                    <Card
                      key={group.strategy}
                      className="bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-neutral-100 truncate">
                                {group.strategy}
                              </span>
                              {group.time && (
                                <span className="text-xs text-neutral-400 flex-shrink-0">
                                  {group.time}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <div>
                                <span className="text-neutral-400">Trades: </span>
                                <span className="text-neutral-200 font-medium">
                                  {group.trades.length}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400">Win: </span>
                                <span className="text-amber-300 font-medium">
                                  {group.winRate.toFixed(0)}%
                                </span>
                              </div>
                              {group.romPct !== undefined && group.romPct !== 0 && (
                                <div>
                                  <span className="text-neutral-400">ROM: </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      group.romPct > 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                    )}
                                  >
                                    {group.romPct.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={cn(
                                "text-lg font-semibold",
                                group.totalPL < 0
                                  ? "text-red-400"
                                  : "text-neutral-300"
                              )}
                            >
                              {fmtCompactUsd(group.totalPL)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Log Table */}
      <Card className="border-neutral-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold">
                Trade Log ({filteredTrades.length}/{trades.length} entries)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Detailed fills & legs
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-md border border-neutral-800 bg-neutral-900/80 p-1 text-xs">
                {(["all", "wins", "losses"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={cn(
                      "px-2 py-1 rounded-sm transition",
                      filter === key
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {key === "all" ? "All" : key === "wins" ? "Wins" : "Losses"}
                  </button>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportCsv}>
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-neutral-800 overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-neutral-900/90 border-neutral-800 backdrop-blur">
                  <TableHead className="w-[160px] text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    Strategy
                  </TableHead>
                  <TableHead className="w-[190px] text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    Legs
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    Premium
                  </TableHead>
                  <TableHead className="w-[130px] text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    Margin
                  </TableHead>
                  <TableHead className="w-[120px] text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    P/L
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                    ROM%
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade, idx) => (
                  <TableRow
                    key={`${trade.strategy}-${idx}`}
                    className="border-neutral-800 hover:bg-neutral-900/50 transition-colors"
                  >
                    <TableCell className="text-sm text-neutral-200">
                      {trade.strategy}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-400 font-mono">
                      {trade.legs}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-200 font-medium">
                      {fmtUsd(trade.premium)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-neutral-200 font-medium">
                      {fmtUsd(trade.margin)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right text-sm font-semibold",
                        trade.pl > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {fmtUsd(trade.pl)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-neutral-300">
                      {trade.romPct ? `${trade.romPct.toFixed(1)}%` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
