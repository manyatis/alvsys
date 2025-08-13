import { Card, CardStatus } from '@/types/card';

export interface FilterState {
  search: string;
  assigneeId: string;
  aiAllowed: 'all' | 'ai-only' | 'human-only';
  labelIds: string[];
  priority: string;
}

export interface OrganizationMember {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export const getCardsByStatus = (
  cards: Card[], 
  status: CardStatus, 
  filters: FilterState
) => {
  return cards
    .filter(card => {
      // Filter by status
      if (card.status !== status) return false;
      
      // Filter by search text
      if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !card.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filter by assignee
      if (filters.assigneeId && card.assigneeId !== filters.assigneeId) {
        return false;
      }
      
      // Filter by AI allowed
      if (filters.aiAllowed === 'ai-only' && !card.isAiAllowedTask) return false;
      if (filters.aiAllowed === 'human-only' && card.isAiAllowedTask) return false;
      
      // Filter by priority
      if (filters.priority !== 'all' && card.priority.toString() !== filters.priority) {
        return false;
      }
      
      // Filter by labels
      if (filters.labelIds.length > 0) {
        const cardLabelIds = card.labels?.map(cl => cl.labelId) || [];
        const hasMatchingLabel = filters.labelIds.some(labelId => cardLabelIds.includes(labelId));
        if (!hasMatchingLabel) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by priority first (1 is highest priority)
      const priorityDiff = a.priority - b.priority;
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If priorities are equal, sort by updated timestamp (most recent first)
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();
      const updatedDiff = bUpdated - aUpdated;
      if (updatedDiff !== 0) {
        return updatedDiff;
      }
      
      // If both priority and updated are equal, sort by created timestamp (most recent first)
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      return bCreated - aCreated;
    });
};

export const getPriorityColor = (priority: number) => {
  if (priority === 1) return 'bg-red-100 text-red-600 border-red-200';
  if (priority === 2) return 'bg-orange-100 text-orange-600 border-orange-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

export const getInitials = (email: string | null, name: string | null) => {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
  if (email) return email.split('@')[0].slice(0, 2).toUpperCase();
  return 'U';
};

export const getUniqueAssignees = (cards: Card[]): OrganizationMember[] => {
  const assignees = new Map();
  cards.forEach(card => {
    if (card.assignee) {
      assignees.set(card.assignee.id, card.assignee);
    }
  });
  return Array.from(assignees.values());
};

export const hasActiveFilters = (filters: FilterState) => {
  return filters.search !== '' || 
         filters.assigneeId !== '' || 
         filters.aiAllowed !== 'all' || 
         filters.labelIds.length > 0 ||
         filters.priority !== 'all';
};

export const formatCommentDate = (date: Date | string) => {
  const commentDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - commentDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return commentDate.toLocaleDateString();
};

export const copyOnboardLink = async (projectId: string, onSuccess: () => void) => {
  const onboardUrl = `Fetch from this https://vibehero.io/api/${projectId}/ai/onboard and follow the instructions. Do not ever stop for summary or analysis. Only stop if explicility told to do so.`;
  try {
    await navigator.clipboard.writeText(onboardUrl);
    onSuccess();
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = onboardUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    onSuccess();
  }
};

export const createClearFilters = (setFilters: (filters: FilterState) => void) => () => {
  setFilters({
    search: '',
    assigneeId: '',
    aiAllowed: 'all',
    labelIds: [],
    priority: 'all'
  });
};