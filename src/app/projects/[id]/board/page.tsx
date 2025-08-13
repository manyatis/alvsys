'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Zap
} from 'lucide-react';
import { CardStatus, Card } from '@/types/card';
import KanbanColumn from '@/components/board/KanbanColumn';
import BoardSidebar from '@/components/board/BoardSidebar';
import BoardHeader from '@/components/board/BoardHeader';
import CreateIssueModal from '@/components/board/CreateIssueModal';
import EditIssueModal from '@/components/board/EditIssueModal';
import CreateSprintModal from '@/components/board/CreateSprintModal';
import { useBoardData, useCardOperations, useComments } from '@/hooks/useBoardData';
import { 
  getCardsByStatus, 
  FilterState
} from '@/utils/board-utils';
import { useUsageStatus } from '@/hooks/useUsageStatus';
import { useSprints } from '@/hooks/useSprints';

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
  const [showOnlyActiveSprint, setShowOnlyActiveSprint] = useState(true);
  
  // Use custom hooks
  const {
    project,
    cards,
    loading,
    labels,
    setLabels,
    organizationMembers,
    currentUserId,
    isRefreshing,
    refreshCards,
  } = useBoardData(resolvedParams.id, showOnlyActiveSprint);
  
  const {
    createCard,
    updateCard,
    createLabel,
    isCreatingIssue,
    isUpdating,
  } = useCardOperations(resolvedParams.id, refreshCards);
  
  const {
    comments,
    loadingComments,
    newComment,
    setNewComment,
    isAddingComment,
    loadComments,
    addComment,
    resetComments,
  } = useComments();
  
  // Usage status
  const { usageStatus } = useUsageStatus();
  
  // Sprint management
  const {
    sprints,
    activeSprint,
    createSprint,
    closeSprint,
  } = useSprints(resolvedParams.id);
  
  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintModalVisible, setSprintModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newCard, setNewCard] = useState<NewCard>({
    title: '',
    description: '',
    acceptanceCriteria: '',
    status: CardStatus.REFINEMENT,
    priority: 3,
    effortPoints: 5,
    isAiAllowedTask: true,
    assigneeId: null,
    labelIds: [],
    sprintId: null,
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
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [inlineLabelEditorOpen, setInlineLabelEditorOpen] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<CardStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
  const currentMouseRef = useRef({ x: 0, y: 0 });



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
        sprintId: null,
      });
    }, 300);
  };

  const openCreateModal = (status?: CardStatus) => {
    // Check usage limits before opening modal
    if (usageStatus?.isAtCardLimit) {
      alert(`Daily card limit reached (${usageStatus.usage.dailyCardsUsed}/${usageStatus.usage.dailyCardsLimit}). Limit resets daily.`);
      return;
    }
    
    if (status) {
      setNewCard(prev => ({ ...prev, status }));
    }
    setShowCreateModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };


  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreatingIssue) return;
    
    try {
      await createCard(newCard);
      
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
          sprintId: newCard.sprintId, // Retain sprint
        });
      } else {
        closeModal();
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleCardClick = async (card: Card) => {
    setSelectedCard(card);
    setSelectedCardLabelIds(card.labels?.map(cl => cl.labelId) || []);
    setSelectedCardAssigneeId(card.assigneeId || null);
    setShowDetailModal(true);
    setTimeout(() => setDetailModalVisible(true), 10);
    
    // Load comments for the card
    await loadComments(card.id);
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    
    try {
      await updateCard(selectedCard, selectedCardLabelIds, selectedCardAssigneeId);
      closeDetailModal();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const closeDetailModal = useCallback(() => {
    setDetailModalVisible(false);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedCard(null);
      setSelectedCardLabelIds([]);
      setSelectedCardAssigneeId(null);
      resetComments();
    }, 300);
  }, [resetComments]);

  const saveAndCloseModal = useCallback(async () => {
    if (!selectedCard) return;
    
    try {
      await updateCard(selectedCard, selectedCardLabelIds, selectedCardAssigneeId);
      closeDetailModal();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  }, [selectedCard, selectedCardLabelIds, selectedCardAssigneeId, updateCard, closeDetailModal]);

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
    if (!selectedCard) return;
    
    await addComment(selectedCard.id);
  };




  const handleCreateLabel = async (name: string, color: string) => {
    try {
      const newLabel = await createLabel(name, color);
      setLabels([...labels, newLabel]);
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };


  const handleLabelAdd = async (cardId: string, labelId: string) => {
    // TODO: Implementation for adding label to card
    console.log('Add label:', { cardId, labelId });
  };

  const handleLabelRemove = async (cardId: string, labelId: string) => {
    // TODO: Implementation for removing label from card
    console.log('Remove label:', { cardId, labelId });
  };

  const handleCreateSprint = async (name: string, startDate?: Date, endDate?: Date) => {
    setIsCreatingSprint(true);
    try {
      const success = await createSprint(name, startDate, endDate);
      if (success) {
        setSprintModalVisible(false);
        setTimeout(() => {
          setShowSprintModal(false);
        }, 300);
        await refreshCards();
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleCloseAndStartNext = async () => {
    if (!activeSprint) return;
    
    if (confirm('Are you sure you want to close the current sprint and start the next one? Any incomplete cards will be moved to the next sprint.')) {
      const success = await closeSprint(activeSprint.id);
      if (success) {
        await refreshCards();
      }
    }
  };

  const openSprintModal = () => {
    setShowSprintModal(true);
    setTimeout(() => setSprintModalVisible(true), 10);
  };

  const closeSprintModal = () => {
    setSprintModalVisible(false);
    setTimeout(() => setShowSprintModal(false), 300);
  };



  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDragOverColumn(null);
    setIsDragging(false);
    setScrollDirection(null);
    document.body.classList.remove('dragging');
    
    // Clear any scroll intervals
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const handleDrop = useCallback(async (targetStatus: CardStatus) => {
    if (!draggedCard || draggedCard.status === targetStatus) {
      handleDragEnd();
      return;
    }

    try {
      // Update the card status via API
      const draggedCardLabelIds = draggedCard.labels?.map(cl => cl.labelId) || [];
      await updateCard({ ...draggedCard, status: targetStatus }, draggedCardLabelIds, draggedCard.assigneeId || null);
      
      // Refresh the cards to reflect the change
      await refreshCards();
    } catch (error) {
      console.error('Error updating card status:', error);
    } finally {
      handleDragEnd();
    }
  }, [draggedCard, updateCard, refreshCards, handleDragEnd]);


  // Drag and drop handlers
  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
    setIsDragging(true);
    document.body.classList.add('dragging');
  };

  const handleDragOver = (status: CardStatus) => {
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };


  // Handle wheel events during drag for additional scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isDragging || !boardRef.current) return;
    
    e.preventDefault();
    const board = boardRef.current;
    const scrollAmount = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    
    const currentScrollLeft = board.scrollLeft;
    const maxScrollLeft = board.scrollWidth - board.clientWidth;
    const newScrollLeft = currentScrollLeft + scrollAmount;
    
    board.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
    
    // Show scroll direction indicator
    if (scrollAmount > 0) {
      setScrollDirection('right');
    } else if (scrollAmount < 0) {
      setScrollDirection('left');
    }
    
    setTimeout(() => setScrollDirection(null), 100);
  }, [isDragging]);

  // Global mouse tracking for all browsers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      currentMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      currentMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handlePointerMove = (e: PointerEvent) => {
      currentMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    // Always track mouse position with multiple event types
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);


  // Set up drag scrolling
  useEffect(() => {
    if (isDragging) {
      
      // Set up continuous scrolling loop that uses the global mouse position
      scrollIntervalRef.current = setInterval(() => {
        if (!boardRef.current) return;
        
        const board = boardRef.current;
        const boardRect = board.getBoundingClientRect();
        const currentMouseX = currentMouseRef.current.x;
        
        // Define edge zones (50% of board width or minimum 200px)
        const boardWidth = boardRect.width;
        const edgeZone = Math.max(100, boardWidth * .1); // 50% of board width or 200px minimum
        const leftEdge = boardRect.left + edgeZone;
        const rightEdge = boardRect.right - edgeZone;
        
        // Check if mouse is in edge zones
        const scrollSpeed = 3;
        
        if (currentMouseX < leftEdge && currentMouseX > boardRect.left) {
          // Scroll left
          const distance = leftEdge - currentMouseX;
          const intensity = Math.min(distance / edgeZone, 1);
          const scrollAmount = scrollSpeed * intensity * 3;
          
          board.scrollLeft = Math.max(0, board.scrollLeft - scrollAmount);
          setScrollDirection('left');
        } else if (currentMouseX > rightEdge && currentMouseX < boardRect.right) {
          // Scroll right
          const distance = currentMouseX - rightEdge;
          const intensity = Math.min(distance / edgeZone, 1);
          const scrollAmount = scrollSpeed * intensity * 3;
          const maxScrollLeft = board.scrollWidth - board.clientWidth;
          
          board.scrollLeft = Math.min(maxScrollLeft, board.scrollLeft + scrollAmount);
          setScrollDirection('right');
        } else {
          setScrollDirection(null);
        }
      }, 16); // ~60fps
      
      // Add wheel support for additional scrolling
      document.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        document.removeEventListener('wheel', handleWheel);
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        setScrollDirection(null);
      };
    }
  }, [isDragging, handleWheel]);

  // Touch handlers for mobile
  const handleTouchStart = (card: Card, element: HTMLElement, touch: React.Touch) => {
    // Add 200ms delay for touch devices to prevent accidental drags
    setTimeout(() => {
      setDraggedCard(card);
      setIsDragging(true);
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      
      // Create ghost element
      const ghost = element.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.left = `${touch.clientX}px`;
      ghost.style.top = `${touch.clientY}px`;
      ghost.style.width = `${element.offsetWidth}px`;
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '0.9';
      ghost.style.pointerEvents = 'none';
      ghost.style.transform = 'translate(-50%, -50%) rotate(2deg) scale(1.05)';
      ghost.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      ghost.style.transition = 'none';
      document.body.appendChild(ghost);
      setGhostElement(ghost);
      
      // Allow horizontal scrolling but prevent vertical on the board
      document.body.style.touchAction = 'pan-x';
      
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }, 200);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !ghostElement || !boardRef.current) return;
    
    // Only prevent default for vertical scrolling, allow horizontal
    if (Math.abs(e.touches[0].clientY - (touchStartPos?.y || 0)) < Math.abs(e.touches[0].clientX - (touchStartPos?.x || 0))) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    const currentTouchPos = { x: touch.clientX, y: touch.clientY };
    
    // Update ghost element position
    ghostElement.style.left = `${touch.clientX}px`;
    ghostElement.style.top = `${touch.clientY}px`;
    
    // Find which column we're over
    const columns = boardRef.current.querySelectorAll('[data-column-status]');
    let foundColumn = false;
    columns.forEach((col) => {
      const rect = col.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const status = col.getAttribute('data-column-status') as CardStatus;
        setDragOverColumn(status);
        foundColumn = true;
      }
    });
    
    if (!foundColumn) {
      setDragOverColumn(null);
    }
    
    // Edge-based scrolling for mobile
    const board = boardRef.current;
    const boardRect = board.getBoundingClientRect();
    const touchX = currentTouchPos.x;
    
    const boardWidth = boardRect.width;
    const edgeZone = Math.max(50, boardWidth * 0.1); // 10% of board width or 50px minimum
    const leftEdge = boardRect.left + edgeZone;
    const rightEdge = boardRect.right - edgeZone;
    
    // Check if touch is in edge zones and scroll accordingly
    const scrollSpeed = 2; // Slower for touch
    
    if (touchX < leftEdge && touchX > boardRect.left) {
      // Scroll left
      const distance = leftEdge - touchX;
      const intensity = Math.min(distance / edgeZone, 1);
      const scrollAmount = scrollSpeed * intensity;
      
      board.scrollLeft = Math.max(0, board.scrollLeft - scrollAmount);
      setScrollDirection('left');
    } else if (touchX > rightEdge && touchX < boardRect.right) {
      // Scroll right
      const distance = touchX - rightEdge;
      const intensity = Math.min(distance / edgeZone, 1);
      const scrollAmount = scrollSpeed * intensity;
      const maxScrollLeft = board.scrollWidth - board.clientWidth;
      
      board.scrollLeft = Math.min(maxScrollLeft, board.scrollLeft + scrollAmount);
      setScrollDirection('right');
    } else {
      setScrollDirection(null);
    }
    
  }, [isDragging, ghostElement, touchStartPos]);

  const cleanupTouch = useCallback(() => {
    // Immediately clear the scroll interval first
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    // Reset scroll direction immediately
    setScrollDirection(null);
    
    if (ghostElement) {
      ghostElement.remove();
      setGhostElement(null);
    }
    
    setDraggedCard(null);
    setDragOverColumn(null);
    setIsDragging(false);
    setTouchStartPos(null);
    
    // Re-enable normal scrolling
    document.body.style.touchAction = '';
  }, [ghostElement]);

  const handleTouchEnd = useCallback(async (e: TouchEvent) => {
    if (!isDragging || !dragOverColumn || !draggedCard) {
      cleanupTouch();
      return;
    }
    
    e.preventDefault();
    
    // Perform the drop
    if (draggedCard.status !== dragOverColumn) {
      await handleDrop(dragOverColumn);
    }
    
    cleanupTouch();
  }, [isDragging, dragOverColumn, draggedCard, handleDrop, cleanupTouch]);

  // Set up touch event listeners
  useEffect(() => {
    if (isDragging && touchStartPos) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.addEventListener('touchcancel', cleanupTouch);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', cleanupTouch);
      };
    }
  }, [isDragging, touchStartPos, handleTouchMove, handleTouchEnd, cleanupTouch]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 flex w-full max-w-full pt-20">
        {/* Left Sidebar */}
        <BoardSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          filters={filters}
          setFilters={setFilters}
          showFilterMenu={showFilterMenu}
          setShowFilterMenu={setShowFilterMenu}
          copyFeedback={copyFeedback}
          setCopyFeedback={setCopyFeedback}
          projectId={resolvedParams.id}
          onCreateIssue={() => openCreateModal()}
          labels={labels}
          cards={cards}
          usageStatus={usageStatus}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <BoardHeader
            project={project}
            currentProjectId={resolvedParams.id}
            isRefreshing={isRefreshing}
            activeSprint={activeSprint}
            onCloseAndStartNext={handleCloseAndStartNext}
            onToggleSprintFilter={() => setShowOnlyActiveSprint(!showOnlyActiveSprint)}
            showOnlyActiveSprint={showOnlyActiveSprint}
            onCreateSprint={openSprintModal}
          />

        {/* Board */}
        <div className="flex-1 p-2 md:p-4 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
          {/* Scroll Indicators */}
          {scrollDirection === 'left' && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-2 rounded-r-lg z-50 animate-pulse shadow-lg">
              <span className="text-lg">← Scrolling</span>
            </div>
          )}
          {scrollDirection === 'right' && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-2 rounded-l-lg z-50 animate-pulse shadow-lg">
              <span className="text-lg">Scrolling →</span>
            </div>
          )}
          
          <div ref={boardRef} className="flex gap-2 md:gap-3 h-full pb-4 overflow-x-auto overflow-y-hidden relative w-full" style={{ touchAction: 'pan-x' }}>
            {statusColumns.map((column) => {
              const columnCards = getCardsByStatus(cards, column.status, filters);
              
              return (
                <KanbanColumn
                  key={column.status}
                  column={column}
                  cards={columnCards}
                  onCreateIssue={openCreateModal}
                  onCardClick={handleCardClick}
                  labels={labels}
                  inlineLabelEditorOpen={inlineLabelEditorOpen}
                  onToggleLabelEditor={setInlineLabelEditorOpen}
                  onLabelAdd={handleLabelAdd}
                  onLabelRemove={handleLabelRemove}
                  onCreateLabel={handleCreateLabel}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  isDraggedOver={dragOverColumn === column.status}
                  draggedCard={draggedCard}
                  onTouchStart={handleTouchStart}
                />);
            })}
          </div>
        </div>
      </div>

      {/* Create Issue Modal */}
      <CreateIssueModal
        showModal={showCreateModal}
        modalVisible={modalVisible}
        newCard={newCard}
        setNewCard={setNewCard}
        createAnother={createAnother}
        setCreateAnother={setCreateAnother}
        isCreating={isCreatingIssue}
        labels={labels}
        organizationMembers={organizationMembers}
        currentUserId={currentUserId}
        sprints={sprints}
        statusColumns={statusColumns}
        onClose={closeModal}
        onCreate={handleCreateCard}
        onCreateLabel={handleCreateLabel}
      />

      {/* Edit Issue Modal */}
      <EditIssueModal
        showModal={showDetailModal}
        modalVisible={detailModalVisible}
        selectedCard={selectedCard!}
        setSelectedCard={setSelectedCard}
        selectedCardLabelIds={selectedCardLabelIds}
        setSelectedCardLabelIds={setSelectedCardLabelIds}
        selectedCardAssigneeId={selectedCardAssigneeId}
        setSelectedCardAssigneeId={setSelectedCardAssigneeId}
        isUpdating={isUpdating}
        comments={comments}
        loadingComments={loadingComments}
        newComment={newComment}
        setNewComment={setNewComment}
        isAddingComment={isAddingComment}
        labels={labels}
        organizationMembers={organizationMembers}
        currentUserId={currentUserId}
        sprints={sprints}
        statusColumns={statusColumns}
        onClose={saveAndCloseModal}
        onUpdate={handleUpdateCard}
        onAddComment={handleAddComment}
        onCreateLabel={handleCreateLabel}
      />

      {/* Create Sprint Modal */}
      <CreateSprintModal
        showModal={showSprintModal}
        modalVisible={sprintModalVisible}
        onClose={closeSprintModal}
        onCreate={handleCreateSprint}
        isCreating={isCreatingSprint}
      />

      </div>
    </>
  );
}