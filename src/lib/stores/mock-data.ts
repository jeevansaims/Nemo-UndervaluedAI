import { useBlockStore } from './block-store';

/**
 * Mock trading data for demo purposes
 * Creates realistic P/L calendar data without requiring database
 */
export async function initializeMockData() {
  const { blocks, addBlock } = useBlockStore.getState();
  
  // Only initialize if no blocks exist
  if (blocks.length > 0) {
    return;
  }

  console.log('Initializing mock trading data...');

  // Create a demo block with sample trades
  const demoBlock = {
    name: 'Demo Account',
    description: 'Sample trading data for P/L Calendar demonstration',
    isActive: true,
    lastModified: new Date(),
    tradeLog: {
      fileName: 'demo_trades.csv',
      rowCount: 45,
      fileSize: 15000,
    },
    stats: {
      totalPnL: 12450.50,
      winRate: 62.22,
      totalTrades: 45,
      avgWin: 425.80,
      avgLoss: -285.40,
    },
  };

  await addBlock(demoBlock);

  console.log('Mock data initialized successfully');
}

/**
 * Generate sample trades for the calendar
 * Returns trades spread across the last 60 days
 */
export function generateMockTrades() {
  const trades = [];
  const today = new Date();
  const strategies = ['Iron Condor', 'Credit Spread', 'Covered Call', 'Cash Secured Put', 'Butterfly'];
  
  // Generate 45 trades over the past 60 days
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const tradeDate = new Date(today);
    tradeDate.setDate(tradeDate.getDate() - daysAgo);
    
    // Skip weekends
    if (tradeDate.getDay() === 0 || tradeDate.getDay() === 6) {
      continue;
    }
    
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const isWinner = Math.random() > 0.38; // 62% win rate
    const pl = isWinner 
      ? 100 + Math.random() * 800  // Winners: $100-$900
      : -(50 + Math.random() * 600); // Losers: -$50 to -$650
    
    const premium = 200 + Math.random() * 400;
    const margin = 5000 + Math.random() * 10000;
    const openingPrice = 1 + Math.random() * 3;
    const closingPrice = openingPrice + (pl / 100);
    
    trades.push({
      dateOpened: tradeDate,
      timeOpened: '09:' + String(30 + Math.floor(Math.random() * 30)).padStart(2, '0') + ':00',
      openingPrice: Math.round(openingPrice * 100) / 100,
      legs: generateLegString(strategy),
      premium: Math.round(premium * 100) / 100,
      closingPrice: Math.round(closingPrice * 100) / 100,
      dateClosed: tradeDate,
      timeClosed: '15:' + String(30 + Math.floor(Math.random() * 30)).padStart(2, '0') + ':00',
      avgClosingCost: Math.round(closingPrice * 100) / 100,
      reasonForClose: isWinner ? 'Profit Target' : 'Stop Loss',
      pl: Math.round(pl * 100) / 100,
      numContracts: 1,
      fundsAtClose: 50000 + Math.random() * 20000,
      marginReq: Math.round(margin),
      strategy,
      openingCommissionsFees: 6.5,
      closingCommissionsFees: 6.5,
      openingShortLongRatio: 1.0,
      closingShortLongRatio: 1.0,
      openingVix: 15 + Math.random() * 10,
      closingVix: 15 + Math.random() * 10,
    });
  }
  
  return trades.sort((a, b) => 
    a.dateOpened.getTime() - b.dateOpened.getTime()
  );
}

function generateLegString(strategy: string): string {
  const strikes = Math.floor(4000 + Math.random() * 600);
  
  switch (strategy) {
    case 'Iron Condor':
      return `SPX ${strikes}/SHORT PUT | SPX ${strikes + 10}/LONG PUT | SPX ${strikes + 50}/SHORT CALL | SPX ${strikes + 60}/LONG CALL`;
    case 'Credit Spread':
      return `SPX ${strikes}/SHORT PUT | SPX ${strikes - 10}/LONG PUT`;
    case 'Covered Call':
      return `SPX ${strikes}/SHORT CALL`;
    case 'Cash Secured Put':
      return `SPX ${strikes}/SHORT PUT`;
    case 'Butterfly':
      return `SPX ${strikes}/LONG CALL | SPX ${strikes + 10}/SHORT CALL | SPX ${strikes + 10}/SHORT CALL | SPX ${strikes + 20}/LONG CALL`;
    default:
      return `SPX ${strikes}/CUSTOM`;
  }
}
