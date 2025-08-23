import { z } from 'zod';
import { getProjectIssues } from '@/lib/issue-functions';
import { getProjectSprints } from '@/lib/sprint-functions';

// MCP tools use a system user ID
const MCP_USER_ID = 'mcp-system';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

interface ToolContext {
  projectId?: string | null;
  userId?: string;
}

export function registerStatisticsTools(server: Server, context?: ToolContext) {
  server.tool(
    "get_project_statistics",
    "Get statistics about project issues, sprints, and progress",
    {},
    async () => {
      const projectId = context?.projectId;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Please provide via X-Project-Id header when configuring the MCP server."
            }, null, 2)
          }]
        };
      }
      
      const issuesResult = await getProjectIssues(projectId, MCP_USER_ID, {});
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
        aiAllowedTasks: issues.filter(i => (i as { isAiAllowedTask?: boolean }).isAiAllowedTask).length,
        assignedTasks: issues.filter(i => (i as { assigneeId?: string }).assigneeId).length,
        unassignedTasks: issues.filter(i => !(i as { assigneeId?: string }).assigneeId).length,
        totalSprints: sprints.length,
        activeSprint: sprints.find(s => s.isActive) || null,
        completedSprints: sprints.filter(s => !s.isActive).length,
        averageIssuesPerSprint: sprints.length > 0 
          ? Math.round(issues.filter(i => (i as { sprintId?: string }).sprintId).length / sprints.length)
          : 0,
        issuesWithoutSprint: issues.filter(i => !(i as { sprintId?: string }).sprintId).length
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
    {},
    async () => {
      const projectId = context?.projectId;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Please provide via X-Project-Id header when configuring the MCP server."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, MCP_USER_ID, {});
      
      if (!result.success || !result.issues) {
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
      
      const backlogIssues = result.issues.filter(issue => !(issue as { sprintId?: string }).sprintId);
      
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
      status: z.string().describe("Status to filter by (REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)")
    },
    async ({ status }) => {
      const projectId = context?.projectId;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Please provide via X-Project-Id header when configuring the MCP server."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, MCP_USER_ID, { status });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_team_activity",
    "Get recent team activity and assignments",
    {},
    async () => {
      const projectId = context?.projectId;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Please provide via X-Project-Id header when configuring the MCP server."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectIssues(projectId, MCP_USER_ID, {});
      
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
        const assigneeId = (issue as { assigneeId?: string }).assigneeId || 'unassigned';
        if (!assigneeMap.has(assigneeId)) {
          assigneeMap.set(assigneeId, []);
        }
        assigneeMap.get(assigneeId)?.push({
          id: issue.id,
          title: issue.title,
          status: issue.status,
          priority: issue.priority,
          updatedAt: issue.updatedAt.toString(),
          assignee: (issue as { assignee?: { name: string | null } | null }).assignee
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