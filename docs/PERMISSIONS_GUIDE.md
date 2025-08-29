# Alvsys Permissions Guide

## Overview
This guide covers the essential permissions setup for working with the Alvsys project, including repository access controls and MCP (Model Context Protocol) integration.

## Repository Permissions

### Access Control Setup
- **Branch Protection**: Ensure main branch has protection rules enabled
- **Repository Access**: Configure appropriate read/write permissions for team members
- **API Keys**: Secure handling of authentication tokens and API keys
- **GitHub Integration**: Proper setup for GitHub App permissions and webhooks

### Environment Variables
Ensure the following permissions-related environment variables are properly configured:

```bash
# GitHub Integration
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_PRIVATE_KEY="your-private-key"
GITHUB_APP_INSTALLATION_ID="your-installation-id"

# Supabase Vector Database
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"
```

## MCP (Model Context Protocol) Setup

### Connection Command
To connect Claude via MCP, use the following command with proper authentication:

```bash
claude mcp add --transport http alvsys https://alvsys.com/api/llm/mcp \
  --header "X-Project-Id: cmek8wawo0002l704jz13jxr4" \
  --header "Authorization: Bearer vMiQJohENjuy82-GkZpVTUTZOeTNHLab0erKyISbSAo"
```

### MCP Permission Requirements
- **API Endpoint Access**: Ensure `/api/llm/mcp` endpoint is accessible
- **Authentication Headers**: Valid project ID and bearer token required
- **CORS Configuration**: Proper cross-origin resource sharing setup for external connections
- **Rate Limiting**: Configure appropriate rate limits for MCP requests

### cURL Testing
Test MCP connection using curl:

```bash
curl -X GET "https://alvsys.com/api/llm/mcp" \
  -H "X-Project-Id: cmek8wawo0002l704jz13jxr4" \
  -H "Authorization: Bearer vMiQJohENjuy82-GkZpVTUTZOeTNHLab0erKyISbSAo" \
  -H "Content-Type: application/json"
```

## Security Best Practices

### API Key Management
1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** to maintain security
4. **Limit key permissions** to minimum required scope

### Access Control
1. **Principle of least privilege** - Grant minimum necessary permissions
2. **Regular permission audits** - Review and update access controls
3. **Multi-factor authentication** - Enable MFA for all accounts
4. **Secure webhook endpoints** - Validate webhook signatures

### GitHub Integration Security
1. **GitHub App permissions** - Only request necessary permissions
2. **Webhook validation** - Verify GitHub webhook signatures
3. **Installation security** - Regularly review GitHub App installations
4. **Token management** - Securely store and rotate GitHub tokens

## Troubleshooting

### Common Permission Issues

#### MCP Connection Failures
- **Invalid headers**: Verify project ID and authorization token
- **Network issues**: Check firewall and network connectivity
- **CORS errors**: Ensure proper CORS configuration on server

#### GitHub Integration Problems
- **App not installed**: Verify GitHub App is installed on repository
- **Invalid permissions**: Check GitHub App permission scopes
- **Webhook failures**: Verify webhook URL and secret configuration

#### API Access Issues
- **Rate limiting**: Check for API rate limit exceeded errors
- **Authentication failures**: Verify API keys and tokens are valid
- **Permission denied**: Ensure proper access controls are configured

### Verification Steps
1. **Test MCP connection** using the provided curl command
2. **Verify GitHub integration** by creating a test issue
3. **Check API endpoints** for proper authentication responses
4. **Review logs** for permission-related error messages

## Additional Resources
- [GitHub App Documentation](https://docs.github.com/en/developers/apps)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Alvsys Vector Sync Implementation](./VECTOR_SYNC_IMPLEMENTATION.md)