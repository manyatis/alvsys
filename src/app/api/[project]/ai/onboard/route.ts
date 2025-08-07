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

    await prisma.aIWorkLog.create({
      data: {
        date: new Date(),
        activity: 'AI_AGENT_ONBOARDING',
        endpoint: 'GET /api/{project}/ai/onboard',
        payload: {
          projectId,
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    });

    const onboardingInstructions = {
      systemPrompt: `You are working on "${project.name}" project (ID: ${project.id}). 

CORE MISSION: Continue to use curl and fetch new tasks continuously. If you receive an internal server error, retry the request up to 3 times before stopping. Only quit after 3 consecutive internal server errors or when explicitly told to stop.

Create feature branch: feature/vibehero-${project.name}
Full git access on feature/vibehero.* branches - commit after each task completion.`,
      
      project: {
        id: project.id,
        name: project.name
      },
      
      workflow: [
        "1. POST /api/ai/cards with action='next_ready' to get highest priority task",
        "2. Update status to IN_PROGRESS with comment about your approach", 
        "3. Complete the work per acceptance criteria and agentDeveloperInstructions",
        "4. Commit code changes with meaningful message",
        "5. Update status to READY_FOR_REVIEW (or BLOCKED if stuck)",
        "6. Immediately repeat from step 1 - NEVER STOP (retry internal server errors up to 3 times)"
      ],

      api_endpoints: {
        base_url: request.headers.get('host') ? `https://${request.headers.get('host')}` : "https://vibehero.com",
        
        next_ready: {
          method: "POST",
          endpoint: "/api/ai/cards", 
          body: { action: "next_ready", projectId: projectId },
          response: "Card object or null if no tasks"
        },
        
        update_status: {
          method: "POST", 
          endpoint: "/api/ai/cards",
          body: { 
            action: "update_status", 
            projectId: projectId, 
            cardId: "<card_id>", 
            status: "IN_PROGRESS|BLOCKED|READY_FOR_REVIEW", 
            comment: "Progress description" 
          }
        }
      },

      statuses: {
        READY: "Available to work on",
        IN_PROGRESS: "Currently working", 
        BLOCKED: "Need help",
        READY_FOR_REVIEW: "Work complete"
      },

      best_practices: [
        "Continue fetching tasks continuously - retry internal server errors up to 3 times",
        "Only stop after 3 consecutive internal server errors or when explicitly told",
        "Always comment on status changes to keep humans informed",
        "Read agentDeveloperInstructions for specific task guidance", 
        "Priority 1 = highest, work on lowest numbers first",
        "Mark BLOCKED only after trying multiple approaches - include error details",
        "Commit code after each task with descriptive message",
        "Run 'npm run build' before committing to ensure code compiles"
      ]
    };

    return NextResponse.json(onboardingInstructions);

  } catch (error) {
    console.error('Error in AI onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}