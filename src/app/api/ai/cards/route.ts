import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { CardService } from '@/services/card-service'
import { CardStatus } from '@/types/card'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// POST /api/ai/cards - AI endpoint to get available cards for processing
export async function POST(request: NextRequest) {
  try {
    // TODO: Add AI agent authentication here
    const body = await request.json()
    const { action, cardId, status, projectId } = body

    switch (action) {
      case 'get_ready_cards':
        const readyCards = await CardService.getAiReadyCards(projectId)
        
        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            activity: 'get_ready_cards',
            endpoint: '/api/ai/cards',
            payload: { projectId },
            response: { count: readyCards.length },
          },
        })

        return NextResponse.json({
          cards: readyCards.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description,
            acceptanceCriteria: card.acceptanceCriteria,
            status: card.status,
            projectId: card.projectId,
            agentInstructions: card.agentDeveloperInstructions,
            project: card.project,
          })),
        })

      case 'update_status':
        if (!cardId || !status) {
          return NextResponse.json(
            { error: 'cardId and status are required for update_status' },
            { status: 400 }
          )
        }

        const updatedCard = await CardService.updateCardStatus(cardId, status as CardStatus)
        
        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            activity: 'update_card_status',
            endpoint: '/api/ai/cards',
            payload: { cardId, status },
            response: { cardId: updatedCard.id, newStatus: updatedCard.status },
          },
        })

        return NextResponse.json({
          message: 'Card status updated successfully',
          card: {
            id: updatedCard.id,
            status: updatedCard.status,
            title: updatedCard.title,
          },
        })

      case 'get_card_details':
        if (!cardId) {
          return NextResponse.json(
            { error: 'cardId is required for get_card_details' },
            { status: 400 }
          )
        }

        const card = await CardService.getCardById(cardId)
        if (!card) {
          return NextResponse.json({ error: 'Card not found' }, { status: 404 })
        }

        // Log AI activity
        await prisma.aIWorkLog.create({
          data: {
            activity: 'get_card_details',
            endpoint: '/api/ai/cards',
            payload: { cardId },
            response: { cardId: card.id, title: card.title },
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
            agentInstructions: card.agentDeveloperInstructions,
            project: card.project,
            createdBy: card.createdBy,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          },
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: get_ready_cards, update_status, get_card_details' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI cards endpoint:', error)
    
    // Log AI error
    await prisma.aIWorkLog.create({
      data: {
        activity: 'error',
        endpoint: '/api/ai/cards',
        payload: await request.json().catch(() => ({})),
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/ai/cards - Get AI-ready cards (alternative endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const readyCards = await CardService.getAiReadyCards(projectId || undefined)
    
    // Log AI activity
    await prisma.aIWorkLog.create({
      data: {
        activity: 'get_ready_cards_via_get',
        endpoint: '/api/ai/cards',
        payload: { projectId },
        response: { count: readyCards.length },
      },
    })

    return NextResponse.json({
      cards: readyCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        acceptanceCriteria: card.acceptanceCriteria,
        status: card.status,
        projectId: card.projectId,
        agentInstructions: card.agentDeveloperInstructions,
        project: card.project,
        branchName: card.agentDeveloperInstructions.find(i => i.type === 'GIT')?.branchName || 
                   CardService.generateBranchName(card.title, card.id),
      })),
    })
  } catch (error) {
    console.error('Error in AI cards GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}