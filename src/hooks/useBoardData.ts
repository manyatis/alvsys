'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Comment, Label, CardStatus } from '@/types/card';
import { OrganizationMember } from '@/utils/board-utils';
import { mcpClient, MCPClientError } from '@/lib/mcp-client';
import { mcpWebSocket } from '@/lib/mcp-websocket';

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
              } else {
                console.warn('Current user not found in organization members:', {
                  sessionEmail: session.user.email,
                  memberEmails: membersData.members.map((m: OrganizationMember) => m.email)
                });
              }
            }
          }
        }

        // Fetch cards using MCP
        try {
          const cardsData = await mcpClient.listIssues(projectId);
          setCards(cardsData);
        } catch (error) {
          console.error('Error fetching cards:', error);
          if (error instanceof MCPClientError) {
            console.error('MCP Error:', error.code, error.message);
          }
        }

        // Fetch labels using MCP
        try {
          const labelsData = await mcpClient.listLabels(projectId);
          setLabels(labelsData);
        } catch (error) {
          console.error('Error fetching labels:', error);
          if (error instanceof MCPClientError) {
            console.error('MCP Error:', error.code, error.message);
          }
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
      
      // Set up real-time updates via WebSocket
      if (mcpWebSocket) {
        // Listen for project-specific events
        mcpWebSocket.onProjectEvent(projectId, (event) => {
          console.log('Board event received:', event);
          
          switch (event.type) {
            case 'issue.created':
            case 'issue.updated':
            case 'issue.deleted':
            case 'issue.status_changed':
              // Refresh cards when issues change
              refreshCards();
              break;
            case 'label.created':
            case 'label.updated':
            case 'label.deleted':
              // Refresh labels when they change
              loadLabels();
              break;
            case 'comment.created':
              // Handle comment updates if needed
              break;
          }
        });
      }
    }
  }, [status, projectId, router, session, showOnlyActiveSprint, selectedSprintId]);
  
  // Helper function to load labels
  const loadLabels = async () => {
    try {
      const labelsData = await mcpClient.listLabels(projectId);
      setLabels(labelsData);
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  // Reduced polling for fallback (WebSocket handles most updates)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let isComponentMounted = true;

    const refreshData = async () => {
      if (!isComponentMounted) return;
      
      setIsRefreshing(true);
      try {
        // Use MCP for data refresh
        const [cardsData, labelsData] = await Promise.all([
          mcpClient.listIssues(projectId).catch(error => {
            console.error('Error refreshing cards:', error);
            return cards; // Keep existing data on error
          }),
          mcpClient.listLabels(projectId).catch(error => {
            console.error('Error refreshing labels:', error);
            return labels; // Keep existing data on error
          })
        ]);
        
        if (isComponentMounted) {
          setCards(cardsData);
          setLabels(labelsData);
        }
      } catch (error) {
        console.error('Error refreshing board data:', error);
      } finally {
        if (isComponentMounted) {
          setIsRefreshing(false);
        }
      }
    };

    if (status === 'authenticated' && projectId) {
      // Reduced polling frequency since WebSocket handles real-time updates
      pollInterval = setInterval(refreshData, 120000); // 2 minutes fallback polling
    }

    return () => {
      isComponentMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [status, projectId, showOnlyActiveSprint, selectedSprintId, cards, labels]);

  const refreshCards = async () => {
    try {
      const cardsData = await mcpClient.listIssues(projectId);
      setCards(cardsData);
    } catch (error) {
      console.error('Error refreshing cards:', error);
      if (error instanceof MCPClientError) {
        console.error('MCP Error:', error.code, error.message);
      }
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
      // Create issue using MCP
      const issue = await mcpClient.createIssue({
        projectId,
        title: newCard.title,
        description: newCard.description,
        status: newCard.status as 'todo' | 'in_progress' | 'done',
        priority: (['low', 'medium', 'high'][newCard.priority] || 'medium') as 'low' | 'medium' | 'high'
      });
      
      // Assign labels to the new issue
      if (newCard.labelIds.length > 0) {
        for (const labelId of newCard.labelIds) {
          try {
            await mcpClient.assignLabel(issue.id, labelId);
          } catch (error) {
            console.error('Error assigning label:', labelId, error);
          }
        }
      }
      
      await refreshCards();
      return issue;
    } catch (error) {
      console.error('Error creating card:', error);
      if (error instanceof MCPClientError) {
        console.error('MCP Error:', error.code, error.message);
      }
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