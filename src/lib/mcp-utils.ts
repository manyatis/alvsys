import type { Card } from '../types/card';

export function createTaskInstructions(cards: Card[], projectName: string) {
  return {
    overview: `Found ${cards.length} AI-allowed tasks in ${projectName}. Create a comprehensive todo list to work through all tasks systematically.`,
    
    workflow: [
      "CONTINUOUS LOOP - Work through all tasks then continue fetching:",
      "• Work through tasks by priority (1 = highest priority)",
      "• For each task: update to IN_PROGRESS → complete work → update to READY_FOR_REVIEW",
      "• After completing all fetched tasks, use 'next_ready' to continue the loop",
      "• NEVER STOP - maintain endless fetch task → work → fetch task cycle",
      "• Retry internal server errors up to 3 times before stopping"
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
      "• Use POST /api/ai/issues with action='next_ready' to get next task",
      "• This ensures you catch any newly added tasks",
      "• Maintain the cycle: fetch task → work → fetch task → work",
      "• If you encounter internal server errors, retry up to 3 times",
      "• Only stop after 3 consecutive failures or explicit instruction"
    ]
  };
}

export function createApiEndpointsInfo(projectId: string) {
  return {
    base_url: "https://vibehero.io",
    
    update_status: {
      method: "POST",
      endpoint: "/api/ai/issues",
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
      endpoint: "/api/ai/issues",
      body: {
        action: "next_ready",
        projectId: projectId
      },
      note: "Use this after completing all fetched tasks to continue the loop"
    }
  };
}