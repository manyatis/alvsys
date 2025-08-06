export enum CardStatus {
  REFINEMENT = 'REFINEMENT',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  COMPLETED = 'COMPLETED',
}

export enum AgentInstructionType {
  GIT = 'GIT',
  SPIKE = 'SPIKE',
  CODING = 'CODING',
  ARCHITECTURE = 'ARCHITECTURE',
}

export interface AgentDeveloperInstruction {
  id: string
  cardId: string
  type: AgentInstructionType
  
  // Git Instructions
  branchName?: string
  createNewBranch: boolean
  
  // Spike/Research Instructions
  webResearchPrompt?: string
  codeResearchPrompt?: string
  architecturePrompt?: string
  
  // General Instructions
  instructions?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  cardId: string
  content: string
  authorId?: string
  author?: {
    id: string
    name?: string
    email?: string
    image?: string
  }
  isAiComment: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Card {
  id: string
  status: CardStatus
  projectId: string
  createdById: string
  title: string
  description?: string
  acceptanceCriteria?: string
  priority: number
  isAiAllowedTask: boolean
  agentDeveloperInstructions: AgentDeveloperInstruction[]
  comments?: Comment[]
  createdAt: Date
  updatedAt: Date
  
  // Relations
  createdBy?: {
    id: string
    name?: string
    email?: string
  }
  project?: {
    id: string
    name: string
  }
}

export interface CreateCardRequest {
  title: string
  description?: string
  acceptanceCriteria?: string
  projectId: string
  isAiAllowedTask?: boolean
  agentInstructions?: CreateAgentInstructionRequest[]
}

export interface CreateAgentInstructionRequest {
  type: AgentInstructionType
  branchName?: string
  createNewBranch?: boolean
  webResearchPrompt?: string
  codeResearchPrompt?: string
  architecturePrompt?: string
  instructions?: string
}

export interface UpdateCardRequest {
  title?: string
  description?: string
  acceptanceCriteria?: string
  status?: CardStatus
  priority?: number
  isAiAllowedTask?: boolean
  agentInstructions?: CreateAgentInstructionRequest[]
}