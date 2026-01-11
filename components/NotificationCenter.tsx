import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications', { action: 'markRead' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put('/notifications', { notificationId: id, action: 'markRead' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match_new': return '🤝';
      case 'match_accepted': return '✅';
      case 'session_scheduled': return '📅';
      case 'session_started': return '🎥';
      case 'token_transfer': return '🪙';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition-all active:scale-95 group focus:outline-none"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white dark:border-[#050505] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-[360px] bg-white dark:bg-[#0F1115] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
               <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Live Feed</h3>
               {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline uppercase tracking-widest"
              >
                Clear Unread
              </button>
            )}
          </div>

          <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer relative ${
                      !notification.read ? 'bg-purple-50/30 dark:bg-purple-500/[0.02]' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification._id);
                      if (notification.link) setIsOpen(false);
                    }}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-6 bottom-6 w-1 bg-purple-600 rounded-r-full shadow-[2px_0_10px_purple]"></div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate mr-2">
                            {notification.title}
                          </p>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest whitespace-nowrap">
                             {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium line-clamp-2 italic">
                          "{notification.message}"
                        </p>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="inline-flex items-center mt-3 text-[9px] font-black text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 uppercase tracking-[0.2em]"
                          >
                            Execute Action →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="text-5xl mb-6 grayscale opacity-20">📡</div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-loose">
                  Frequency Clear<br/>No Signal Detected
                </h4>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/5 text-center bg-gray-50/30 dark:bg-white/[0.01]">
             <Link href="/notifications" className="text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 uppercase tracking-[0.3em] transition-colors">
                Open Full Log Center
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
