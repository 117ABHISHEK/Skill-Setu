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
        className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-gray-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline uppercase"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative ${
                      !notification.read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification._id);
                      if (notification.link) setIsOpen(false);
                    }}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600"></div>
                    )}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-xl mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium">
                             {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="inline-block mt-2 text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline uppercase tracking-widest"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4 grayscale opacity-50">📭</div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
                  No notifications yet.<br/>You're all caught up!
                </p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50/30 dark:bg-gray-700/30">
             <Link href="/notifications" className="text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest">
                See all notifications
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
