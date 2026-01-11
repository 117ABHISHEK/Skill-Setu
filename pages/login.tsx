import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Access Granted! 🛰️');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Skill-Setu</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 bg-white/70 dark:bg-[#0F1115]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-2xl p-10 lg:p-14 w-full max-w-lg transition-all">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8 scale-110">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-2">Resume Journey</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Credentials required for node access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-8 py-5 bg-white dark:bg-[#050505] border-gray-100 dark:border-white/5 rounded-3xl text-sm font-black italic focus:ring-4 focus:ring-purple-500/10 transition-all dark:text-white"
                placeholder="USER@NETWORK.COM"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Secure Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-8 py-5 bg-white dark:bg-[#050505] border-gray-100 dark:border-white/5 rounded-3xl text-sm font-black italic focus:ring-4 focus:ring-purple-500/10 transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-purple-700 shadow-2xl shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'SYNCING...' : 'INITIATE LOGIN'}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
            No identity found?{' '}
            <Link href="/signup" className="text-purple-600 dark:text-purple-400 hover:underline">
              Register Node
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
