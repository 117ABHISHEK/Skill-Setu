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
      const response = await api.get('/notifications'); // Notifications already contains counts
      const res = await api.get('/skills/match');
      setPendingMatches(res.data.matches || []);
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
        toast('No matches found for this skill', { icon: '🔭' });
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
      toast.success('Session Synchronized! 🎥');
      router.push(`/session/${response.data.session.sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate session');
    }
  };

  return (
    <>
      <Head>
        <title>Match | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto py-8 lg:py-12 pb-32 space-y-16 page-transition">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
               <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-3">
                 Target <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">Expertise</span>
               </h1>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Quantum matching between nodes of knowledge</p>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="p-6 bg-white dark:bg-[#0F1115] rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Active Nodes</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 italic">1,280+</div>
              </div>
            </div>
          </div>

          {/* Search Bar - Premium UI */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
               <div className="relative flex flex-col md:flex-row gap-4 p-3 bg-white dark:bg-[#0F1115] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                 <div className="flex-1 relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">🔍</span>
                    <input
                     type="text"
                     value={skill}
                     onChange={(e) => setSkill(e.target.value)}
                     placeholder="What do you want to master today?"
                     className="w-full pl-20 pr-8 py-6 bg-transparent border-none focus:outline-none dark:text-white font-black italic text-lg placeholder:text-gray-400 tracking-tight"
                   />
                 </div>
                 <div className="h-10 w-[1px] bg-gray-100 dark:bg-white/5 hidden md:block self-center"></div>
                 <select
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   className="px-8 py-6 bg-transparent border-none focus:outline-none dark:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                 >
                   {['Tech', 'Creative', 'Music', 'Cooking', 'Languages', 'Soft Skills'].map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                 </select>
                 <button
                   type="submit"
                   disabled={loading}
                   className="px-12 py-6 bg-purple-600 text-white rounded-[1.8rem] font-black tracking-[0.2em] uppercase text-[10px] hover:bg-purple-700 shadow-xl shadow-purple-500/20 active:scale-95 transition-all text-center"
                 >
                   {loading ? 'SCALING...' : 'SCAN NETWORK'}
                 </button>
               </div>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Matches List */}
            <div className="lg:col-span-8 space-y-8">
               <div className="flex items-center gap-4 px-4">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                     {skill ? `Potential Hits for "${skill}"` : 'AI Predictive Matches'}
                  </h2>
               </div>

               {loading && matches.length === 0 ? (
                 <Loading message="Triangulating expertise..." />
               ) : matches.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {matches.map((match, index) => (
                     <div key={index} className="group relative bg-white dark:bg-[#0F1115] rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 hover:shadow-3xl transition-all hover:-translate-y-2 overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                           <span className="text-9xl">💎</span>
                        </div>
                        
                        <div className="flex-1 relative z-10">
                           <div className="flex flex-col gap-6 mb-8">
                             <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                {match.user.name.charAt(0)}
                             </div>
                             <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter leading-none mb-1">{match.user.name}</h3>
                                <div className="flex items-center gap-3">
                                   <span className="text-teal-500 text-[10px] font-black uppercase tracking-widest">★ {match.user.reputation} Trust</span>
                                   <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                   <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Match Score: {match.match_score}%</span>
                                </div>
                             </div>
                           </div>

                           <p className="text-sm text-gray-600 dark:text-gray-400 italic font-medium leading-[1.6] mb-10 opacity-80">
                             "{match.reason}"
                           </p>
                        </div>

                        <button
                          onClick={() => {
                            toast.success('Signal Transmitted!');
                            fetchPendingMatches();
                          }}
                          className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white transition-all shadow-xl mt-auto"
                        >
                          Send Request →
                        </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-24 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[4rem] border border-dashed border-gray-200 dark:border-white/5">
                   <span className="text-8xl mb-10 block grayscale opacity-20 animate-float">🔭</span>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter mb-2">Zero Matches Detected</h3>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] max-w-[280px] mx-auto italic opacity-70">Expand your search parameters or update your node bio.</p>
                 </div>
               )}
            </div>

            {/* Action Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="sticky top-32 space-y-8">
                  <div className="flex items-center justify-between px-4">
                     <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Queue</h2>
                     <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-lg">{pendingMatches.length}</span>
                  </div>

                  <div className="space-y-6">
                    {pendingMatches.map((match) => (
                      <div key={match._id} className="bg-white dark:bg-[#0F1115] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-xl hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-5 mb-8">
                           <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 font-black italic shadow-inner">
                              {match.skill.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-black text-gray-900 dark:text-white truncate italic uppercase tracking-tighter">
                                {match.teacher?.name || match.learner?.name || 'Protocol User'}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{match.skill}</p>
                           </div>
                        </div>
                        <button
                          onClick={() => handleCreateSession(match._id, match.skill, match.skillCategory)}
                          className="w-full py-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all"
                        >
                          Sync Now
                        </button>
                      </div>
                    ))}
                    {pendingMatches.length === 0 && (
                      <div className="p-12 text-center bg-white dark:bg-white/[0.01] rounded-[3rem] border border-gray-100 dark:border-white/10 opacity-60">
                         <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] leading-loose">
                            Queue Empty<br/>Awaiting Inbound Requests
                         </p>
                      </div>
                    )}
                  </div>

                  <div className="p-10 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                     <div className="absolute -bottom-10 -right-10 text-[10rem] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">🎖️</div>
                     <div className="relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Protocol Tip</h4>
                        <p className="text-sm font-black italic leading-relaxed mb-8 opacity-90 tracking-tight">"High reputation nodes attract 3x more targeted matches."</p>
                        <button onClick={() => router.push('/profile')} className="text-[9px] font-black uppercase tracking-[0.4em] py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all">Refine Identity</button>
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
