"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { DailyTrade } from "./DayDetailModal";

interface TradeCardProps {
  strategy: string;
  pl: number;
  trades: DailyTrade[];
  reasonForClose?: string;
  time?: string;
  winRate: number;
  romPct?: number;
  onClick: () => void;
}

const formatCurrency = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function TradeCard({
  strategy,
  pl,
  trades,
  reasonForClose,
  time,
  winRate,
  romPct,
  onClick,
}: TradeCardProps) {
  const tradeCount = trades.length;

  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors border-neutral-800 bg-neutral-900/60"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Strategy name row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold truncate text-neutral-100">
                {strategy}
              </span>
              {time && (
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {time}
                </span>
              )}
              {reasonForClose && (
                <Badge
                  variant="outline"
                  className="text-xs flex-shrink-0 bg-neutral-800 text-neutral-300"
                >
                  {reasonForClose}
                </Badge>
              )}
            </div>

            {/* P&L row - horizontal layout */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">P/L</span>
                <span
                  className={cn(
                    "text-lg font-semibold",
                    pl > 0 && "text-emerald-400",
                    pl < 0 && "text-red-400",
                    pl === 0 && "text-neutral-300"
                  )}
                >
                  {formatCurrency(pl)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Trades</span>
                <span className="text-lg font-semibold text-neutral-200">
                  {tradeCount}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Win Rate</span>
                <span className="text-lg font-semibold text-amber-300">
                  {winRate.toFixed(0)}%
                </span>
              </div>

              {romPct !== undefined && romPct !== 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400">ROM</span>
                  <span
                    className={cn(
                      "text-lg font-semibold",
                      romPct > 0 && "text-emerald-400",
                      romPct < 0 && "text-red-400"
                    )}
                  >
                    {romPct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Click indicator */}
          <ChevronRight className="h-5 w-5 text-neutral-400 flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface PLDayViewProps {
  trades: DailyTrade[];
  onTradeClick: (strategy: string) => void;
}

export function PLDayView({ trades, onTradeClick }: PLDayViewProps) {
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
        data.totalMargin > 0
          ? (data.totalPL / data.totalMargin) * 100
          : undefined;
      const firstTrade = data.trades[0];
      const time = firstTrade?.dateOpened
        ? new Date(firstTrade.dateOpened).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
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

  // Separate winners and losers
  const winners = strategyGroups.filter((g) => g.totalPL > 0);
  const losers = strategyGroups.filter((g) => g.totalPL <= 0);

  return (
    <div className="space-y-6">
      {/* Winners */}
      {winners.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            Winners ({winners.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {winners.map((group) => (
              <TradeCard
                key={group.strategy}
                strategy={group.strategy}
                pl={group.totalPL}
                trades={group.trades}
                winRate={group.winRate}
                romPct={group.romPct}
                time={group.time}
                onClick={() => onTradeClick(group.strategy)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Losers */}
      {losers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            {winners.length > 0 ? "Losers" : "All Trades"} ({losers.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {losers.map((group) => (
              <TradeCard
                key={group.strategy}
                strategy={group.strategy}
                pl={group.totalPL}
                trades={group.trades}
                winRate={group.winRate}
                romPct={group.romPct}
                time={group.time}
                onClick={() => onTradeClick(group.strategy)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {strategyGroups.length === 0 && (
        <Card className="py-8 border-neutral-800 bg-neutral-900/60">
          <CardContent className="text-center text-neutral-400">
            No trades on this day
          </CardContent>
        </Card>
      )}
    </div>
  );
}
