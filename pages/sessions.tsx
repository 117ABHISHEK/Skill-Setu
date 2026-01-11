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
        <span className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
          Fraud Alert
        </span>
      );
    }

    const baseClass = "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border";
    switch (status) {
      case 'created':
        return <span className={`${baseClass} bg-gray-500/10 text-gray-500 border-gray-500/20`}>Scheduled</span>;
      case 'live':
        return <span className={`${baseClass} bg-green-500/10 text-green-500 border-green-500/20 animate-pulse`}>Live Now</span>;
      case 'completed':
        return <span className={`${baseClass} bg-teal-500/10 text-teal-500 border-teal-500/20`}>Success</span>;
      case 'under_review':
        return <span className={`${baseClass} bg-yellow-500/10 text-yellow-500 border-yellow-500/20`}>Reviewing</span>;
      default:
        return <span className={`${baseClass} bg-gray-500/10 text-gray-500 border-gray-500/20`}>{status}</span>;
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
    return <Loading fullScreen />;
  }

  return (
    <>
      <Head>
        <title>Sessions | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-6xl mx-auto py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-2">
                 Session <span className="text-purple-600">History</span>
               </h1>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Track your knowledge transfers and growth</p>
            </div>
            
            {/* Dashboard-style Filters */}
            <div className="flex flex-wrap gap-4 p-2 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl">
               <select
                 value={filter}
                 onChange={(e) => setFilter(e.target.value as any)}
                 className="px-6 py-3 bg-transparent border-none text-xs font-black uppercase tracking-widest dark:text-gray-300 focus:outline-none cursor-pointer"
               >
                 <option value="all">All Roles</option>
                 <option value="teacher">Teacher</option>
                 <option value="learner">Learner</option>
               </select>
               <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 self-center"></div>
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="px-6 py-3 bg-transparent border-none text-xs font-black uppercase tracking-widest dark:text-gray-300 focus:outline-none cursor-pointer"
               >
                 <option value="all">Any Status</option>
                 <option value="created">Scheduled</option>
                 <option value="live">Live</option>
                 <option value="completed">Completed</option>
                 <option value="under_review">Review</option>
               </select>
            </div>
          </div>

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700 p-24 text-center">
              <div className="text-7xl mb-8 grayscale opacity-30">🎥</div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter mb-2">No transmissions found</h2>
              <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto text-sm">You haven't participated in any sessions yet. Connect with a peer to start.</p>
              <Link
                href="/match"
                className="px-10 py-5 bg-purple-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
              >
                Find a Match Today
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => {
                const isTeacher = session.teacher._id === currentUserId || session.teacher.toString() === currentUserId;
                const otherUser = isTeacher ? session.learner : session.teacher;

                return (
                  <div
                    key={session._id}
                    className="group bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <span className="text-9xl">{isTeacher ? '👨‍🏫' : '👨‍🎓'}</span>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                       {/* Left side: Icon & Main Info */}
                       <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                             <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase leading-none">{session.skill}</h3>
                             {getStatusBadge(session.status, session.fraud_flagged)}
                             <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {session.skillCategory}
                             </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                             <div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{isTeacher ? 'Transmission To' : 'Transmission From'}</div>
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-black">
                                      {otherUser?.name?.charAt(0).toUpperCase()}
                                   </div>
                                   <span className="text-sm font-black text-gray-800 dark:text-white uppercase">{otherUser?.name || 'Unknown'}</span>
                                </div>
                             </div>

                             {session.startTime && (
                                <div>
                                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Timestamp</div>
                                   <div className="text-sm font-black text-gray-800 dark:text-white truncate">{formatDate(session.startTime)}</div>
                                </div>
                             )}

                             {session.final_engagement_score !== undefined && (
                                <div>
                                   <div className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2">Engagement</div>
                                   <div className="text-xl font-black text-teal-500 italic">{session.final_engagement_score.toFixed(0)}%</div>
                                </div>
                             )}
                             
                             {!session.startTime && (
                                <div>
                                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Created On</div>
                                   <div className="text-sm font-black text-gray-800 dark:text-white truncate">{formatDate(session.createdAt)}</div>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Right side: Actions */}
                       <div className="flex flex-col justify-center gap-3 md:min-w-[180px]">
                          {(session.status === 'created' || session.status === 'live') && (
                            <button
                              onClick={() => handleJoinSession(session)}
                              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white shadow-xl transition-all active:scale-95"
                            >
                              {session.status === 'live' ? 'JOIN NOW' : 'OPEN LINK'}
                            </button>
                          )}
                          
                          {session.status === 'completed' && (
                            <Link
                              href={`/session/${session.sessionId}/summary`}
                              className="w-full py-4 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-center rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-teal-600 hover:text-white transition-all"
                            >
                              VIEW REPORT
                            </Link>
                          )}

                          {session.tokenStatus === 'frozen' && (
                            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center uppercase tracking-widest">
                               Tokens Frozen
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
