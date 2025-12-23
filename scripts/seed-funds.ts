// Seed AI Funds with realistic data
import { PrismaClient } from '@prisma/client';
import { 
  FUND_CONFIGS, 
  generatePerformanceCurve, 
  generateHoldings,
  calculateFundMetrics 
} from '../src/lib/funds/generateFundData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI Funds...\n');
  
  for (const [slug, config] of Object.entries(FUND_CONFIGS)) {
    console.log(`📊 Creating ${config.name}...`);
    
    // Generate performance data
    const performance = generatePerformanceCurve(config.performance);
    const metrics = calculateFundMetrics(performance);
    
    // Generate holdings
    const holdings = generateHoldings(config.type);
    
    // Create or update fund
    const fund = await prisma.fund.upsert({
      where: { slug },
      create: {
        slug,
        name: config.name,
        description: config.description,
      },
      update: {
        name: config.name,
        description: config.description,
      },
    });
    
    console.log(`  ✓ Fund created: ${fund.id}`);
    
    // Clear existing data
    await prisma.holding.deleteMany({ where: { fundId: fund.id } });
    await prisma.fundSnapshot.deleteMany({ where: { fundId: fund.id } });
    
    // Insert holdings
    for (const holding of holdings) {
      await prisma.holding.create({
        data: {
          fundId: fund.id,
          ticker: holding.ticker,
          name: holding.name,
          weightPct: holding.weightPct,
          rationale: holding.rationale,
        },
      });
    }
    
console.log(`  ✓ Created ${holdings.length} holdings`);
    
    // Insert performance snapshots
    for (const point of performance) {
      await prisma.fundSnapshot.create({
        data: {
          fundId: fund.id,
          date: point.date,
          equity: point.value,
          metrics: metrics ? JSON.parse(JSON.stringify(metrics)) : null,
        },
      });
    }
    
    console.log(`  ✓ Created ${performance.length} performance snapshots`);
    
    if (metrics) {
      console.log(`  📈 Metrics:`);
      console.log(`     Total Return: ${metrics.totalReturn}%`);
      console.log(`     Sharpe Ratio: ${metrics.sharpeRatio}`);
      console.log(`     Max Drawdown: ${metrics.maxDrawdown}%`);
      console.log(`     Volatility: ${metrics.volatility}%\n`);
    }
  }
  
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding funds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
