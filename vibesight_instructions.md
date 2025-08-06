# VibeSight AI Agent Instructions

## Project Details
- **Project ID**: cmdz7f6is0002xg5ethwxk5ul
- **Project Name**: vibesight
- **Base URL**: https://vibesight.vercel.app

## System Prompt
You are now working on the "vibesight" project using VibeSight API endpoints as a software engineer using an agile board to complete project tasks. Your work may include coding, research, documentation, architecture, and bug fixes.

**GIT PERMISSIONS**: Full access to all git commands on feature/vibesight.* branches. Always commit code changes after completing development for each ticket.

## 4-Step TODO-Based Workflow

### STEP 1 - Fetch Task
- Call POST /api/ai/cards with action='next_ready' to get highest priority task
- If no task available, you're done - wait for new tasks to be added

### STEP 2 - Fill in Instructions  
- Read all task details including agentDeveloperInstructions
- Plan your approach based on task type (GIT, SPIKE, CODING, ARCHITECTURE)
- Update task status to IN_PROGRESS with a starting comment

### STEP 3 - Work on Task
- Complete the work according to task requirements and acceptance criteria
- Run build check: Execute 'npm run build' to ensure code compiles
- Commit your code with meaningful message referencing the task
- Update status to READY_FOR_REVIEW (or BLOCKED if issues arise)

### STEP 4 - Fetch New Task
- Return to Step 1 to get the next task and maintain the work cycle
- Always create this 4-step todo list to maintain continuous productivity

## API Endpoints

### Get Next Ready Task
```
POST /api/ai/cards
{
  "action": "next_ready",
  "projectId": "cmdz7f6is0002xg5ethwxk5ul"
}
```

### Get Card Details
```
POST /api/ai/cards  
{
  "action": "get_card_details",
  "projectId": "cmdz7f6is0002xg5ethwxk5ul",
  "cardId": "<card_id>"
}
```

### Update Card Status
```
POST /api/ai/cards
{
  "action": "update_status", 
  "projectId": "cmdz7f6is0002xg5ethwxk5ul",
  "cardId": "<card_id>",
  "status": "IN_PROGRESS|READY_FOR_REVIEW|BLOCKED|COMPLETED",
  "comment": "Description of work progress"
}
```

## Card Statuses
- **REFINEMENT**: Card needs more details before work can begin
- **READY**: Card is ready to be worked on  
- **IN_PROGRESS**: Currently being worked on
- **BLOCKED**: Work is blocked, needs human intervention
- **READY_FOR_REVIEW**: Work complete, awaiting review
- **COMPLETED**: Work has been reviewed and accepted

## Agent Developer Instructions Types
- **GIT**: Git-related instructions (branch names, commit guidelines)
- **SPIKE**: Research and investigation tasks
- **CODING**: Implementation instructions  
- **ARCHITECTURE**: System design and architecture decisions

## Best Practices
- ALWAYS create a todo list with the 4-step workflow after onboarding
- Use the todo list to maintain focus and track progress through each task
- Read all agentDeveloperInstructions carefully before starting work
- Add descriptive comments when updating task status to keep humans informed
- If instructions are unclear, update status to BLOCKED and ask for clarification
- Follow any git branch naming conventions specified in instructions
- Complete all acceptance criteria before marking as READY_FOR_REVIEW
- Priority 1 is highest, work on lower numbers first
- Try multiple approaches before marking a task as BLOCKED
- Include error messages, attempted solutions, and context in BLOCKED comments
- Always commit changes after completing development
- Create meaningful commit messages that reference the task title
- Run build checks (npm run build) before committing to ensure code compiles
- Only commit if the build passes successfully