'use client';

import { useState, useEffect } from 'react';
import { getOrganizationMembers } from '@/lib/organization-functions';
import { 
  getProjectIssues, 
  createIssue, 
  updateIssueWithAgentInstructions,
  addLabelToIssue,
  removeLabelFromIssue,
  getIssueComments,
  createIssueComment
} from '@/lib/issue-functions';
import { getProjectById } from '@/lib/project-functions';
import { getProjectSprints, createSprint } from '@/lib/sprint-functions';
import { getProjectLabels, createLabel as createLabelAction } from '@/lib/label-functions';
import { syncProject } from '@/lib/github-functions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Comment, Label, CardStatus } from '@/types/card';
import { OrganizationMember } from '@/utils/board-utils';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  } | null;
  githubSyncEnabled?: boolean;
}

interface NewCard {
  title: string;
  description: string;
  acceptanceCriteria: string;
  status: CardStatus;
  priority: number;
  effortPoints: number;
  isAiAllowedTask: boolean;
  assigneeId: string | null;
  labelIds: string[];
  sprintId: string | null;
}

export function useBoardData(projectId: string, showOnlyActiveSprint: boolean = true, selectedSprintId: string | null = null) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const projectResult = await getProjectById(projectId);
        if (projectResult.success && projectResult.project) {
          setProject(projectResult.project);
          
          // If project has GitHub sync enabled, perform background sync
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((projectResult.project as any).githubSyncEnabled && (session?.user as any)?.id) {
            // Start sync in background - don't block the initial load
            setIsSyncing(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            syncProject(projectId, (session!.user as any).id).then(async (syncResult) => {
              if (syncResult.success) {
                console.log('Background GitHub sync completed successfully');
                // Refresh cards after sync
                // Only filter by active sprint if there actually is an active sprint
                const issuesResult = await getProjectIssues(projectId);
                if (issuesResult.success && issuesResult.issues) {
                  let filteredCards = issuesResult.issues;
                  if (selectedSprintId) {
                    filteredCards = filteredCards.filter(card => card.sprint?.id === selectedSprintId);
                  } else if (showOnlyActiveSprint) {
                    // Check if there's an active sprint before filtering
                    const sprintsResult = await getProjectSprints(projectId);
                    if (sprintsResult.success && sprintsResult.sprints) {
                      const sprints = sprintsResult.sprints;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const activeSprint = sprints.find((s: any) => s.isActive);
                      if (activeSprint) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        filteredCards = filteredCards.filter(card => (card.sprint as any)?.isActive);
                      }
                    }
                  }
                  
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setCards(filteredCards as any);
                  console.log('Cards refreshed after GitHub sync');
                }
              } else {
                console.warn('Background GitHub sync failed:', syncResult.error);
              }
              setIsSyncing(false);
            }).catch(syncError => {
              console.warn('Background GitHub sync error:', syncError);
              setIsSyncing(false);
            });
          }
          
          // Fetch organization members
          if (projectResult.project.organization) {
            const membersResult = await getOrganizationMembers(projectResult.project.organization.id);
            if (membersResult.success && membersResult.members) {
              setOrganizationMembers(membersResult.members);
              
              // Find current user ID
              if (session?.user?.email) {
                const currentUser = membersResult.members.find((member: OrganizationMember) => 
                  member.email === session.user!.email
                );
                if (currentUser) {
                  setCurrentUserId(currentUser.id);
                } else {
                  console.warn('Current user not found in organization members:', {
                    sessionEmail: session.user.email,
                    memberEmails: membersResult.members?.map((m: OrganizationMember) => m.email)
                  });
                }
              }
            }
          }
        }

        // Fetch cards
        const issuesResult = await getProjectIssues(projectId);
        let filteredCards: Card[] = [];
        if (issuesResult.success && issuesResult.issues) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredCards = issuesResult.issues as any;
          if (selectedSprintId) {
            filteredCards = filteredCards.filter(card => card.sprint?.id === selectedSprintId);
          } else if (showOnlyActiveSprint) {
            // Check if there's an active sprint before filtering
            const sprintsResult = await getProjectSprints(projectId);
            if (sprintsResult.success && sprintsResult.sprints) {
              const sprints = sprintsResult.sprints;
              const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
              if (activeSprint) {
                filteredCards = filteredCards.filter(card => card.sprint?.isActive);
              }
              // If no active sprint, show all cards
            }
          }
        }
        setCards(filteredCards);

        // Fetch labels
        const labelsResult = await getProjectLabels(projectId);
        if (labelsResult.success && labelsResult.labels) {
          setLabels(labelsResult.labels);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && projectId) {
      loadData();
    }
  }, [status, projectId, router, session, showOnlyActiveSprint, selectedSprintId]);

  // Polling for real-time updates with connection management
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let isComponentMounted = true;

    const refreshData = async () => {
      if (!isComponentMounted) return;
      
      setIsRefreshing(true);
      try {
        // Use AbortController to cancel requests if component unmounts
        const controller = new AbortController();
        
        // Fetch cards
        const issuesResult = await getProjectIssues(projectId);
        let filteredCards: Card[] = [];
        if (issuesResult.success && issuesResult.issues) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredCards = issuesResult.issues as any;
          if (selectedSprintId) {
            filteredCards = filteredCards.filter(card => card.sprint?.id === selectedSprintId);
          } else if (showOnlyActiveSprint) {
            // Check if there's an active sprint before filtering
            const sprintsResult = await getProjectSprints(projectId);
            if (sprintsResult.success && sprintsResult.sprints && isComponentMounted) {
              const sprints = sprintsResult.sprints;
              const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
              if (activeSprint) {
                filteredCards = filteredCards.filter(card => card.sprint?.isActive);
              }
              // If no active sprint, show all cards
            }
          }
        }
        if (isComponentMounted) {
          setCards(filteredCards);
        }

        // Fetch labels
        const labelsResult = await getProjectLabels(projectId);
        if (labelsResult.success && labelsResult.labels && isComponentMounted) {
          setLabels(labelsResult.labels);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error refreshing board data:', error);
        }
      } finally {
        if (isComponentMounted) {
          setIsRefreshing(false);
        }
      }
    };

    if (status === 'authenticated' && projectId) {
      // Increase polling interval to reduce connection pressure
      pollInterval = setInterval(refreshData, 30000); // Changed from 20s to 30s
    }

    return () => {
      isComponentMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [status, projectId, showOnlyActiveSprint, selectedSprintId]);

  const refreshCards = async () => {
    try {
      const issuesResult = await getProjectIssues(projectId);
      let filteredCards: Card[] = [];
      if (issuesResult.success && issuesResult.issues) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredCards = issuesResult.issues as any;
        if (selectedSprintId) {
          filteredCards = filteredCards.filter(card => card.sprint?.id === selectedSprintId);
        } else if (showOnlyActiveSprint) {
          // Check if there's an active sprint before filtering
          const sprintsResult = await getProjectSprints(projectId);
          if (sprintsResult.success && sprintsResult.sprints) {
            const sprints = sprintsResult.sprints;
            const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
            if (activeSprint) {
              filteredCards = filteredCards.filter(card => card.sprint?.isActive);
            }
            // If no active sprint, show all cards
          }
        }
      }
      setCards(filteredCards);
    } catch (error) {
      console.error('Error refreshing cards:', error);
    }
  };

  return {
    project,
    cards,
    loading,
    labels,
    setLabels,
    organizationMembers,
    currentUserId,
    isRefreshing,
    isSyncing,
    refreshCards,
  };
}

export function useCardOperations(projectId: string, refreshCards: () => Promise<void>) {
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const createCard = async (newCard: NewCard) => {
    setIsCreatingIssue(true);
    try {
      const result = await createIssue({
        title: newCard.title,
        description: newCard.description,
        acceptanceCriteria: newCard.acceptanceCriteria,
        status: newCard.status,
        priority: newCard.priority,
        storyPoints: newCard.effortPoints,
        isAiAllowedTask: newCard.isAiAllowedTask,
        sprintId: newCard.sprintId || undefined,
        projectId,
      });

      if (result.success && result.issue) {
        // Assign labels to the new card
        if (newCard.labelIds.length > 0) {
          for (const labelId of newCard.labelIds) {
            await addLabelToIssue(result.issue.id, labelId);
          }
        }
        
        await refreshCards();
        return result.issue;
      }
      throw new Error(result.error || 'Failed to create card');
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    } finally {
      setIsCreatingIssue(false);
    }
  };

  const updateCard = async (card: Card, selectedCardLabelIds: string[], selectedCardAssigneeId: string | null) => {
    setIsUpdating(true);
    try {
      const result = await updateIssueWithAgentInstructions(card.id, projectId, {
        ...card,
        assigneeId: selectedCardAssigneeId || undefined,
      });

      if (result.success) {
        // Update labels if they changed
        const currentLabelIds = card.labels?.map(cl => cl.labelId) || [];
        
        // Remove labels that are no longer selected
        for (const labelId of currentLabelIds) {
          if (!selectedCardLabelIds.includes(labelId)) {
            await removeLabelFromIssue(card.id, labelId);
          }
        }
        
        // Add new labels
        for (const labelId of selectedCardLabelIds) {
          if (!currentLabelIds.includes(labelId)) {
            await addLabelToIssue(card.id, labelId);
          }
        }
        
        await refreshCards();
      } else {
        throw new Error(result.error || 'Failed to update card');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const createLabel = async (name: string, color: string) => {
    try {
      const result = await createLabelAction(projectId, { name, color });

      if (result.success && result.label) {
        return result.label;
      } else {
        throw new Error(result.error || 'Failed to create label');
      }
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  return {
    createCard,
    updateCard,
    createLabel,
    isCreatingIssue,
    isUpdating,
  };
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const loadComments = async (cardId: string) => {
    setLoadingComments(true);
    try {
      const result = await getIssueComments(cardId);
      if (result.success && result.comments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setComments(result.comments as any);
      } else {
        console.error('Failed to load comments:', result.error || 'Unknown error');
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async (cardId: string) => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const result = await createIssueComment(cardId, newComment.trim());
      if (result.success && result.comment) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setComments([...comments, result.comment as any]);
        setNewComment('');
      } else {
        console.error('Failed to add comment:', result.error || 'Unknown error');
        alert(`Failed to add comment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Network error: Failed to add comment. Please check your connection.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const resetComments = () => {
    setComments([]);
    setNewComment('');
  };

  return {
    comments,
    loadingComments,
    newComment,
    setNewComment,
    isAddingComment,
    loadComments,
    addComment,
    resetComments,
  };
}