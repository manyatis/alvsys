import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CardService } from '@/services/card-service'
import { CardStatus } from '@/types/card'
import { validateApiKeyForProject, createApiErrorResponse } from '@/lib/api-auth'
import { UsageService } from '@/services/usage-service'

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
        const readyCards = await CardService.getAiReadyCards(projectId)
        
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

        // Verify card belongs to the specified project for privacy
        const cardToUpdate = await prisma.card.findFirst({
          where: { id: cardId, projectId }
        })
        if (!cardToUpdate) {
          return NextResponse.json(
            { error: 'Card not found in specified project' },
            { status: 404 }
          )
        }

        const updatedCard = await CardService.updateCardStatus(cardId, status as CardStatus)
        
        // Add comment if provided
        if (comment) {
          await prisma.comment.create({
            data: {
              cardId,
              content: comment,
              authorId: user.id,
              isAiComment: true,
            },
          })
        }
        
        // Increment usage when AI completes tasks (READY_FOR_REVIEW or COMPLETED)
        if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
          await UsageService.incrementCardUsage(user.id)
        }
        
        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            cardId: cardId,
            userId: user.id,
            action: 'update_card_status',
            details: { status, comment, previousStatus: cardToUpdate.status },
            apiEndpoint: '/api/ai/issues'
          },
        })

        // Check if the card was moved to READY_FOR_REVIEW or COMPLETED, then fetch next task
        let autoNextCard = null
        if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
          autoNextCard = await prisma.card.findFirst({
            where: {
              projectId,
              status: 'READY',
              isAiAllowedTask: true,
            },
            orderBy: [
              { priority: 'asc' },
              { createdAt: 'asc' },
            ],
            include: {
              project: true,
              agentInstructions: true,
              assignee: true,
            },
          })

          // Log the next card fetch activity
          if (autoNextCard) {
            await prisma.aIWorkLog.create({
              data: {
                cardId: autoNextCard.id,
                userId: user.id,
                action: 'auto_fetch_next_ready_card',
                details: { afterCardId: cardId, projectId, nextCardTitle: autoNextCard.title },
                apiEndpoint: '/api/ai/issues'
              },
            })
          }
        }

        const response: {
          message: string;
          card: {
            id: string;
            status: string;
            title: string;
          };
          instruction?: string;
          nextCard?: {
            id: string;
            title: string;
            description: string | null;
            acceptanceCriteria: string | null;
            status: string;
            priority: number;
            projectId: string;
            isAiAllowedTask: boolean;
            agentInstructions: unknown[];
            project: unknown;
            assignee: unknown;
            createdAt: Date;
            updatedAt: Date;
          };
        } = {
          message: 'Card status updated successfully',
          card: {
            id: updatedCard.id,
            status: updatedCard.status,
            title: updatedCard.title,
          },
        }

        // Include next card in response if found
        if (autoNextCard) {
          response.nextCard = {
            id: autoNextCard.id,
            title: autoNextCard.title,
            description: autoNextCard.description,
            acceptanceCriteria: autoNextCard.acceptanceCriteria,
            status: autoNextCard.status,
            priority: autoNextCard.priority,
            projectId: autoNextCard.projectId,
            isAiAllowedTask: autoNextCard.isAiAllowedTask,
            agentInstructions: autoNextCard.agentInstructions,
            project: autoNextCard.project,
            assignee: autoNextCard.assignee,
            createdAt: autoNextCard.createdAt,
            updatedAt: autoNextCard.updatedAt,
          }
        } else if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
          response.message = 'Card status updated successfully. No more ready tasks available. Continue polling for new tasks every 1 minute.'
          ;(response as {instruction?: string}).instruction = 'Wait 60 seconds, then call next_ready API again. Do not stop - keep checking for new work.'
        }

        return NextResponse.json(response)

      case 'get_card_details':
        if (!cardId || !projectId) {
          return NextResponse.json(
            { error: 'cardId and projectId are required for get_card_details' },
            { status: 400 }
          )
        }

        // Verify card belongs to the specified project for privacy
        const card = await prisma.card.findFirst({
          where: { id: cardId, projectId },
          include: {
            project: true,
            agentInstructions: true,
            assignee: true,
          }
        })
        if (!card) {
          return NextResponse.json({ error: 'Card not found in specified project' }, { status: 404 })
        }

        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            cardId: cardId,
            userId: user.id,
            action: 'get_card_details',
            details: { title: card.title },
            apiEndpoint: '/api/ai/issues'
          },
        })

        return NextResponse.json({
          card: {
            id: card.id,
            title: card.title,
            description: card.description,
            acceptanceCriteria: card.acceptanceCriteria,
            status: card.status,
            projectId: card.projectId,
            isAiAllowedTask: card.isAiAllowedTask,
            agentInstructions: card.agentInstructions,
            project: card.project,
            assignee: card.assignee,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          },
        })

      case 'next_ready':
        if (!projectId) {
          return NextResponse.json(
            { error: 'projectId is required for next_ready' },
            { status: 400 }
          )
        }

        // Get the highest priority READY card that is AI-allowed
        const nextCard = await prisma.card.findFirst({
          where: {
            projectId,
            status: 'READY',
            isAiAllowedTask: true,
          },
          orderBy: [
            { priority: 'asc' },
            { createdAt: 'asc' },
          ],
          include: {
            project: true,
            agentInstructions: true,
            assignee: true,
          },
        })

        if (!nextCard) {
          return NextResponse.json({
            message: 'No ready tasks available. Continue polling for new tasks every 1 minute. Do not stop - keep checking for new work.',
            card: null,
            instruction: 'Wait 60 seconds, then call next_ready API again. Repeat indefinitely until tasks become available.'
          })
        }

        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            cardId: nextCard.id,
            userId: user.id,
            action: 'get_next_ready_card',
            details: { projectId, title: nextCard.title },
            apiEndpoint: '/api/ai/issues'
          },
        })

        return NextResponse.json({
          card: {
            id: nextCard.id,
            title: nextCard.title,
            description: nextCard.description,
            acceptanceCriteria: nextCard.acceptanceCriteria,
            status: nextCard.status,
            priority: nextCard.priority,
            projectId: nextCard.projectId,
            isAiAllowedTask: nextCard.isAiAllowedTask,
            agentInstructions: nextCard.agentInstructions,
            project: nextCard.project,
            assignee: nextCard.assignee,
            createdAt: nextCard.createdAt,
            updatedAt: nextCard.updatedAt,
          },
        })

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

    const readyCards = await CardService.getAiReadyCards(projectId)
    
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