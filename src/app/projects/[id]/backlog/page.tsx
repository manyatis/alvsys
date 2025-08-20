'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Flag } from 'lucide-react';
import { useSprints } from '@/hooks/useSprints';
import { getProjectCards } from '@/lib/card-functions';
import { Card } from '@/types/card';

export default function BacklogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { sprints } = useSprints(resolvedParams.id);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprintFilter, setSelectedSprintFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const result = await getProjectCards(resolvedParams.id);
        if (result.success && result.cards) {
          setCards(result.cards);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [resolvedParams.id]);

  const groupedCards = () => {
    if (selectedSprintFilter === 'all') {
      // Group cards by sprint
      const cardsBySprintId: Record<string | 'unassigned', Card[]> = {};
      
      cards.forEach(card => {
        const key = card.sprintId || 'unassigned';
        if (!cardsBySprintId[key]) {
          cardsBySprintId[key] = [];
        }
        cardsBySprintId[key].push(card);
      });
      
      return cardsBySprintId;
    } else {
      // Return filtered cards as a single group
      const filtered = cards.filter(card => {
        if (selectedSprintFilter === 'unassigned') return !card.sprintId;
        return card.sprintId === selectedSprintFilter;
      });
      return { [selectedSprintFilter]: filtered };
    }
  };

  const cardGroups = groupedCards();

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 2: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 4: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 5: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'READY_FOR_REVIEW': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'BLOCKED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'REFINEMENT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/projects/${resolvedParams.id}/board`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Board
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Product Backlog
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and prioritize your product backlog items
              </p>
            </div>
          </div>
        </div>

        {/* Sprint Filter */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Sprint:
                </label>
                <select
                  value={selectedSprintFilter}
                  onChange={(e) => setSelectedSprintFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Items</option>
                  <option value="unassigned">Unassigned to Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} {sprint.isActive ? '(Active)' : '(Completed)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Backlog Items */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading backlog items...</p>
            </div>
          </div>
        ) : Object.keys(cardGroups).length === 0 || Object.values(cardGroups).every(group => group.length === 0) ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No backlog items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {selectedSprintFilter === 'all' 
                  ? "No items in your backlog yet. Create your first issue to get started."
                  : selectedSprintFilter === 'unassigned'
                  ? "No unassigned items found. All items are assigned to sprints."
                  : "No items found for the selected sprint."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(cardGroups).map(([groupKey, groupCards]) => {
              if (groupCards.length === 0) return null;
              
              const isUnassigned = groupKey === 'unassigned';
              const sprint = isUnassigned ? null : sprints.find(s => s.id === groupKey);
              const groupTitle = isUnassigned ? 'Backlog (Unassigned)' : 
                                sprint ? `${sprint.name} ${sprint.isActive ? '(Active)' : '(Completed)'}` : 
                                'Unknown Sprint';
              
              return (
                <div key={groupKey} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* Group Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {groupTitle}
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({groupCards.length} {groupCards.length === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Group Items */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {groupCards.map((card) => (
                      <div key={card.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Flag className={`h-3 w-3 ${
                                card.priority === 1 ? 'text-red-500' :
                                card.priority === 2 ? 'text-orange-500' :
                                card.priority === 3 ? 'text-yellow-500' :
                                card.priority === 4 ? 'text-green-500' :
                                'text-blue-500'
                              }`} />
                              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(card.priority)}`}>
                                P{card.priority}
                              </span>
                              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getStatusColor(card.status)}`}>
                                {card.status.replace('_', ' ')}
                              </span>
                              {card.isAiAllowedTask && (
                                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                  AI
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                              {card.title}
                            </h3>
                            
                            {card.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1">
                                {card.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                {card.createdAt.toLocaleDateString()}
                              </span>
                              {card.storyPoints && (
                                <span>
                                  {card.storyPoints}pt
                                </span>
                              )}
                              {card.assignee && (
                                <span>
                                  {card.assignee.name || card.assignee.email?.split('@')[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}