# Debugging GitHub App Installation Issues

This guide helps diagnose and fix GitHub App installation issues when you're getting 404 errors during sync.

## Quick Diagnosis

### 1. Test GitHub App Configuration

Run the test script to verify your GitHub App is configured correctly:

```bash
node scripts/test-github-app.js
```

This will check:
- Environment variables are set
- GitHub App authentication works
- List all installations
- Show accessible repositories

### 2. Use Debug Endpoints

The following debug endpoints are available to help diagnose issues:

#### Check Overall GitHub App Status

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/debug/github-app
```

This shows:
- GitHub App credentials status
- All projects with GitHub integration
- Installation validity for each project
- Recommendations for fixing issues

#### Get GitHub App Installation URL

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/debug/github-app/install-url
```

Returns the correct URL to install the GitHub App.

#### Fix Installation Issues

```bash
# Clear invalid installation
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID", "action": "clear_installation"}' \
  http://localhost:3000/api/debug/github-app/fix

# Validate installation
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID", "action": "validate_installation"}' \
  http://localhost:3000/api/debug/github-app/fix

# List available installations
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "YOUR_PROJECT_ID", "action": "list_available_installations"}' \
  http://localhost:3000/api/debug/github-app/fix
```

## Common Issues and Solutions

### 1. 404 Error When Creating Installation Token

**Symptoms:**
- Sync fails with "404 Not Found"
- Error mentions installation access token

**Causes:**
- GitHub App was uninstalled
- Installation ID is invalid
- App ID mismatch

**Solution:**
1. Run `clear_installation` action to reset the project
2. Reinstall the GitHub App
3. Re-link the repository

### 2. GitHub App Not Found

**Symptoms:**
- Can't authenticate as GitHub App
- 401 errors

**Causes:**
- Incorrect GITHUB_APP_ID
- Malformed private key
- Environment variables not loaded

**Solution:**
1. Verify environment variables in `.env.local`
2. Check private key format (should include BEGIN/END lines)
3. Ensure line breaks in private key are preserved

### 3. No Installations Found

**Symptoms:**
- Authentication works but no installations visible
- Can't see repositories

**Causes:**
- GitHub App not installed on any account
- User doesn't have access to installations

**Solution:**
1. Get the installation URL from debug endpoint
2. Install the app on your GitHub account/organization
3. Grant access to desired repositories

## Step-by-Step Recovery Process

If you're experiencing GitHub sync issues:

1. **Run the test script**
   ```bash
   node scripts/test-github-app.js
   ```

2. **Check debug endpoint**
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3000/api/debug/github-app
   ```

3. **If installation is invalid, clear it**
   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"projectId": "YOUR_PROJECT_ID", "action": "clear_installation"}' \
     http://localhost:3000/api/debug/github-app/fix
   ```

4. **Get the installation URL**
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3000/api/debug/github-app/install-url
   ```

5. **Install/reinstall the GitHub App**
   - Visit the installation URL
   - Select your account/organization
   - Grant access to repositories

6. **Re-link the repository in alvsys**
   - Go to project settings
   - Use GitHub integration UI
   - Select the new installation
   - Choose your repository

## Environment Variable Reference

Required for GitHub App:
```bash
# GitHub App Configuration
GITHUB_APP_ID="123456"  # Your GitHub App's ID
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...your private key content...
-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"

# GitHub OAuth (for user authentication)
GITHUB_ID="Iv1.abc123..."  # GitHub App's Client ID
GITHUB_SECRET="1234567890abcdef..."  # GitHub App's Client Secret
```

## Understanding the Error

The 404 error typically means:

1. **Installation not found**: The installation ID stored in the database no longer exists on GitHub
2. **App uninstalled**: The GitHub App was removed from the repository
3. **Permission revoked**: The app no longer has access to the repository

The debug endpoints help identify which scenario you're facing and provide the appropriate fix.