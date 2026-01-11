import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

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
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([fetchUser(), fetchPendingMatches()]).finally(() => setLoading(false));
  }, [router]);

  const fetchPendingMatches = async () => {
    try {
      const response = await api.get('/skills/match');
      setPendingMatches(response.data.matches || []);
    } catch (error) {
      console.error('Failed to fetch pending matches');
    }
  };

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
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const quickActions = [
    { name: 'Find Matches', href: '/match', icon: '🔍', color: 'purple', desc: 'Match with targeted teachers' },
    { name: 'Live Sessions', href: '/sessions', icon: '🎥', color: 'teal', desc: 'Join active video learning' },
    { name: 'Courses', href: '/courses', icon: '📖', color: 'indigo', desc: 'Browse curated skill paths' },
    { name: 'Create Course', href: '/create-course', icon: '➕', color: 'blue', desc: 'Publish your own expertise' },
    { name: 'Learning Tracker', href: '/tracker', icon: '📊', color: 'emerald', desc: 'AI-driven progress insights' },
    { name: 'Profile', href: '/profile', icon: '👤', color: 'gray', desc: 'Manage your skill identity' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
          {/* Hero / Welcome Section */}
          <div className="relative overflow-hidden rounded-[3rem] bg-[#050505] p-12 lg:p-16 border border-white/5 shadow-2xl">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      Skill Passport Active
                   </div>
                   <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4 leading-none">
                      WELCOME BACK,<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{user?.name?.toUpperCase()}</span>
                   </h1>
                   <p className="text-gray-400 font-medium max-w-sm mb-0">Your journey to mastery continues. What's the goal for today?</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                   <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] text-center min-w-[140px] shadow-xl group hover:border-purple-500/30 transition-all">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Tokens</div>
                      <div className="text-4xl font-black text-purple-400 italic group-hover:scale-110 transition-transform">🪙 {user?.tokens || 0}</div>
                   </div>
                   <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] text-center min-w-[140px] shadow-xl group hover:border-teal-500/30 transition-all">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Reputation</div>
                      <div className="text-4xl font-black text-teal-400 italic group-hover:scale-110 transition-transform">⭐ {user?.reputation || 0}</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Connection Requests Section */}
          {pendingMatches.length > 0 && (
            <section>
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Active Connections</h2>
                     <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg">{pendingMatches.length}</span>
                  </div>
                  <Link href="/match" className="text-xs font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-2">View All →</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingMatches.slice(0, 3).map((match) => (
                    <div key={match._id} className="relative group bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-all"></div>
                       <div className="flex flex-col gap-6 relative z-10">
                          <div className="flex items-center justify-between">
                             <div className="w-14 h-14 bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                {match.skill.charAt(0)}
                             </div>
                             <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">Match Pending</div>
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-gray-900 dark:text-white italic tracking-tight mb-1">
                                {match.teacher?._id === user?._id ? match.learner?.name : match.teacher?.name}
                             </h4>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{match.skill}</p>
                          </div>
                          <Link 
                             href={`/match`}
                             className="w-full py-4 text-center bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm"
                          >
                             Respond Now →
                          </Link>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Quick Actions Grid */}
          <section>
             <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Ecosystem Access</h2>
                <p className="text-gray-400 font-medium text-sm mt-1">Jump into any module and start growing.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="group bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-900 transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 mb-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                       {action.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 italic tracking-tight uppercase leading-none">{action.name}</h3>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest leading-relaxed max-w-[180px]">"{action.desc}"</p>
                  </Link>
                ))}
             </div>
          </section>

          {/* Empty Space / Bottom Spacer */}
          <div className="h-10"></div>
        </div>
      </Layout>
    </>
  );
}
