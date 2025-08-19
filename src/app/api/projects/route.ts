import { NextResponse, NextRequest } from 'next/server';
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth';
import { ProjectsAPI } from '@/lib/api/projects';
import { handleApiError } from '@/lib/api/errors';

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const result = await ProjectsAPI.getProjects({ userId: user.id });
    return NextResponse.json(result);
  } catch (error: any) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}

// POST /api/projects - Create new project (and optionally organization)
export async function POST(request: NextRequest) {
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = await ProjectsAPI.createProject({
      userId: user.id,
      ...body
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}