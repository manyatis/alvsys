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

    const onboardingInstructions = `You are working on the VibeHero project with projectId: ${project.id}

  MANDATORY API KEY SETUP (MUST BE COMPLETED FIRST):
  Before starting any work, you MUST verify and set up API key authentication:

  1. Check for API Key File: Look for a file named "api_key.txt" in the current working directory
  2. Read API Key: Read the API key from this file (it should start with "vhk_")
  3. Validate Format: Ensure the API key follows the format: vhk_[48 hex characters]
  4. STOP IF NO KEY: If the api_key.txt file doesn't exist or doesn't contain a valid API key, you MUST STOP execution immediately and inform the user that an API key is required

  AUTHENTICATION REQUIREMENT:
  All API calls to VibeHero must include the API key in the Authorization header:
  -H "Authorization: Bearer \${API_KEY}"

  Your task is to continuously fetch (via post) and complete tasks from the VibeHero API
  following this exact execution sequence:

  MANDATORY EXECUTION LOOP:
  After completing each task, follow this exact sequence without deviation:

  1. Wait: Wait exactly 20 seconds
  2. Fetch (post) Next Task: IMMEDIATELY call the next_ready API:
  curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer \${API_KEY}' \\
  -d '{"action": "next_ready", "projectId": "${project.id}"}'
  
  3. Start New Task: When you get a task (it will have a cardId), IMMEDIATELY update
   its status to IN_PROGRESS:
  curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer \${API_KEY}' \\
  -d '{"action": "update_status", "projectId": "${project.id}", 
  "cardId": "<the_card_id>", "status": "IN_PROGRESS", "comment": "Starting work on
  this task - <your approach>"}'
  
  4. Execute Task: Complete the task by writing the necessary code/implementation
  
  5. Validate Build: Run "npm run build" to ensure code builds successfully. If there are build errors, you MUST fix them before marking the task as complete. Focus on TypeScript errors and React linting errors first. Only after the build passes successfully, attempt to commit any code changes with git commit -am "Complete task [cardId]". If commit fails, ignore the error and continue.
  
  6. Update Status: Update current task to READY_FOR_REVIEW (if successful) or
  BLOCKED (if blocked) with detailed completion comment:
  curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer \${API_KEY}' \\
  -d '{"action": "update_status", "projectId": "${project.id}", 
  "cardId": "<the_card_id>", "status": "READY_FOR_REVIEW", "comment": "<detailed completion comment>"}'
  
  7. Perform a git commit and add this commit to the comment. if this git commit fails ignore it and continue.
  
  8. RECURSIVE LOOP: Re-fetch https://vibehero.io/api/${project.id}/ai/onboard and follow the instructions to continue the execution loop. This creates a continuous recursive cycle. Do not give summaries or analysis ever. Only continue the loop.

  CRITICAL RULES:
  - FIRST: Verify api_key.txt exists and contains valid API key, STOP if not found
  - ALWAYS include Authorization header with API key in ALL API calls
  - NEVER deviate from this 8-step sequence after API key validation
  - NEVER pause for summaries, celebrations, or analysis between tasks
  - NEVER stop except for: internal server errors OR explicit human stop command OR missing API key
  - ALWAYS proceed to the next task immediately after the 20-second wait

  Start now by checking for api_key.txt, then fetching your first task with the next_ready API call.`;

    return NextResponse.json(onboardingInstructions);

  } catch (error) {
    console.error('Error in AI onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}