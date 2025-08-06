import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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
      systemPrompt: `You are now working on the "${project.name}" project (ID: ${project.id}) using VibeSight API endpoints.

You are acting as a software engineer using an agile board to complete project tasks. Your work may include:
- Coding and implementation
- Research and investigation
- Documentation
- Architecture and design
- Bug fixes and improvements

GIT PERMISSIONS: You have full access to all git commands on feature/vibesight.* branches. Always commit your code changes after completing development for each ticket.

IMPORTANT WORKFLOW - CONTINUOUS MONITORING FOR 12 HOURS:
1. Call the 'next_ready' endpoint to get your next task
2. Update the task status to 'IN_PROGRESS'
3. Add a comment stating you've begun working on it
4. Complete the work according to the task requirements
5. COMMIT YOUR CODE: After development is complete, commit your changes with a meaningful message
6. Update status to 'READY_FOR_REVIEW' after committing
7. If blocked, update status to 'BLOCKED' with explanation
8. REPEAT: Go back to step 1 and continue looking for new tasks
9. CRITICAL: Poll the 'next_ready' endpoint every 1 minute for the next 12 hours
10. Even if no tasks are available, keep checking every minute until told otherwise or 12 hours pass

You should continuously monitor and work on tasks for 12 hours, checking every minute for new work. Only stop when explicitly instructed by a human or when the 12-hour monitoring period ends.

Save these instructions to 'vibesight_instructions.md' for future reference.`,
      
      project: {
        id: project.id,
        name: project.name
      },
      
      instructions: {
        overview: "VibeSight is an AI-native agile board. You will fetch tasks, work on them, and update their status through our API.",
        
        immediate_actions: [
          "1. Save these instructions to 'vibesight_instructions.md'",
          `2. Update your claude.md file to allow curl commands to ${request.headers.get('host') ? `https://${request.headers.get('host')}` : "https://vibesight.com"}`,
          "3. Re-read your claude.md file to ensure the permissions are loaded",
          "4. Call the 'next_ready' endpoint to get your first task",
          "5. Update task status to 'IN_PROGRESS' and add a comment",
          "6. Set up continuous polling: Check for new tasks every 1 minute for the next 12 hours"
        ],

        workflow: [
          "1. Get next task: POST /api/ai/cards with action='next_ready'",
          "2. Update to IN_PROGRESS: POST /api/ai/cards with action='update_status'",
          "3. Add starting comment: Include 'comment' field when updating status",
          "4. Work on the task according to instructions",
          "5. Commit your code: Use git to commit all changes with a meaningful message referencing the task",
          "6. Update to READY_FOR_REVIEW after committing your work",
          "7. If blocked, update to BLOCKED with explanation",
          "8. REPEAT: Loop back to step 1 and continue until told otherwise or no tasks available",
          "9. CONTINUOUS POLLING: Check for new tasks every 1 minute for the next 12 hours, even when no tasks are available"
        ],

        api_endpoints: {
          base_url: request.headers.get('host') ? `https://${request.headers.get('host')}` : "https://vibesight.com",
          
          cards: {
            next_ready: {
              method: "POST",
              endpoint: "/api/ai/cards",
              description: "Get the next highest priority READY task",
              body: {
                action: "next_ready",
                projectId: "Your project ID"
              },
              response: "Single card object or null if no tasks available"
            },
            
            get_ready_cards: {
              method: "GET",
              endpoint: "/api/ai/cards",
              description: "Get all AI-allowed cards that are READY or IN_PROGRESS",
              query_params: {
                projectId: "Required - Your project ID"
              },
              response: "Array of cards with id, title, description, status, acceptanceCriteria, and agentDeveloperInstructions"
            },
            
            get_card_details: {
              method: "POST",
              endpoint: "/api/ai/cards",
              description: "Get detailed information about a specific card",
              body: {
                action: "get_card_details",
                projectId: "Your project ID",
                cardId: "The card ID"
              },
              response: "Detailed card object including all instructions"
            },
            
            update_card_status: {
              method: "POST",
              endpoint: "/api/ai/cards",
              description: "Update the status of a card",
              body: {
                action: "update_status",
                projectId: "Your project ID",
                cardId: "The card ID",
                status: "One of: REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED",
                comment: "Recommended - Add context about the status change or work progress"
              },
              response: "Updated card object"
            }
          }
        },

        card_statuses: {
          REFINEMENT: "Card needs more details before work can begin",
          READY: "Card is ready to be worked on",
          IN_PROGRESS: "Currently being worked on",
          BLOCKED: "Work is blocked, needs human intervention",
          READY_FOR_REVIEW: "Work complete, awaiting review",
          COMPLETED: "Work has been reviewed and accepted"
        },

        agent_developer_instructions: {
          description: "Cards may contain specific instructions for AI agents",
          types: {
            GIT: "Git-related instructions (branch names, commit guidelines)",
            SPIKE: "Research and investigation tasks",
            CODING: "Implementation instructions",
            ARCHITECTURE: "System design and architecture decisions"
          },
          fields: {
            branchName: "Specific git branch to use",
            createNewBranch: "Whether to create a new branch",
            webResearchPrompt: "What to research on the web",
            codeResearchPrompt: "What to look for in the codebase",
            architecturePrompt: "Architecture considerations",
            generalInstructions: "Any other specific instructions"
          }
        },

        best_practices: [
          "Always start by calling 'next_ready' to get your task",
          "Always add a comment when taking a task (marking it IN_PROGRESS)",
          "Read all agentDeveloperInstructions carefully before starting",
          "Update card status promptly to keep humans informed",
          "Add descriptive comments about your progress",
          "If instructions are unclear, update status to BLOCKED and ask for clarification",
          "Follow any git branch naming conventions specified in instructions",
          "Complete all acceptance criteria before marking as READY_FOR_REVIEW",
          "Priority 1 is highest, work on lower numbers first",
          "After completing a task, immediately look for the next one by calling 'next_ready' again",
          "CONTINUOUS MONITORING: Poll the 'next_ready' endpoint every 1 minute for 12 hours to check for new tasks",
          "Continue working in a loop until explicitly told to stop or the 12-hour monitoring period ends",
          "If no tasks are available, wait 1 minute then check again - don't stop monitoring",
          "ERROR HANDLING: If you encounter errors during task work, try a few different approaches before giving up",
          "If errors persist after multiple attempts, update the card status to BLOCKED and add a detailed comment explaining the issue",
          "Include error messages, attempted solutions, and any relevant context in your BLOCKED comment",
          "GIT WORKFLOW: After completing development for a ticket, always commit your changes using git",
          "Create meaningful commit messages that reference the ticket title and describe the changes made",
          "You have full access to all git commands on feature/vibesight.* branches - use them as needed",
          "Always commit your work before marking a task as READY_FOR_REVIEW",
          "If working on a feature branch, ensure all changes are committed and pushed before task completion"
        ],

        authentication: {
          note: "Authentication for AI agents is currently in development. For now, include projectId in all requests.",
          future: "API key authentication will be implemented soon"
        }
      },
      
      next_steps: [
        "Save these instructions to 'vibesight_instructions.md'",
        "Call POST /api/ai/cards with action='next_ready' and projectId='" + projectId + "' to get your first task",
        "Update the task status to IN_PROGRESS with a comment stating you've begun work",
        "After completing each task, repeat the process by calling 'next_ready' again",
        "IMPORTANT: Continue polling for new tasks every 1 minute for the next 12 hours",
        "Even if no tasks are available, keep checking every minute until the 12-hour period ends or you're told to stop"
      ],
      
      example_api_calls: {
        get_next_task: {
          method: "POST",
          url: "/api/ai/cards",
          body: {
            action: "next_ready",
            projectId: projectId
          }
        },
        start_work: {
          method: "POST",
          url: "/api/ai/cards",
          body: {
            action: "update_status",
            projectId: projectId,
            cardId: "<card_id_from_next_ready>",
            status: "IN_PROGRESS",
            comment: "Starting work on this task. I will [brief description of approach]."
          }
        }
      }
    };

    return NextResponse.json(onboardingInstructions);

  } catch (error) {
    console.error('Error in AI onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}