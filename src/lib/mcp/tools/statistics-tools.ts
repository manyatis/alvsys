import { z } from 'zod';
import { getProjectIssues } from '@/lib/issue-functions';
import { getProjectSprints } from '@/lib/sprint-functions';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

export function registerStatisticsTools(server: Server) {
  server.tool(
    "get_project_statistics",
    "Get statistics about project issues, sprints, and progress",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ project_id }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const issuesResult = await getProjectIssues(projectId, {});
      const sprintsResult = await getProjectSprints(projectId);
      
      if (!issuesResult.success || !issuesResult.issues) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: false,
              error: issuesResult.error || "Failed to fetch issues"
            }, null, 2)
          }]
        };
      }
      
      const issues = issuesResult.issues;
      const sprints = sprintsResult.success ? sprintsResult.sprints || [] : [];
      
      // Calculate statistics
      const statistics = {
        totalIssues: issues.length,
        byStatus: {
          refinement: issues.filter(i => i.status === 'REFINEMENT').length,
          ready: issues.filter(i => i.status === 'READY').length,
          inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
          blocked: issues.filter(i => i.status === 'BLOCKED').length,
          readyForReview: issues.filter(i => i.status === 'READY_FOR_REVIEW').length,
          completed: issues.filter(i => i.status === 'COMPLETED').length
        },
        byPriority: {
          p1: issues.filter(i => i.priority === 1).length,
          p2: issues.filter(i => i.priority === 2).length,
          p3: issues.filter(i => i.priority === 3).length,
          p4: issues.filter(i => i.priority === 4).length,
          p5: issues.filter(i => i.priority === 5).length
        },
        aiAllowedTasks: issues.filter(i => (i as any).isAiAllowedTask).length,
        assignedTasks: issues.filter(i => i.assigneeId).length,
        unassignedTasks: issues.filter(i => !i.assigneeId).length,
        totalSprints: sprints.length,
        activeSprint: sprints.find(s => s.isActive) || null,
        completedSprints: sprints.filter(s => !s.isActive).length,
        averageIssuesPerSprint: sprints.length > 0 
          ? Math.round(issues.filter(i => i.sprintId).length / sprints.length)
          : 0,
        issuesWithoutSprint: issues.filter(i => !i.sprintId).length
      };
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: true,
            projectId,
            statistics
          }, null, 2)
        }]
      };
    }
  );

  server.tool(
    "get_backlog",
    "Get all issues in the backlog (not assigned to any sprint)",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ project_id }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, {});
      
      if (!result.success || !result.issues) {
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
      
      const backlogIssues = result.issues.filter(issue => !issue.sprintId);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: true,
            projectId,
            backlog: {
              totalIssues: backlogIssues.length,
              issues: backlogIssues,
              byStatus: {
                refinement: backlogIssues.filter(i => i.status === 'REFINEMENT').length,
                ready: backlogIssues.filter(i => i.status === 'READY').length,
                inProgress: backlogIssues.filter(i => i.status === 'IN_PROGRESS').length,
                blocked: backlogIssues.filter(i => i.status === 'BLOCKED').length,
                readyForReview: backlogIssues.filter(i => i.status === 'READY_FOR_REVIEW').length,
                completed: backlogIssues.filter(i => i.status === 'COMPLETED').length
              }
            }
          }, null, 2)
        }]
      };
    }
  );

  server.tool(
    "get_issues_by_status",
    "Get all issues with a specific status",
    {
      status: z.string().describe("Status to filter by (REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ status, project_id }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, { status });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_team_activity",
    "Get recent team activity and assignments",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ project_id }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, {});
      
      if (!result.success || !result.issues) {
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
      
      // Group issues by assignee
      interface IssueActivity {
        id: string;
        title: string;
        status: string;
        priority: number;
        updatedAt: string;
        assignee?: {
          name: string | null;
        } | null;
      }
      const assigneeMap = new Map<string, IssueActivity[]>();
      
      result.issues.forEach(issue => {
        const assigneeId = issue.assigneeId || 'unassigned';
        if (!assigneeMap.has(assigneeId)) {
          assigneeMap.set(assigneeId, []);
        }
        assigneeMap.get(assigneeId)?.push({
          id: issue.id,
          title: issue.title,
          status: issue.status,
          priority: issue.priority,
          updatedAt: issue.updatedAt,
          assignee: issue.assignee
        });
      });
      
      const teamActivity = Array.from(assigneeMap.entries()).map(([assigneeId, issues]) => ({
        assigneeId,
        assigneeName: assigneeId === 'unassigned' 
          ? 'Unassigned' 
          : issues[0]?.assignee?.name || assigneeId,
        totalTasks: issues.length,
        tasksByStatus: {
          inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
          blocked: issues.filter(i => i.status === 'BLOCKED').length,
          readyForReview: issues.filter(i => i.status === 'READY_FOR_REVIEW').length,
          completed: issues.filter(i => i.status === 'COMPLETED').length
        },
        recentTasks: issues
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
      }));
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: true,
            projectId,
            teamActivity
          }, null, 2)
        }]
      };
    }
  );
}