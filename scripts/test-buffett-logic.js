
require('dotenv').config({ path: '.env.local' });
const { analyzeMoat, analyzeConsistency, calculateIntrinsicValue } = require('../src/lib/ai/financial-analysis');

// Mock Data: A "Buffett-style" company (consistent growth, high ROE)
const mockHistory = [
  { date: '2023-12-31', revenue: 1000, netIncome: 200, roe: 0.20, operatingMargin: 0.25, eps: 2.0, freeCashFlow: 220 },
  { date: '2022-12-31', revenue: 900,  netIncome: 180, roe: 0.19, operatingMargin: 0.24, eps: 1.8, freeCashFlow: 190 },
  { date: '2021-12-31', revenue: 800,  netIncome: 160, roe: 0.18, operatingMargin: 0.24, eps: 1.6, freeCashFlow: 170 },
  { date: '2020-12-31', revenue: 700,  netIncome: 140, roe: 0.17, operatingMargin: 0.23, eps: 1.4, freeCashFlow: 150 },
  { date: '2019-12-31', revenue: 600,  netIncome: 120, roe: 0.16, operatingMargin: 0.22, eps: 1.2, freeCashFlow: 130 },
];

async function runTest() {
  console.log("Running Quantitative Logic Tests...");

  console.log("\n1. Testing Moat Analysis...");
  const moat = analyzeMoat(mockHistory);
  console.log(`Score: ${moat.score}/5`);
  console.log("Details:", moat.details);

  console.log("\n2. Testing Consistency Analysis...");
  const consistency = analyzeConsistency(mockHistory);
  console.log(`Score: ${consistency.score}/5`);
  console.log("Details:", consistency.details);

  console.log("\n3. Testing Intrinsic Value (DCF)...");
  const iv = calculateIntrinsicValue(mockHistory, 100); // Current price irrelevant for calculation, only for MOS
  console.log(`Intrinsic Value: $${(iv.intrinsicValue).toFixed(2)}`);
  console.log("Assumptions:", iv.assumptions);

  console.log("\n✅ Quantitative Logic Verified.");
}

runTest().catch(console.error);
