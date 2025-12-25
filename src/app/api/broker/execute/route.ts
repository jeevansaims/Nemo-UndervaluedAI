/**
 * API Route: Execute Trade
 * POST /api/broker/execute
 * Executes a trade through the connected broker
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitOrder, AlpacaConfig, OrderRequest } from '@/lib/broker/alpaca';

// Decrypt XOR encrypted key
function decryptKey(encrypted: string): string {
  const salt = process.env.AUTH_SECRET || 'default-salt';
  const decoded = Buffer.from(encrypted, 'base64').toString();
  return decoded.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
  ).join('');
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fundSlug, ticker, action, shares } = body;

    // Validate required fields
    if (!fundSlug || !ticker || !action || !shares) {
      return NextResponse.json(
        { error: 'Missing required fields: fundSlug, ticker, action, shares' },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be BUY or SELL' },
        { status: 400 }
      );
    }

    if (shares <= 0) {
      return NextResponse.json(
        { error: 'Shares must be greater than 0' },
        { status: 400 }
      );
    }

    // Get broker connection
    const connection = await prisma.brokerConnection.findUnique({
      where: { userId: session.user.id },
    });

    if (!connection || !connection.isActive) {
      return NextResponse.json(
        { error: 'No active broker connection. Please connect your broker first.' },
        { status: 400 }
      );
    }

    // Create auto trade record
    const autoTrade = await prisma.autoTrade.create({
      data: {
        userId: session.user.id,
        fundSlug,
        ticker,
        action,
        shares,
        status: 'EXECUTING',
      },
    });

    try {
      // Decrypt credentials
      const config: AlpacaConfig = {
        keyId: decryptKey(connection.apiKey),
        secretKey: decryptKey(connection.apiSecret),
        paper: connection.paperTrading,
      };

      // Submit order to Alpaca
      const orderRequest: OrderRequest = {
        symbol: ticker,
        qty: shares,
        side: action.toLowerCase() as 'buy' | 'sell',
        type: 'market',
        time_in_force: 'day',
      };

      const order = await submitOrder(config, orderRequest);

      // Update trade record with success
      await prisma.autoTrade.update({
        where: { id: autoTrade.id },
        data: {
          status: 'EXECUTED',
          orderId: order.id,
          executedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        trade: {
          id: autoTrade.id,
          ticker,
          action,
          shares,
          status: 'EXECUTED',
          orderId: order.id,
          orderStatus: order.status,
        },
      });
    } catch (tradeError: any) {
      // Update trade record with failure
      await prisma.autoTrade.update({
        where: { id: autoTrade.id },
        data: {
          status: 'FAILED',
          errorMsg: tradeError.message || 'Trade execution failed',
        },
      });

      return NextResponse.json(
        { error: tradeError.message || 'Trade execution failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Execute trade error:', error);
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    );
  }
}

// GET: Get user's trade history
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const trades = await prisma.autoTrade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Get trades error:', error);
    return NextResponse.json(
      { error: 'Failed to get trades' },
      { status: 500 }
    );
  }
}
