# Permissions Guide

This guide covers the basic permissions setup for using Alvsys with AI agents and MCP (Model Context Protocol) integration.

## Repository Permissions

### Current Repository Access

When working within the current repository, you need to ensure proper access controls are in place:

1. **Repository Access**: Ensure your AI agent has appropriate read/write permissions to the repository
2. **Branch Protection**: Configure branch protection rules to prevent unauthorized changes to main branches
3. **API Keys**: Store sensitive credentials securely using environment variables
4. **GitHub Integration**: Use the GitHub App integration for secure repository access

### Environment Variables

Configure the following permissions-related environment variables:

```bash
# GitHub Integration
GITHUB_APP_ID="your-github-app-id"
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"

# Database Access
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="your-app-url"

# MCP Authentication
MCP_PROJECT_ID="your-project-id"
MCP_AUTH_TOKEN="your-auth-token"
```

## MCP (Model Context Protocol) Setup

### Curl via MCP

To set up MCP integration with curl authentication, use the following command:

```bash
claude mcp add --transport http alvsys https://alvsys.com/api/llm/mcp \
  --header "X-Project-Id: YOUR_PROJECT_ID" \
  --header "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Replace `YOUR_PROJECT_ID` and `YOUR_AUTH_TOKEN` with your actual credentials.

### MCP Permission Scopes

The MCP integration provides access to the following tools with appropriate permissions:

- **Issue Management**: Create, read, update, and manage issues
- **Project Management**: Access project data and sprint information
- **Statistics**: Read-only access to project statistics and metrics
- **Workflow Management**: Manage workflow states and transitions

### Security Best Practices

1. **API Key Management**: 
   - Never commit API keys to the repository
   - Use environment variables for all sensitive credentials
   - Rotate keys regularly

2. **Access Control**:
   - Implement least-privilege access principles
   - Use project-specific API keys when possible
   - Monitor API usage and access logs

3. **Authentication**:
   - Use secure token-based authentication for MCP connections
   - Implement proper session management
   - Enable audit logging for all API access

## Troubleshooting Permissions

### Common Issues

1. **403 Forbidden Errors**: Check that your API keys have the correct permissions
2. **Connection Timeouts**: Verify network access and firewall settings
3. **Invalid Token**: Ensure your authentication tokens are valid and not expired

### Verification Steps

To verify your permissions are correctly configured:

1. Test the MCP connection:
```bash
curl -H "X-Project-Id: YOUR_PROJECT_ID" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     https://alvsys.com/api/llm/mcp
```

2. Check repository access permissions in your GitHub settings
3. Verify environment variables are properly loaded in your application

## Support

If you encounter permission-related issues:

1. Check the application logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your GitHub App has the necessary permissions
4. Contact support with specific error messages and reproduction steps