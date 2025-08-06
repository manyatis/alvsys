import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  const resolvedParams = await params;
  const projectId = resolvedParams.project;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all AI-allowed cards that are READY or IN_PROGRESS
    const cards = await prisma.card.findMany({
      where: {
        projectId: projectId,
        isAiAllowedTask: true,
        status: {
          in: ['READY', 'IN_PROGRESS']
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        acceptanceCriteria: true,
        priority: true,
        status: true,
        agentDeveloperInstructions: {
          select: {
            id: true,
            type: true,
            branchName: true,
            createNewBranch: true,
            webResearchPrompt: true,
            codeResearchPrompt: true,
            architecturePrompt: true,
            instructions: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Log the activity
    await prisma.aIWorkLog.create({
      data: {
        date: new Date(),
        activity: 'AI_FETCH_ALL_TASKS',
        endpoint: 'GET /api/{project}/ai/onboard/fetchAll',
        payload: {
          projectId,
          cardsCount: cards.length,
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    });

    const response = {
      project: {
        id: project.id,
        name: project.name
      },
      cards: cards,
      totalCards: cards.length,
      instructions: {
        overview: `Found ${cards.length} AI-allowed tasks in ${project.name}. Create a comprehensive todo list to work through all tasks systematically.`,
        
        workflow: [
          "CONTINUOUS LOOP - Work through all tasks then continue fetching:",
          "• Work through tasks by priority (1 = highest priority)",
          "• For each task: update to IN_PROGRESS → complete work → update to READY_FOR_REVIEW",
          "• After completing all fetched tasks, use 'next_ready' to continue the loop",
          "• NEVER STOP - maintain endless fetch task → work → fetch task cycle"
        ],

        task_management: [
          "Work on tasks in priority order (lower numbers = higher priority)",
          "Always read agentDeveloperInstructions before starting",
          "Update status with meaningful comments about your progress",
          "If blocked, provide detailed context about the issue",
          "Commit code changes after completing development work",
          "Run build checks before marking tasks as complete"
        ],

        continuous_loop: [
          "After processing all fetched tasks, continue the endless loop:",
          "• Use POST /api/ai/cards with action='next_ready' to get next task",
          "• This ensures you catch any newly added tasks",
          "• Maintain the cycle: fetch task → work → fetch task → work"
        ]
      },
      
      api_endpoints: {
        base_url: request.headers.get('host') ? `https://${request.headers.get('host')}` : "https://vibehero.com",
        
        update_status: {
          method: "POST",
          endpoint: "/api/ai/cards",
          body: {
            action: "update_status",
            projectId: projectId,
            cardId: "<card_id>",
            status: "IN_PROGRESS | READY_FOR_REVIEW | BLOCKED",
            comment: "Your progress comment"
          }
        },
        
        next_ready: {
          method: "POST", 
          endpoint: "/api/ai/cards",
          body: {
            action: "next_ready",
            projectId: projectId
          },
          note: "Use this after completing all fetched tasks to continue the loop"
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching all AI tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}