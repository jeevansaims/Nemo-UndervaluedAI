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
  risk: {
    analysis: string;
    keyPoints: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
  };
  portfolioManager: {
    finalReport: string;
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidenceScore: number;
    targetPrice?: number;
    timeHorizon: string;
    keyTakeaways: string[];
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
    if (rec === 'BUY') return 'text-green-600 bg-green-50 border-green-600';
    if (rec === 'SELL') return 'text-red-600 bg-red-50 border-red-600';
    return 'text-yellow-600 bg-yellow-50 border-yellow-600';
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === 'BUY') return <TrendingUp className="w-5 h-5" />;
    if (rec === 'SELL') return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
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
                      valuationResult: result.valuation.analysis,
                      sentimentResult: result.sentiment.analysis,
                      fundamentalResult: result.fundamental.analysis,
                      riskResult: result.risk.analysis,
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
                    {result.portfolioManager.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-sm">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="final" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="final">Final Report</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="fundamental">Fundamentals</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
            </TabsList>

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
                  Claude 3 Haiku (Anthropic) to analyze stocks from different perspectives:
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
  );
}
