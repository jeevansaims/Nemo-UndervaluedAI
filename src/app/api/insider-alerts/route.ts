import { NextResponse } from 'next/server';
import { generateInsiderTrades } from '@/lib/insider/generateInsiderData';

// Generate fresh data per request (or you could cache it)
// For a demo, dynamic is fine.
export async function GET() {
  const trades = generateInsiderTrades(50);
  
  // Calculate summary stats
  const buyVolume = trades
    .filter(t => t.transactionType === 'Buy')
    .reduce((sum, t) => sum + t.value, 0);
    
  const sellVolume = trades
    .filter(t => t.transactionType === 'Sell')
    .reduce((sum, t) => sum + t.value, 0);

  return NextResponse.json({
    trades,
    stats: {
      buyVolume,
      sellVolume,
      buyCount: trades.filter(t => t.transactionType === 'Buy').length,
      sellCount: trades.filter(t => t.transactionType === 'Sell').length,
    }
  });
}
