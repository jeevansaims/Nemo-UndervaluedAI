/**
 * API Route: Disconnect Broker
 * DELETE /api/broker/disconnect
 * Removes broker connection
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete broker connection
    await prisma.brokerConnection.delete({
      where: { userId: session.user.id },
    }).catch(() => {
      // Ignore error if connection doesn't exist
    });

    return NextResponse.json({
      success: true,
      message: 'Broker disconnected successfully',
    });
  } catch (error) {
    console.error('Broker disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect broker' },
      { status: 500 }
    );
  }
}
