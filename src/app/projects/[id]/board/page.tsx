'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Settings,
  Users,
  X,
  Loader2,
  Send,
  MessageCircle,
  Copy,
  Check,
  Bot
} from 'lucide-react';
import { CardStatus, Card, Comment, Label } from '@/types/card';
import LabelSelector from '@/components/LabelSelector';
import AssigneeSelector from '@/components/AssigneeSelector';
import ProjectSelector from '@/components/ProjectSelector';
import KanbanColumn from '@/components/board/KanbanColumn';
import { 
  getCardsByStatus, 
  getInitials, 
  getUniqueAssignees, 
  hasActiveFilters, 
  formatCommentDate, 
  copyOnboardLink,
  createClearFilters,
  FilterState,
  OrganizationMember
} from '@/utils/board-utils';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
}


const statusColumns: { 
  status: CardStatus; 
  title: string; 
  color: string; 
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{className?: string}>;
}[] = [
  { 
    status: CardStatus.REFINEMENT, 
    title: 'Refinement', 
    color: 'border-gray-300', 
    bgColor: 'bg-gray-50 dark:bg-gray-700',
    textColor: 'text-gray-700',
    icon: RefreshCw 
  },
  { 
    status: CardStatus.READY, 
    title: 'To Do', 
    color: 'border-blue-300', 
    bgColor: 'bg-blue-50 dark:bg-gray-700',
    textColor: 'text-blue-700',
    icon: Clock 
  },
  { 
    status: CardStatus.IN_PROGRESS, 
    title: 'In Progress', 
    color: 'border-yellow-300', 
    bgColor: 'bg-yellow-50 dark:bg-gray-700',
    textColor: 'text-yellow-700',
    icon: Zap 
  },
  { 
    status: CardStatus.BLOCKED, 
    title: 'Blocked', 
    color: 'border-red-300', 
    bgColor: 'bg-red-50 dark:bg-gray-700',
    textColor: 'text-red-700',
    icon: AlertCircle 
  },
  { 
    status: CardStatus.READY_FOR_REVIEW, 
    title: 'Review', 
    color: 'border-purple-300', 
    bgColor: 'bg-purple-50 dark:bg-gray-700',
    textColor: 'text-purple-700',
    icon: CheckCircle 
  },
  { 
    status: CardStatus.COMPLETED, 
    title: 'Done', 
    color: 'border-green-300', 
    bgColor: 'bg-green-50 dark:bg-gray-700',
    textColor: 'text-green-700',
    icon: CheckCircle 
  },
];

export default function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<CardStatus | null>(null);
  const [touchedCard, setTouchedCard] = useState<Card | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchHoldTimer, setTouchHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [canStartDragging, setCanStartDragging] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    acceptanceCriteria: '',
    status: CardStatus.REFINEMENT,
    priority: 3,
    effortPoints: 5,
    isAiAllowedTask: true,
    assigneeId: null as string | null,
    labelIds: [] as string[],
  });
  const [createAnother, setCreateAnother] = useState(false);
  const [selectedCardLabelIds, setSelectedCardLabelIds] = useState<string[]>([]);
  const [selectedCardAssigneeId, setSelectedCardAssigneeId] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    assigneeId: '',
    aiAllowed: 'all',
    labelIds: [],
    priority: 'all'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [inlineLabelEditorOpen, setInlineLabelEditorOpen] = useState<string | null>(null);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user ID from session
        if (session?.user?.email) {
          // Find current user ID from organization members
          // We'll get this after fetching members
        }

        // Fetch project details
        const projectRes = await fetch(`/api/projects/${resolvedParams.id}`);
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
        const cardsRes = await fetch(`/api/issues?projectId=${resolvedParams.id}`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }

        // Fetch labels
        const labelsRes = await fetch(`/api/projects/${resolvedParams.id}/labels`);
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
    } else if (status === 'authenticated' && resolvedParams.id) {
      loadData();
    }
  }, [status, resolvedParams.id, router, session]);

  // Auto-assign "Agent" when AI allowed task is enabled for new cards
  useEffect(() => {
    if (newCard.isAiAllowedTask && !newCard.assigneeId) {
      setNewCard(prev => ({ ...prev, assigneeId: 'agent' }));
    } else if (!newCard.isAiAllowedTask && newCard.assigneeId === 'agent') {
      setNewCard(prev => ({ ...prev, assigneeId: null }));
    }
  }, [newCard.isAiAllowedTask, newCard.assigneeId]);

  // Auto-assign "Agent" when AI allowed task is enabled for selected card
  useEffect(() => {
    if (selectedCard?.isAiAllowedTask && !selectedCardAssigneeId) {
      setSelectedCardAssigneeId('agent');
    } else if (!selectedCard?.isAiAllowedTask && selectedCardAssigneeId === 'agent') {
      setSelectedCardAssigneeId(null);
    }
  }, [selectedCard?.isAiAllowedTask, selectedCardAssigneeId]);

  // Polling mechanism for real-time data updates
  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);
      try {
        // Fetch cards (most likely to change)
        const cardsRes = await fetch(`/api/issues?projectId=${resolvedParams.id}`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }

        // Fetch labels (less frequent updates but still needed)
        const labelsRes = await fetch(`/api/projects/${resolvedParams.id}/labels`);
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

    // Only start polling if authenticated and we have a project ID
    if (status === 'authenticated' && resolvedParams.id) {
      // Set up polling every 20 seconds
      const pollInterval = setInterval(refreshData, 20000);

      // Cleanup interval on unmount
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [status, resolvedParams.id]);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setShowCreateModal(false);
      setCreateAnother(false);
      setNewCard({
        title: '',
        description: '',
        acceptanceCriteria: '',
        status: CardStatus.REFINEMENT,
        priority: 3,
        effortPoints: 5,
        isAiAllowedTask: true,
        assigneeId: null,
        labelIds: [],
      });
    }, 300);
  };

  const openCreateModal = (status?: CardStatus) => {
    if (status) {
      setNewCard(prev => ({ ...prev, status }));
    }
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };


  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreatingIssue) return;
    
    setIsCreatingIssue(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCard,
          projectId: resolvedParams.id,
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
        
        // Refresh cards to get updated data with labels
        const cardsRes = await fetch(`/api/issues?projectId=${resolvedParams.id}`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }
        
        if (createAnother) {
          // Keep modal open and retain labels
          setNewCard({
            title: '',
            description: '',
            acceptanceCriteria: '',
            status: CardStatus.REFINEMENT,
            priority: 3,
            effortPoints: 5,
            isAiAllowedTask: true,
            assigneeId: null,
            labelIds: newCard.labelIds, // Retain labels
          });
        } else {
          setShowCreateModal(false);
          setNewCard({
            title: '',
            description: '',
            acceptanceCriteria: '',
            status: CardStatus.REFINEMENT,
            priority: 3,
            effortPoints: 5,
            isAiAllowedTask: true,
            assigneeId: null,
            labelIds: [],
          });
        }
      }
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsCreatingIssue(false);
    }
  };

  const handleCardClick = async (card: Card) => {
    // Don't open modal if we just finished dragging
    if (touchedCard || draggedCard) return;
    
    setSelectedCard(card);
    setSelectedCardLabelIds(card.labels?.map(cl => cl.labelId) || []);
    setSelectedCardAssigneeId(card.assigneeId || null);
    setShowDetailModal(true);
    setTimeout(() => setDetailModalVisible(true), 10);
    
    // Load comments for the card
    await loadComments(card.id);
  };

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

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/issues/${selectedCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...selectedCard, assigneeId: selectedCardAssigneeId }),
      });

      if (response.ok) {
        // Update labels if they changed
        const currentLabelIds = selectedCard.labels?.map(cl => cl.labelId) || [];
        
        // Remove labels that are no longer selected
        for (const labelId of currentLabelIds) {
          if (!selectedCardLabelIds.includes(labelId)) {
            await fetch(`/api/issues/${selectedCard.id}/labels`, {
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
            await fetch(`/api/issues/${selectedCard.id}/labels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ labelId }),
            });
          }
        }
        
        // Refresh cards to get updated data with labels
        const cardsRes = await fetch(`/api/issues?projectId=${resolvedParams.id}`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }
        
        closeDetailModal();
      }
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeDetailModal = useCallback(() => {
    setDetailModalVisible(false);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedCard(null);
      setSelectedCardLabelIds([]);
      setSelectedCardAssigneeId(null);
      setComments([]);
      setNewComment('');
    }, 300);
  }, [setDetailModalVisible, setShowDetailModal, setSelectedCard, setComments, setNewComment]);

  const saveAndCloseModal = useCallback(async () => {
    if (!selectedCard) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/issues/${selectedCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...selectedCard, assigneeId: selectedCardAssigneeId }),
      });

      if (response.ok) {
        // Update labels if they changed
        const currentLabelIds = selectedCard.labels?.map(cl => cl.labelId) || [];
        
        // Remove labels that are no longer selected
        for (const labelId of currentLabelIds) {
          if (!selectedCardLabelIds.includes(labelId)) {
            await fetch(`/api/issues/${selectedCard.id}/labels`, {
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
            await fetch(`/api/issues/${selectedCard.id}/labels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ labelId }),
            });
          }
        }
        
        // Refresh cards to get updated data with labels
        const cardsRes = await fetch(`/api/issues?projectId=${resolvedParams.id}`);
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }
        
        closeDetailModal();
      }
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedCard, selectedCardLabelIds, selectedCardAssigneeId, setCards, setIsUpdating, closeDetailModal, resolvedParams.id]);

  // Handle escape key and close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreateModal) {
          setModalVisible(false);
          setTimeout(() => setShowCreateModal(false), 300);
        } else if (showDetailModal) {
          saveAndCloseModal();
        }
      }
    };

    if (showCreateModal || showDetailModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal, showDetailModal, saveAndCloseModal]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedCard || !newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/issues/${selectedCard.id}/comments`, {
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

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle visual effect to the dragged card
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedCard(null);
    setDragOverColumn(null);
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: CardStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnStatus: CardStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedCard || draggedCard.status === columnStatus) {
      return;
    }

    try {
      const response = await fetch(`/api/issues/${draggedCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draggedCard,
          status: columnStatus,
        }),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setCards(cards.map(card => 
          card.id === draggedCard.id ? updatedCard : card
        ));
      }
    } catch (error) {
      console.error('Error updating card status:', error);
    } finally {
      setDraggedCard(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, card: Card) => {
    const touch = e.touches[0];
    setTouchedCard(card);
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsTouchDragging(false);
    setCanStartDragging(true); // Enable dragging immediately
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchedCard || !touchStartPos) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const moveThreshold = 10; // pixels
    
    // Check if we've moved enough to consider it a drag
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      // Mark as dragging
      if (!isTouchDragging) {
        setIsTouchDragging(true);
        // Add visual feedback
        const element = e.currentTarget as HTMLElement;
        if (element) {
          element.style.opacity = '0.6';
          element.style.transform = 'scale(1.02) rotate(2deg)';
          element.style.boxShadow = '0 8px 25px 0 rgba(0, 0, 0, 0.15)';
          element.style.transition = 'all 0.2s ease';
          element.style.zIndex = '50';
        }
      }
      
      // Find which column we're over
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const columnElement = element?.closest('[data-column-status]');
      
      if (columnElement) {
        const status = columnElement.getAttribute('data-column-status') as CardStatus;
        setDragOverColumn(status);
      } else {
        setDragOverColumn(null);
      }
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (!touchedCard) return;
    
    // Reset visual feedback
    const element = e.currentTarget as HTMLElement;
    if (element) {
      element.style.opacity = '1';
      element.style.transform = 'scale(1) rotate(0deg)';
      element.style.boxShadow = '';
      element.style.zIndex = '';
      element.style.transition = 'all 0.2s ease';
    }
    
    const touch = e.changedTouches[0];
    
    // If we were dragging, handle the drop
    if (isTouchDragging && dragOverColumn) {
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const columnElement = elementBelow?.closest('[data-column-status]');
      
      if (columnElement) {
        const newStatus = columnElement.getAttribute('data-column-status') as CardStatus;
        
        if (newStatus && newStatus !== touchedCard.status) {
          try {
            const response = await fetch(`/api/issues/${touchedCard.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...touchedCard,
                status: newStatus,
              }),
            });

            if (response.ok) {
              const updatedCard = await response.json();
              setCards(cards.map(card => 
                card.id === touchedCard.id ? updatedCard : card
              ));
              
              // Provide success haptic feedback
              if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
              }
            }
          } catch (error) {
            console.error('Error updating card status:', error);
            // Provide error haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
          }
        }
      }
    } else if (!isTouchDragging) {
      // If we weren't dragging, treat it as a click
      handleCardClick(touchedCard);
    }
    
    // Clean up
    setTouchedCard(null);
    setTouchStartPos(null);
    setDragOverColumn(null);
    setIsTouchDragging(false);
    setCanStartDragging(false);
  };



  const clearFilters = createClearFilters(setFilters);
  const uniqueAssignees = getUniqueAssignees(cards);
  const activeFilters = hasActiveFilters(filters);


  const handleCopyOnboardLink = () => {
    copyOnboardLink(resolvedParams.id, () => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleCreateLabel = async (name: string, color: string) => {
    try {
      console.log('Creating label:', { name, color, projectId: resolvedParams.id });
      
      const response = await fetch(`/api/projects/${resolvedParams.id}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        const newLabel = await response.json();
        console.log('Label created successfully:', newLabel);
        setLabels([...labels, newLabel]);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Label creation failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to create label: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  const handleInlineLabelAdd = async (cardId: string, labelId: string) => {
    try {
      const response = await fetch(`/api/issues/${cardId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labelId }),
      });

      if (response.ok) {
        // Update the cards state to reflect the new label
        const updatedCards = cards.map(card => {
          if (card.id === cardId) {
            const label = labels.find(l => l.id === labelId);
            if (label && !card.labels?.some(cl => cl.labelId === labelId)) {
              return {
                ...card,
                labels: [...(card.labels || []), { id: `${cardId}-${labelId}`, cardId, labelId, label }]
              };
            }
          }
          return card;
        });
        setCards(updatedCards);
      } else {
        throw new Error('Failed to add label');
      }
    } catch (error) {
      console.error('Error adding label to card:', error);
      throw error;
    }
  };

  const handleInlineLabelRemove = async (cardId: string, labelId: string) => {
    try {
      const response = await fetch(`/api/issues/${cardId}/labels`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labelId }),
      });

      if (response.ok) {
        // Update the cards state to remove the label
        const updatedCards = cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              labels: card.labels?.filter(cl => cl.labelId !== labelId) || []
            };
          }
          return card;
        });
        setCards(updatedCards);
      } else {
        throw new Error('Failed to remove label');
      }
    } catch (error) {
      console.error('Error removing label from card:', error);
      throw error;
    }
  };

  const handleLabelAdd = async (cardId: string, labelId: string) => {
    // Implementation for adding label to card
    console.log('Adding label', labelId, 'to card', cardId);
  };

  const handleLabelRemove = async (cardId: string, labelId: string) => {
    // Implementation for removing label from card
    console.log('Removing label', labelId, 'from card', cardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 sticky left-0 top-0 h-screen z-10 ${
        sidebarCollapsed ? 'w-8 md:w-10' : 'w-32 sm:w-44 md:w-48'
      }`}>
        <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Board Actions</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="p-2 md:p-3 space-y-1">
          {!sidebarCollapsed ? (
            <>
              <button
                onClick={() => openCreateModal()}
                className="w-full flex items-center gap-1 md:gap-2 px-2 py-1.5 text-left text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-3 w-3" />
                Create Issue
              </button>
              
              <button
                onClick={() => copyOnboardLink(resolvedParams.id, () => {
                  setCopyFeedback(true);
                  setTimeout(() => setCopyFeedback(false), 2000);
                })}
                className="w-full flex items-center gap-1 md:gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copyFeedback ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copyFeedback ? 'Copied!' : 'Copy AI Onboard Link'}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded-lg transition-colors ${
                    hasActiveFilters(filters) 
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  Filter
                  {hasActiveFilters(filters) && (
                    <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
                
                {showFilterMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowFilterMenu(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-40 p-3 md:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                        {hasActiveFilters(filters) && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      {/* Search */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Search
                        </label>
                        <input
                          type="text"
                          placeholder="Search issues..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      {/* Priority */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={filters.priority}
                          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="all">All priorities</option>
                          <option value="1">P1 (Highest)</option>
                          <option value="2">P2 (High)</option>
                          <option value="3">P3 (Medium)</option>
                          <option value="4">P4 (Low)</option>
                          <option value="5">P5 (Lowest)</option>
                        </select>
                      </div>
                      
                      {/* Assignee */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Creator
                        </label>
                        <select
                          value={filters.assigneeId}
                          onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All creators</option>
                          {getUniqueAssignees(cards).map((assignee) => (
                            <option key={assignee.id} value={assignee.id}>
                              {assignee.name || assignee.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* AI Allowed */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          AI Tasks
                        </label>
                        <select
                          value={filters.aiAllowed}
                          onChange={(e) => setFilters(prev => ({ ...prev, aiAllowed: e.target.value as 'all' | 'ai-only' | 'human-only' }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="all">All issues</option>
                          <option value="ai-only">AI allowed only</option>
                          <option value="human-only">Human only</option>
                        </select>
                      </div>
                      
                      {/* Labels */}
                      {labels.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Labels
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {labels.map((label) => (
                              <label key={label.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={filters.labelIds.includes(label.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        labelIds: [...prev.labelIds, label.id]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        labelIds: prev.labelIds.filter(id => id !== label.id)
                                      }));
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span
                                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: label.color + '20',
                                    color: label.color,
                                    border: `1px solid ${label.color}40`
                                  }}
                                >
                                  {label.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Search className="h-3 w-3" />
                Search
              </button>
              
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Users className="h-3 w-3" />
                Assignees
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="h-3 w-3" />
                  Board Settings
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setTimeout(() => setModalVisible(true), 10);
                }}
                className="w-full p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Create Issue"
              >
                <Plus className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => copyOnboardLink(resolvedParams.id, () => {
                  setCopyFeedback(true);
                  setTimeout(() => setCopyFeedback(false), 2000);
                })}
                className="w-full p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={copyFeedback ? 'Copied!' : 'Copy AI Onboard Link'}
              >
                {copyFeedback ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`w-full p-1.5 rounded-lg transition-colors relative ${
                    hasActiveFilters(filters) 
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Filter"
                >
                  <Filter className="h-3 w-3" />
                  {hasActiveFilters(filters) && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
                
                {showFilterMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowFilterMenu(false)}
                    />
                    <div className="absolute left-full top-0 ml-2 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-40 p-3 md:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                        {hasActiveFilters(filters) && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      {/* Search */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Search
                        </label>
                        <input
                          type="text"
                          placeholder="Search issues..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      {/* Priority */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={filters.priority}
                          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="all">All priorities</option>
                          <option value="1">P1 (Highest)</option>
                          <option value="2">P2 (High)</option>
                          <option value="3">P3 (Medium)</option>
                          <option value="4">P4 (Low)</option>
                          <option value="5">P5 (Lowest)</option>
                        </select>
                      </div>
                      
                      {/* Assignee */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Creator
                        </label>
                        <select
                          value={filters.assigneeId}
                          onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All creators</option>
                          {getUniqueAssignees(cards).map((assignee) => (
                            <option key={assignee.id} value={assignee.id}>
                              {assignee.name || assignee.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* AI Allowed */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          AI Tasks
                        </label>
                        <select
                          value={filters.aiAllowed}
                          onChange={(e) => setFilters(prev => ({ ...prev, aiAllowed: e.target.value as 'all' | 'ai-only' | 'human-only' }))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        >
                          <option value="all">All issues</option>
                          <option value="ai-only">AI allowed only</option>
                          <option value="human-only">Human only</option>
                        </select>
                      </div>
                      
                      {/* Labels */}
                      {labels.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Labels
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {labels.map((label) => (
                              <label key={label.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={filters.labelIds.includes(label.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        labelIds: [...prev.labelIds, label.id]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        labelIds: prev.labelIds.filter(id => id !== label.id)
                                      }));
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span
                                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: label.color + '20',
                                    color: label.color,
                                    border: `1px solid ${label.color}40`
                                  }}
                                >
                                  {label.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <button 
                className="w-full p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Search"
              >
                <Search className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex-1 min-w-0">
              {project && (
                <ProjectSelector 
                  currentProject={project} 
                  currentProjectId={resolvedParams.id}
                />
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-2 md:ml-4">
              {isRefreshing && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="hidden md:inline">Syncing...</span>
                </div>
              )}
              <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                <MoreVertical className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 p-2 md:p-4 min-h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2 md:gap-3 h-full overflow-x-auto pb-4">
            {statusColumns.map((column) => {
              const columnCards = getCardsByStatus(cards, column.status, filters);
              
              return (
                <KanbanColumn
                  key={column.status}
                  column={column}
                  cards={columnCards}
                  onCreateIssue={openCreateModal}
                  onCardClick={handleCardClick}
                  dragOverColumn={dragOverColumn}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  draggedCard={draggedCard}
                  touchedCard={touchedCard}
                  isTouchDragging={isTouchDragging}
                  labels={labels}
                  inlineLabelEditorOpen={inlineLabelEditorOpen}
                  onToggleLabelEditor={setInlineLabelEditorOpen}
                  onLabelAdd={handleLabelAdd}
                  onLabelRemove={handleLabelRemove}
                  onCreateLabel={handleCreateLabel}
                  onCardDragStart={handleDragStart}
                  onCardDragEnd={handleDragEnd}
                  onCardTouchStart={handleTouchStart}
                  onCardTouchMove={handleTouchMove}
                  onCardTouchEnd={handleTouchEnd}
                />);
            })}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showCreateModal && (
        <>
          <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${
              modalVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          </div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-sm md:w-96 max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 mx-4 ${
                modalVisible 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-0 translate-y-4'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Create Issue
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Summary *
                  </label>
                  <input
                    type="text"
                    value={newCard.title}
                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCard.description}
                    onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    rows={2}
                    placeholder="Add a description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={newCard.status}
                        onChange={(e) => setNewCard({ ...newCard, status: e.target.value as CardStatus })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                      >
                        {statusColumns.map((col) => (
                          <option key={col.status} value={col.status}>
                            {col.title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        value={newCard.priority}
                        onChange={(e) => setNewCard({ ...newCard, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <option value={1}>Highest</option>
                        <option value={2}>High</option>
                        <option value={3}>Medium</option>
                        <option value={4}>Low</option>
                        <option value={5}>Lowest</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Effort Points
                    </label>
                    <div className="relative">
                      <select
                        value={newCard.effortPoints}
                        onChange={(e) => setNewCard({ ...newCard, effortPoints: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <option value={1}>1 point</option>
                        <option value={3}>3 points</option>
                        <option value={5}>5 points</option>
                        <option value={8}>8 points</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Acceptance Criteria
                  </label>
                  <textarea
                    value={newCard.acceptanceCriteria}
                    onChange={(e) => setNewCard({ ...newCard, acceptanceCriteria: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    rows={2}
                    placeholder="Define what done means..."
                  />
                </div>

                <div>
                  <LabelSelector
                    availableLabels={labels}
                    selectedLabelIds={newCard.labelIds}
                    onSelectionChange={(labelIds) => setNewCard({ ...newCard, labelIds })}
                    onCreateLabel={handleCreateLabel}
                  />
                </div>

                <div>
                  <AssigneeSelector
                    currentUserId={currentUserId || undefined}
                    organizationMembers={organizationMembers}
                    selectedAssigneeId={newCard.assigneeId || undefined}
                    onSelectionChange={(assigneeId) => setNewCard({ ...newCard, assigneeId })}
                    isAiAllowedTask={newCard.isAiAllowedTask}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">AI Agent Access</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Allow AI agents to work on this issue</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCard.isAiAllowedTask}
                      onChange={(e) => setNewCard({ ...newCard, isAiAllowedTask: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center gap-2 p-3">
                  <input
                    type="checkbox"
                    id="createAnother"
                    checked={createAnother}
                    onChange={(e) => setCreateAnother(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="createAnother" className="text-sm text-gray-700 dark:text-gray-300">
                    Create another issue after this one
                  </label>
                </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingIssue}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  {isCreatingIssue && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreatingIssue ? 'Creating...' : 'Create Issue'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </>
      )}

      {/* Card Detail Modal */}
      {showDetailModal && selectedCard && (
        <>
          <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${
              detailModalVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeDetailModal}
          >
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          </div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={saveAndCloseModal}>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${
                detailModalVisible 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-0 translate-y-2'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Issue</h2>
                <button
                  type="button"
                  onClick={saveAndCloseModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary *
                </label>
                <input
                  type="text"
                  value={selectedCard.title}
                  onChange={(e) => setSelectedCard({ ...selectedCard, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCard.status}
                      onChange={(e) => setSelectedCard({ ...selectedCard, status: e.target.value as CardStatus })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                    >
                      {statusColumns.map((col) => (
                        <option key={col.status} value={col.status}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCard.priority}
                      onChange={(e) => setSelectedCard({ ...selectedCard, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <option value={1}>Highest</option>
                      <option value={2}>High</option>
                      <option value={3}>Medium</option>
                      <option value={4}>Low</option>
                      <option value={5}>Lowest</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Effort Points
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCard.effortPoints}
                      onChange={(e) => setSelectedCard({ ...selectedCard, effortPoints: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <option value={1}>1 point</option>
                      <option value={3}>3 points</option>
                      <option value={5}>5 points</option>
                      <option value={8}>8 points</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedCard.description || ''}
                  onChange={(e) => setSelectedCard({ ...selectedCard, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  placeholder="Add a description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acceptance Criteria
                </label>
                <textarea
                  value={selectedCard.acceptanceCriteria || ''}
                  onChange={(e) => setSelectedCard({ ...selectedCard, acceptanceCriteria: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  placeholder="Define what done means..."
                />
              </div>

              <div>
                <LabelSelector
                  availableLabels={labels}
                  selectedLabelIds={selectedCardLabelIds}
                  onSelectionChange={setSelectedCardLabelIds}
                  onCreateLabel={handleCreateLabel}
                />
              </div>

              <div>
                <AssigneeSelector
                  currentUserId={currentUserId || undefined}
                  organizationMembers={organizationMembers}
                  selectedAssigneeId={selectedCardAssigneeId || undefined}
                  onSelectionChange={setSelectedCardAssigneeId}
                  isAiAllowedTask={selectedCard?.isAiAllowedTask || false}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">AI Agent Access</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Allow AI agents to work on this issue</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCard.isAiAllowedTask}
                    onChange={(e) => setSelectedCard({ ...selectedCard, isAiAllowedTask: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>


              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isUpdating ? 'Updating...' : 'Update Issue'}
                </button>
              </div>
            </form>
            
            {/* Comments Section - Moved outside form to prevent nesting issues */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Comments ({comments.length})
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                {loadingComments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                    No comments yet
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="flex-shrink-0">
                        {comment.isAiComment ? (
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">
                            AI
                          </div>
                        ) : (
                          <div 
                            className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium"
                            title={comment.author?.name || comment.author?.email || 'Unknown'}
                          >
                            {getInitials(comment.author?.email || null, comment.author?.name || null)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {comment.isAiComment 
                              ? 'AI Agent' 
                              : (comment.author?.name || comment.author?.email?.split('@')[0] || 'Unknown')
                            }
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form - Now outside the edit form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isAddingComment}
                  className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {isAddingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}