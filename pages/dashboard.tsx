import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  tokens: number;
  reputation: number;
  skills_known: any[];
  skills_learning: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
  }, [router]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data.user);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Skill-Setu</title>
      </Head>
      <Layout>
        {/* Header Section - LeetCode Style */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="text-purple-600 dark:text-purple-400">{user?.name}</span>! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your learning and teaching journey</p>
        </div>

        {/* Stats Cards - LeetCode Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Skills Learning</span>
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{user?.skills_learning.length || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Skills Teaching</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{user?.skills_known.length || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tokens</span>
              <span className="text-2xl">🪙</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{user?.tokens || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Reputation</span>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{user?.reputation || 0}</div>
          </div>
        </div>

        {/* Quick Actions - LeetCode Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/match"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">🔍</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Find Matches</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Match with teachers and learners for skills</p>
          </Link>

          <Link
            href="/sessions"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">🎥</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Live Sessions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start or join live video learning sessions</p>
          </Link>

          <Link
            href="/courses"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">📖</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Courses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Browse and enroll in skill courses</p>
          </Link>

          <Link
            href="/create-course"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">➕</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Create Course</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create and publish your own course</p>
          </Link>

          <Link
            href="/tracker"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">📊</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Learning Tracker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress with AI insights</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">👤</div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Profile</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View and edit your skill passport</p>
          </Link>
        </div>
      </Layout>
    </>
  );
}
