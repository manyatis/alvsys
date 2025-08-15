# MCP Migration Test Guide

## Testing the Migration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test MCP Endpoints

#### Test Projects Endpoint
```bash
# List projects (GET)
curl -X GET "http://localhost:3000/mcp/projects" \
  -H "Cookie: your-session-cookie"

# Create project (POST) 
curl -X POST "http://localhost:3000/mcp/projects" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "projectName": "Test MCP Project",
    "description": "A project created via MCP endpoint"
  }'
```

#### Test Issues Endpoint
```bash
# List issues (GET)
curl -X GET "http://localhost:3000/mcp/issues?projectId=YOUR_PROJECT_ID" \
  -H "Cookie: your-session-cookie"

# Create issue (POST)
curl -X POST "http://localhost:3000/mcp/issues" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "title": "Test MCP Issue",
    "description": "An issue created via MCP endpoint",
    "status": "todo",
    "priority": "medium"
  }'

# Update issue (PUT)
curl -X PUT "http://localhost:3000/mcp/issues/YOUR_ISSUE_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Updated MCP Issue",
    "status": "in_progress"
  }'
```

#### Test Comments Endpoint
```bash
# List comments (GET)
curl -X GET "http://localhost:3000/mcp/issues/YOUR_ISSUE_ID/comments" \
  -H "Cookie: your-session-cookie"

# Create comment (POST)
curl -X POST "http://localhost:3000/mcp/issues/YOUR_ISSUE_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "content": "This is a test comment via MCP",
    "isAiComment": false
  }'
```

### 3. Test MCP Protocol Endpoint

#### Direct MCP Protocol (JSON-RPC)
```bash
# List tools
curl -X POST "http://localhost:3000/mcp" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Call a tool
curl -X POST "http://localhost:3000/mcp" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
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

### 4. Frontend Testing

#### Check Browser Network Tab
1. Open browser dev tools
2. Go to Network tab  
3. Navigate to `/projects` page
4. Look for calls to `/mcp/projects` instead of `/api/projects`
5. Verify deprecation headers on old `/api/projects` calls

#### Check WebSocket Connection
1. Open browser dev tools console
2. Look for WebSocket connection logs: `[MCP WebSocket] Connected successfully`
3. Create/update a project and verify real-time updates

### 5. Verification Checklist

- [ ] `/mcp/projects` GET endpoint works
- [ ] `/mcp/projects` POST endpoint works  
- [ ] `/mcp/issues` GET endpoint works
- [ ] `/mcp/issues` POST endpoint works
- [ ] `/mcp/issues/[id]` PUT endpoint works
- [ ] `/mcp/issues/[id]/comments` GET endpoint works
- [ ] `/mcp/issues/[id]/comments` POST endpoint works
- [ ] Direct MCP protocol at `/mcp` works
- [ ] Frontend uses new MCP endpoints
- [ ] WebSocket real-time updates work
- [ ] Old API endpoints show deprecation warnings
- [ ] Error handling works correctly

### 6. Performance Comparison

#### Before Migration (REST API)
- Monitor response times for `/api/projects`, `/api/issues`
- Check polling frequency (was 30s interval)

#### After Migration (MCP)
- Monitor response times for `/mcp/projects`, `/mcp/issues`  
- Verify reduced polling (should be 2min fallback)
- Check WebSocket real-time updates work

### 7. Expected Improvements

1. **Real-time updates**: Changes appear immediately via WebSocket
2. **Reduced polling**: From 30s to 2min fallback polling
3. **Better error handling**: Structured MCP error responses
4. **Standardized protocol**: Self-describing tools and schemas
5. **Event notifications**: Real-time project/issue/comment events

### 8. Rollback Plan

If issues occur:
1. Frontend can fall back to old `/api` endpoints
2. Disable WebSocket client temporarily
3. Increase polling frequency if needed
4. Both systems run in parallel during transition

## Migration Status

✅ **Completed:**
- MCP server infrastructure
- `/mcp/*` REST-style endpoints
- Frontend MCP client
- WebSocket real-time notifications
- Deprecation notices on old endpoints

🔄 **In Progress:**
- Testing and validation
- Performance monitoring

📋 **Planned:**
- Additional endpoints (sprints, labels)  
- Enhanced error handling
- Complete API deprecation
- Documentation updates

This migration provides a smooth transition path from traditional REST APIs to the modern MCP protocol while maintaining backward compatibility.