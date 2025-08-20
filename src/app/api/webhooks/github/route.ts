import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@/generated/prisma';
import { validateWebhookSignature } from '@/lib/github';
import { GitHubFunctions } from '@/lib/github-functions';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headersList = await headers();
    const signature = headersList.get('x-hub-signature-256') || '';
    const event = headersList.get('x-github-event') || '';
    const deliveryId = headersList.get('x-github-delivery') || '';

    // Get raw body
    const payload = await request.text();

    // Parse payload first to get repository info
    const data = JSON.parse(payload);
    const repository = data.repository as { full_name?: string } | undefined;
    const repositoryName = repository?.full_name;

    // Find project and validate webhook signature with project-specific secret
    let validSignature = false;
    if (repositoryName) {
      const projects = await prisma.project.findMany({
        where: {
          githubRepoName: repositoryName,
          githubSyncEnabled: true,
        },
      });

      // Try to validate with each project's webhook secret
      for (const project of projects) {
        if (project.githubWebhookSecret && await validateWebhookSignature(payload, signature, project.githubWebhookSecret)) {
          validSignature = true;
          break;
        }
      }
    }

    // Fall back to global webhook secret if no project-specific match
    if (!validSignature) {
      const globalWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (!globalWebhookSecret || !(await validateWebhookSignature(payload, signature, globalWebhookSecret))) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Log the webhook event
    console.log(`GitHub webhook received: ${event} (${deliveryId})`);

    // Repository name already extracted above

    // Store webhook event for processing
    await prisma.gitHubWebhookEvent.create({
      data: {
        githubEventId: deliveryId,
        eventType: event,
        action: data.action as string || 'unknown',
        repositoryName: repositoryName || 'unknown',
        payload: data,
        signature,
        processed: false,
      },
    });

    // Process the webhook event using consolidated functions
    const result = await GitHubFunctions.handleWebhook(data, event);
    
    if (!result.success) {
      console.error('Webhook processing failed:', result.error);
      // Still return success to GitHub to avoid retries
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(eventType: string, data: Record<string, unknown>, deliveryId: string) {
  try {
    // Find the project associated with this repository
    const repository = data.repository as { full_name?: string } | undefined;
    const repositoryName = repository?.full_name;
    if (!repositoryName) {
      console.log('No repository information in webhook payload');
      return;
    }

    const projects = await prisma.project.findMany({
      where: {
        githubRepoName: repositoryName,
        githubSyncEnabled: true,
      },
    });

    if (projects.length === 0) {
      console.log(`No projects found for repository ${repositoryName}`);
      return;
    }

    // Process the event for each project
    for (const project of projects) {
      try {
        await processEventForProject(project.id, eventType, data);
      } catch (error) {
        console.error(`Error processing event for project ${project.id}:`, error);
        
        // Update webhook event with error
        await prisma.gitHubWebhookEvent.updateMany({
          where: { githubEventId: deliveryId },
          data: {
            processingError: error instanceof Error ? error.message : 'Unknown error',
            retryCount: { increment: 1 },
          },
        });
      }
    }

    // Mark webhook as processed
    await prisma.gitHubWebhookEvent.updateMany({
      where: { githubEventId: deliveryId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in processWebhookEvent:', error);
    throw error;
  }
}

async function processEventForProject(projectId: string, eventType: string, data: Record<string, unknown>) {
  const syncService = await GitHubSyncService.createForProject(projectId);
  if (!syncService) {
    console.log(`Cannot create sync service for project ${projectId}`);
    return;
  }

  switch (eventType) {
    case 'issues':
      await handleIssuesEvent(syncService, data);
      break;
    
    case 'issue_comment':
      await handleIssueCommentEvent(syncService, data);
      break;
    
    case 'installation':
      await handleInstallationEvent(data);
      break;
    
    case 'installation_repositories':
      await handleInstallationRepositoriesEvent(data);
      break;
    
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handleIssuesEvent(syncService: GitHubSyncService, data: Record<string, unknown>) {
  const action = data.action;
  const issue = data.issue as { number: number } | undefined;

  if (!issue) {
    console.log('No issue information in webhook payload');
    return;
  }

  console.log(`Processing issues event: ${action} for issue #${issue.number}`);

  switch (action) {
    case 'opened':
    case 'edited':
    case 'closed':
    case 'reopened':
      // Sync the specific issue to VibeHero
      const result = await syncService.syncIssueToVibeHero(issue.number);
      if (!result.success) {
        console.error(`Failed to sync issue #${issue.number}:`, result.error);
      }
      break;
    
    case 'deleted':
      // Handle issue deletion - mark card as deleted or remove sync
      await handleIssueDeleted(issue.number);
      break;
    
    default:
      console.log(`Unhandled issues action: ${action}`);
  }
}

async function handleIssueCommentEvent(syncService: GitHubSyncService, data: Record<string, unknown>) {
  const action = data.action;
  const comment = data.comment as { id: number; body: string; user: { login: string } } | undefined;
  const issue = data.issue as { number: number } | undefined;

  if (!issue || !comment) {
    console.log('Missing issue or comment information in webhook payload');
    return;
  }

  console.log(`Processing issue_comment event: ${action} for comment on issue #${issue.number}`);

  // Find the card associated with this issue
  const issueSync = await prisma.gitHubIssueSync.findFirst({
    where: {
      githubIssueId: issue.number,
    },
    include: { 
      card: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!issueSync) {
    console.log(`No card found for GitHub issue #${issue.number}`);
    return;
  }

  switch (action) {
    case 'created':
      // Try to find the user by GitHub username or account
      let authorId = issueSync.card.project.ownerId; // Default to project owner
      
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: comment.user.login },
            // If they've connected with GitHub OAuth
            {
              accounts: {
                some: {
                  provider: 'github',
                  providerAccountId: (comment as { user?: { id?: number } }).user?.id?.toString(),
                },
              },
            },
          ],
        },
      });

      if (user) {
        authorId = user.id;
      }

      // Create new comment in VibeHero
      await prisma.comment.create({
        data: {
          content: user 
            ? comment.body 
            : `**From GitHub (@${comment.user.login}):**\n\n${comment.body}`,
          cardId: issueSync.cardId,
          authorId,
          githubCommentId: comment.id,
          githubSyncEnabled: true,
        },
      });
      break;
    
    case 'edited':
      // Update existing comment
      const existingComment = await prisma.comment.findFirst({
        where: {
          githubCommentId: comment.id,
        },
        include: {
          author: true,
        },
      });

      if (existingComment) {
        // Check if the comment was created by a linked user or with GitHub prefix
        const hasGitHubPrefix = existingComment.content.startsWith('**From GitHub');
        
        await prisma.comment.update({
          where: { id: existingComment.id },
          data: {
            content: hasGitHubPrefix 
              ? `**From GitHub (@${comment.user.login}):**\n\n${comment.body}`
              : comment.body,
          },
        });
      }
      break;
    
    case 'deleted':
      // Remove comment from VibeHero
      await prisma.comment.deleteMany({
        where: {
          githubCommentId: comment.id,
        },
      });
      break;
    
    default:
      console.log(`Unhandled issue_comment action: ${action}`);
  }
}

async function handleInstallationEvent(data: Record<string, unknown>) {
  const action = data.action;
  const installation = data.installation as { 
    id: number; 
    account: { id: number; login: string; type: string }; 
    repository_selection: string;
    target_type: string;
    permissions: Record<string, unknown>;
    events: string[];
  } | undefined;

  if (!installation) {
    console.log('No installation information in webhook payload');
    return;
  }

  console.log(`Processing installation event: ${action} for installation ${installation.id}`);

  switch (action) {
    case 'created':
      // GitHub App installed - store installation info
      await prisma.gitHubInstallation.create({
        data: {
          githubInstallationId: installation.id.toString(),
          githubAccountId: installation.account.id.toString(),
          githubAccountLogin: installation.account.login,
          githubAccountType: installation.account.type,
          repositorySelection: installation.repository_selection,
          targetType: installation.target_type,
          permissions: JSON.parse(JSON.stringify(installation.permissions)),
          events: installation.events,
          userId: 'system', // Will need to link to actual user
          isActive: true,
        },
      });
      break;
    
    case 'deleted':
      // GitHub App uninstalled - deactivate installation
      await prisma.gitHubInstallation.updateMany({
        where: {
          githubInstallationId: installation.id.toString(),
        },
        data: {
          isActive: false,
          suspendedAt: new Date(),
        },
      });

      // Disable GitHub sync for all projects using this installation
      await prisma.project.updateMany({
        where: {
          githubInstallationId: installation.id.toString(),
        },
        data: {
          githubSyncEnabled: false,
        },
      });
      break;
    
    case 'suspend':
      // Installation suspended
      await prisma.gitHubInstallation.updateMany({
        where: {
          githubInstallationId: installation.id.toString(),
        },
        data: {
          isActive: false,
          suspendedAt: new Date(),
          suspendedBy: (data.sender as { login?: string })?.login,
        },
      });
      break;
    
    case 'unsuspend':
      // Installation unsuspended
      await prisma.gitHubInstallation.updateMany({
        where: {
          githubInstallationId: installation.id.toString(),
        },
        data: {
          isActive: true,
          suspendedAt: null,
          suspendedBy: null,
        },
      });
      break;
    
    default:
      console.log(`Unhandled installation action: ${action}`);
  }
}

async function handleInstallationRepositoriesEvent(data: Record<string, unknown>) {
  const action = data.action;
  const installation = data.installation as { id: number } | undefined;

  if (!installation) {
    console.log('No installation information in webhook payload');
    return;
  }

  console.log(`Processing installation_repositories event: ${action} for installation ${installation.id}`);

  switch (action) {
    case 'added':
      // Repositories added to installation
      const addedRepos = data.repositories_added as Array<{ full_name: string }> || [];
      for (const repo of addedRepos) {
        console.log(`Repository ${repo.full_name} added to installation ${installation.id}`);
      }
      break;
    
    case 'removed':
      // Repositories removed from installation
      const removedRepos = data.repositories_removed as Array<{ full_name: string }> || [];
      for (const repo of removedRepos) {
        console.log(`Repository ${repo.full_name} removed from installation ${installation.id}`);
        
        // Disable GitHub sync for projects using this repository
        await prisma.project.updateMany({
          where: {
            githubRepoName: repo.full_name,
            githubInstallationId: installation.id.toString(),
          },
          data: {
            githubSyncEnabled: false,
          },
        });
      }
      break;
    
    default:
      console.log(`Unhandled installation_repositories action: ${action}`);
  }
}

async function handleIssueDeleted(issueNumber: number) {
  // Find the sync record
  const issueSync = await prisma.gitHubIssueSync.findFirst({
    where: {
      githubIssueId: issueNumber,
    },
  });

  if (issueSync) {
    // Option 1: Delete the sync record but keep the card
    await prisma.gitHubIssueSync.delete({
      where: { id: issueSync.id },
    });

    // Clear GitHub info from the card
    await prisma.card.update({
      where: { id: issueSync.cardId },
      data: {
        githubIssueId: null,
        githubIssueUrl: null,
        githubSyncEnabled: false,
      },
    });

    console.log(`Removed GitHub sync for card ${issueSync.cardId} (issue #${issueNumber} deleted)`);
  }
}