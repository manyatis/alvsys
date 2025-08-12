import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UsageService } from '@/services/usage-service';

// GET /api/projects - Get user's projects
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedProjects: {
          include: {
            organization: true,
            _count: {
              select: { cards: true }
            }
          }
        },
        projects: {
          include: {
            project: {
              include: {
                organization: true,
                _count: {
                  select: { cards: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Combine owned projects and projects user is a member of
    const allProjects = [
      ...user.ownedProjects,
      ...user.projects.map(p => p.project)
    ];

    // Remove duplicates
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p.id, p])).values()
    );

    return NextResponse.json({ projects: uniqueProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/projects - Create new project (and optionally organization)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationName, organizationId, projectName } = body;

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    if (!organizationName && !organizationId) {
      return NextResponse.json({ error: 'Either organization name or ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check usage limits before creating project
    const canCreateProject = await UsageService.canCreateProject(user.id);
    if (!canCreateProject) {
      const usageStatus = await UsageService.getUserUsageStatus(user.id);
      return NextResponse.json({ 
        error: 'Project limit reached', 
        usageLimit: {
          used: usageStatus.projectsUsed,
          limit: usageStatus.projectsLimit,
        }
      }, { status: 429 });
    }

    let orgId = organizationId;

    // Create new organization if needed
    if (!organizationId && organizationName) {
      const newOrg = await prisma.organization.create({
        data: {
          name: organizationName,
          users: {
            connect: { id: user.id }
          }
        }
      });
      
      orgId = newOrg.id;

      // Update user's organization
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: orgId }
      });
    }

    // Verify user has access to the organization
    if (organizationId) {
      const userOrg = await prisma.user.findFirst({
        where: {
          id: user.id,
          organizationId: organizationId
        }
      });

      if (!userOrg) {
        return NextResponse.json({ error: 'You do not have access to this organization' }, { status: 403 });
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        organizationId: orgId,
        ownerId: user.id,
        users: {
          create: {
            userId: user.id,
            role: 'owner'
          }
        }
      },
      include: {
        organization: true
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}