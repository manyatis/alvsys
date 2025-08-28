# Permissions Guide

This guide covers setting up the essential permissions and access controls for working with Alvsys.

## Repository Permissions

### Basic Repository Access
When working within the current repository, ensure you have the following permissions:

#### GitHub Repository Access
- **Read access** to clone and pull the repository
- **Write access** to push changes to your branches  
- **Issues access** to create, edit, and manage issues
- **Pull requests access** to create and manage PRs

#### Environment Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/manyatis/alvsys.git
   cd alvsys
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
3. **Configure your API keys** in the `.env` file:
   - Database connection strings
   - Authentication providers
   - Third-party service keys

### Branch Protection Rules
- `main` branch is protected - always work on feature branches
- Pull requests require review before merging
- Status checks must pass before merging

## MCP (Model Context Protocol) Setup

### Connection Command
To connect your local AI agent to Alvsys via MCP, use the following command:

```bash
claude mcp add --transport http alvsys https://alvsys.com/api/llm/mcp \
  --header "X-Project-Id: cmek8wawo0002l704jz13jxr4" \
  --header "Authorization: Bearer vMiQJohENjuy82-GkZpVTUTZOeTNHLab0erKyISbSAo"
```

### MCP Authentication Headers
- **X-Project-Id**: Identifies your specific project in Alvsys
- **Authorization**: Bearer token for API authentication

### Testing MCP Connection
To verify your MCP connection is working:

```bash
# Test basic connectivity
curl -H "X-Project-Id: cmek8wawo0002l704jz13jxr4" \
     -H "Authorization: Bearer vMiQJohENjuy82-GkZpVTUTZOeTNHLab0erKyISbSAo" \
     https://alvsys.com/api/llm/mcp
```

### API Key Management
- **Keep your API keys secure** - never commit them to the repository
- **Use environment variables** for all sensitive configuration
- **Rotate keys regularly** for security best practices
- **Limit key permissions** to only what's necessary

## Security Best Practices

### Access Control
- Use principle of least privilege - grant only necessary permissions
- Regularly audit and review access permissions
- Remove access for inactive team members
- Monitor API usage for unusual patterns

### Authentication
- Enable two-factor authentication on all accounts
- Use strong, unique passwords
- Keep authentication tokens secure and rotated
- Never share authentication credentials

### Environment Security
- **Development**: Use separate API keys from production
- **Staging**: Mirror production permissions but with test data
- **Production**: Strict access controls and monitoring

## Troubleshooting

### Common Permission Issues

#### "Permission denied" errors
- Verify your GitHub access token has the required scopes
- Check if the repository collaborator permissions are sufficient
- Ensure your SSH keys are properly configured

#### MCP connection failures
- Verify the project ID and bearer token are correct
- Check if the API endpoint is accessible from your network
- Confirm your API key hasn't expired or been revoked

#### API authentication errors
- Double-check the Authorization header format
- Ensure the bearer token is valid and active
- Verify the X-Project-Id matches your project

### Getting Help
- Check the main [README.md](../README.md) for setup instructions
- Review existing [documentation](./VECTOR_SYNC_IMPLEMENTATION.md) for advanced features
- Contact the development team for access issues

---

**Security Note**: This platform is designed with privacy in mind - your code never leaves your system, and your API keys stay yours. We use trusted, reliable infrastructure (Vercel + Supabase) without sketchy dependencies.