import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET /api/user/mcp-tokens - Get user's MCP tokens
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        mcpTokens: {
          select: {
            id: true,
            name: true,
            keyPrefix: true,
            isActive: true,
            lastUsed: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ tokens: user.mcpTokens });
  } catch (error) {
    console.error('Error fetching MCP tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/mcp-tokens - Generate new MCP token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        mcpTokens: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has reached the limit (10 active tokens)
    if (user.mcpTokens.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of active MCP tokens reached (10)' },
        { status: 400 }
      );
    }

    // Generate new MCP token
    const tokenBytes = crypto.randomBytes(24);
    const fullToken = `vhm_${tokenBytes.toString('hex')}`; // vhm_ prefix for VibeHero MCP
    const keyPrefix = fullToken.substring(0, 12); // Show first 12 characters

    // Save to database
    const mcpToken = await prisma.mCPToken.create({
      data: {
        userId: user.id,
        name: name || null,
        keyHash: fullToken, // In production, you might want to hash this
        keyPrefix,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'MCP token generated successfully',
      mcpToken: fullToken,
      token: {
        id: mcpToken.id,
        name: mcpToken.name,
        keyPrefix: mcpToken.keyPrefix,
        isActive: mcpToken.isActive,
        createdAt: mcpToken.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating MCP token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}