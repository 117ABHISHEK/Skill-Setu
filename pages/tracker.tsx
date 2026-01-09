import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Tracker() {
  const router = useRouter();
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracker();
  }, []);

  const fetchTracker = async () => {
    try {
      const response = await api.get('/learning/tracker');
      setTracker(response.data.tracker);
    } catch (error: any) {
      toast.error('Failed to load tracker');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading your progress...</div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Learning Tracker - Skill-Setu</title>
      </Head>
      <Layout>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Learning Tracker</h1>

          {/* Stats */}
          {tracker?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Courses Completed</span>
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{tracker.stats.totalCoursesCompleted}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Sessions Attended</span>
                  <span className="text-2xl">🎥</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{tracker.stats.totalSessionsAttended}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total XP</span>
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">{tracker.stats.totalXP}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Day Streak</span>
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="text-3xl font-bold text-teal-600">{tracker.stats.currentStreak}</div>
              </div>
            </div>
          )}

          {/* AI Advice */}
          {tracker?.advice && (
            <div className="bg-purple-600 rounded-lg border border-purple-700 p-6 mb-6 text-white">
              <h2 className="text-xl font-semibold mb-3">🤖 AI-Powered Advice</h2>
              <p className="text-base whitespace-pre-line leading-relaxed">{tracker.advice}</p>
            </div>
          )}

          {/* Progress by Skill */}
          {tracker?.progress && tracker.progress.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Progress</h2>
              <div className="space-y-4">
                {tracker.progress.map((skill: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{skill.skill}</h3>
                      <span className="text-purple-600 font-medium">{skill.xpEarned} XP</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Courses: </span>
                        <span className="font-semibold text-gray-900">{skill.coursesCompleted}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sessions: </span>
                        <span className="font-semibold text-gray-900">{skill.sessionsAttended}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Streak: </span>
                        <span className="font-semibold text-gray-900">{skill.streak} days</span>
                      </div>
                    </div>
                    {skill.badges.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {skill.badges.map((badge: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </Layout>
    </>
  );
}
