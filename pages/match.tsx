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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPendingMatches(),
      fetchRecommendations()
    ]);
    setLoading(false);
  };

  const fetchPendingMatches = async () => {
    try {
      const response = await api.get('/skills/match');
      setPendingMatches(response.data.matches || []);
    } catch (error: any) {
      console.error('Failed to fetch pending matches');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.post('/skills/match', {});
      setMatches(response.data.matches || []);
    } catch (error: any) {
      console.error('Failed to fetch recommendations');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) {
      fetchRecommendations();
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

  const handleCreateSession = async (matchId: string, skillName: string, skillCategory: string) => {
    try {
      const response = await api.post('/sessions/create', {
        matchId,
        skill: skillName,
        category: skillCategory,
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
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500">Perfect Match</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Connect with experts who want to share what you want to learn.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Active Learners</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white">1,280</div>
              </div>
            </div>
          </div>

          {/* Search Bar - Premium Style */}
          <div className="relative mb-12">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex-1 relative">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                 <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="What do you want to master today? (e.g. JavaScript, Guitar)"
                  className="w-full pl-14 pr-6 py-5 bg-transparent border-none focus:outline-none dark:text-white font-medium text-lg placeholder:text-gray-400"
                />
              </div>
              <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block self-center"></div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-6 py-5 bg-transparent border-none focus:outline-none dark:text-white font-bold text-gray-700 appearance-none cursor-pointer"
              >
                {['Tech', 'Creative', 'Music', 'Cooking', 'Languages', 'Soft Skills', 'Practical'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[1.5rem] font-black hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? '...' : 'FIND EXPERTS'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <div className="mb-8 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                    {skill ? `Matches for "${skill}"` : 'AI Recommendations'}
                 </h2>
                 <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time matching active</span>
                 </div>
              </div>

              {loading && matches.length === 0 ? (
                <Loading message="Finding experts..." />
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((match, index) => (
                    <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                          <span className="text-8xl">💎</span>
                       </div>
                       
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                               {match.user.name.charAt(0)}
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Match Score</div>
                               <div className="text-3xl font-black text-gray-900 dark:text-white">{match.match_score}%</div>
                            </div>
                          </div>

                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{match.user.name}</h3>
                          <div className="flex items-center gap-2 mb-4">
                             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match.user.skills_known[0]?.name || 'Expert'}</span>
                             <span className="text-teal-500 text-xs font-bold">★ {match.user.reputation} Reputation</span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-8 font-medium italic leading-relaxed">
                            "{match.reason}"
                          </p>

                          <button
                            onClick={() => {
                              toast.success('Match request sent!');
                              fetchPendingMatches();
                            }}
                            className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white transition-all active:scale-95"
                          >
                            REQUEST TO CONNECT
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-6xl mb-6 block">🔭</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">No matches found yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm">Update your learning list or try searching for a broader skill.</p>
                </div>
              )}
            </div>

            {/* Sidebar with Pending Matches */}
            <div className="lg:col-span-4">
               <div className="sticky top-24">
                  <div className="mb-8 flex items-center gap-3">
                     <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Connection Requests</h2>
                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                        {pendingMatches.length}
                     </span>
                  </div>

                  <div className="space-y-4">
                    {pendingMatches.map((match) => (
                      <div key={match._id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 font-bold">
                              {match.skill.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                                {(() => {
                                  try {
                                    const userStr = localStorage.getItem('user');
                                    if (!userStr) return match.teacher?.name || match.learner?.name;
                                    const user = JSON.parse(userStr);
                                    const currentUserId = user?._id || '';
                                    const isLearner = match.learner?._id === currentUserId || match.learner?.toString() === currentUserId;
                                    return isLearner ? match.teacher?.name : match.learner?.name;
                                  } catch { return 'User'; }
                                })()}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{match.skill}</p>
                           </div>
                           <div className="text-xs font-black text-purple-600">{match.matchScore}%</div>
                        </div>
                        <button
                          onClick={() => handleCreateSession(match._id, match.skill, match.skillCategory)}
                          className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                        >
                          Schedule Session
                        </button>
                      </div>
                    ))}
                    {pendingMatches.length === 0 && (
                      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-loose">
                            Waiting for your first connection...<br/>Start a search to get noticed!
                         </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute -bottom-4 -right-4 text-7xl opacity-20 rotate-12">🎖️</div>
                     <div className="relative z-10">
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2">Pro Tip</h4>
                        <p className="text-xs font-medium leading-relaxed opacity-90 mb-4">Users with a clear bio and verified skills are 3x more likely to be matched!</p>
                        <button onClick={() => router.push('/profile')} className="text-[10px] font-black uppercase tracking-tighter underline">Complete Profile →</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
