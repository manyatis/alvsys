import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProjectsAPI } from '@/lib/api/projects';
import { handleApiError } from '@/lib/api/errors';

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
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

    const result = await ProjectsAPI.getProjects({ userId: user.id });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}

// POST /api/projects - Create new project (and optionally organization)
export async function POST(request: NextRequest) {
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
    const result = await ProjectsAPI.createProject({
      userId: user.id,
      ...body
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const { data, status } = handleApiError(error);
    return NextResponse.json(data, { status });
  }
}