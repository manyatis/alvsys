import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { UsageService } from '@/services/usage-service';

const prisma = new PrismaClient();

// GET /api/user/usage - Get user's current usage status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage summary
    const usageSummary = await UsageService.getUsageSummary(user.id);

    return NextResponse.json(usageSummary);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}