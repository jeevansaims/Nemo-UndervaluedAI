/**
 * AI Orchestrator - Coordinates all agents and manages the analysis workflow
 * Updated to support 20 agents (9 functional + 11 persona)
 */

import { runValuationAgent } from './agents/valuation-agent';
import { runSentimentAgent } from './agents/sentiment-agent';
import { runFundamentalAgent } from './agents/fundamental-agent';
import { runRiskAgent } from './agents/risk-agent';
import { runTechnicalAgent } from './agents/technical-agent';
import { runPeerComparisonAgent } from './agents/peer-comparison-agent';
import { runMacroAgent } from './agents/macro-agent';
import { runEarningsCallAgent } from './agents/earnings-call-agent';
import { runWarrenBuffettAgent } from './agents/warren-buffett-agent';
// Persona Agents
import { runBenGrahamAgent } from './agents/ben-graham-agent';
import { runCharlieMungerAgent } from './agents/charlie-munger-agent';
import { runPeterLynchAgent } from './agents/peter-lynch-agent';
import { runMichaelBurryAgent } from './agents/michael-burry-agent';
import { runCathieWoodAgent } from './agents/cathie-wood-agent';
import { runBillAckmanAgent } from './agents/bill-ackman-agent';
import { runPhilFisherAgent } from './agents/phil-fisher-agent';
import { runStanleyDruckenmillerAgent } from './agents/stanley-druckenmiller-agent';
import { runAswathDamodaranAgent } from './agents/aswath-damodaran-agent';
import { runMohnishPabraiAgent } from './agents/mohnish-pabrai-agent';
import { runRakeshJhunjhunwalaAgent } from './agents/rakesh-jhunjhunwala-agent';
import { runPortfolioManager } from './agents/portfolio-manager';
import { MarketData, AnalysisResult } from './types';

/**
 * Run comprehensive multi-agent stock analysis
 * Executes all 20 agents in parallel, then synthesizes with portfolio manager
 */
export async function runStockAnalysis(
  marketData: MarketData,
  lastTargetPrice?: number
): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    console.log(`Starting 20-agent analysis for ${marketData.ticker}...`);
    if (lastTargetPrice) {
      console.log(`Last target price for ${marketData.ticker}: $${lastTargetPrice} (for consistency)`);
    }

    // Run ALL agents in parallel (9 functional + 11 persona = 20 total)
    const [
      // Functional Agents
      valuationResult,
      sentimentResult,
      fundamentalResult,
      riskResult,
      technicalResult,
      peerComparisonResult,
      macroResult,
      earningsCallResult,
      // Persona Agents
      warrenBuffettResult,
      benGrahamResult,
      charlieMungerResult,
      peterLynchResult,
      michaelBurryResult,
      cathieWoodResult,
      billAckmanResult,
      philFisherResult,
      stanleyDruckenmillerResult,
      aswathDamodaranResult,
      mohnishPabraiResult,
      rakeshJhunjhunwalaResult,
    ] = await Promise.all([
      // Functional
      runValuationAgent(marketData, lastTargetPrice),
      runSentimentAgent(marketData),
      runFundamentalAgent(marketData),
      runRiskAgent(marketData),
      runTechnicalAgent(marketData),
      runPeerComparisonAgent(marketData),
      runMacroAgent(marketData),
      runEarningsCallAgent(marketData),
      // Persona
      runWarrenBuffettAgent(marketData),
      runBenGrahamAgent(marketData),
      runCharlieMungerAgent(marketData),
      runPeterLynchAgent(marketData),
      runMichaelBurryAgent(marketData),
      runCathieWoodAgent(marketData),
      runBillAckmanAgent(marketData),
      runPhilFisherAgent(marketData),
      runStanleyDruckenmillerAgent(marketData),
      runAswathDamodaranAgent(marketData),
      runMohnishPabraiAgent(marketData),
      runRakeshJhunjhunwalaAgent(marketData),
    ]);

    console.log(`All 20 agents completed for ${marketData.ticker}`);

    // Collect all persona results for portfolio manager
    const personaResults = {
      warrenBuffett: warrenBuffettResult,
      benGraham: benGrahamResult,
      charlieMunger: charlieMungerResult,
      peterLynch: peterLynchResult,
      michaelBurry: michaelBurryResult,
      cathieWood: cathieWoodResult,
      billAckman: billAckmanResult,
      philFisher: philFisherResult,
      stanleyDruckenmiller: stanleyDruckenmillerResult,
      aswathDamodaran: aswathDamodaranResult,
      mohnishPabrai: mohnishPabraiResult,
      rakeshJhunjhunwala: rakeshJhunjhunwalaResult,
    };

    // Run portfolio manager to synthesize all analyses
    const portfolioManagerResult = await runPortfolioManager(
      marketData,
      valuationResult,
      sentimentResult,
      fundamentalResult,
      riskResult,
      technicalResult,
      peerComparisonResult,
      macroResult,
      earningsCallResult,
      personaResults
    );

    console.log(`Portfolio manager synthesis completed for ${marketData.ticker}`);

    const processingTime = Date.now() - startTime;

    return {
      ticker: marketData.ticker,
      marketData,
      valuation: valuationResult,
      sentiment: sentimentResult,
      fundamental: fundamentalResult,
      risk: riskResult,
      technical: technicalResult,
      peerComparison: peerComparisonResult,
      macro: macroResult,
      earningsCall: earningsCallResult,
      warrenBuffett: warrenBuffettResult,
      personaAgents: personaResults,
      portfolioManager: portfolioManagerResult,
      processingTime,
    };
  } catch (error) {
    console.error(`Stock analysis failed for ${marketData.ticker}:`, error);
    throw error;
  }
}

/**
 * Validate that required API keys are configured
 */
export function validateApiKeys() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured. All agents now use Claude (Anthropic).');
  }
}
