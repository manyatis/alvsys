'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Flag } from 'lucide-react';
import { useSprints } from '@/hooks/useSprints';

interface Card {
  id: string;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  status: string;
  priority: number;
  storyPoints: number | null;
  sprintId: string | null;
  isAiAllowedTask: boolean;
  createdAt: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

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
        const response = await fetch(`/api/projects/${resolvedParams.id}/cards`);
        if (response.ok) {
          const data = await response.json();
          setCards(data);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [resolvedParams.id]);

  const filteredCards = cards.filter(card => {
    if (selectedSprintFilter === 'all') return true;
    if (selectedSprintFilter === 'unassigned') return !card.sprintId;
    return card.sprintId === selectedSprintFilter;
  });

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
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
        ) : filteredCards.length === 0 ? (
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
          <div className="space-y-3">
            {filteredCards.map((card) => {
              const sprint = sprints.find(s => s.id === card.sprintId);
              return (
                <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-4 w-4 ${
                            card.priority === 1 ? 'text-red-500' :
                            card.priority === 2 ? 'text-orange-500' :
                            card.priority === 3 ? 'text-yellow-500' :
                            card.priority === 4 ? 'text-green-500' :
                            'text-blue-500'
                          }`} />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(card.priority)}`}>
                            P{card.priority}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(card.status)}`}>
                          {card.status.replace('_', ' ')}
                        </span>
                        {card.isAiAllowedTask && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            AI Task
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                        {card.title}
                      </h3>
                      
                      {card.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Created {new Date(card.createdAt).toLocaleDateString()}
                        </span>
                        {card.storyPoints && (
                          <span>
                            {card.storyPoints} story points
                          </span>
                        )}
                        {card.assignee && (
                          <span>
                            Assigned to {card.assignee.name || card.assignee.email}
                          </span>
                        )}
                        {sprint && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {sprint.name} {sprint.isActive ? '(Active)' : '(Completed)'}
                          </span>
                        )}
                        {!card.sprintId && (
                          <span className="text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
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