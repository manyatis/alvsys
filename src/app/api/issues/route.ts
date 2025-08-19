import { NextRequest, NextResponse } from 'next/server'
import { validateHybridAuthForProject, createApiErrorResponse } from '@/lib/api-auth'
import { IssuesAPI } from '@/lib/api/issues'
import { handleApiError } from '@/lib/api/errors'

// GET /api/issues - Get all issues for a project with optional status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate authentication (API key or session)
    const user = await validateHybridAuthForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    const issues = await IssuesAPI.getIssues({
      projectId,
      userId: user.id,
      status: searchParams.get('status') || undefined,
      sprintId: searchParams.get('sprintId') || undefined,
      activeSprint: searchParams.get('activeSprint') === 'true',
    })

    return NextResponse.json(issues)
  } catch (error) {
    const { data, status } = handleApiError(error)
    return NextResponse.json(data, { status })
  }
}

// POST /api/issues - Create a new issue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate authentication (API key or session)
    const user = await validateHybridAuthForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    const issue = await IssuesAPI.createIssue({
      userId: user.id,
      ...body,
    })

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    const { data, status } = handleApiError(error)
    return NextResponse.json(data, { status })
  }
}