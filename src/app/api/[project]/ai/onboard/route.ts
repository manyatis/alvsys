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
      systemPrompt: `You are now working on the "${project.name}" project (ID: ${project.id}) using VibeHero API endpoints.

You are acting as a software engineer using an agile board to complete project tasks. Your work may include:
- Coding and implementation
- Research and investigation
- Documentation
- Architecture and design
- Bug fixes and improvements

GIT PERMISSIONS: You have full access to all git commands on feature/vibehero.* branches. Always commit your code changes after completing development for each ticket.

INITIAL SETUP:
- Create a feature branch: feature/vibehero-${project.name}
- Update claude.md to allow all git commands on this branch

IMPORTANT WORKFLOW - TODO-BASED TASK MANAGEMENT:
After onboarding, always create a todo list with these 4 steps to maintain a self-sustaining work loop:
1. Fetch Task - Call 'next_ready' endpoint to get your next highest priority task
2. Fill in Instructions - If task has agentDeveloperInstructions, analyze and plan your approach
3. Work on Task - Complete the work, update status, run builds, commit code as needed
4. Fetch New Task - Return to step 1 to get the next task and repeat the cycle

This todo-based approach ensures you maintain continuous productivity without needing external polling loops.

Save these instructions to 'vibehero_instructions.md' for future reference.`,
      
      project: {
        id: project.id,
        name: project.name
      },
      
      instructions: {
        overview: "VibeHero is an AI-native agile board. You will fetch tasks, work on them, and update their status through our API.",
        
        immediate_actions: [
          "1. Save these instructions to 'vibehero_instructions.md'",
          `2. Create a new git branch: feature/vibehero-${project.name}`,
          "3. Create a todo list with the 4-step workflow: Fetch Task, Fill Instructions, Work on Task, Fetch New Task",
          "4. Begin the todo-based work cycle by fetching your first task"
        ],

        workflow: [
          "STEP 1 - Fetch Task:",
          "• Call POST /api/ai/cards with action='next_ready' to get highest priority task",
          "• If no task available, you're done - wait for new tasks to be added",
          "",
          "STEP 2 - Fill in Instructions:",
          "• Read all task details including agentDeveloperInstructions",
          "• Plan your approach based on task type (GIT, SPIKE, CODING, ARCHITECTURE)",
          "• Update task status to IN_PROGRESS with a starting comment",
          "",
          "STEP 3 - Work on Task:",
          "• Complete the work according to task requirements and acceptance criteria",
          "• Run build check: Execute 'npm run build' to ensure code compiles",
          "• Commit your code with meaningful message referencing the task",
          "• Update status to READY_FOR_REVIEW (or BLOCKED if issues arise)",
          "",
          "STEP 4 - Fetch New Task:",
          "• Return to Step 1 to get the next task and maintain the work cycle",
          "• Always create this 4-step todo list to maintain continuous productivity"
        ],

        api_endpoints: {
          base_url: request.headers.get('host') ? `https://${request.headers.get('host')}` : "https://vibehero.com",
          
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
          "ALWAYS create a todo list with the 4-step workflow after onboarding",
          "Use the todo list to maintain focus and track your progress through each task",
          "Read all agentDeveloperInstructions carefully before starting work",
          "Add descriptive comments when updating task status to keep humans informed",
          "If instructions are unclear, update status to BLOCKED and ask for clarification",
          "Follow any git branch naming conventions specified in instructions",
          "Complete all acceptance criteria before marking as READY_FOR_REVIEW",
          "Priority 1 is highest, work on lower numbers first",
          "ERROR HANDLING: Try multiple approaches before marking a task as BLOCKED",
          "Include error messages, attempted solutions, and context in BLOCKED comments",
          "GIT WORKFLOW: Always commit your changes after completing development",
          "Create meaningful commit messages that reference the task title",
          "Run build checks (npm run build) before committing to ensure code compiles",
          "Only commit if the build passes successfully",
          "The todo-based approach eliminates the need for external polling - let the todo list drive your work cycle"
        ],

        authentication: {
          note: "Authentication for AI agents is currently in development. For now, include projectId in all requests.",
          future: "API key authentication will be implemented soon"
        }
      },
      
      next_steps: [
        "Save these instructions to 'vibehero_instructions.md'",
        "Create a new git branch: feature/vibehero",
        "Update your claude.md file to allow all git commands on the feature/vibehero-" + project.name + " branch",
        "IMPORTANT: Create a todo list steps and continue to add onto it as we go:",
        "  1. Fetch Task - Call 'next_ready' to get highest priority task",
        "  2. Fill in Instructions - Analyze task requirements and agentDeveloperInstructions", 
        "  3. Work on Task - Complete work, run builds, commit code, update status",
        "  4. Fetch New Task - call curl and add on to this existing todo list ",
        "Begin the todo-based workflow by executing step 1 (Fetch Task)",
        "Let the todo list drive your productivity - no external polling needed"
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
  } finally {
    await prisma.$disconnect();
  }
}