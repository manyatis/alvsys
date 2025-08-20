import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Check if user is authenticated
  if (!token?.email) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { 
      id: true, 
      email: true, 
      organizationId: true,
      organization: {
        select: { id: true }
      }
    }
  })

  if (!user) {
    // User doesn't exist in database, redirect to home
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Handle route-specific validation
  const pathname = request.nextUrl.pathname
  
  // For account pages, just ensure user exists (already checked above)
  if (pathname.startsWith('/account')) {
    // User is authenticated and exists, allow access
  }
  
  // For project pages, check project access
  else if (pathname.startsWith('/projects')) {
    const projectMatch = pathname.match(/^\/projects\/([^\/]+)/)
    
    if (projectMatch) {
      const projectId = projectMatch[1]
      
      // Check if user has access to this project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } },
            // Allow access if project belongs to user's organization
            { organizationId: user.organizationId }
          ]
        }
      })

      if (!project) {
        // User doesn't have access to this project, redirect to projects list
        const projectsUrl = new URL('/projects', request.url)
        return NextResponse.redirect(projectsUrl)
      }
    }
  }

  // Add user info to headers for downstream consumption
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-email', user.email)
  if (user.organizationId) {
    response.headers.set('x-user-org-id', user.organizationId)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Only protect specific routes that require authentication and authorization:
     * - /projects/* (requires project access validation)
     * - /account/* (requires user authentication)
     */
    '/projects/:path*',
    '/account/:path*',
  ],
}