/**
 * API Route: Broker Status
 * GET /api/broker/status
 * Returns broker connection status and account info
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAccountInfo, getPositions, AlpacaConfig } from '@/lib/broker/alpaca';

// Decrypt XOR encrypted key
function decryptKey(encrypted: string): string {
  const salt = process.env.AUTH_SECRET || 'default-salt';
  const decoded = Buffer.from(encrypted, 'base64').toString();
  return decoded.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
  ).join('');
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get broker connection
    const connection = await prisma.brokerConnection.findUnique({
      where: { userId: session.user.id },
    });

    if (!connection) {
      return NextResponse.json({
        connected: false,
        message: 'No broker connection found',
      });
    }

    if (!connection.isActive) {
      return NextResponse.json({
        connected: false,
        broker: connection.broker,
        message: 'Broker connection is inactive',
      });
    }

    // Decrypt credentials and fetch account info
    const config: AlpacaConfig = {
      keyId: decryptKey(connection.apiKey),
      secretKey: decryptKey(connection.apiSecret),
      paper: connection.paperTrading,
    };

    try {
      const [accountInfo, positions] = await Promise.all([
        getAccountInfo(config),
        getPositions(config),
      ]);

      return NextResponse.json({
        connected: true,
        broker: connection.broker,
        paperTrading: connection.paperTrading,
        account: {
          accountNumber: accountInfo.account_number,
          status: accountInfo.status,
          currency: accountInfo.currency,
          cash: accountInfo.cash,
          portfolioValue: accountInfo.portfolio_value,
          buyingPower: accountInfo.buying_power,
          equity: accountInfo.equity,
        },
        positions: positions.map(pos => ({
          symbol: pos.symbol,
          qty: pos.qty,
          marketValue: pos.market_value,
          unrealizedPl: pos.unrealized_pl,
          unrealizedPlPc: pos.unrealized_plpc,
          currentPrice: pos.current_price,
        })),
        positionCount: positions.length,
      });
    } catch (apiError) {
      console.error('Alpaca API error:', apiError);
      return NextResponse.json({
        connected: false,
        broker: connection.broker,
        error: 'Failed to connect to broker API. Credentials may be expired.',
      });
    }
  } catch (error) {
    console.error('Broker status error:', error);
    return NextResponse.json(
      { error: 'Failed to get broker status' },
      { status: 500 }
    );
  }
}
