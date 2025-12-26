'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateAnalysisPDF } from '@/lib/utils/pdfGenerator';

interface AnalysisResult {
  ticker: string;
  marketData: {
    currentPrice: number;
    marketCap?: number;
  };
  valuation: {
    analysis: string;
    keyPoints: string[];
    targetPrice?: number;
    upside?: number;
  };
  sentiment: {
    analysis: string;
    keyPoints: string[];
    overallSentiment: 'Bullish' | 'Neutral' | 'Bearish';
    sentimentScore: number;
  };
  fundamental: {
    analysis: string;
    keyPoints: string[];
    financialHealth: 'Strong' | 'Moderate' | 'Weak';
    growthPotential: 'High' | 'Medium' | 'Low';
  };
  technical?: {
    analysis: string;
    keyPoints?: string[];
    trend?: 'Bullish' | 'Neutral' | 'Bearish';
    momentum?: 'Strong' | 'Moderate' | 'Weak';
    signal?: 'Bullish' | 'Bearish' | 'Neutral';
  };
  macro?: {
    analysis: string;
    keyPoints?: string[];
    economicOutlook?: 'Favorable' | 'Neutral' | 'Unfavorable';
    sectorTrend?: 'Tailwind' | 'Neutral' | 'Headwind';
  };
  warrenBuffett?: {
    analysis: string;
    signal: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
    moatScore: number;
    intrinsicValue: number;
    marginOfSafety: number;
  };
  personaAgents?: Record<string, {
    agentName: string;
    analysis: string;
    signal: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
  }>;
  risk: {
    analysis: string;
    keyPoints: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
    positionSize?: number;
    positionValue?: number;
    portfolioWeight?: number;
    suggestedStopLoss?: number;
    volatility?: number;
  };
  portfolioManager: {
    finalReport: string;
    analysis?: string; // Add the string field for full text
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidenceScore: number;
    targetPrice?: number;
    timeHorizon: string;
    keyTakeaways: string[];
    tradeSetup?: {
      suggestedAction: 'BUY' | 'SELL' | 'HOLD';
      entryPrice: number;
      targetPrice: number;
      stopLoss: number;
      riskRewardRatio: number;
      upside: number; // percentage
      downside: number; // percentage
      reasoning: string;
    };
  };
  processingTime: number;
}

export default function AIAnalysisPage() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | string>('?');

  const requestAnalysis = async () => {
    if (!ticker || ticker.trim().length === 0) {
      toast.error('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/ai-analysis/${ticker.toUpperCase()}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          toast.error(data.message);
          return;
        }
        throw new Error(data.message || 'Analysis failed');
      }

      setResult(data.result);
      setRemainingAnalyses(data.remainingAnalyses);
      toast.success(`Analysis completed in ${(data.result.processingTime / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze stock');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'BUY') return 'text-green-400 bg-green-500/20 border-green-500';
    if (rec === 'SELL') return 'text-red-400 bg-red-500/20 border-red-500';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === 'BUY') return <TrendingUp className="w-5 h-5" />;
    if (rec === 'SELL') return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-[#303741] text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Breadcrumbs */}
      {result && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition">
            Home
          </a>
          <span>›</span>
          <span className="text-foreground font-medium">{result.ticker}</span>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Stock Analysis</h1>
          <p className="text-muted-foreground">
            Get comprehensive AI-powered analysis using multiple expert agents
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/ai-analysis/history">View History</a>
        </Button>
      </div>

      {/* Request Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Analysis</CardTitle>
          <CardDescription>
            Enter a stock ticker to get institutional-grade AI analysis
            {typeof remainingAnalyses === 'number' && (
              <span className="ml-2 text-sm font-medium">
                ({remainingAnalyses} free analyses remaining)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter ticker (e.g., AAPL, MSFT, TSLA)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && requestAnalysis()}
              disabled={loading}
              className="max-w-md"
            />
            <Button onClick={requestAnalysis} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Stock'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">
                    {result.ticker}
                    <span className="text-lg text-muted-foreground ml-4">
                      ${result.marketData.currentPrice.toFixed(2)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {result.marketData.marketCap && (
                      <span>Market Cap: ${(result.marketData.marketCap / 1e9).toFixed(2)}B</span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-lg px-4 py-2 ${getRecommendationColor(result.portfolioManager.recommendation)}`}
                  >
                    <span className="flex items-center gap-2">
                      {getRecommendationIcon(result.portfolioManager.recommendation)}
                      {result.portfolioManager.recommendation}
                    </span>
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    Confidence: {result.portfolioManager.confidenceScore}%
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => generateAnalysisPDF({
                      ticker: result.ticker,
                      recommendation: result.portfolioManager.recommendation,
                      confidenceScore: result.portfolioManager.confidenceScore,
                      targetPrice: result.portfolioManager.targetPrice,
                      currentPrice: result.marketData.currentPrice,
                      marketCap: result.marketData.marketCap,
                      createdAt: new Date(),
                      finalReport: result.portfolioManager.finalReport,
                      valuationResult: result.valuation?.analysis,
                      sentimentResult: result.sentiment?.analysis,
                      fundamentalResult: result.fundamental?.analysis,
                      riskResult: result.risk?.analysis,
                      technicalResult: result.technical?.analysis,
                      macroResult: result.macro?.analysis,
                      warrenBuffett: result.warrenBuffett,
                      personaAgents: result.personaAgents,
                    })}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.portfolioManager.targetPrice && (
                  <div>
                    <span className="font-medium">Target Price: </span>
                    <span className="text-lg">${result.portfolioManager.targetPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground ml-2">
                      ({result.portfolioManager.timeHorizon})
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Key Takeaways</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(result.portfolioManager.keyTakeaways || []).map((takeaway, idx) => (
                      <li key={idx} className="text-sm">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            </Card>

          {/* Trade Setup Card */}
          {result.portfolioManager.tradeSetup && (
            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  Trade Setup
                </CardTitle>
                <CardDescription>
                  Synthesized from Technical Support/Resistance and Volatility Analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Entry */}
                  <div className="p-4 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Entry Zone</div>
                    <div className="text-2xl font-bold">
                      ${result.portfolioManager.tradeSetup.entryPrice.toFixed(2)}
                    </div>
                    <Badge variant="outline" className="mt-2">Current Price</Badge>
                  </div>

                  {/* Stop Loss */}
                  <div className="p-4 bg-background rounded-lg border border-red-200 dark:border-red-900/50">
                    <div className="text-sm text-muted-foreground mb-1">Stop Loss</div>
                    <div className="text-2xl font-bold text-red-500">
                      ${result.portfolioManager.tradeSetup.stopLoss.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {result.portfolioManager.tradeSetup.downside.toFixed(2)}% Downside
                    </div>
                  </div>

                  {/* Target */}
                  <div className="p-4 bg-background rounded-lg border border-green-200 dark:border-green-900/50">
                    <div className="text-sm text-muted-foreground mb-1">Target Price</div>
                    <div className="text-2xl font-bold text-green-500">
                      ${result.portfolioManager.tradeSetup.targetPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {result.portfolioManager.tradeSetup.upside.toFixed(2)}% Upside
                    </div>
                  </div>

                  {/* Risk/Reward */}
                  <div className="p-4 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Risk / Reward</div>
                    <div className="text-2xl font-bold">
                      1 : {result.portfolioManager.tradeSetup.riskRewardRatio}
                    </div>
                    <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden flex">
                      <div className="bg-red-500 h-full w-1/4" />
                      <div className="bg-green-500 h-full w-3/4" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground bg-background p-3 rounded border">
                  <strong>Strategy:</strong> {result.portfolioManager.tradeSetup.reasoning}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="final" className="w-full">
           <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="final">Final Report</TabsTrigger>
              <TabsTrigger value="warren">Warren Buffett</TabsTrigger>
              <TabsTrigger value="personas">Investor Analysts</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="fundamental">Fundamentals</TabsTrigger>
              <TabsTrigger value="risk">Risk & Position</TabsTrigger>
              <TabsTrigger value="peers">Peer Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="warren">
              <Card>
                <CardHeader>
                  <CardTitle>Warren Buffett Analysis</CardTitle>
                  <CardDescription>Moat, Consistency, and Intrinsic Value Analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.warrenBuffett ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="font-medium">Signal:</span>{' '}
                          <Badge 
                            variant={
                              result.warrenBuffett.signal === 'Bullish' ? 'default' : 
                              result.warrenBuffett.signal === 'Bearish' ? 'destructive' : 'secondary'
                            }
                            className={
                              result.warrenBuffett.signal === 'Bullish' ? 'bg-green-600' : ''
                            }
                          >
                            {result.warrenBuffett.signal}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span>{' '}
                          {result.warrenBuffett.confidence}%
                        </div>
                        <div>
                          <span className="font-medium">Moat Score:</span>{' '}
                          <Badge variant="outline">{result.warrenBuffett.moatScore}/5</Badge>
                        </div>
                         <div>
                          <span className="font-medium">Intrinsic Value:</span>{' '}
                          ${(result.warrenBuffett.intrinsicValue / 1e9).toFixed(2)}B
                        </div>
                        <div>
                          <span className="font-medium">Margin of Safety:</span>{' '}
                          <span className={result.warrenBuffett.marginOfSafety > 0 ? 'text-green-600' : 'text-red-600'}>
                             {(result.warrenBuffett.marginOfSafety * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{result.warrenBuffett.analysis}</pre>
                      </div>
                    </div>
                  ) : (
                     <div className="text-muted-foreground italic">Analysis not available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas">
              <Card>
                <CardHeader>
                  <CardTitle>Investor Analyst Signals</CardTitle>
                  <CardDescription>How 12 famous investors would view this stock - click to expand for detailed reasoning</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.personaAgents ? (
                    <div className="space-y-4">
                      {Object.entries(result.personaAgents).map(([key, agent]) => (
                        <details key={key} className="border border-white/10 rounded-lg overflow-hidden group">
                          <summary className="p-4 bg-[#313131] hover:bg-[#3a3a3a] transition-colors cursor-pointer flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-medium capitalize text-white">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <Badge 
                                variant={
                                  agent.signal === 'Bullish' ? 'default' : 
                                  agent.signal === 'Bearish' ? 'destructive' : 'secondary'
                                }
                                className={agent.signal === 'Bullish' ? 'bg-green-600' : ''}
                              >
                                {agent.signal}
                              </Badge>
                              <span className="text-sm text-white/60">
                                ({agent.confidence}% confidence)
                              </span>
                            </div>
                            <span className="text-white/60 text-sm group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="p-4 border-t border-white/10 bg-[#252525]">
                            <div className="prose prose-sm prose-invert max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-white/90 bg-transparent">{agent.analysis}</pre>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">Persona analyses not available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="final">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Manager Recommendation</CardTitle>
                  <CardDescription>Synthesis of all expert analyses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">
                      {result.portfolioManager.finalReport}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valuation">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Analysis</CardTitle>
                  <CardDescription>Deep value analysis by AI valuation expert</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.valuation.targetPrice && (
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-medium">Target Price:</span> $
                          {result.valuation.targetPrice.toFixed(2)}
                        </div>
                        {result.valuation.upside !== undefined && (
                          <div>
                            <span className="font-medium">Upside:</span>{' '}
                            <span
                              className={result.valuation.upside > 0 ? 'text-green-600' : 'text-red-600'}
                            >
                              {result.valuation.upside.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{result.valuation.analysis}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>Market sentiment and momentum indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-medium">Overall Sentiment:</span>{' '}
                        <Badge>{result.sentiment.overallSentiment}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Sentiment Score:</span>{' '}
                        {result.sentiment.sentimentScore}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{result.sentiment.analysis}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fundamental">
              <Card>
                <CardHeader>
                  <CardTitle>Fundamental Analysis</CardTitle>
                  <CardDescription>Financial health and business quality assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-medium">Financial Health:</span>{' '}
                        <Badge>{result.fundamental.financialHealth}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Growth Potential:</span>{' '}
                        <Badge>{result.fundamental.growthPotential}</Badge>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{result.fundamental.analysis}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                  <CardDescription>Comprehensive risk assessment and mitigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-medium">Risk Level:</span>{' '}
                        <Badge
                          variant={
                            result.risk.riskLevel === 'High'
                              ? 'destructive'
                              : result.risk.riskLevel === 'Low'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {result.risk.riskLevel}
                        </Badge>
                      </div>
                    </div>
                    {/* Position Sizing Section */}
                    {result.risk.positionSize && (
                      <div className="bg-muted/50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold mb-3">📊 Position Sizing (for $100k portfolio)</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Suggested Shares:</span>
                            <div className="text-xl font-bold">{result.risk.positionSize.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Position Value:</span>
                            <div className="text-xl font-bold">${result.risk.positionValue?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Portfolio Weight:</span>
                            <div className="text-xl font-bold">{result.risk.portfolioWeight?.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Key Risk Factors</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.risk.riskFactors.map((factor, idx) => (
                          <li key={idx} className="text-sm">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{result.risk.analysis}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="peers">
              <Card>
                <CardHeader>
                  <CardTitle>Peer Comparison</CardTitle>
                  <CardDescription>
                    Compare {result.ticker} to its industry leaders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Comparison Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-2 font-semibold">Company</th>
                            <th className="text-right py-3 px-2 font-semibold">Market Cap</th>
                            <th className="text-right py-3 px-2 font-semibold">P/E Ratio</th>
                            <th className="text-right py-3 px-2 font-semibold">P/B Ratio</th>
                            <th className="text-right py-3 px-2 font-semibold">Net Margin</th>
                            <th className="text-right py-3 px-2 font-semibold">Debt/Equity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Current Stock Row - Highlighted */}
                          <tr className="border-b border-white/5 bg-blue-500/10">
                            <td className="py-3 px-2 font-semibold text-blue-400">{result.ticker}</td>
                            <td className="text-right py-3 px-2">
                              {result.marketData.marketCap
                                ? `$${(result.marketData.marketCap / 1e9).toFixed(2)}B`
                                : 'N/A'}
                            </td>
                            <td className="text-right py-3 px-2">
                              {(result as any).marketData.peRatio?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="text-right py-3 px-2">
                              {(result as any).marketData.pbRatio?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="text-right py-3 px-2">N/A</td>
                            <td className="text-right py-3 px-2">
                              {(result as any).marketData.debtToEquity?.toFixed(2) || 'N/A'}
                            </td>
                          </tr>

                          {/* Peer Rows */}
                          {(result as any).peerComparison?.peerData && (result as any).peerComparison.peerData.length > 0 ? (
                            (result as any).peerComparison.peerData.map((peer: any, idx: number) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                                <td className="py-3 px-2 font-medium">{peer.ticker}</td>
                                <td className="text-right py-3 px-2">
                                  {peer.marketCap
                                    ? `$${(peer.marketCap / 1e9).toFixed(2)}B`
                                    : 'N/A'}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {peer.peRatio?.toFixed(2) || 'N/A'}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {peer.pbRatio?.toFixed(2) || 'N/A'}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {peer.netMargin ? `${(peer.netMargin * 100).toFixed(2)}%` : 'N/A'}
                                </td>
                                <td className="text-right py-3 px-2">
                                  {peer.debtToEquity?.toFixed(2) || 'N/A'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b border-white/5">
                              <td colSpan={6} className="py-4 px-2 text-center text-muted-foreground italic">
                                Loading peer comparison data...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Analysis Text */}
                    {(result as any).peerComparison?.analysis && (
                      <div className="prose prose-sm max-w-none mt-6">
                        <h4 className="font-semibold mb-3">Competitive Analysis</h4>
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {(result as any).peerComparison.analysis}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Info Card */}
      {!result && !loading && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>How it works:</strong> Our AI system uses multiple specialized agents powered by
                  Claude 3.5 Sonnet (Anthropic) to analyze stocks from different perspectives:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Valuation Agent - Deep value analysis and intrinsic value calculation</li>
                  <li>Sentiment Agent - Market sentiment and momentum analysis</li>
                  <li>Fundamental Agent - Financial health and business quality</li>
                  <li>Risk Agent - Comprehensive risk assessment</li>
                  <li>Portfolio Manager - Synthesis and final recommendation</li>
                </ul>
                <p className="mt-2">
                  Free users get 5 analyses per month. Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
