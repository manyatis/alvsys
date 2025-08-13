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

export interface AgentInstruction {
  id: string
  cardId: string
  instructionType: AgentInstructionType
  
  // Git Instructions
  branchName?: string
  createBranch: boolean
  
  // Spike/Research Instructions
  webResearchPrompt?: string
  codeResearchPrompt?: string
  architectureGuidelines?: string
  
  // General Instructions
  generalInstructions?: string
  
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

export interface Label {
  id: string
  name: string
  color: string
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export interface CardLabel {
  id: string
  cardId: string
  labelId: string
  label: Label
}

export interface Card {
  id: string
  status: CardStatus
  projectId: string
  // createdById: string - removed as not in schema
  assigneeId?: string
  sprintId?: string
  title: string
  description?: string
  acceptanceCriteria?: string
  priority: number
  storyPoints?: number
  isAiAllowedTask: boolean
  agentInstructions: AgentInstruction[]
  comments?: Comment[]
  labels?: CardLabel[]
  createdAt: Date
  updatedAt: Date
  
  // Relations
  // createdBy removed - not in schema
  /*createdBy?: {
    id: string
    name?: string
    email?: string
  }*/
  assignee?: {
    id: string
    name?: string
    email?: string
  }
  project?: {
    id: string
    name: string
  }
  sprint?: {
    id: string
    name: string
    isActive: boolean
  }
}

export interface CreateCardRequest {
  title: string
  description?: string
  acceptanceCriteria?: string
  projectId: string
  assigneeId?: string
  priority?: number
  storyPoints?: number
  isAiAllowedTask?: boolean
  agentInstructions?: CreateAgentInstructionRequest[]
}

export interface CreateAgentInstructionRequest {
  instructionType: AgentInstructionType
  branchName?: string
  createBranch?: boolean
  webResearchPrompt?: string
  codeResearchPrompt?: string
  architectureGuidelines?: string
  generalInstructions?: string
}

export interface UpdateCardRequest {
  title?: string
  description?: string
  acceptanceCriteria?: string
  status?: CardStatus
  priority?: number
  storyPoints?: number
  assigneeId?: string
  sprintId?: string
  isAiAllowedTask?: boolean
  agentInstructions?: CreateAgentInstructionRequest[]
}