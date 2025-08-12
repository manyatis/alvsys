'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Folder, Users, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
  _count?: {
    cards: number;
  };
  createdAt: string;
}

interface UsageStatus {
  tier: 'FREE' | 'INDIE' | 'PROFESSIONAL';
  usage: {
    canCreateCard: boolean;
    canCreateProject: boolean;
    dailyCardsUsed: number;
    dailyCardsLimit: number;
    projectsUsed: number;
    projectsLimit: number;
    resetTime: Date;
  };
  isAtCardLimit: boolean;
  isAtProjectLimit: boolean;
}

export default function ProjectsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    projectName: '',
    useExistingOrg: false,
    organizationId: ''
  });
  const [organizations, setOrganizations] = useState<{id: string, name: string}[]>([]);
  const [creating, setCreating] = useState(false);
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);

  useEffect(() => {
    console.log('Projects page - Auth status:', status);
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchProjects();
      fetchOrganizations();
      fetchUsageStatus();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchUsageStatus = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageStatus(data);
      }
    } catch (error) {
      console.error('Error fetching usage status:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: formData.useExistingOrg ? undefined : formData.organizationName,
          organizationId: formData.useExistingOrg ? formData.organizationId : undefined,
          projectName: formData.projectName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/projects/${data.project.id}/board`);
      } else {
        const error = await response.json();
        if (response.status === 429) {
          alert(`${error.error}\nYou have ${error.usageLimit.used}/${error.usageLimit.limit} projects.`);
        } else {
          alert(error.error || 'Failed to create project');
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Projects
            </h1>
            {usageStatus && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {usageStatus.tier} Plan • {usageStatus.usage.projectsUsed}/{usageStatus.usage.projectsLimit} projects • {usageStatus.usage.dailyCardsUsed}/{usageStatus.usage.dailyCardsLimit} daily cards
              </div>
            )}
          </div>
          <div>
            {usageStatus?.isAtProjectLimit && (
              <div className="mb-2 text-sm text-red-600 dark:text-red-400">
                Project limit reached ({usageStatus.usage.projectsUsed}/{usageStatus.usage.projectsLimit})
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={usageStatus?.isAtProjectLimit}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first project to get started with VibeHero
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={usageStatus?.isAtProjectLimit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}/board`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <Folder className="h-8 w-8 text-purple-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {project._count?.cards || 0} issues
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Users className="h-4 w-4" />
                  {project.organization.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 max-w-md w-full mx-2 md:mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.useExistingOrg}
                    onChange={(e) => setFormData({ ...formData, useExistingOrg: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Use existing organization
                  </span>
                </label>

                {formData.useExistingOrg ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Organization
                    </label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Choose an organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="My Company"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}