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
    
    const onboardingInstructions = `
PROJECT: ${project.id}

=== API KEY VALIDATION (STEP 0) ===
1. Check "api_key.txt" file exists in working directory
2. Verify API key starts with "vhk_" and is 52 characters total
3. Use the API key from this file as \${API_KEY} in all curl commands
4. IF NO VALID KEY: STOP and report "API key required"

=== INFINITE EXECUTION LOOP ===
THIS IS AN INFINITE LOOP. YOU WILL REPEAT THESE 4 STEPS FOREVER AND NEVER RETURN ANALYSIS OR SUMMARY:

STEP 0: CUT A BRANCH called feature/vibehero and work off this.

STEP 2: FETCH NEXT ISSUE USING: curl -X POST https://vibehero.io/api/ai/issues -H 'Content-Type: application/json' -H 'Authorization: Bearer \${API_KEY}' -d '{"action": "next_ready", "projectId": "${project.id}"}'
- If "card" is null: no tasks available, wait 20 seconds and call https://vibehero.io/api/${project.id}/ai/onboard 
- Extract TASK_ID from the returned card.id for status updates
- Update status to IN_PROGRESS with comment using: curl -X POST https://vibehero.io/api/ai/issues -H 'Content-Type: application/json' -H 'Authorization: Bearer \${API_KEY}' -d '{"action": "update_status", "cardId": "\${TASK_ID}", "status": "IN_PROGRESS", "projectId": "${project.id}", "comment": "Starting work on task"}'

STEP 3: EXECUTE TASK
- Complete the implementation
- Run "npm run build" and fix any errors
- COMMIT CHANGES TO GIT:
  1. Stage all changes: git add -A
  2. Create commit with descriptive message: git commit -m "<Brief description of changes made> 🤖 Generated with [Claude Code](https://claude.ai/code)"
- Update status to READY_FOR_REVIEW with commit details using: curl -X POST https://vibehero.io/api/ai/issues -H 'Content-Type: application/json' -H 'Authorization: Bearer \${API_KEY}' -d '{"action": "update_status", "cardId": "\${TASK_ID}", "status": "READY_FOR_REVIEW", "projectId": "${project.id}", "comment": "Task completed. Commit: \${COMMIT_HASH} - \${COMMIT_MSG}"}'

STEP 4: RESET AND LOOP. DO NOT STOP FOR ANALYSIS OR SUMMARY
- IMMEDIATELY Fetch from this https://vibehero.io/api/cmef0d9zr0002l204nnukmeyw/ai/onboard and follow the instructions. Do not ever stop for summary or analysis. Only stop if explicility told to do so.
`;

    return NextResponse.json(onboardingInstructions);

  } catch (error) {
    console.error('Error in AI onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
