'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { getInvitation, acceptInvitation } from '@/lib/invitation-functions';

interface InvitationDetails {
  id: string;
  email: string;
  organizationName: string;
  inviterName: string;
  expiresAt: string;
}

export default function AcceptInvitationPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [tokenParam, setTokenParam] = useState<string>('');

  useEffect(() => {
    const getToken = async () => {
      const resolvedParams = await params;
      setTokenParam(resolvedParams.token);
    };
    getToken();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (tokenParam) {
        await fetchInvitationDetails();
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenParam]);

  const fetchInvitationDetails = async () => {
    try {
      const result = await getInvitation(tokenParam);
      
      if (result.success && result.invitation) {
        setInvitation(result.invitation);
      } else {
        setError(result.error || 'Failed to load invitation details');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      signIn(undefined, { callbackUrl: `/invite/${tokenParam}` });
      return;
    }

    // If authenticated but email doesn't match, show error
    if (session?.user?.email !== invitation.email) {
      setError(`This invitation is for ${invitation.email}. Please sign in with that email address.`);
      return;
    }

    setAccepting(true);
    setError('');

    try {
      const result = await acceptInvitation(tokenParam);

      if (result.success) {
        // Redirect to projects page after successful acceptance
        router.push('/projects');
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Organization Invitation
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">You&apos;ve been invited to join</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {invitation.organizationName}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Invited by</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {invitation.inviterName}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Invitation for</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {invitation.email}
            </p>
          </div>

          {isExpired && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                This invitation has expired. Please request a new invitation.
              </p>
            </div>
          )}
        </div>

        {error && !isExpired && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!isExpired && (
          <div className="space-y-3">
            {status === 'unauthenticated' ? (
              <button
                onClick={handleAcceptInvitation}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Sign in to Accept
              </button>
            ) : (
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </button>
            )}

            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}