import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { api } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications', { action: 'markRead' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
       console.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
     try {
        await api.delete(`/notifications?notificationId=${id}`);
        setNotifications(notifications.filter(n => n._id !== id));
     } catch (error) {
        console.error('Failed to delete notification');
     }
  };

  if (loading) return <Layout><Loading message="Loading your inbox..." /></Layout>;

  return (
    <>
      <Head><title>Notifications - Skill-Setu</title></Head>
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
           <div className="flex justify-between items-end mb-12">
              <div>
                 <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2 uppercase italic">Inboxed <span className="text-purple-600">Insights</span></h1>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your skill connections and updates</p>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllRead}
                  className="px-6 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all active:scale-95"
                >
                   Clear Unread
                </button>
              )}
           </div>

           {notifications.length > 0 ? (
             <div className="space-y-4">
                {notifications.map((n) => (
                   <div 
                    key={n._id} 
                    className={`group relative p-8 bg-white dark:bg-gray-800 rounded-[2rem] border transition-all duration-300 ${
                      !n.read 
                        ? 'border-purple-200 dark:border-purple-800 shadow-xl shadow-purple-500/5' 
                        : 'border-gray-100 dark:border-gray-700 opacity-80'
                    }`}
                   >
                      <div className="flex gap-6 items-start">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                            n.type.includes('match') ? 'bg-blue-50 text-blue-600' :
                            n.type.includes('session') ? 'bg-purple-50 text-purple-600' :
                            'bg-gray-50 text-gray-600'
                         }`}>
                            {n.type === 'match_new' ? '🤝' : n.type === 'session_scheduled' ? '📅' : '🔔'}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{n.title}</h3>
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                     {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                  </p>
                               </div>
                               <button 
                                onClick={() => deleteNotification(n._id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                               >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                               </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6 italic">
                               "{n.message}"
                            </p>
                            {n.link && (
                               <Link 
                                href={n.link}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white transition-all"
                               >
                                  Join Connection →
                               </Link>
                            )}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-6xl mb-6 block">🕯️</span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Your inbox is empty</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">When you get matches or session updates, they'll appear here.</p>
             </div>
           )}
        </div>
      </Layout>
    </>
  );
}
