import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { api } from '@/lib/utils';
import Link from 'next/link';

export default function SessionSummary() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSessionSummary();
    }
  }, [sessionId]);

  const fetchSessionSummary = async () => {
    try {
      const response = await api.get(`/session/${sessionId}`);
      setSession(response.data.session);
    } catch (error) {
       console.error('Failed to fetch session summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading message="Generating your session summary..." /></Layout>;
  if (!session) return <Layout><div className="flex items-center justify-center min-h-[400px]">Session not found</div></Layout>;

  return (
    <>
      <Head><title>Session Summary - Skill-Setu</title></Head>
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-6">
           <div className="mb-12 text-center">
              <div className="inline-block px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">Session Completed 🎉</div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Knowledge <span className="text-purple-600">Transferred</span></h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-2">{session.skill} with {session.teacher?.name}</p>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 text-center shadow-xl shadow-purple-500/5">
                 <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Engagement</div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white italic">{Math.round(session.final_engagement_score || 0)}%</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 text-center shadow-xl shadow-indigo-500/5">
                 <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Teaching</div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white italic">{Math.round(session.final_teaching_score || 0)}%</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 text-center shadow-xl shadow-teal-500/5">
                 <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Participation</div>
                 <div className="text-4xl font-black text-gray-900 dark:text-white italic">{Math.round(session.final_participation_score || 0)}%</div>
              </div>
           </div>

           {/* AI Deep Insight */}
           {session.final_ai_report ? (
              <div className="space-y-8">
                 <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <span className="text-9xl">🤖</span>
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 mb-6">AI Session Analysis</h3>
                       <p className="text-2xl font-medium leading-relaxed italic mb-10 text-gray-100">
                          "{session.final_ai_report.summary}"
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-teal-400/20 flex items-center justify-center text-[10px]">✓</span> 
                                Strengths
                             </h4>
                             <ul className="space-y-3">
                                {session.final_ai_report.strengths.map((s: string, i: number) => (
                                   <li key={i} className="text-sm font-bold text-gray-300 flex gap-3">• {s}</li>
                                ))}
                             </ul>
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-400/20 flex items-center justify-center text-[10px]">↗</span> 
                                Next Steps
                             </h4>
                             <ul className="space-y-3">
                                {session.final_ai_report.next_steps.map((s: string, i: number) => (
                                   <li key={i} className="text-sm font-bold text-gray-300 flex gap-3">→ {s}</li>
                                ))}
                             </ul>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="text-center pt-8">
                    <Link 
                      href="/dashboard"
                      className="inline-flex items-center gap-4 px-12 py-5 bg-white dark:bg-gray-800 text-black dark:text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all active:scale-95"
                    >
                       Return to Dashboard →
                    </Link>
                 </div>
              </div>
           ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                 <span className="text-4xl mb-6 block">🕰️</span>
                 <h3 className="text-xl font-black text-gray-900 italic">Detailed report is being processed...</h3>
                 <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Come back in a few minutes for deep AI insights.</p>
                 <Link href="/dashboard" className="text-purple-600 font-black text-[10px] uppercase tracking-widest hover:underline block mt-8">Dashboard</Link>
              </div>
           )}
        </div>
      </Layout>
    </>
  );
}
