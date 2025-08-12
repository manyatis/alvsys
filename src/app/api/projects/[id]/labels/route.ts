import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate a random hex color
function generateRandomColor(): string {
  const colors = [
    '#EF4444', // Red
    '#F97316', // Orange  
    '#F59E0B', // Amber
    '#EAB308', // Yellow
    '#84CC16', // Lime
    '#22C55E', // Green
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#A855F7', // Purple
    '#D946EF', // Fuchsia
    '#EC4899', // Pink
    '#F43F5E', // Rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        users: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = project.ownerId === user.id || 
                     project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all labels for the project
    const labels = await prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { name, color } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        users: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = project.ownerId === user.id || 
                     project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if label already exists in this project
    const existingLabel = await prisma.label.findUnique({
      where: {
        name_projectId: {
          name: name.trim(),
          projectId: projectId
        }
      }
    });

    if (existingLabel) {
      return NextResponse.json({ error: 'Label already exists' }, { status: 409 });
    }

    // Create the label with provided color or random if not provided
    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || generateRandomColor(),
        projectId: projectId
      }
    });

    return NextResponse.json(label);
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}