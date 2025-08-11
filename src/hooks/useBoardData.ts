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
}

export function useBoardData(projectId: string) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const projectRes = await fetch(`/api/projects/${projectId}`);
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData.project);
          
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
        const cardsRes = await fetch(`/api/issues?projectId=${projectId}`);
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
  }, [status, projectId, router, session]);

  // Polling for real-time updates
  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);
      try {
        // Fetch cards
        const cardsRes = await fetch(`/api/issues?projectId=${projectId}`);
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
        console.error('Error refreshing board data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    if (status === 'authenticated' && projectId) {
      const pollInterval = setInterval(refreshData, 20000);
      return () => clearInterval(pollInterval);
    }
  }, [status, projectId]);

  const refreshCards = async () => {
    const cardsRes = await fetch(`/api/issues?projectId=${projectId}`);
    if (cardsRes.ok) {
      const cardsData = await cardsRes.json();
      setCards(cardsData);
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
          ...newCard,
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