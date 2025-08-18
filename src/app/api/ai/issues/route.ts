import { NextRequest, NextResponse } from 'next/server'
import { CardService } from '@/services/card-service'
import { CardStatus } from '@/types/card'
import { validateApiKeyForProject, createApiErrorResponse } from '@/lib/api-auth'
import { AIService } from '@/lib/ai-service'

// POST /api/ai/issues - AI endpoint to get available issues for processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, cardId, status, projectId, comment } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Validate API key and project access
    const user = await validateApiKeyForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Invalid API key or insufficient permissions', 401)
    }

    switch (action) {
      case 'get_ready_cards':
        const readyCards = await AIService.getReadyCards(projectId)
        
        // Log AI activity
        // TODO: Fix AIWorkLog usage - requires cardId and userId
        // await prisma.aIWorkLog.create({
        //   data: {
        //     cardId: '', // Need a specific card ID
        //     userId: user.id,
        //     action: 'get_ready_cards',
        //     details: { projectId, count: readyCards.length },
        //     apiEndpoint: '/api/ai/issues'
        //   },
        // })

        return NextResponse.json({
          cards: readyCards.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description,
            acceptanceCriteria: card.acceptanceCriteria,
            status: card.status,
            projectId: card.projectId,
            agentInstructions: card.agentInstructions,
            project: card.project,
          })),
        })

      case 'update_status':
        if (!cardId || !status || !projectId) {
          return NextResponse.json(
            { error: 'cardId, status, and projectId are required for update_status' },
            { status: 400 }
          )
        }

        try {
          const result = await AIService.updateCardStatus(
            cardId, 
            status as CardStatus, 
            projectId, 
            comment,
            user.id
          )
          
          // Log AI activity
          await AIService.logAIActivity(
            cardId,
            user.id,
            'update_card_status',
            { status, comment },
            '/api/ai/issues'
          )

          // Log auto fetch activity if next card exists
          if (result.nextCard) {
            await AIService.logAIActivity(
              result.nextCard.id,
              user.id,
              'auto_fetch_next_ready_card',
              { afterCardId: cardId, projectId, nextCardTitle: result.nextCard.title },
              '/api/ai/issues'
            )
          }

          return NextResponse.json(result)
        } catch (error) {
          if (error instanceof Error && error.message === 'Card not found in specified project') {
            return NextResponse.json({ error: error.message }, { status: 404 })
          }
          throw error
        }

      case 'get_card_details':
        if (!cardId || !projectId) {
          return NextResponse.json(
            { error: 'cardId and projectId are required for get_card_details' },
            { status: 400 }
          )
        }

        try {
          const result = await AIService.getCardDetails(cardId, projectId)

          // Log AI activity
          await AIService.logAIActivity(
            cardId,
            user.id,
            'get_card_details',
            { title: result.card.title },
            '/api/ai/issues'
          )

          return NextResponse.json(result)
        } catch (error) {
          if (error instanceof Error && error.message === 'Card not found in specified project') {
            return NextResponse.json({ error: error.message }, { status: 404 })
          }
          throw error
        }

      case 'next_ready':
        if (!projectId) {
          return NextResponse.json(
            { error: 'projectId is required for next_ready' },
            { status: 400 }
          )
        }

        const result = await AIService.getNextReadyCard(projectId)

        // Log AI activity if card found
        if (result.card) {
          await AIService.logAIActivity(
            result.card.id,
            user.id,
            'get_next_ready_card',
            { projectId, title: result.card.title },
            '/api/ai/issues'
          )
        }

        return NextResponse.json(result)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: get_ready_cards, update_status, get_card_details, next_ready' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI issues endpoint:', error)
    
    // Log AI error
    // TODO: Fix AIWorkLog usage - requires cardId
    // await prisma.aIWorkLog.create({
    //   data: {
    //     cardId: '', // Need a specific card ID
    //     userId: '', // Need user ID from auth
    //     action: 'error',
    //     details: { error: error instanceof Error ? error.message : 'Unknown error' },
    //     apiEndpoint: '/api/ai/issues'
    //   },
    // })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/ai/issues - Get AI-ready issues (alternative endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      )
    }

    // Validate API key and project access
    const user = await validateApiKeyForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Invalid API key or insufficient permissions', 401)
    }

    const readyCards = await AIService.getReadyCards(projectId)
    
    // Log AI activity
    // TODO: Fix AIWorkLog usage - requires cardId and userId
    // await prisma.aIWorkLog.create({
    //   data: {
    //     cardId: '', // Need a specific card ID
    //     userId: user.id,
    //     action: 'get_ready_cards_via_get',
    //     details: { projectId, count: readyCards.length },
    //     apiEndpoint: '/api/ai/issues'
    //   },
    // })

    return NextResponse.json({
      cards: readyCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        acceptanceCriteria: card.acceptanceCriteria,
        status: card.status,
        projectId: card.projectId,
        agentInstructions: card.agentInstructions,
        project: card.project,
        branchName: card.agentInstructions.find(i => i.instructionType === 'GIT')?.branchName || 
                   CardService.generateBranchName(card.title, card.id),
      })),
    })
  } catch (error) {
    console.error('Error in AI issues GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}