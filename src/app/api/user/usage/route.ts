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
    const usageStats = await UsageService.getUserUsageStats(user.id);
    
    // Transform to expected format
    const usageStatus = {
      tier: 'FREE' as const,
      usage: {
        canCreateCard: !(await UsageService.hasReachedDailyCardLimit(user.id)),
        canCreateProject: !(await UsageService.hasReachedProjectLimit(user.id)),
        dailyCardsUsed: usageStats.dailyCardProcessingCount,
        dailyCardsLimit: 5, // Default for FREE tier
        projectsUsed: usageStats.totalProjectCount,
        projectsLimit: 1, // Default for FREE tier
        resetTime: usageStats.lastResetDate,
      },
      isAtCardLimit: await UsageService.hasReachedDailyCardLimit(user.id),
      isAtProjectLimit: await UsageService.hasReachedProjectLimit(user.id),
    };

    return NextResponse.json(usageStatus);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}