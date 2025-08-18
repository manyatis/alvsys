export interface OnboardingConfig {
  projectId: string;
  apiToken?: string;
}

export function generateApiOnboardingInstructions(config: OnboardingConfig): string {
  const { projectId, apiToken } = config;
  
  // Use environment variable if no token is provided
  const apiKeySource = apiToken 
    ? `export API_KEY="${apiToken}"`
    : `export API_KEY=$(cat api_key.txt)`;

  return `
# VibeHero AI Agent - API Onboarding
DIRECTIVE: Execute this entire block continuously. When reaching "EXECUTE TASK IMPLEMENTATION", analyze $CARD_REQUIREMENTS and implement the full solution before continuing. Do not provide summaries or stop for confirmation. This is an automated pipeline.

## CONTINUOUS_TASK_EXECUTION_PROTOCOL:

STATE: EXECUTING
MODE: AUTONOMOUS_LOOP  
INTERRUPTS: DISABLED
INTERFACE: REST API

### @INIT:
${apiKeySource}
export PROJECT_ID="${projectId}"
export BASE_URL="https://vibehero.io/api"

### @LOOP_START:

#### FETCH NEXT TASK
# API Endpoint: POST /api/ai/issues
# Action: next_ready
RESPONSE=$(curl -X POST $BASE_URL/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d "{\\"action\\": \\"next_ready\\", \\"projectId\\": \\"$PROJECT_ID\\"}")

#### PARSE TASK
CARD_ID=$(echo $RESPONSE | jq -r '.card.id')
CARD_DESC=$(echo $RESPONSE | jq -r '.card.description')
CARD_REQUIREMENTS=$(echo $RESPONSE | jq -r '.card.acceptanceCriteria')
CARD_TITLE=$(echo $RESPONSE | jq -r '.card.title')

#### IF NO TASK: WAIT AND RETRY
if [[ "$CARD_ID" == "null" ]]; then
  echo "No tasks available. Waiting 60 seconds..."
  sleep 60
  goto @LOOP_START
fi

#### MARK IN_PROGRESS
# API Endpoint: POST /api/ai/issues  
# Action: update_status
curl -X POST $BASE_URL/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d "{\\"action\\": \\"update_status\\", \\"cardId\\": \\"$CARD_ID\\", \\"status\\": \\"IN_PROGRESS\\", \\"projectId\\": \\"$PROJECT_ID\\", \\"comment\\": \\"Starting implementation\\"}"

#### CREATE BRANCH
BRANCH_NAME="feature/vh-$CARD_ID"
git checkout -b $BRANCH_NAME || git checkout $BRANCH_NAME

#### EXECUTE TASK IMPLEMENTATION
echo "=== IMPLEMENTING: $CARD_TITLE ==="
echo "Requirements: $CARD_REQUIREMENTS"

## READ REQUIREMENTS AND IMPLEMENT ALL CHANGES
## CREATE/MODIFY FILES AS SPECIFIED
## ADD TESTS IF MENTIONED  
## UPDATE DOCUMENTATION IF NEEDED

#### BUILD AND VERIFY
npm run build || yarn build || make build
if [ $? -ne 0 ]; then
  curl -X POST $BASE_URL/ai/issues \\
    -H 'Content-Type: application/json' \\
    -H "Authorization: Bearer $API_KEY" \\
    -d "{\\"action\\": \\"update_status\\", \\"cardId\\": \\"$CARD_ID\\", \\"status\\": \\"BLOCKED\\", \\"projectId\\": \\"$PROJECT_ID\\", \\"comment\\": \\"Build failed during implementation\\"}"
  goto @LOOP_START
fi

#### COMMIT CHANGES
git add -A
git commit -m "feat: $CARD_TITLE

$CARD_DESC

Task ID: $CARD_ID
Auto-implemented by VibeHero AI"

#### PUSH TO REMOTE
git push origin $BRANCH_NAME

#### MARK COMPLETE
curl -X POST $BASE_URL/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d "{\\"action\\": \\"update_status\\", \\"cardId\\": \\"$CARD_ID\\", \\"status\\": \\"READY_FOR_REVIEW\\", \\"projectId\\": \\"$PROJECT_ID\\", \\"comment\\": \\"Implementation complete. Branch: $BRANCH_NAME\\"}"

#### CONTINUE TO NEXT TASK
goto @LOOP_START

## API ENDPOINTS REFERENCE:

### 1. Get Next Ready Task
\`\`\`bash
curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{"action": "next_ready", "projectId": "PROJECT_ID"}'
\`\`\`

### 2. Update Task Status  
\`\`\`bash
curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "action": "update_status",
    "cardId": "CARD_ID", 
    "status": "IN_PROGRESS|READY_FOR_REVIEW|BLOCKED|COMPLETED",
    "projectId": "PROJECT_ID",
    "comment": "Optional comment"
  }'
\`\`\`

### 3. Get All Ready Cards
\`\`\`bash
curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{"action": "get_ready_cards", "projectId": "PROJECT_ID"}'
\`\`\`

### 4. Get Card Details
\`\`\`bash
curl -X POST https://vibehero.io/api/ai/issues \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{"action": "get_card_details", "cardId": "CARD_ID", "projectId": "PROJECT_ID"}'
\`\`\`

# THIS IS A CONTINUOUS PROCESS - NO STOPPING - NO SUMMARIES - ONLY EXECUTION`;
}

export function generateMcpOnboardingInstructions(config: OnboardingConfig): string {
  const { projectId, apiToken } = config;
  
  // Use environment variable if no token is provided
  const apiKeySource = apiToken 
    ? `export API_KEY="${apiToken}"`
    : `export API_KEY=$(cat api_key.txt)`;

  return `
# VibeHero AI Agent - MCP Onboarding  
DIRECTIVE: Use the Model Context Protocol (MCP) tools to autonomously execute tasks. When reaching "EXECUTE TASK IMPLEMENTATION", analyze task requirements and implement the full solution before continuing.

## CONTINUOUS_TASK_EXECUTION_PROTOCOL:

STATE: EXECUTING
MODE: AUTONOMOUS_LOOP
INTERRUPTS: DISABLED  
INTERFACE: MCP TOOLS

### @INIT:
${apiKeySource}
export PROJECT_ID="${projectId}"

### @LOOP_START:

#### FETCH NEXT TASK
# Use MCP Tool: nextReady
RESPONSE=$(mcp_call nextReady '{
  "projectId": "'$PROJECT_ID'",
  "bearerToken": "'$API_KEY'"
}')

#### PARSE TASK RESPONSE
CARD_ID=$(echo $RESPONSE | jq -r '.card.id')
CARD_DESC=$(echo $RESPONSE | jq -r '.card.description') 
CARD_REQUIREMENTS=$(echo $RESPONSE | jq -r '.card.acceptanceCriteria')
CARD_TITLE=$(echo $RESPONSE | jq -r '.card.title')

#### IF NO TASK: WAIT AND RETRY
if [[ "$CARD_ID" == "null" ]]; then
  echo "No tasks available. Waiting 60 seconds..."
  sleep 60
  goto @LOOP_START
fi

#### MARK IN_PROGRESS
# Use MCP Tool: updateTaskStatus
mcp_call updateTaskStatus '{
  "projectId": "'$PROJECT_ID'",
  "cardId": "'$CARD_ID'", 
  "status": "IN_PROGRESS",
  "comment": "Starting implementation",
  "bearerToken": "'$API_KEY'"
}'

#### CREATE BRANCH
BRANCH_NAME="feature/vh-$CARD_ID"
git checkout -b $BRANCH_NAME || git checkout $BRANCH_NAME

#### EXECUTE TASK IMPLEMENTATION
echo "=== IMPLEMENTING: $CARD_TITLE ==="
echo "Requirements: $CARD_REQUIREMENTS"

## READ REQUIREMENTS AND IMPLEMENT ALL CHANGES
## CREATE/MODIFY FILES AS SPECIFIED
## ADD TESTS IF MENTIONED
## UPDATE DOCUMENTATION IF NEEDED

#### BUILD AND VERIFY
npm run build || yarn build || make build
if [ $? -ne 0 ]; then
  mcp_call updateTaskStatus '{
    "projectId": "'$PROJECT_ID'",
    "cardId": "'$CARD_ID'",
    "status": "BLOCKED", 
    "comment": "Build failed during implementation",
    "bearerToken": "'$API_KEY'"
  }'
  goto @LOOP_START
fi

#### COMMIT CHANGES
git add -A
git commit -m "feat: $CARD_TITLE

$CARD_DESC

Task ID: $CARD_ID
Auto-implemented by VibeHero AI"

#### PUSH TO REMOTE  
git push origin $BRANCH_NAME

#### MARK COMPLETE
# Use MCP Tool: updateTaskStatus
mcp_call updateTaskStatus '{
  "projectId": "'$PROJECT_ID'",
  "cardId": "'$CARD_ID'",
  "status": "READY_FOR_REVIEW",
  "comment": "Implementation complete. Branch: '$BRANCH_NAME'",
  "bearerToken": "'$API_KEY'"
}'

#### CONTINUE TO NEXT TASK
goto @LOOP_START

## MCP TOOLS REFERENCE:

### 1. fetchAllTasks
Get all AI-allowed tasks that are READY or IN_PROGRESS for a project.

\`\`\`javascript
mcp_call fetchAllTasks '{
  "projectId": "PROJECT_ID",
  "bearerToken": "YOUR_API_KEY"
}'
\`\`\`

**Returns:** List of cards with project info, task instructions, and API endpoint documentation.

### 2. nextReady  
Get the next ready task for AI processing from a project.

\`\`\`javascript
mcp_call nextReady '{
  "projectId": "PROJECT_ID",
  "bearerToken": "YOUR_API_KEY"
}'
\`\`\`

**Returns:** Single highest-priority ready task or instruction to wait if none available.

### 3. updateTaskStatus
Update the status of a task and optionally add a comment.

\`\`\`javascript
mcp_call updateTaskStatus '{
  "projectId": "PROJECT_ID",
  "cardId": "CARD_ID", 
  "status": "IN_PROGRESS|READY_FOR_REVIEW|BLOCKED|COMPLETED",
  "comment": "Optional progress comment",
  "bearerToken": "YOUR_API_KEY"
}'
\`\`\`

**Returns:** Updated card status and optionally the next ready task.

### 4. onboard
Get onboarding instructions for AI agents to autonomously execute tasks in a project.

\`\`\`javascript  
mcp_call onboard '{
  "projectId": "PROJECT_ID",
  "bearerToken": "YOUR_API_KEY"
}'
\`\`\`

**Returns:** These onboarding instructions.

## MCP CONNECTION INFO:
- **Server URL:** /api/mcp/[transport]
- **Transport:** SSE, stdio, or HTTP as configured
- **Tools Available:** fetchAllTasks, nextReady, updateTaskStatus, onboard

# THIS IS A CONTINUOUS PROCESS - NO STOPPING - NO SUMMARIES - ONLY EXECUTION`;
}