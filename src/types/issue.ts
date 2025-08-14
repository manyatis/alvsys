export enum IssueStatus {
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
  issueId: string
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
  issueId: string
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

export interface IssueLabel {
  id: string
  issueId: string
  labelId: string
  label: Label
}

export interface Issue {
  id: string
  status: IssueStatus
  projectId: string
  createdById: string
  assigneeId?: string
  title: string
  description?: string
  acceptanceCriteria?: string
  priority: number
  isAiAllowedTask: boolean
  agentDeveloperInstructions: AgentDeveloperInstruction[]
  comments?: Comment[]
  labels?: IssueLabel[]
  createdAt: Date
  updatedAt: Date
  
  // Relations
  createdBy?: {
    id: string
    name?: string
    email?: string
  }
  assignee?: {
    id: string
    name?: string
    email?: string
  }
  project?: {
    id: string
    name: string
  }
}

export interface CreateIssueRequest {
  title: string
  description?: string
  acceptanceCriteria?: string
  projectId: string
  assigneeId?: string
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

export interface UpdateIssueRequest {
  title?: string
  description?: string
  acceptanceCriteria?: string
  status?: IssueStatus
  priority?: number
  assigneeId?: string
  isAiAllowedTask?: boolean
  agentInstructions?: CreateAgentInstructionRequest[]
}

// Legacy type aliases for backward compatibility during migration
export type CardStatus = IssueStatus;
export type Card = Issue;
export type CardLabel = IssueLabel;
export type CreateCardRequest = CreateIssueRequest;
export type UpdateCardRequest = UpdateIssueRequest;

// Export the CardStatus enum for backward compatibility
export const CardStatus = IssueStatus;