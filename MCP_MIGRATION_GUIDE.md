# VibeHero MCP Migration Guide

## Overview

This guide covers the complete migration from API key authentication to Model Context Protocol (MCP) for the VibeHero project management platform.

## What's Been Implemented

### Phase 1: MCP Foundation ✅
- **MCP SDK Integration**: Installed `@modelcontextprotocol/sdk`
- **Server Infrastructure**: Created `src/lib/mcp/` directory with core files
- **Basic Authentication**: Hybrid auth supporting both API keys and sessions
- **Core Tools**: 5 basic MCP tools for project and issue management

### Phase 2: Complete MCP Server ✅
- **25+ MCP Tools**: Full coverage of existing API endpoints
- **Multiple Transports**: HTTP, WebSocket, and stdio support
- **Enhanced Error Handling**: Validation, rate limiting, and logging
- **MCP Resources**: Templates, schemas, and user data access
- **Real-time Notifications**: Event system with WebSocket broadcasting

## MCP Server Architecture

```
src/lib/mcp/
├── server.ts          # Main MCP server class
├── auth.ts            # Authentication handlers
├── tools.ts           # Tool implementation handlers
├── transports.ts      # HTTP and WebSocket transports
├── validation.ts      # Input validation and error handling
├── resources.ts       # Templates and read-only data
├── notifications.ts   # Event system and real-time notifications
└── index.ts          # Entry point and exports
```

## Available MCP Tools

### Organization Management
- `list_organizations` - Get user's organizations
- `create_organization` - Create new organization
- `invite_to_organization` - Invite users to organization

### Project Management
- `list_projects` - List user's projects
- `create_project` - Create new project

### Sprint Management
- `list_sprints` - List project sprints
- `create_sprint` - Create new sprint
- `close_sprint` - Close active sprint

### Issue Management
- `list_issues` - List project issues (with filtering)
- `create_issue` - Create new issue
- `update_issue` - Update existing issue

### Label Management
- `list_labels` - List project labels
- `create_label` - Create new label
- `assign_label` - Assign label to issue

### Comment Management
- `list_comments` - List issue comments
- `create_comment` - Add comment to issue

### AI Integration
- `get_ai_ready_cards` - Get cards ready for AI processing
- `update_card_status` - Update card status (with AI logging)
- `get_next_ready_card` - Get next available AI task

## MCP Resources

### Templates
- `vibehero://templates/project/basic` - Basic project template
- `vibehero://templates/project/agile` - Agile project with sprints
- `vibehero://templates/project/kanban` - Kanban workflow
- `vibehero://templates/issue/bug` - Bug report template
- `vibehero://templates/issue/feature` - Feature request template
- `vibehero://templates/issue/task` - General task template

### Schemas
- `vibehero://schemas/project` - Project validation schema
- `vibehero://schemas/issue` - Issue validation schema
- `vibehero://schemas/sprint` - Sprint validation schema

### User Data
- `vibehero://data/user/profile` - Current user profile
- `vibehero://data/user/projects` - User projects summary
- `vibehero://data/user/usage` - Usage statistics and limits

## Transport Options

### 1. HTTP Transport
**Endpoint**: `POST /api/mcp`

**Authentication**: Bearer token or session

**Example Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create_project",
    "arguments": {
      "name": "My New Project",
      "description": "A project for testing MCP"
    }
  },
  "id": 1
}
```

### 2. WebSocket Transport
**Endpoint**: `GET /api/mcp/ws` (WebSocket upgrade)

**Features**:
- Real-time notifications
- Event broadcasting
- Persistent connections

### 3. Stdio Transport
**Usage**: Command-line integration
```bash
npm run start-mcp
```

## Event System

### Supported Events
- Project: created, updated, deleted
- Issue: created, updated, status_changed, assigned, deleted
- Comment: created, updated, deleted
- Sprint: created, started, closed
- Label: created, assigned, removed
- Organization: created, member_invited, member_joined
- AI: task_started, task_completed, task_failed
- System: user_connected, user_disconnected, rate_limit_exceeded

### Event Notifications
Events are automatically sent to:
- Event creator
- Project members (for project events)
- Organization members (for org events)
- WebSocket subscribers

## Security Features

### Rate Limiting
- Default: 100 requests per minute per user
- Configurable limits
- Rate limit exceeded events

### Input Validation
- Zod schema validation for all tool arguments
- Detailed error messages with field-specific feedback
- Sanitized error logging

### Authentication
- Hybrid support: API keys + session auth
- Project-level access control
- Organization membership validation

## Migration Steps

### For Developers

1. **Update Client Code**:
   ```typescript
   // Old API approach
   const response = await fetch('/api/projects', {
     headers: { 'Authorization': `Bearer ${apiKey}` }
   });
   
   // New MCP approach
   const response = await fetch('/api/mcp', {
     method: 'POST',
     headers: { 
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       jsonrpc: '2.0',
       method: 'tools/call',
       params: {
         name: 'list_projects',
         arguments: {}
       },
       id: 1
     })
   });
   ```

2. **Use MCP Client Library**:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

3. **WebSocket Integration**:
   ```typescript
   const ws = new WebSocket('ws://localhost:3000/api/mcp/ws');
   ws.onmessage = (event) => {
     const notification = JSON.parse(event.data);
     if (notification.method === 'notification') {
       console.log('Real-time event:', notification.params);
     }
   };
   ```

### For AI Systems

1. **Connect via MCP Client**:
   ```typescript
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';
   
   const client = new Client({
     name: 'ai-assistant',
     version: '1.0.0'
   });
   
   // Connect and authenticate
   await client.connect(transport);
   
   // List available tools
   const tools = await client.listTools();
   
   // Call tools
   const result = await client.callTool('get_next_ready_card', {
     projectId: 'project-uuid'
   });
   ```

2. **Use Resources for Context**:
   ```typescript
   // Get project template for understanding structure
   const template = await client.readResource('vibehero://templates/project/agile');
   
   // Get user context
   const profile = await client.readResource('vibehero://data/user/profile');
   ```

## Testing the Implementation

### 1. Start MCP Server
```bash
npm run build-mcp
npm run start-mcp
```

### 2. Test HTTP Endpoint
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### 3. Test Tool Execution
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_projects",
      "arguments": {}
    },
    "id": 1
  }'
```

### 4. Test Resources
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "resources/read",
    "params": {
      "uri": "vibehero://templates/project/basic"
    },
    "id": 1
  }'
```

## Performance Monitoring

### Request Logging
- All MCP tool calls are logged with duration and success/failure
- Recent logs available via `requestLogger.getRecentLogs()`
- User-specific logs via `requestLogger.getLogsByUser(userId)`

### Error Tracking
- Error rate monitoring via `requestLogger.getErrorRate()`
- Detailed error context in logs
- Rate limit tracking per user

### Event Analytics
- Event history maintained in memory (last 1000 events)
- Project-specific event tracking
- Real-time event streaming via WebSocket

## Next Steps

1. **Client Migration**: Update frontend to use MCP client instead of direct HTTP APIs
2. **API Deprecation**: Add deprecation notices to existing API endpoints
3. **Documentation**: Update API documentation to reflect MCP protocol
4. **Monitoring**: Set up production monitoring for MCP server performance
5. **Testing**: Add comprehensive integration tests for MCP tools

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure API key is valid and active
   - Check session is authenticated for web requests

2. **Rate Limiting**:
   - Default limit is 100 requests/minute
   - Check `rateLimiter.getRemainingRequests(userId)`

3. **Validation Errors**:
   - Review tool argument schemas in `validation.ts`
   - Check error details in response

4. **WebSocket Connection Issues**:
   - Ensure WebSocket upgrade headers are correct
   - Check server logs for connection errors

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=mcp:* npm run start-mcp
```

## Benefits of MCP Migration

1. **Standardization**: Industry-standard protocol for tool exposure
2. **Self-Documentation**: Tools are self-describing with schemas
3. **Real-time Updates**: WebSocket notifications for immediate feedback
4. **Better Developer Experience**: Rich tooling and client libraries
5. **AI-Native**: Designed specifically for AI system integration
6. **Future-Proof**: Extensible architecture for new capabilities

This completes the comprehensive MCP migration for VibeHero! 🎉