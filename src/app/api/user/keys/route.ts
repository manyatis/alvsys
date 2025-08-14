import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import crypto from 'crypto';
// import bcrypt from 'bcryptjs'; // Removed - not needed for plain key storage

const prisma = new PrismaClient();

// GET /api/user/keys - Get user's API keys
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            key: true, // Note: Should be masked in production
            name: true,
            isActive: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ keys: user.apiKeys });
  } catch (error) {
    console.error('Error fetching user keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/keys - Generate new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has too many active keys (limit to 10)
    const activeKeyCount = await prisma.aPIKey.count({
      where: { userId: user.id, isActive: true },
    });

    if (activeKeyCount >= 10) {
      return NextResponse.json({ 
        error: 'Maximum number of active API keys reached (10)' 
      }, { status: 400 });
    }

    // Generate a new API key
    const apiKey = `vhk_${crypto.randomBytes(24).toString('hex')}`;

    // Create the key in the database
    const userKey = await prisma.aPIKey.create({
      data: {
        userId: user.id,
        key: apiKey,
        name: name || null,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      apiKey,
      keyId: userKey.id,
      message: 'API key generated successfully' 
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}