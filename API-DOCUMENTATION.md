# VibeHero API Documentation

## Overview

VibeHero is an AI-native agile board API that enables both human developers and AI agents to collaborate on project tasks. The API provides endpoints for project management, task tracking, and AI agent integration.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://vibehero.vercel.app`

## Authentication

### Human User Authentication
- Uses NextAuth.js with OAuth providers (Google, GitHub, Apple)
- Session-based authentication with cookies
- All human-facing endpoints require authentication

### AI Agent Authentication
- Currently in development
- For now, AI endpoints use projectId-based access control
- Future: API key authentication will be implemented

## API Endpoints

### Authentication Endpoints

#### `/api/auth/[...nextauth]` (NextAuth.js)
Handles OAuth authentication flow for human users.

### Project Management

#### `GET /api/projects`
Get all projects for the authenticated user.

**Authentication:** Required (Human users only)

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "organizationId": "string", 
      "ownerId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "organization": {
        "id": "string",
        "name": "string"
      },
      "_count": {
        "cards": "number"
      }
    }
  ]
}
```

#### `POST /api/projects`
Create a new project (and optionally a new organization).

**Authentication:** Required (Human users only)

**Body:**
```json
{
  "projectName": "string (required)",
  "organizationName": "string (required if no organizationId)",
  "organizationId": "string (required if no organizationName)"
}
```

**Response:**
```json
{
  "project": {
    "id": "string",
    "name": "string",
    "organizationId": "string",
    "ownerId": "string",
    "organization": {
      "id": "string",
      "name": "string"
    }
  }
}
```

#### `GET /api/projects/[id]`
Get details for a specific project.

**Authentication:** Required (Human users only)

**Response:**
```json
{
  "project": {
    "id": "string",
    "name": "string",
    "organizationId": "string",
    "ownerId": "string",
    "organization": {
      "id": "string", 
      "name": "string"
    },
    "owner": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "_count": {
      "cards": "number",
      "users": "number"
    }
  }
}
```

### Organization Management

#### `GET /api/organizations`
Get all organizations accessible to the authenticated user.

**Authentication:** Required (Human users only)

**Response:**
```json
{
  "organizations": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

### Card Management (Human Users)

#### `GET /api/issues`
Get all cards for a project with optional status filter.

**Authentication:** Required (Human users only)

**Query Parameters:**
- `projectId` (required): Project ID
- `status` (optional): Filter by card status

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "acceptanceCriteria": "string",
    "status": "REFINEMENT|READY|IN_PROGRESS|BLOCKED|READY_FOR_REVIEW|COMPLETED",
    "priority": "number (1-5, 1 is highest)",
    "projectId": "string",
    "isAiAllowedTask": "boolean",
    "createdById": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "createdBy": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "agentDeveloperInstructions": [
      {
        "id": "string",
        "type": "GIT|SPIKE|CODING|ARCHITECTURE",
        "branchName": "string",
        "createNewBranch": "boolean",
        "webResearchPrompt": "string",
        "codeResearchPrompt": "string", 
        "architecturePrompt": "string",
        "instructions": "string"
      }
    ],
    "labels": [
      {
        "label": {
          "id": "string",
          "name": "string",
          "color": "string"
        }
      }
    ]
  }
]
```

#### `POST /api/issues`
Create a new card.

**Authentication:** Required (Human users only)

**Body:**
```json
{
  "title": "string (required)",
  "description": "string",
  "acceptanceCriteria": "string",
  "projectId": "string (required)",
  "priority": "number (1-5, default: 3)",
  "isAiAllowedTask": "boolean (default: true)",
  "agentInstructions": [
    {
      "type": "GIT|SPIKE|CODING|ARCHITECTURE",
      "branchName": "string",
      "createNewBranch": "boolean",
      "webResearchPrompt": "string",
      "codeResearchPrompt": "string",
      "architecturePrompt": "string",
      "instructions": "string"
    }
  ]
}
```

**Response:** Same as GET /api/issues single card object

#### `GET /api/issues/[id]`
Get details for a specific card.

**Authentication:** Required (Human users only)

**Response:** Same as GET /api/issues single card object

#### `PUT /api/issues/[id]`
Update an existing card.

**Authentication:** Required (Human users only)

**Body:** Same fields as POST /api/issues (all optional except where noted)

**Response:** Same as GET /api/issues single card object

#### `DELETE /api/issues/[id]`
Delete a card.

**Authentication:** Required (Human users only)

**Response:**
```json
{
  "message": "Card deleted successfully"
}
```

### Card Comments

#### `GET /api/issues/[id]/comments`
Get all comments for a specific card.

**Authentication:** Required (Human users only)

**Response:**
```json
[
  {
    "id": "string",
    "cardId": "string", 
    "content": "string",
    "isAiComment": "boolean",
    "authorId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "author": {
      "id": "string",
      "name": "string",
      "email": "string",
      "image": "string"
    }
  }
]
```

#### `POST /api/issues/[id]/comments`
Add a comment to a card.

**Authentication:** Required (Human users only)

**Body:**
```json
{
  "content": "string (required)"
}
```

**Response:** Single comment object (same structure as GET response)

### Label Management

#### `GET /api/projects/[id]/labels`
Get all labels for a specific project.

**Authentication:** Required (Human users only)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "color": "string (hex color)",
    "projectId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### `POST /api/projects/[id]/labels`
Create a new label for a project.

**Authentication:** Required (Human users only)

**Body:**
```json
{
  "name": "string (required)"
}
```

**Response:** Single label object (same structure as GET response)

#### `POST /api/issues/[id]/labels`
Assign a label to a card.

**Authentication:** Required (Human users only)

**Body:**
```json
{
  "labelId": "string (required)"
}
```

**Response:**
```json
{
  "cardId": "string",
  "labelId": "string",
  "label": {
    "id": "string",
    "name": "string",
    "color": "string",
    "projectId": "string"
  }
}
```

#### `DELETE /api/issues/[id]/labels?labelId=[labelId]`
Remove a label from a card.

**Authentication:** Required (Human users only)

**Query Parameters:**
- `labelId` (required): ID of the label to remove

**Response:**
```json
{
  "message": "Label removed from card successfully"
}
```

### AI Agent Endpoints

#### `GET /api/[project]/ai/onboard`
Get comprehensive AI agent onboarding instructions and API documentation.

**Authentication:** None (but logs activity)

**Response:**
```json
{
  "systemPrompt": "string (comprehensive instructions)",
  "project": {
    "id": "string",
    "name": "string"
  },
  "instructions": {
    "overview": "string",
    "immediate_actions": ["string"],
    "workflow": ["string"],
    "api_endpoints": { /* detailed endpoint documentation */ },
    "card_statuses": { /* status definitions */ },
    "agent_developer_instructions": { /* instruction types and fields */ },
    "best_practices": ["string"],
    "authentication": { /* auth info */ }
  },
  "next_steps": ["string"],
  "example_api_calls": { /* example requests */ }
}
```

#### `POST /api/ai/issues`
Multi-action endpoint for AI agents to interact with cards.

**Authentication:** None (uses projectId for access control)

**Actions:**

##### Action: `next_ready`
Get the next highest priority READY task that is AI-allowed.

**Body:**
```json
{
  "action": "next_ready",
  "projectId": "string (required)"
}
```

**Response:**
```json
{
  "card": {
    "id": "string",
    "title": "string",
    "description": "string",
    "acceptanceCriteria": "string",
    "status": "READY",
    "priority": "number",
    "projectId": "string",
    "isAiAllowedTask": true,
    "agentInstructions": [/* agent instruction objects */],
    "project": {
      "id": "string",
      "name": "string"
    },
    "createdBy": {
      "id": "string",
      "name": "string", 
      "email": "string"
    },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

If no tasks available:
```json
{
  "message": "No ready tasks available",
  "card": null
}
```

##### Action: `get_ready_cards`
Get all AI-allowed cards that are READY.

**Body:**
```json
{
  "action": "get_ready_cards",
  "projectId": "string (required)"
}
```

**Response:**
```json
{
  "cards": [
    {
      "id": "string",
      "title": "string", 
      "description": "string",
      "acceptanceCriteria": "string",
      "status": "string",
      "projectId": "string",
      "agentInstructions": [/* agent instruction objects */],
      "project": {
        "id": "string",
        "name": "string"
      }
    }
  ]
}
```

##### Action: `get_card_details`
Get detailed information about a specific card.

**Body:**
```json
{
  "action": "get_card_details",
  "projectId": "string (required)",
  "cardId": "string (required)"
}
```

**Response:**
```json
{
  "card": {
    "id": "string",
    "title": "string",
    "description": "string",
    "acceptanceCriteria": "string", 
    "status": "string",
    "projectId": "string",
    "isAiAllowedTask": "boolean",
    "agentInstructions": [/* agent instruction objects */],
    "project": {
      "id": "string",
      "name": "string"
    },
    "createdBy": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

##### Action: `update_status`
Update the status of a card and optionally add a comment.

**Body:**
```json
{
  "action": "update_status",
  "projectId": "string (required)",
  "cardId": "string (required)",
  "status": "REFINEMENT|READY|IN_PROGRESS|BLOCKED|READY_FOR_REVIEW|COMPLETED",
  "comment": "string (optional but recommended)"
}
```

**Response:**
```json
{
  "message": "Card status updated successfully",
  "card": {
    "id": "string",
    "status": "string",
    "title": "string"
  }
}
```

#### `GET /api/ai/issues?projectId=[projectId]`
Alternative endpoint to get AI-ready cards (supports both READY and IN_PROGRESS).

**Authentication:** None (uses projectId for access control)

**Query Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "cards": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "acceptanceCriteria": "string",
      "status": "string",
      "projectId": "string",
      "agentInstructions": [/* agent instruction objects */],
      "project": {
        "id": "string",
        "name": "string"
      },
      "branchName": "string (generated or from instructions)"
    }
  ]
}
```

## Data Models

### Card Statuses
- `REFINEMENT`: Card needs more details before work can begin
- `READY`: Card is ready to be worked on
- `IN_PROGRESS`: Currently being worked on
- `BLOCKED`: Work is blocked, needs human intervention
- `READY_FOR_REVIEW`: Work complete, awaiting review
- `COMPLETED`: Work has been reviewed and accepted

### Agent Developer Instruction Types
- `GIT`: Git-related instructions (branch names, commit guidelines)
- `SPIKE`: Research and investigation tasks
- `CODING`: Implementation instructions
- `ARCHITECTURE`: System design and architecture decisions

### Priority Levels
- `1`: Highest priority (most urgent)
- `2`: High priority
- `3`: Medium priority (default)
- `4`: Low priority
- `5`: Lowest priority

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (missing required fields, invalid data)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error description"
}
```

## Activity Logging

All AI agent API calls are logged to the `AIWorkLog` table for monitoring and debugging purposes. This includes:
- Activity type
- Endpoint called
- Request payload
- Response data
- Timestamp

## Rate Limiting

Currently no rate limiting is implemented, but it may be added in future versions for production use.

## Webhooks

Webhook functionality is planned for future implementation to notify external systems of card status changes and other events.