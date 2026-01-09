import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Session {
  _id: string;
  sessionId: string;
  skill: string;
  skillCategory: string;
  status: string;
  teacher: any;
  learner: any;
  startTime?: string;
  endTime?: string;
  duration?: number;
  fraud_flagged: boolean;
  tokenStatus: string;
  final_engagement_score?: number;
  createdAt: string;
}

export default function Sessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'teacher' | 'learner'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user._id) {
          setCurrentUserId(user._id);
        }
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    fetchSessions();
  }, [filter, statusFilter]);

  const fetchSessions = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.role = filter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/sessions', { params });
      setSessions(response.data.sessions || []);
    } catch (error: any) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, fraudFlagged: boolean) => {
    if (fraudFlagged) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          🔴 Fraud Detected
        </span>
      );
    }

    switch (status) {
      case 'created':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Created
          </span>
        );
      case 'live':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            🟢 Live
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            🟡 Under Review
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            ✅ Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const handleJoinSession = (session: Session) => {
    if (session.status === 'created' || session.status === 'live') {
      router.push(`/session/${session.sessionId}`);
    } else {
      toast.error('Session is not active');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Loading your sessions..." />
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>My Sessions - Skill-Setu</title>
      </Head>
      <Layout>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎥 My Sessions</h1>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">As Teacher</option>
                  <option value="learner">As Learner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="under_review">Under Review</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-5xl mb-4">🎥</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No sessions yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start by finding a match and creating a session</p>
              <Link
                href="/match"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Find Matches
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const isTeacher =
                  session.teacher._id === currentUserId ||
                  session.teacher.toString() === currentUserId;
                const otherUser = isTeacher ? session.learner : session.teacher;

                return (
                  <div
                    key={session._id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{session.skill}</h3>
                          {getStatusBadge(session.status, session.fraud_flagged)}
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                            {session.skillCategory}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {isTeacher ? '👨‍🏫 Teaching' : '👨‍🎓 Learning'}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {isTeacher ? 'Teaching' : 'Learning from'}: {otherUser.name || 'Unknown'}
                            </div>
                          </div>
                          {session.startTime && (
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Started</div>
                              <div className="font-medium">{formatDate(session.startTime)}</div>
                            </div>
                          )}
                          {session.duration && (
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Duration</div>
                              <div className="font-medium">{session.duration} minutes</div>
                            </div>
                          )}
                          {session.final_engagement_score !== undefined && (
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Engagement Score</div>
                              <div className="font-medium text-purple-600">
                                {session.final_engagement_score.toFixed(0)}%
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          Created: {formatDate(session.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {(session.status === 'created' || session.status === 'live') && (
                        <button
                          onClick={() => handleJoinSession(session)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                        >
                          {session.status === 'live' ? 'Join Session' : 'Open Session'}
                        </button>
                        )}
                        {session.status === 'completed' && (
                          <div className="text-center">
                            <div className="text-2xl mb-1">✅</div>
                            <div className="text-sm text-gray-600">Completed</div>
                          </div>
                        )}
                        {session.tokenStatus === 'frozen' && (
                          <div className="text-center">
                            <div className="text-2xl mb-1">⚠️</div>
                            <div className="text-sm text-red-600">Tokens Frozen</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </Layout>
    </>
  );
}
