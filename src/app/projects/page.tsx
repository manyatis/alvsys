'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Folder, Users, Calendar, Github, Zap, CheckCircle, XCircle } from 'lucide-react';
import GitHubRepositorySelector from '@/components/GitHubRepositorySelector';
import { getUserUsage } from '@/lib/usage-functions';
import { getUserProjects, createProject } from '@/lib/project-functions';
import { getUserOrganizations } from '@/lib/organization-functions';
import { createProjectFromRepository } from '@/lib/github-actions';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  } | null;
  _count?: {
    cards: number;
  };
  createdAt: Date;
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
    resetTime: Date | null;
  };
  isAtCardLimit: boolean;
  isAtProjectLimit: boolean;
}

type CreationMode = 'select' | 'vibes' | 'github';

function ProjectsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationMode>('select');
  const [formData, setFormData] = useState({
    organizationName: '',
    projectName: '',
    useExistingOrg: false,
    organizationId: '',
    githubRepo: '',
    githubInstallationId: ''
  });
  const [organizations, setOrganizations] = useState<{id: string, name: string}[]>([]);
  const [creating, setCreating] = useState(false);
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [installationMessage, setInstallationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    console.log('Projects page - Auth status:', status);
    if (status === 'unauthenticated') {
      signIn(undefined, { callbackUrl: '/projects' });
    } else if (status === 'authenticated') {
      fetchProjects();
      fetchOrganizations();
      fetchUsageStatus();
      
      // Check for GitHub installation callback parameters
      const githubInstalled = searchParams.get('github_installed');
      const installationId = searchParams.get('installation_id');
      const error = searchParams.get('error');
      
      if (githubInstalled === 'true' && installationId) {
        setInstallationMessage({
          type: 'success',
          message: 'GitHub App installed successfully! You can now create projects from your repositories.',
        });
        // Open GitHub modal automatically after installation
        setTimeout(() => setShowGitHubModal(true), 1500);
      } else if (githubInstalled === 'false' || error === 'cancelled') {
        setInstallationMessage({
          type: 'error',
          message: 'GitHub App installation was cancelled. You can try again when you\'re ready.',
        });
      } else if (error === 'installation_failed') {
        setInstallationMessage({
          type: 'error',
          message: 'GitHub App installation failed. Please try again.',
        });
      }
      
      // Clear the URL parameters after processing
      if (githubInstalled || error) {
        router.replace('/projects');
      }
    }
  }, [status, router, searchParams]);

  const fetchProjects = async () => {
    try {
      const result = await getUserProjects();
      if (result.success && result.projects) {
        setProjects(result.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const result = await getUserOrganizations(session?.user?.id || 'anonymous');
      if (result.success && result.organizations) {
        setOrganizations(result.organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchUsageStatus = async () => {
    try {
      const result = await getUserUsage(session?.user?.id || 'anonymous');
      if (result.success && result.usage) {
        setUsageStatus(result.usage);
      }
    } catch (error) {
      console.error('Error fetching usage status:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const result = await createProject({
        organizationName: formData.useExistingOrg ? undefined : formData.organizationName,
        organizationId: formData.useExistingOrg ? formData.organizationId : undefined,
        projectName: formData.projectName,
      });

      if (result.success && result.project) {
        setShowCreateModal(false);
        setCreationMode('select');
        setFormData({
          organizationName: '',
          projectName: '',
          useExistingOrg: false,
          organizationId: '',
          githubRepo: '',
          githubInstallationId: ''
        });
        router.push(`/projects/${result.project.id}/board`);
      } else {
        alert(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleGitHubRepositorySelect = async (repo: { 
    id: number; 
    name: string; 
    full_name: string; 
    description: string | null; 
    private: boolean; 
    html_url: string; 
    default_branch: string; 
  }, installationId: number) => {
    if (!session?.user?.id) {
      alert('You must be logged in to create a project');
      return;
    }
    
    setCreating(true);
    try {
      const result = await createProjectFromRepository(
        repo.full_name,
        repo.description || undefined,
        installationId,
        true, // syncIssues
        session.user.id
      );

      if (result.success && result.project) {
        router.push(`/projects/${result.project.id}/board`);
      } else {
        alert(result.error || 'Failed to create project from GitHub repository');
      }
    } catch (error) {
      console.error('Error creating project from GitHub:', error);
      alert('Failed to create project from GitHub repository');
    } finally {
      setCreating(false);
      setShowGitHubModal(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreationMode('select');
    setFormData({
      organizationName: '',
      projectName: '',
      useExistingOrg: false,
      organizationId: '',
      githubRepo: '',
      githubInstallationId: ''
    });
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
        {/* GitHub Installation Message */}
        {installationMessage && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            installationMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {installationMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>{installationMessage.message}</span>
            <button
              onClick={() => setInstallationMessage(null)}
              className="ml-auto text-sm hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* {usageStatus && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {usageStatus.tier} Plan • {usageStatus.usage.projectsUsed}/{usageStatus.usage.projectsLimit} projects • {usageStatus.usage.dailyCardsUsed}/{usageStatus.usage.dailyCardsLimit} daily cards
              </div>
            )} */}
          </div>
          <div className="flex gap-3">
            {usageStatus?.isAtProjectLimit && (
              <div className="mb-2 text-sm text-red-600 dark:text-red-400">
                Project limit reached ({usageStatus.usage.projectsUsed}/{usageStatus.usage.projectsLimit})
              </div>
            )}
            <button
              onClick={openCreateModal}
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
            <div className="flex justify-center">
              <button
                onClick={openCreateModal}
                disabled={usageStatus?.isAtProjectLimit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                New Project
              </button>
            </div>
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
                  {project.organization?.name || 'No Organization'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {project.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && creationMode === 'select' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 max-w-md w-full mx-2 md:mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Project
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setCreationMode('vibes')}
                className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      New VibeHero Project
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Start fresh with a new project
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowGitHubModal(true)}
                className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <Github className="h-6 w-6 text-gray-700 dark:text-gray-300 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Link from GitHub
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Import issues from a GitHub repository
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreationMode('select');
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VibeHero Project Form */}
      {showCreateModal && creationMode === 'vibes' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 max-w-md w-full mx-2 md:mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              New VibeHero Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group-professional">
                {organizations.length > 0 ? (
                  <>
                    <label className="form-label-professional form-label-professional-required">
                      Organization
                    </label>
                    <select
                      value={formData.useExistingOrg ? formData.organizationId : 'new'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'new') {
                          setFormData({ ...formData, useExistingOrg: false, organizationId: '' });
                        } else {
                          setFormData({ ...formData, useExistingOrg: true, organizationId: value });
                        }
                      }}
                      className="select-professional"
                      required={formData.useExistingOrg}
                    >
                      {formData.useExistingOrg && <option value="">Choose an organization</option>}
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                      <option value="new">+ Create new organization</option>
                    </select>
                    
                    {!formData.useExistingOrg && (
                      <div className="form-group-professional mt-4">
                        <label className="form-label-professional form-label-professional-required">
                          New Organization Name
                        </label>
                        <input
                          type="text"
                          value={formData.organizationName}
                          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                          className="input-professional"
                          placeholder="My Company"
                          required
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="form-label-professional form-label-professional-required">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="input-professional"
                      placeholder="My Company"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group-professional">
                <label className="form-label-professional form-label-professional-required">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="input-professional"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreationMode('select')}
                  className="btn-professional-secondary"
                  disabled={creating}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-professional-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Repository Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-2 md:mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Link from GitHub Repository
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <GitHubRepositorySelector
                onRepositorySelect={handleGitHubRepositorySelect}
                onCancel={() => setShowGitHubModal(false)}
                loading={creating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}