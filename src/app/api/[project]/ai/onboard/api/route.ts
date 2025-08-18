import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '../../../../../../lib/ai-service';
import { generateApiOnboarding } from '../../../../../../lib/ai/onboarding';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  const resolvedParams = await params;
  const projectId = resolvedParams.project;

  try {
    const project = await AIService.getProjectById(projectId);
    
    const onboardingInstructions = generateApiOnboarding({
      projectId: project.id,
      apiToken: process.env.VIBE_HERO_API_TOKEN
    });

    return new NextResponse(onboardingInstructions, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error in API onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}