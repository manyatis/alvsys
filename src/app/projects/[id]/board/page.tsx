'use client';

import { useState, useEffect, use, useCallback } from 'react';
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
import { useBoardData, useCardOperations, useComments } from '@/hooks/useBoardData';
import { 
  getCardsByStatus, 
  FilterState
} from '@/utils/board-utils';

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
  } = useBoardData(resolvedParams.id);
  
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
  
  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
          onCreateIssue={openCreateModal}
          labels={labels}
          cards={cards}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <BoardHeader
            project={project}
            currentProjectId={resolvedParams.id}
            isRefreshing={isRefreshing}
          />

        {/* Board */}
        <div className="flex-1 p-2 md:p-4 min-h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2 md:gap-3 h-full pb-4 overflow-x-auto overflow-y-hidden">
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
        statusColumns={statusColumns}
        onClose={saveAndCloseModal}
        onUpdate={handleUpdateCard}
        onAddComment={handleAddComment}
        onCreateLabel={handleCreateLabel}
      />

      </div>
    </>
  );
}