# GitHub Issues Integration

This document explains how to set up and use the GitHub Issues integration in VibeHero.

## Overview

The GitHub integration allows you to:
- **Link projects to GitHub repositories** - Connect VibeHero projects with GitHub repos
- **Bidirectional sync** - Keep issues and cards synchronized between both systems
- **Automatic webhooks** - Real-time updates when issues change on GitHub
- **Comment synchronization** - Comments flow between both platforms
- **Status mapping** - Intelligent mapping between VibeHero card statuses and GitHub issue states
- **Optional integration** - Can be enabled/disabled per project

## Setup

### 1. Create a GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Fill in the app details:
   - **App name**: `VibeHero Integration` (or your preferred name)
   - **Homepage URL**: Your VibeHero instance URL
   - **Webhook URL**: `https://your-domain.com/api/webhooks/github`
   - **Webhook secret**: Generate a random secret (save for later)

4. Set permissions:
   - **Repository permissions**:
     - Issues: Read & Write
     - Metadata: Read
     - Pull requests: Read (optional)
   - **Organization permissions**: None required
   - **Account permissions**: Email addresses: Read (for user mapping)

5. Subscribe to events:
   - Issues
   - Issue comments
   - Installation
   - Installation repositories

6. Save the app and note down:
   - App ID
   - Generate and download the private key
   - Client ID and Client Secret (for OAuth)

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# GitHub App Integration (for repository sync)
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your-github-app-private-key
-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# GitHub OAuth Provider (existing - for user authentication)
GITHUB_ID="your-github-app-client-id"
GITHUB_SECRET="your-github-app-client-secret"
```

### 3. Database Migration

Run the database migration to add GitHub integration tables:

```bash
npm run db:migrate
```

### 4. Install the GitHub App

1. Go to your GitHub App settings
2. Click "Install App"
3. Choose the account/organization where your repositories are located
4. Select "All repositories" or choose specific repositories
5. Complete the installation

## Usage

### Linking a Project to GitHub

1. **Navigate to project settings** or use the GitHub integration component
2. **Connect GitHub account** (if not already connected via OAuth)
3. **Select installation** - Choose the GitHub App installation
4. **Select repository** - Pick the repository to sync with
5. **Link repository** - Confirm the connection

### Syncing Options

When setting up sync, you can configure:

- **Direction**:
  - `VIBES_TO_GITHUB` - Only sync VibeHero cards to GitHub issues
  - `GITHUB_TO_VIBES` - Only sync GitHub issues to VibeHero cards
  - `BIDIRECTIONAL` - Sync both ways (recommended)

- **Conflict Resolution**:
  - `MANUAL` - Require manual intervention for conflicts
  - `VIBES_WINS` - VibeHero always wins conflicts
  - `GITHUB_WINS` - GitHub always wins conflicts
  - `LATEST_TIMESTAMP` - Most recent update wins

- **Additional Options**:
  - Sync comments between systems
  - Sync labels between systems

### Status Mapping

| VibeHero Status | GitHub State |
|----------------|--------------|
| REFINEMENT     | open         |
| READY          | open         |
| IN_PROGRESS    | open         |
| BLOCKED        | open         |
| READY_FOR_REVIEW | open       |
| COMPLETED      | closed       |

### Automatic Sync

Once linked, the following events trigger automatic sync:

**From GitHub to VibeHero:**
- Issue created → New card created in REFINEMENT status
- Issue updated → Card title/description updated
- Issue closed → Card status changed to COMPLETED
- Issue reopened → Card status changed to REFINEMENT
- Comment added → Comment added to card

**From VibeHero to GitHub:**
- Card created with sync enabled → New issue created
- Card updated → Issue title/description updated
- Card completed → Issue closed
- Card reopened → Issue reopened
- Comment added → Comment added to issue

### Manual Sync

You can trigger manual sync through:

1. **Full project sync** - Sync all cards/issues
2. **Individual card sync** - Sync specific card to GitHub
3. **API endpoints** - Programmatic sync control

## API Endpoints

### Project GitHub Integration

```http
# Get GitHub integration status
GET /api/projects/{id}/github

# Link repository
POST /api/projects/{id}/github/link
{
  "repoName": "owner/repo",
  "installationId": "12345"
}

# Unlink repository
DELETE /api/projects/{id}/github/link

# Trigger full sync
POST /api/projects/{id}/github/sync
{
  "direction": "BIDIRECTIONAL",
  "conflictResolution": "LATEST_TIMESTAMP",
  "syncComments": true,
  "syncLabels": true
}
```

### Card GitHub Integration

```http
# Sync card to GitHub
POST /api/cards/{id}/github

# Disable GitHub sync for card
DELETE /api/cards/{id}/github
```

### GitHub Installations

```http
# Get available installations
GET /api/github/installations
```

## Components

### GitHubIntegration Component

Use the provided React component to add GitHub integration UI to your project:

```tsx
import GitHubIntegration from '@/components/GitHubIntegration';

function ProjectSettings({ projectId }: { projectId: string }) {
  return (
    <div>
      <GitHubIntegration 
        projectId={projectId}
        onSyncStatusChange={(status) => {
          console.log('Sync status changed:', status);
        }}
      />
    </div>
  );
}
```

## Security Considerations

1. **Webhook Signatures** - All webhooks are verified using HMAC signatures
2. **API Authentication** - All endpoints require valid API keys or session auth
3. **Permission Checking** - Users can only link repositories they have access to
4. **Rate Limiting** - GitHub API calls are subject to rate limits
5. **Data Privacy** - Only synced data is stored; full GitHub data is not cached

## Troubleshooting

### Common Issues

1. **Repository not accessible**
   - Ensure the GitHub App is installed for the repository
   - Check that the installation hasn't been suspended
   - Verify repository permissions

2. **Webhook not receiving events**
   - Check webhook URL is publicly accessible
   - Verify webhook secret matches environment variable
   - Check GitHub App event subscriptions

3. **Sync conflicts**
   - Review conflict resolution settings
   - Check for manual resolution requirements
   - Verify timestamps and update ordering

4. **Authentication errors**
   - Ensure GitHub OAuth is configured correctly
   - Check GitHub App credentials
   - Verify installation permissions

### Debugging

Enable debug logging by setting:

```bash
DEBUG=github:*
```

Check webhook event logs in the database:

```sql
SELECT * FROM "GitHubWebhookEvent" 
WHERE processed = false 
ORDER BY "createdAt" DESC;
```

## Database Schema

The integration adds these models:

- `GitHubIssueSync` - Links cards to GitHub issues
- `GitHubInstallation` - Tracks GitHub App installations
- `GitHubWebhookEvent` - Logs webhook events for debugging

Extended existing models:
- `Project` - Added GitHub repository fields
- `Card` - Added GitHub issue fields
- `Comment` - Added GitHub comment fields

## Limitations

1. **User Mapping** - GitHub users are mapped to project owners for comments
2. **Label Sync** - Basic label name matching (no color sync yet)
3. **Assignee Sync** - Requires users to be connected to both systems
4. **Rich Text** - Markdown formatting may differ between systems
5. **Attachments** - File attachments are not synced

## Future Enhancements

- **Pull Request Integration** - Link cards to pull requests
- **Advanced User Mapping** - Map GitHub users to VibeHero users
- **Rich Label Sync** - Sync label colors and descriptions
- **Attachment Sync** - Sync file attachments between systems
- **Branch Linking** - Connect cards to specific branches
- **Commit References** - Link commits to cards automatically