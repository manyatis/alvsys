import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@/generated/prisma';
import { validateWebhookSignature } from '@/lib/github';
import { handleWebhook } from '@/lib/github-functions';

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
    const result = await handleWebhook(data, event);
    
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
  try {
    const result = await handleWebhook(data, eventType);
    if (!result.success) {
      console.log(`Failed to process webhook for project ${projectId}: ${result.error}`);
      return;
    }
    console.log(`Successfully processed ${eventType} webhook for project ${projectId}`);
  } catch (error) {
    console.error(`Error processing webhook for project ${projectId}:`, error);
    return;
  }
}