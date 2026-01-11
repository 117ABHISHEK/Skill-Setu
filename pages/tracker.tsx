import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
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
    return <Loading fullScreen />;
  }

  const statsList = [
    { label: 'Knowledge Tracks', value: tracker?.stats?.totalCoursesCompleted || 0, icon: '📚', color: 'purple' },
    { label: 'Transmission Units', value: tracker?.stats?.totalSessionsAttended || 0, icon: '🎥', color: 'teal' },
    { label: 'Experience XP', value: tracker?.stats?.totalXP || 0, icon: '⭐', color: 'indigo' },
    { label: 'Activity Streak', value: tracker?.stats?.currentStreak || 0, icon: '🔥', color: 'red' },
  ];

  return (
    <>
      <Head>
        <title>Tracker | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto py-12 space-y-16 pb-24">
          {/* Header */}
          <div className="text-center">
             <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-2">
                Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">Tracker</span>
             </h1>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.4em]">Advanced progress analytics & AI diagnostics</p>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsList.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl hover:scale-105 transition-transform group">
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</span>
                    <div className="h-10 w-10 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    </div>
                 </div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* AI Insights - Premium Banner */}
          {tracker?.advice && (
            <div className="relative overflow-hidden rounded-[3rem] bg-[#050505] p-10 lg:p-14 border border-white/5 shadow-2xl group">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="text-3xl">🤖</span>
                     <h2 className="text-xl font-black text-white italic uppercase tracking-widest">AI Performance Diagnosis</h2>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-12 items-start">
                     <div className="flex-1">
                        <p className="text-gray-300 text-lg font-medium leading-[1.6] italic">
                          "{tracker.advice}"
                        </p>
                     </div>
                     <div className="lg:w-64 space-y-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                           <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Status</div>
                           <div className="text-lg font-black text-white italic">Leveling Up</div>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                           <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Momentum</div>
                           <div className="text-lg font-black text-white italic">Strong</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Skill Breakdown */}
          {tracker?.progress && tracker.progress.length > 0 && (
            <section>
              <div className="mb-10 flex items-center gap-4">
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter leading-none">Transmission Progress</h2>
                 <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {tracker.progress.map((skill: any, index: number) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl group hover:border-purple-200 dark:hover:border-purple-900 transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-[0.08] transition-all">
                       <span className="text-9xl italic font-black uppercase tracking-tighter">XP</span>
                    </div>

                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-8">
                          <div>
                             <h3 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tight mb-1">{skill.skill}</h3>
                             <div className="flex gap-2">
                                {skill.badges.map((badge: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                                    {badge}
                                  </span>
                                ))}
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Accumulated</div>
                             <div className="text-2xl font-black text-gray-900 dark:text-white italic">{skill.xpEarned} XP</div>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem]">
                          <div className="text-center group-hover:scale-105 transition-transform">
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paths</div>
                             <div className="text-lg font-black text-gray-900 dark:text-white italic">{skill.coursesCompleted}</div>
                          </div>
                          <div className="text-center group-hover:scale-105 transition-transform border-x border-gray-200 dark:border-gray-700">
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Units</div>
                             <div className="text-lg font-black text-gray-900 dark:text-white italic">{skill.sessionsAttended}</div>
                          </div>
                          <div className="text-center group-hover:scale-105 transition-transform">
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Streak</div>
                             <div className="text-lg font-black text-gray-900 dark:text-white italic">{skill.streak}d</div>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!tracker?.progress || tracker.progress.length === 0) && (
            <div className="p-24 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700 space-y-6">
               <span className="text-7xl block grayscale opacity-40">📈</span>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Waiting for Initial Data</h3>
               <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">Complete your first session or enroll in a course to trigger the AI tracker.</p>
               <button onClick={() => router.push('/dashboard')} className="px-10 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xl">Back to Base</button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
