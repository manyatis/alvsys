'use client';

import { useState, useEffect, use } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { CardStatus, Card, Comment, Label, CardLabel } from '@/types/card';

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
  const { status } = useSession();
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    acceptanceCriteria: '',
    status: CardStatus.REFINEMENT,
    priority: 3,
    isAiAllowedTask: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const projectRes = await fetch(`/api/projects/${resolvedParams.id}`);
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData.project);
        }

        // Fetch cards
        const cardsRes = await fetch(`/api/cards?projectId=${resolvedParams.id}`);
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
  }, [status, resolvedParams.id, router]);

  // Handle escape key and close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateModal) {
        setModalVisible(false);
        setTimeout(() => setShowCreateModal(false), 300);
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowCreateModal(false), 300);
  };


  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cards', {
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
        setCards([...cards, data]);
        setShowCreateModal(false);
        setNewCard({
          title: '',
          description: '',
          acceptanceCriteria: '',
          status: CardStatus.REFINEMENT,
          priority: 3,
          isAiAllowedTask: true,
        });
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleCardClick = async (card: Card) => {
    // Don't open modal if we just finished dragging
    if (touchedCard || draggedCard) return;
    
    setSelectedCard(card);
    setShowDetailModal(true);
    setTimeout(() => setDetailModalVisible(true), 10);
    
    // Load comments for the card
    await loadComments(card.id);
  };

  const loadComments = async (cardId: string) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/cards/${cardId}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCard),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setCards(cards.map(card => card.id === selectedCard.id ? updatedCard : card));
        closeDetailModal();
      }
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedCard(null);
      setComments([]);
      setNewComment('');
    }, 300);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/comments`, {
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
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
      const response = await fetch(`/api/cards/${draggedCard.id}`, {
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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchedCard || !touchStartPos) return;
    
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
        element.style.opacity = '0.5';
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.2s ease';
      }
      
      // Prevent scrolling while dragging
      e.preventDefault();
      
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
    
    // Reset visual feedback if we were dragging
    if (isTouchDragging) {
      const element = e.currentTarget as HTMLElement;
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
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
            const response = await fetch(`/api/cards/${touchedCard.id}`, {
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
            }
          } catch (error) {
            console.error('Error updating card status:', error);
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
  };

  const getCardsByStatus = (status: CardStatus) => {
    return cards
      .filter(card => card.status === status)
      .sort((a, b) => a.priority - b.priority);
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-600 border-red-200';
    if (priority === 2) return 'bg-orange-100 text-orange-600 border-orange-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getInitials = (email: string | null, name: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.split('@')[0].slice(0, 2).toUpperCase();
    return 'U';
  };

  const formatCommentDate = (date: Date | string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 sticky left-0 top-0 h-screen z-10 ${
        sidebarCollapsed ? 'w-10' : 'w-48'
      }`}>
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Board Actions</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1">
          {!sidebarCollapsed ? (
            <>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setTimeout(() => setModalVisible(true), 10);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-3 w-3" />
                Create Issue
              </button>
              
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Filter className="h-3 w-3" />
                Filter
              </button>
              
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
                className="w-full p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Create Issue"
              >
                <Plus className="h-3 w-3" />
              </button>
              
              <button 
                className="w-full p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Filter"
              >
                <Filter className="h-3 w-3" />
              </button>
              
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {project?.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Software project • {project?.organization.name}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <button className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Share
              </button>
              <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                <MoreVertical className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 p-4 h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3 h-full overflow-x-auto pb-4">
            {statusColumns.map((column) => {
              const Icon = column.icon;
              const columnCards = getCardsByStatus(column.status);
              
              return (
                <div
                  key={column.status}
                  className="w-64 min-w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col"
                >
                  <div className={`px-3 py-2 border-b border-gray-200 dark:border-gray-700 ${column.bgColor} flex-shrink-0 rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3 w-3 ${column.textColor}`} />
                        <h3 className={`text-sm font-medium ${column.textColor} dark:text-white`}>
                          {column.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                        {columnCards.length}
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-2 space-y-2 flex-1 overflow-y-auto transition-colors duration-200 ${
                      dragOverColumn === column.status 
                        ? 'bg-purple-50/50 dark:bg-purple-900/10' 
                        : ''
                    }`}
                    data-column-status={column.status}
                    onDragOver={(e) => handleDragOver(e, column.status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.status)}
                  >
                    {columnCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onClick={() => {
                          // Prevent click if we're dragging
                          if (!isTouchDragging && !draggedCard) {
                            handleCardClick(card);
                          }
                        }}
                        onDragStart={(e) => handleDragStart(e, card)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, card)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-move group touch-none ${
                          draggedCard?.id === card.id || touchedCard?.id === card.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {card.title}
                          </h4>
                          <button className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-opacity">
                            <MoreVertical className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {card.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                            {card.description}
                          </p>
                        )}

                        {/* Labels */}
                        {card.labels && card.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {card.labels.slice(0, 3).map((cardLabel) => (
                              <span
                                key={cardLabel.id}
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: cardLabel.label.color + '20', 
                                  color: cardLabel.label.color,
                                  border: `1px solid ${cardLabel.label.color}40`
                                }}
                              >
                                {cardLabel.label.name}
                              </span>
                            ))}
                            {card.labels.length > 3 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                +{card.labels.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getPriorityColor(card.priority)}`}>
                              P{card.priority}
                            </span>
                            {card.isAiAllowedTask && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                AI
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium"
                              title={card.createdBy?.name || card.createdBy?.email || 'Unknown'}
                            >
                              {getInitials(card.createdBy?.email || null, card.createdBy?.name || null)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {columnCards.length === 0 && (
                      <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                        <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">No issues</p>
                      </div>
                    )}
                  </div>
                </div>
              );
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
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${
                modalVisible 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-0 translate-y-4'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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

                <div className="grid grid-cols-2 gap-3">
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
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Create Issue
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeDetailModal}>
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
                  onClick={closeDetailModal}
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

              <div className="grid grid-cols-2 gap-4">
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

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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

                {/* Add Comment Form */}
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
            </div>
          </div>
        </>
      )}

    </div>
  );
}