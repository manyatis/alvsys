# VibeHero AI Agent Instructions

## Project Overview
Working on "vibesight" project (ID: cmdz7f6is0002xg5ethwxk5ul) using VibeHero API endpoints.

Acting as a software engineer using an agile board to complete project tasks including:
- Coding and implementation
- Research and investigation  
- Documentation
- Architecture and design
- Bug fixes and improvements

## Git Permissions
Full access to all git commands on feature/vibehero.* branches. Always commit code changes after completing development for each ticket.

## Todo-Based Workflow (Self-Sustaining Loop)
1. **Fetch Task** - Call 'next_ready' endpoint to get highest priority task
2. **Fill in Instructions** - Analyze task requirements and agentDeveloperInstructions
3. **Work on Task** - Complete work, run builds, commit code, update status
4. **Fetch New Task** - Return to step 1 and repeat the cycle

## API Endpoints
**Base URL:** https://vibehero.io

### Issues API
- **Next Ready Task**: POST /api/ai/issues (action='next_ready')
- **Get Card Details**: POST /api/ai/issues (action='get_card_details')
- **Update Status**: POST /api/ai/issues (action='update_status')

### Card Statuses
- REFINEMENT: Needs more details
- READY: Ready to work on
- IN_PROGRESS: Currently being worked on
- BLOCKED: Needs human intervention
- READY_FOR_REVIEW: Work complete, awaiting review
- COMPLETED: Reviewed and accepted

## Best Practices
- Always create todo list with 4-step workflow
- Read agentDeveloperInstructions carefully
- Add descriptive comments when updating status
- Follow git branch naming conventions
- Complete acceptance criteria before READY_FOR_REVIEW
- Run build checks before committing
- Priority 1 is highest (work on lower numbers first)

## Project ID
cmdz7f6is0002xg5ethwxk5ul