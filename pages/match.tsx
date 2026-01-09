import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Match() {
  const router = useRouter();
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('Tech');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingMatches();
  }, []);

  const fetchPendingMatches = async () => {
    try {
      const response = await api.get('/skills/match');
      setPendingMatches(response.data.matches || []);
    } catch (error: any) {
      console.error('Failed to fetch pending matches');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) {
      toast.error('Please enter a skill to search');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/skills/match', { skill, category });
      setMatches(response.data.matches || []);
      if (response.data.matches.length === 0) {
        toast('No matches found for this skill', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (matchId: string, skillName: string) => {
    try {
      const response = await api.post('/session/create', {
        matchId,
        skill: skillName,
        category,
      });
      toast.success('Session created! 🎉');
      router.push(`/session/${response.data.session.sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create session');
    }
  };

  return (
    <>
      <Head>
        <title>Find Matches - Skill-Setu</title>
      </Head>
      <Layout>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🔍 Find Skill Matches</h1>

          {/* Search Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Enter skill you want to learn (e.g., JavaScript, Guitar, Cooking)"
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Tech">Tech</option>
                <option value="Creative">Creative</option>
                <option value="Music">Music</option>
                <option value="Cooking">Cooking</option>
                <option value="Languages">Languages</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Practical">Practical</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Pending Matches */}
          {pendingMatches.length > 0 && (
              <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingMatches.map((match) => (
                  <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {(() => {
                            try {
                              const userStr = localStorage.getItem('user');
                              if (!userStr) return match.teacher?.name || match.learner?.name;
                              const user = JSON.parse(userStr);
                              const currentUserId = user?._id || '';
                              const isLearner = match.learner?._id === currentUserId || match.learner?.toString() === currentUserId;
                              return isLearner ? match.teacher?.name : match.learner?.name;
                            } catch {
                              return match.teacher?.name || match.learner?.name;
                            }
                          })()}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{match.skill}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                        {match.matchScore}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{match.reason}</p>
                    <button
                      onClick={() => handleCreateSession(match._id, match.skill)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                    >
                      Create Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {matches.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{match.user.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{match.skill}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                        {match.match_score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{match.reason}</p>
                    <button
                      onClick={() => {
                        toast('Creating match...', { icon: '⏳' });
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                    >
                      Request Match
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
      </Layout>
    </>
  );
}
