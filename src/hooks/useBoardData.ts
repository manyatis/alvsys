'use client';

import { useState, useEffect } from 'react';
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
  };
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
        const projectRes = await fetch(`/api/projects/${projectId}`);
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData.project);
          
          // If project has GitHub sync enabled, perform background sync
          if (projectData.project.githubSyncEnabled) {
            // Start sync in background - don't block the initial load
            setIsSyncing(true);
            fetch(`/api/projects/${projectId}/github/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                direction: 'BIDIRECTIONAL',
                conflictResolution: 'LATEST_TIMESTAMP',
                syncComments: true,
                syncLabels: true,
              }),
            }).then(async (syncRes) => {
              if (syncRes.ok) {
                console.log('Background GitHub sync completed successfully');
                // Refresh cards after sync
                // Only filter by active sprint if there actually is an active sprint
                let cardsUrl = `/api/issues?projectId=${projectId}`;
                if (selectedSprintId) {
                  cardsUrl += `&sprintId=${selectedSprintId}`;
                } else if (showOnlyActiveSprint) {
                  // Check if there's an active sprint before filtering
                  const sprintsRes = await fetch(`/api/projects/${projectId}/sprints`);
                  if (sprintsRes.ok) {
                    const sprints = await sprintsRes.json();
                    const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
                    if (activeSprint) {
                      cardsUrl += `&activeSprint=true`;
                    }
                    // If no active sprint, show all cards
                  }
                }
                
                const cardsRes = await fetch(cardsUrl);
                if (cardsRes.ok) {
                  const cardsData = await cardsRes.json();
                  setCards(cardsData);
                  console.log('Cards refreshed after GitHub sync');
                }
              } else {
                console.warn('Background GitHub sync failed:', await syncRes.text());
              }
              setIsSyncing(false);
            }).catch(syncError => {
              console.warn('Background GitHub sync error:', syncError);
              setIsSyncing(false);
            });
          }
          
          // Fetch organization members
          const membersRes = await fetch(`/api/organizations/${projectData.project.organization.id}/members`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setOrganizationMembers(membersData.members);
            
            // Find current user ID
            if (session?.user?.email) {
              const currentUser = membersData.members.find((member: OrganizationMember) => 
                member.email === session.user!.email
              );
              if (currentUser) {
                setCurrentUserId(currentUser.id);
              }
            }
          }
        }

        // Fetch cards
        let cardsUrl = `/api/issues?projectId=${projectId}`;
        if (selectedSprintId) {
          cardsUrl += `&sprintId=${selectedSprintId}`;
        } else if (showOnlyActiveSprint) {
          // Check if there's an active sprint before filtering
          const sprintsRes = await fetch(`/api/projects/${projectId}/sprints`);
          if (sprintsRes.ok) {
            const sprints = await sprintsRes.json();
            const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
            if (activeSprint) {
              cardsUrl += `&activeSprint=true`;
            }
            // If no active sprint, show all cards
          }
        }
        const cardsRes = await fetch(cardsUrl);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }

        // Fetch labels
        const labelsRes = await fetch(`/api/projects/${projectId}/labels`);
        if (labelsRes.ok) {
          const labelsData = await labelsRes.json();
          setLabels(labelsData);
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
        let cardsUrl = `/api/issues?projectId=${projectId}`;
        if (selectedSprintId) {
          cardsUrl += `&sprintId=${selectedSprintId}`;
        } else if (showOnlyActiveSprint) {
          // Check if there's an active sprint before filtering
          const sprintsRes = await fetch(`/api/projects/${projectId}/sprints`, {
            signal: controller.signal,
            headers: { 'Connection': 'close' }
          });
          if (sprintsRes.ok && isComponentMounted) {
            const sprints = await sprintsRes.json();
            const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
            if (activeSprint) {
              cardsUrl += `&activeSprint=true`;
            }
            // If no active sprint, show all cards
          }
        }
        const cardsRes = await fetch(cardsUrl, { 
          signal: controller.signal,
          headers: { 'Connection': 'close' } 
        });
        if (cardsRes.ok && isComponentMounted) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }

        // Fetch labels
        const labelsRes = await fetch(`/api/projects/${projectId}/labels`, { 
          signal: controller.signal,
          headers: { 'Connection': 'close' } 
        });
        if (labelsRes.ok && isComponentMounted) {
          const labelsData = await labelsRes.json();
          setLabels(labelsData);
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
      let cardsUrl = `/api/issues?projectId=${projectId}`;
      if (selectedSprintId) {
        cardsUrl += `&sprintId=${selectedSprintId}`;
      } else if (showOnlyActiveSprint) {
        // Check if there's an active sprint before filtering
        const sprintsRes = await fetch(`/api/projects/${projectId}/sprints`);
        if (sprintsRes.ok) {
          const sprints = await sprintsRes.json();
          const activeSprint = sprints.find((s: { isActive: boolean }) => s.isActive);
          if (activeSprint) {
            cardsUrl += `&activeSprint=true`;
          }
          // If no active sprint, show all cards
        }
      }
      const cardsRes = await fetch(cardsUrl, {
        headers: { 'Connection': 'close' }
      });
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData);
      }
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
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newCard.title,
          description: newCard.description,
          acceptanceCriteria: newCard.acceptanceCriteria,
          status: newCard.status,
          priority: newCard.priority,
          effortPoints: newCard.effortPoints,
          isAiAllowedTask: newCard.isAiAllowedTask,
          assigneeId: newCard.assigneeId || null,
          labelIds: newCard.labelIds,
          sprintId: newCard.sprintId,
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Assign labels to the new card
        if (newCard.labelIds.length > 0) {
          for (const labelId of newCard.labelIds) {
            await fetch(`/api/issues/${data.id}/labels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ labelId }),
            });
          }
        }
        
        await refreshCards();
        return data;
      }
      throw new Error('Failed to create card');
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
      const response = await fetch(`/api/issues/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...card, assigneeId: selectedCardAssigneeId }),
      });

      if (response.ok) {
        // Update labels if they changed
        const currentLabelIds = card.labels?.map(cl => cl.labelId) || [];
        
        // Remove labels that are no longer selected
        for (const labelId of currentLabelIds) {
          if (!selectedCardLabelIds.includes(labelId)) {
            await fetch(`/api/issues/${card.id}/labels`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ labelId }),
            });
          }
        }
        
        // Add new labels
        for (const labelId of selectedCardLabelIds) {
          if (!currentLabelIds.includes(labelId)) {
            await fetch(`/api/issues/${card.id}/labels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ labelId }),
            });
          }
        }
        
        await refreshCards();
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
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        const newLabel = await response.json();
        return newLabel;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to create label: ${response.status}`);
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
      const response = await fetch(`/api/issues/${cardId}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      } else {
        const errorData = await response.json();
        console.error('Failed to load comments:', errorData.error || 'Unknown error');
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
      const response = await fetch(`/api/issues/${cardId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      } else {
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData.error || 'Unknown error');
        alert(`Failed to add comment: ${errorData.error || 'Unknown error'}`);
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