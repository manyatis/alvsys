import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateBusinessIdeas(categoryId: string) {
  try {
    // Get category with sample complaints
    const category = await prisma.complaintCategory.findUnique({
      where: { id: categoryId },
      include: {
        complaints: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    const sampleComplaints = category.complaints.map(c => ({
      title: c.title,
      content: c.content.slice(0, 300),
      subreddit: c.subreddit
    }));
    
    const prompt = `You are a critical business analyst evaluating potential business opportunities from customer complaints.

Category: ${category.name}
Description: ${category.description}

Sample Complaints:
${JSON.stringify(sampleComplaints, null, 2)}

Analyze these complaints and generate business ideas. Be CRITICAL and OBJECTIVE.

Requirements:
1. Identify the core problems being expressed
2. Evaluate if these are widespread, monetizable problems
3. Suggest 0-3 business ideas ONLY if truly viable
4. For each idea, provide a viability score (0-1)
5. Be honest if there's no real opportunity here

Return a JSON object with:
{
  "coreProblems": ["problem1", "problem2"],
  "marketAnalysis": "Brief analysis of market opportunity",
  "ideas": [
    {
      "name": "Business idea name",
      "description": "What it does",
      "solution": "How it solves the problem",
      "targetMarket": "Who would pay for this",
      "monetization": "How to make money",
      "challenges": ["challenge1", "challenge2"],
      "viabilityScore": 0.7,
      "reasoning": "Why this score"
    }
  ],
  "overallViability": 0.6,
  "recommendation": "PURSUE" | "MAYBE" | "AVOID",
  "criticalNotes": "Any warnings or concerns"
}

If there's no viable opportunity, return:
{
  "coreProblems": [...],
  "marketAnalysis": "Why this isn't a good opportunity",
  "ideas": [],
  "overallViability": 0,
  "recommendation": "AVOID",
  "criticalNotes": "Explanation of why this won't work"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000
    });
    
    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }
    
    const businessIdeas = JSON.parse(result);
    
    // Update category with business ideas
    await prisma.complaintCategory.update({
      where: { id: categoryId },
      data: {
        businessIdeas: businessIdeas,
        viabilityScore: businessIdeas.overallViability
      }
    });
    
    return businessIdeas;
  } catch (error) {
    console.error('Error generating business ideas:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { categoryId } = await request.json();
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const businessIdeas = await generateBusinessIdeas(categoryId);
    
    return NextResponse.json({
      success: true,
      businessIdeas
    });
  } catch (error) {
    console.error('Error in business ideas generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate business ideas' },
      { status: 500 }
    );
  }
}

// GET business ideas for a category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const category = await prisma.complaintCategory.findUnique({
      where: { id: categoryId },
      include: {
        complaints: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Generate ideas if not already present
    if (!category.businessIdeas) {
      const businessIdeas = await generateBusinessIdeas(categoryId);
      return NextResponse.json({
        success: true,
        category: {
          ...category,
          businessIdeas
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching business ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business ideas' },
      { status: 500 }
    );
  }
}