import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { Webhooks } from '@octokit/webhooks';

// GitHub App Configuration
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Singleton GitHub App instance
let githubApp: Octokit | null = null;

/**
 * Get authenticated GitHub App instance
 */
export function getGitHubApp(): Octokit {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GitHub App credentials not configured');
  }

  if (!githubApp) {
    githubApp = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: GITHUB_APP_ID,
        privateKey: GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }

  return githubApp;
}

/**
 * Get authenticated Octokit instance for a specific installation
 */
export async function getGitHubInstallation(installationId: string): Promise<Octokit> {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GitHub App credentials not configured');
  }

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      installationId: parseInt(installationId, 10),
    },
  });
}

/**
 * Get authenticated Octokit instance using user's access token
 * (for operations that require user-level permissions)
 */
export function getGitHubUser(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
  });
}

/**
 * GitHub Webhooks handler
 */
export function getGitHubWebhooks(): Webhooks {
  if (!GITHUB_WEBHOOK_SECRET) {
    throw new Error('GitHub webhook secret not configured');
  }

  return new Webhooks({
    secret: GITHUB_WEBHOOK_SECRET,
  });
}

/**
 * Status mapping between VibeHero and GitHub
 */
export const STATUS_MAPPING = {
  // VibeHero -> GitHub
  REFINEMENT: 'open',
  READY: 'open',
  IN_PROGRESS: 'open',
  BLOCKED: 'open',
  READY_FOR_REVIEW: 'open',
  COMPLETED: 'closed',
} as const;

/**
 * Reverse status mapping (GitHub -> VibeHero)
 */
export const GITHUB_STATUS_MAPPING = {
  open: 'READY', // Default new GitHub issues to ready (To Do)
  closed: 'COMPLETED',
} as const;

/**
 * GitHub Issue and VibeHero Card types
 */
export interface GitHubIssue {
  id: number;
  node_id: string;
  number: number;
  title: string;
  body: string | null | undefined;
  state: 'open' | 'closed';
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  assignees: Array<{
    id: number;
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

/**
 * Rate limit error with retry information
 */
export class GitHubRateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: Date,
    public remaining: number,
    public limit: number
  ) {
    super(message);
    this.name = 'GitHubRateLimitError';
  }
}

/**
 * Utility functions for GitHub integration
 */
export class GitHubService {
  public octokit: Octokit;
  private userToken?: string;

  constructor(installationId?: string, accessToken?: string) {
    if (accessToken) {
      this.octokit = getGitHubUser(accessToken);
      this.userToken = accessToken;
    } else if (installationId) {
      // This will be async, so we'll need to handle this differently
      throw new Error('Use createForInstallation() for installation-based auth');
    } else {
      this.octokit = getGitHubApp();
    }
  }

  static async createForInstallation(installationId: string): Promise<GitHubService> {
    const octokit = await getGitHubInstallation(installationId);
    const service = Object.create(GitHubService.prototype);
    service.octokit = octokit;
    return service;
  }

  /**
   * Handle rate limit errors and throw custom error with retry information
   */
  private async handleRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      const githubError = error as { status?: number; response?: { headers?: Record<string, string> } };
      if (githubError.status === 403 && githubError.response?.headers?.['x-ratelimit-remaining'] === '0') {
        const resetTime = parseInt(githubError.response.headers['x-ratelimit-reset'], 10);
        const limit = parseInt(githubError.response.headers['x-ratelimit-limit'], 10);
        
        throw new GitHubRateLimitError(
          `GitHub API rate limit exceeded. Reset at ${new Date(resetTime * 1000).toISOString()}`,
          new Date(resetTime * 1000),
          0,
          limit
        );
      }
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return data;
    });
  }

  /**
   * Get repository information by full name (owner/repo)
   */
  async getRepositoryByName(repoName: string) {
    const [owner, repo] = repoName.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository name format. Expected: owner/repo');
    }
    return this.getRepository(owner, repo);
  }

  /**
   * List issues in a repository
   */
  async getIssues(owner: string, repo: string, options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    since?: string;
  } = {}) {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: options.state || 'all',
        labels: options.labels,
        since: options.since,
        per_page: 100, // Max per page to reduce API calls
      });
      
      // Filter out pull requests (GitHub API includes PRs in issues endpoint)
      return data.filter(item => !item.pull_request);
    });
  }

  /**
   * Get a specific issue
   */
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });
      return data as GitHubIssue;
    });
  }

  /**
   * Create a new issue
   */
  async createIssue(owner: string, repo: string, issue: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }): Promise<GitHubIssue> {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
        assignees: issue.assignees,
      });
      return data as GitHubIssue;
    });
  }

  /**
   * Update an existing issue
   */
  async updateIssue(owner: string, repo: string, issueNumber: number, updates: {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
    assignees?: string[];
  }): Promise<GitHubIssue> {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...updates,
      });
      return data as GitHubIssue;
    });
  }

  /**
   * Get comments for an issue
   */
  async getIssueComments(owner: string, repo: string, issueNumber: number): Promise<GitHubComment[]> {
    return this.handleRateLimit(async () => {
      const { data } = await this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100, // Max per page
      });
      return data as GitHubComment[];
    });
  }

  /**
   * Create a comment on an issue
   */
  async createComment(owner: string, repo: string, issueNumber: number, body: string): Promise<GitHubComment> {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
    return data as GitHubComment;
  }

  /**
   * Update a comment
   */
  async updateComment(owner: string, repo: string, commentId: number, body: string): Promise<GitHubComment> {
    const { data } = await this.octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body,
    });
    return data as GitHubComment;
  }

  /**
   * Get repository labels
   */
  async getLabels(owner: string, repo: string) {
    const { data } = await this.octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
    });
    return data;
  }

  /**
   * Get installations for the authenticated app or user
   */
  async getInstallations() {
    if (this.userToken) {
      // For user tokens, get installations the user has access to
      const { data } = await this.octokit.rest.apps.listInstallationsForAuthenticatedUser();
      return data.installations;
    } else {
      // For app tokens, get all installations
      const { data } = await this.octokit.rest.apps.listInstallations();
      return data;
    }
  }

  /**
   * Get repositories accessible to an installation
   */
  async getInstallationRepositories(installationId: string) {
    if (this.userToken) {
      // For user tokens, get installation repositories
      const { data } = await this.octokit.rest.apps.listInstallationReposForAuthenticatedUser({
        installation_id: parseInt(installationId, 10),
      });
      return data;
    } else {
      // For app tokens, use installation-specific access
      const installationOctokit = await getGitHubInstallation(installationId);
      const { data } = await installationOctokit.rest.apps.listReposAccessibleToInstallation();
      return { repositories: data.repositories };
    }
  }
}

/**
 * Parse repository name from various formats
 */
export function parseRepositoryName(input: string): { owner: string; repo: string } | null {
  // Handle GitHub URLs
  const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Handle owner/repo format
  const nameMatch = input.match(/^([^\/]+)\/([^\/]+)$/);
  if (nameMatch) {
    return { owner: nameMatch[1], repo: nameMatch[2] };
  }

  return null;
}

/**
 * Validate GitHub webhook signature
 */
export async function validateWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const webhooks = new Webhooks({ secret });
  return await webhooks.verify(payload, signature);
}