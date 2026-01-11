import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';
import toast from 'react-hot-toast';
import { api } from '@/lib/utils';
import Loading from './Loading';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
       // If we're on public pages, don't redirect (but Layout is usually for protected pages)
       // However, to be safe, we check if it's one of the auth pages
       if (router.pathname !== '/login' && router.pathname !== '/signup' && router.pathname !== '/') {
          router.push('/login');
          return;
       }
    }

    fetchUser();
  }, [router]);

  const fetchUser = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }

      const response = await api.get('/users/profile');
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Only redirect if we're not already on an auth page
        if (router.pathname !== '/login' && router.pathname !== '/signup' && router.pathname !== '/') {
           localStorage.removeItem('accessToken');
           localStorage.removeItem('refreshToken');
           router.push('/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Matches', href: '/match', icon: '🔍' },
    { name: 'Sessions', href: '/sessions', icon: '🎥' },
    { name: 'Courses', href: '/courses', icon: '📖' },
    { name: 'Tracker', href: '/tracker', icon: '📈' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] transition-colors selection:bg-purple-500/30 selection:text-purple-200">
      {/* Premium Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-10">
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                <Logo size="medium" />
              </Link>
              
              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-6">
                 {navigation.slice(0, 5).map((item) => (
                    <Link
                       key={item.name}
                       href={item.href}
                       className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-full ${
                          router.pathname === item.href 
                             ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                             : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                       }`}
                    >
                       {item.name}
                    </Link>
                 ))}
              </div>
            </div>

            {/* Right side tools */}
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 dark:bg-purple-500/5 border border-purple-500/20 rounded-full">
                  <span className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">🪙 {user?.tokens || 0}</span>
               </div>
               
               <NotificationCenter />
               <ThemeToggle />

               {/* User Profile Trigger */}
               <div className="relative group ml-2">
                  <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                     <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                     </div>
                     <span className="hidden xl:block text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mr-2">
                        {user?.name || 'Explorer'}
                     </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                     <div className="p-3 space-y-1">
                        <Link 
                           href="/profile" 
                           className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                        >
                           👤 Profile IDENTITY
                        </Link>
                        <Link 
                           href="/tracker" 
                           className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                        >
                           📈 Progress DIAGNOSTIC
                        </Link>
                        <div className="h-[1px] bg-gray-100 dark:bg-gray-700 mx-2 my-2"></div>
                        <button 
                           onClick={handleLogout}
                           className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                        >
                           🚪 TERMINATE SESSION
                        </button>
                     </div>
                  </div>
               </div>

               {/* Mobile Toggle */}
               <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-3 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-purple-500 hover:text-white transition-all"
               >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {sidebarOpen && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
               <div className="flex items-center justify-between mb-12">
                  <Logo size="medium" />
                  <button onClick={() => setSidebarOpen(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-full">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
               <nav className="space-y-4">
                  {navigation.map(item => (
                     <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-4 p-5 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all ${
                           router.pathname === item.href 
                              ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/30' 
                              : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                     >
                        <span className="text-xl">{item.icon}</span>
                        {item.name}
                     </Link>
                  ))}
               </nav>
            </div>
         </div>
      )}

      {/* Main Page Content Wrapper */}
      <main className="pt-32 min-h-screen px-6 sm:px-10 lg:px-12">
         {children}
      </main>
    </div>
  );
}
