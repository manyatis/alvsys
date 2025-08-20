import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProjectsAPI } from '@/lib/api/projects';
import { handleApiError } from '@/lib/api/errors';

// GET /api/projects/[id] - Get specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session (type assertion needed since we extended the session)
    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }
    
    const user = { id: userId, email: session.user.email };

    const project = await ProjectsAPI.getProjectById(resolvedParams.id, user.id);
    return NextResponse.json({ project });
  } catch (error: unknown) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session (type assertion needed since we extended the session)
    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }
    
    const user = { id: userId, email: session.user.email };

    const body = await request.json();
    const project = await ProjectsAPI.updateProject(resolvedParams.id, user.id, body);
    return NextResponse.json({ project });
  } catch (error: unknown) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session (type assertion needed since we extended the session)
    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }
    
    const user = { id: userId, email: session.user.email };

    await ProjectsAPI.deleteProject(resolvedParams.id, user.id);
    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}