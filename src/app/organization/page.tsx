'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUserOrganizations, getOrganizationMembers, inviteUserToOrganization } from '@/lib/organization-functions';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
}

interface OrganizationMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
  inviter: {
    name: string | null;
    email: string;
  };
}

export default function OrganizationSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProUser, setIsProUser] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    try {
      const userId = session?.user?.id;
      const userWithOrg = session?.user as {
        id?: string;
        organizationId?: string;
      };
      const userOrgId = userWithOrg?.organizationId;
      
      if (!userId) {
        setError('User session not found');
        setLoading(false);
        return;
      }
      
      const result = await getUserOrganizations(userId, userOrgId);
      if (result.success && result.organizations) {
        setOrganizations(result.organizations);
        if (result.organizations.length > 0) {
          setSelectedOrg(result.organizations[0].id);
        }
      } else {
        setError(result.error || 'Failed to load organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Check if user has Pro subscription
      const userWithSubscription = session.user as {
        id?: string;
        subscriptionTier?: string;
        subscriptionStatus?: string;
        organizationId?: string;
      };
      const userTier = userWithSubscription.subscriptionTier || 'hobby';
      const userStatus = userWithSubscription.subscriptionStatus;
      setIsProUser(userTier === 'pro' && userStatus === 'active');
      
      if (userTier === 'pro' && userStatus === 'active') {
        fetchOrganizations();
      } else {
        setLoading(false);
      }
    }
  }, [status, router, session, fetchOrganizations]);

  const fetchMembers = useCallback(async (orgId: string) => {
    if (!orgId || !session?.user?.id) return;
    
    setMemberLoading(true);
    setError('');
    try {
      const result = await getOrganizationMembers(orgId, session.user.id);
      if (result.success) {
        setMembers(result.members || []);
        setPendingInvitations(result.pendingInvitations || []);
      } else {
        setError(result.error || 'Failed to load organization members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load organization members');
    } finally {
      setMemberLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (selectedOrg) {
      fetchMembers(selectedOrg);
    }
  }, [selectedOrg, fetchMembers]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !selectedOrg || !session?.user?.id) return;

    setInviteLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await inviteUserToOrganization(
        selectedOrg, 
        newMemberEmail.trim(), 
        session.user.id, 
        session.user.name
      );

      if (result.success) {
        if (result.user) {
          setSuccessMessage(`User ${newMemberEmail} successfully added to organization!`);
        } else if (result.invitation) {
          setSuccessMessage(`Invitation sent successfully! Share this link with ${newMemberEmail}: ${window.location.origin}${result.invitation.invitationLink}`);
        }
        setNewMemberEmail('');
        // Refresh members list
        await fetchMembers(selectedOrg);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setError('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show Pro upgrade prompt for non-Pro users
  if (!isProUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full mb-6">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Organization Management is a Pro Feature
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Upgrade to Pro to invite team members, manage organization settings, and collaborate with your team.
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Pro Plan Benefits
                </h2>
                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Unlimited team members</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Organization-wide project sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Advanced collaboration features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Priority support</span>
                  </li>
                </ul>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  $5<span className="text-base font-normal text-slate-600 dark:text-slate-300">/month</span>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/subscribe"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Upgrade to Pro
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all"
                >
                  Back to Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Organization Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your organization members and settings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          {/* Organization Selector */}
          {organizations.length > 1 && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Invite Member Section */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Invite Team Member
            </h2>
            <form onSubmit={handleInviteMember} className="flex gap-3">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={inviteLoading || !newMemberEmail.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Inviting...' : 'Invite'}
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Organization Members
            </h2>
            
            {memberLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {member.image ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name || 'Member'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {member.name || 'No name set'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 py-8 text-center">
                No members found. Invite team members to collaborate on projects.
              </p>
            )}

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Pending Invitations
                </h3>
                <div className="space-y-3">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Invited by {invitation.inviter.name || invitation.inviter.email} • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}