import { NextRequest, NextResponse } from 'next/server';
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth';
import { ProjectsAPI } from '@/lib/api/projects';
import { handleApiError } from '@/lib/api/errors';

// GET /api/projects/[id] - Get specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const project = await ProjectsAPI.getProjectById(resolvedParams.id, user.id);
    return NextResponse.json({ project });
  } catch (error: any) {
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
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const project = await ProjectsAPI.updateProject(resolvedParams.id, user.id, body);
    return NextResponse.json({ project });
  } catch (error: any) {
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
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    await ProjectsAPI.deleteProject(resolvedParams.id, user.id);
    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error: any) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}