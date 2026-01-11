import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 selection:text-purple-200">
      <Head>
        <title>Skill-Setu | AI-Powered Peer-to-Peer Learning Platform</title>
        <meta name="description" content="Master any skill through AI-matched peer learning and community-driven courses." />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="medium" />
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-widest text-gray-400">
               <Link href="#features" className="hover:text-white transition-colors">Features</Link>
               <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="px-6 py-2.5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all transform active:scale-95"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:text-purple-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/20 transition-all transform active:scale-95"
                  >
                    Join the Tribe
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Side: Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI-Powered Skill Exchange</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tighter mb-8 italic">
                LEARN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">FASTER.</span><br/>
                TEACH <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">BETTER.</span>
              </h1>
              
              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl mb-12 lg:mx-0 mx-auto">
                Skill-Setu is the future of knowledge exchange. Connect with experts through AI-matching, join immersive live sessions, and master any skill in record time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link 
                  href="/signup"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-purple-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
                >
                  START YOUR JOURNEY
                </Link>
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-800 flex items-center justify-center font-bold text-xs ring-4 ring-white/5">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="pl-6 flex flex-col justify-center text-left">
                     <div className="text-sm font-black italic tracking-tighter">1,200+ JOINED</div>
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Learners</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Visual */}
            <div className="flex-1 relative animate-float">
               <div className="relative z-10 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-teal-500/20 rounded-[4rem] blur-2xl"></div>
                  <div className="relative w-full h-full rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl">
                    <img 
                      src="/skill_setu_hero_illustration.png" 
                      alt="Knowledge Network Illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-10 -left-10 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-bounce-slow">
                    <span className="text-3xl">🤝</span>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-purple-400">Match Found</div>
                  </div>
                  <div className="absolute -bottom-5 -right-5 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-bounce-slow delay-700">
                    <span className="text-3xl">🎥</span>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-teal-400">Live Session</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4">The Next Generation of <span className="text-purple-500">Learning</span></h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Precision-engineered for maximum knowledge transfer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🧠', title: 'AI Matching', desc: 'Our algorithm finds the perfect teacher based on your specific proficiency gap.' },
              { icon: '🛡️', title: 'Smart Monitoring', desc: 'AI analyzes sessions in real-time to ensure quality and prevent fraud.' },
              { icon: '🪙', title: 'Token Economy', desc: 'Teach to earn tokens, learn to grow. A direct value-to-knowledge system.' }
            ].map((feature, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/[0.08] transition-all group">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-4 text-white italic">{feature.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed italic">"{feature.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
             <Logo size="small" />
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">
            © 2026 Skill-Setu. Built for the future of education.
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/login" className="hover:text-white transition-colors">Login</Link>
             <Link href="/signup" className="hover:text-white transition-colors">Signup</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
}
