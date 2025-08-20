import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';
import { CardStatus } from '@/types/card';

export interface GetNextReadyTaskParams {
  projectId: string;
  userId?: string; // Optional for logging purposes
}

export interface OnboardParams {
  projectId: string;
}

export class AiAPI {
  static async getNextReadyTask(params: GetNextReadyTaskParams) {
    const { projectId, userId } = params;

    if (!projectId) {
      throw ApiError.badRequest('projectId is required for next_ready');
    }

    // Get the highest priority READY card that is AI-allowed
    const nextCard = await prisma.card.findFirst({
      where: {
        projectId,
        status: 'READY',
        isAiAllowedTask: true,
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
        labels: {
          include: {
            label: true
          }
        },
      },
    });

    if (!nextCard) {
      return {
        message: 'No ready tasks available. Continue polling for new tasks every 1 minute. Do not stop - keep checking for new work.',
        card: null,
        instruction: 'Wait 60 seconds, then call next_ready API again. Repeat indefinitely until tasks become available.'
      };
    }

    // Log AI activity if userId is provided
    if (userId) {
      try {
        await prisma.aIWorkLog.create({
          data: {
            cardId: nextCard.id,
            userId,
            action: 'get_next_ready_card',
            details: { projectId, title: nextCard.title },
            apiEndpoint: '/api/ai/issues'
          },
        });
      } catch (error) {
        // Don't fail if logging fails
        console.error('Failed to log AI activity:', error);
      }
    }

    return {
      card: {
        id: nextCard.id,
        title: nextCard.title,
        description: nextCard.description,
        acceptanceCriteria: nextCard.acceptanceCriteria,
        status: nextCard.status,
        priority: nextCard.priority,
        projectId: nextCard.projectId,
        isAiAllowedTask: nextCard.isAiAllowedTask,
        agentInstructions: nextCard.agentInstructions,
        project: nextCard.project,
        assignee: nextCard.assignee,
        labels: nextCard.labels,
        createdAt: nextCard.createdAt,
        updatedAt: nextCard.updatedAt,
      },
    };
  }

  static async updateCardStatus(params: {
    cardId: string;
    status: string;
    projectId: string;
    assigneeId?: string;
    userId?: string;
  }) {
    const { cardId, status, projectId, assigneeId, userId } = params;

    // Verify the card exists and belongs to the project
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        projectId,
      },
    });

    if (!card) {
      throw ApiError.notFound('Card not found in the specified project');
    }

    // Handle assigneeId: convert empty string to null, validate if not null
    let processedAssigneeId: string | null | undefined = undefined;
    if (assigneeId !== undefined) {
      if (assigneeId === '' || assigneeId === null) {
        processedAssigneeId = null;
      } else {
        // Verify the assignee exists
        const assigneeExists = await prisma.user.findUnique({
          where: { id: assigneeId },
        });
        if (!assigneeExists) {
          throw ApiError.badRequest('Invalid assignee ID');
        }
        processedAssigneeId = assigneeId;
      }
    }

    // Update the card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        status: status as CardStatus,
        ...(processedAssigneeId !== undefined && { assigneeId: processedAssigneeId }),
      },
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
      },
    });

    // Log AI activity if userId is provided
    if (userId) {
      try {
        await prisma.aIWorkLog.create({
          data: {
            cardId,
            userId,
            action: 'update_card_status',
            details: { 
              oldStatus: card.status, 
              newStatus: status,
              projectId,
            },
            apiEndpoint: '/api/ai/issues'
          },
        });
      } catch (error) {
        console.error('Failed to log AI activity:', error);
      }
    }

    // If the card is marked as ready for review or completed, return the next ready card
    let nextCard = null;
    if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
      const result = await this.getNextReadyTask({ projectId, userId });
      nextCard = result.card;
    }

    return {
      updatedCard,
      nextCard,
    };
  }

  static async getOnboardInstructions(params: OnboardParams) {
    const { projectId } = params;

    if (!projectId) {
      throw ApiError.badRequest('projectId is required for onboarding');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    
    const onboardingInstructions = `
    DIRECTIVE: Execute this entire block continuously using MCP tools. When reaching "EXECUTE TASK IMPLEMENTATION", analyze the task requirements and implement the full solution before continuing. Do not provide summaries or stop for confirmation. This is an automated pipeline using MCP (Model Context Protocol).
    
    CONTINUOUS_TASK_EXECUTION_PROTOCOL_MCP:

STATE: EXECUTING
MODE: AUTONOMOUS_LOOP
INTERRUPTS: DISABLED
PROJECT_ID: ${project.id}

@LOOP_START:
# FETCH NEXT TASK using MCP tool
Use the mcp__vibehero__next_ready tool to fetch the next available task.

# PARSE TASK RESPONSE
Extract the following from the response:
- CARD_ID (from response.card.id)
- CARD_TITLE (from response.card.title) 
- CARD_DESC (from response.card.description)
- CARD_ACCEPTANCE (from response.card.acceptanceCriteria)
- CARD_REQUIREMENTS (combine description + acceptanceCriteria)

# IF NO TASK: WAIT AND RETRY
If response.card is null, wait 60 seconds and call mcp__vibehero__next_ready again


# CREATE BRANCH
git checkout -b feature/vibehero || git checkout feature/vibehero

# EXECUTE TASK IMPLEMENTATION
## READ REQUIREMENTS: $CARD_REQUIREMENTS
# MARK TASK IN_PROGRESS
Use update_task MCP tool to update the card status to "IN_PROGRESS" and add a comment.
## IMPLEMENT ALL CHANGES REQUIRED according to:
##   - Description: $CARD_DESC
##   - Acceptance Criteria: $CARD_ACCEPTANCE
## CREATE/MODIFY FILES AS SPECIFIED
## ADD TESTS IF MENTIONED
## UPDATE DOCUMENTATION IF NEEDED
## ENSURE ALL REQUIREMENTS ARE MET

# BUILD AND VERIFY
npm run build || yarn build || make build
Run tests if available: npm test || yarn test

# MARK COMPLETE
Use update_task MCP tool to update the card status to "READY_FOR_REVIEW"
Add comment: "Implementation complete. Branch: feature/vibehero. All acceptance criteria addressed."


# COMMIT CHANGES
git add -A
git commit -m "feat: $CARD_TITLE

$CARD_DESC

Acceptance Criteria:
$CARD_ACCEPTANCE

Task ID: $CARD_ID
Auto-implemented by VibeHero AI via MCP"

# PUSH TO REMOTE
git push origin feature/vibehero


# CONTINUE TO NEXT TASK
goto @LOOP_START

# THIS IS A CONTINUOUS PROCESS - NO STOPPING - NO SUMMARIES - ONLY EXECUTION
# Use MCP tools throughout for all VibeHero API interactions`;

    return onboardingInstructions;
  }
}

