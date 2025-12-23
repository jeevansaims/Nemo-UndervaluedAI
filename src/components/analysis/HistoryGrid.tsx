'use client';

import { StockAnalysis } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { generateAnalysisPDF } from "@/lib/utils/pdfGenerator";
import { Button } from "@/components/ui/button";

interface HistoryGridProps {
  history: StockAnalysis[];
}

export default function HistoryGrid({ history }: HistoryGridProps) {
  const handleDownload = (analysis: StockAnalysis) => {
    generateAnalysisPDF({
      ticker: analysis.ticker,
      recommendation: analysis.recommendation || undefined,
      confidenceScore: analysis.confidenceScore || undefined,
      targetPrice: analysis.targetPrice || undefined,
      currentPrice: analysis.currentPrice || undefined,
      marketCap: analysis.marketCap || undefined,
      createdAt: analysis.createdAt,
      finalReport: analysis.finalReport || undefined,
      valuationResult: analysis.valuationResult || undefined,
      sentimentResult: analysis.sentimentResult || undefined,
      fundamentalResult: analysis.fundamentalResult || undefined,
      riskResult: analysis.riskResult || undefined,
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {history.map((analysis) => {
        const sentimentColor = 
          analysis.recommendation === 'BUY' ? 'text-green-400' :
          analysis.recommendation === 'SELL' ? 'text-red-400' :
          'text-yellow-400';
        
        const sentimentBg = 
          analysis.recommendation === 'BUY' ? 'bg-green-400/10' :
          analysis.recommendation === 'SELL' ? 'bg-red-400/10' :
          'bg-yellow-400/10';

        return (
          <div 
            key={analysis.id}
            className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-neutral-700 hover:bg-neutral-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  {analysis.ticker}
                </h3>
                <p className="text-xs text-neutral-500">
                  {formatDistanceToNow(new Date(analysis.createdAt))} ago
                </p>
              </div>
              {analysis.recommendation && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${sentimentColor} ${sentimentBg}`}>
                  {analysis.recommendation}
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
              <div>
                <p className="text-xs text-neutral-500">Target Price</p>
                <p className="font-mono text-lg font-medium text-white">
                  {analysis.targetPrice ? `$${analysis.targetPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Confidence</p>
                <p className="font-mono text-lg font-medium text-white">
                  {analysis.confidenceScore ? `${analysis.confidenceScore}%` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDownload(analysis)}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
