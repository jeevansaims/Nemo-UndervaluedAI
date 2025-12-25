/**
 * API Route: Connect Broker
 * POST /api/broker/connect
 * Saves encrypted broker API credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateCredentials, AlpacaConfig } from '@/lib/broker/alpaca';

// Simple XOR encryption for API keys (in production, use proper encryption)
function encryptKey(key: string): string {
  const salt = process.env.AUTH_SECRET || 'default-salt';
  return Buffer.from(
    key.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
    ).join('')
  ).toString('base64');
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
    const { broker, apiKey, apiSecret, paperTrading = true } = body;

    // Validate required fields
    if (!broker || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing required fields: broker, apiKey, apiSecret' },
        { status: 400 }
      );
    }

    // Currently only support Alpaca
    if (broker !== 'alpaca') {
      return NextResponse.json(
        { error: 'Only Alpaca broker is currently supported' },
        { status: 400 }
      );
    }

    // Validate credentials before saving
    const config: AlpacaConfig = {
      keyId: apiKey,
      secretKey: apiSecret,
      paper: paperTrading,
    };

    const isValid = await validateCredentials(config);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API credentials. Please check your key and secret.' },
        { status: 400 }
      );
    }

    // Encrypt credentials
    const encryptedKey = encryptKey(apiKey);
    const encryptedSecret = encryptKey(apiSecret);

    // Upsert broker connection
    const connection = await prisma.brokerConnection.upsert({
      where: { userId: session.user.id },
      update: {
        broker,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
        paperTrading,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        broker,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
        paperTrading,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        broker: connection.broker,
        paperTrading: connection.paperTrading,
        isActive: connection.isActive,
        createdAt: connection.createdAt,
      },
    });
  } catch (error) {
    console.error('Broker connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect broker' },
      { status: 500 }
    );
  }
}
