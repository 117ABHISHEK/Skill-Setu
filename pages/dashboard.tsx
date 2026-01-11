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
        <div className="max-w-7xl mx-auto space-y-12 pb-24 page-transition">
          {/* Hero / Welcome Section */}
          <div className="relative overflow-hidden rounded-[3rem] bg-[#050505] p-12 lg:p-16 border border-white/5 shadow-2xl group animate-in">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 transition-opacity group-hover:opacity-60"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      Skill Passport Authorized
                   </div>
                   <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 leading-none uppercase">
                      READY FOR<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">MOD_GROWTH?</span>
                   </h1>
                   <p className="text-gray-400 font-bold text-sm max-w-sm mb-0 uppercase tracking-widest italic opacity-70">Authenticated as: {user?.name}</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6">
                   <div className="bg-white/5 border border-white/10 backdrop-blur-3xl p-10 rounded-[2.5rem] text-center min-w-[160px] shadow-2xl group hover:border-purple-500/30 transition-all hover:-translate-y-2">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Currency</div>
                      <div className="text-4xl font-black text-purple-400 italic group-hover:scale-110 transition-transform">🪙 {user?.tokens || 0}</div>
                   </div>
                   <div className="bg-white/5 border border-white/10 backdrop-blur-3xl p-10 rounded-[2.5rem] text-center min-w-[160px] shadow-2xl group hover:border-teal-500/30 transition-all hover:-translate-y-2">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Reputation</div>
                      <div className="text-4xl font-black text-teal-400 italic group-hover:scale-110 transition-transform">⭐ {user?.reputation || 0}</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Connection Requests Section */}
          {pendingMatches.length > 0 && (
            <section className="animate-in" style={{ animationDelay: '0.1s' }}>
               <div className="flex items-center justify-between mb-10 px-4">
                  <div className="flex items-center gap-6">
                     <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Transmission Requests</h2>
                     <span className="flex h-8 w-8 items-center justify-center bg-red-500 text-white text-xs font-black rounded-lg shadow-lg shadow-red-500/40 animate-bounce">{pendingMatches.length}</span>
                  </div>
                  <Link href="/match" className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em] hover:underline flex items-center gap-2">Protocol Override →</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingMatches.slice(0, 3).map((match) => (
                    <div key={match._id} className="relative group bg-white dark:bg-[#0F1115] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 hover:shadow-3xl transition-all overflow-hidden">
                       <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-all"></div>
                       <div className="flex flex-col gap-8 relative z-10">
                          <div className="flex items-center justify-between">
                             <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                {match.skill.charAt(0)}
                             </div>
                             <div className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-500/20">Awaiting Signal</div>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-1">
                                {match.teacher?._id === user?._id ? match.learner?.name : match.teacher?.name}
                             </h4>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.skill}</p>
                          </div>
                          <Link 
                             href={`/match`}
                             className="w-full py-5 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] group-hover:bg-purple-600 dark:group-hover:bg-purple-500 dark:group-hover:text-white transition-all shadow-xl"
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
          <section className="animate-in" style={{ animationDelay: '0.2s' }}>
             <div className="mb-12 px-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-3">Modular Access</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] opacity-60 italic">"Efficiency is the result of proper node navigation"</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="group bg-white dark:bg-[#0F1115] p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/5 hover:shadow-3xl hover:-translate-y-3 transition-all flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.02] to-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-24 h-24 mb-10 bg-gray-50 dark:bg-black rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-gray-100 dark:border-white/5">
                       {action.icon}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 italic tracking-tighter uppercase leading-none">{action.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed max-w-[200px] italic">"{action.desc}"</p>
                  </Link>
                ))}
             </div>
          </section>

          <div className="h-20"></div>
        </div>
      </Layout>
    </>
  );
}
