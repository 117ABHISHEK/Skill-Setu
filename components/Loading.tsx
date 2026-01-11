import React from 'react';
import Logo from './Logo';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Syncing your knowledge...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-12">
      {/* Animated Icon Container */}
      <div className="relative group">
        {/* Glow Effects */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-purple-600/30 to-teal-500/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-600/20 to-teal-400/20 rounded-full blur-xl animate-bounce-slow"></div>
        
        {/* Logo with pulsating effect */}
        <div className="relative z-10 p-8 bg-white/10 dark:bg-gray-800/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-float">
           <Logo size="large" showText={false} />
        </div>

        {/* Orbiting particles */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
           <div className="w-2 h-2 bg-purple-500 rounded-full absolute -top-4 -left-4 shadow-[0_0_15px_purple]"></div>
           <div className="w-2 h-2 bg-teal-400 rounded-full absolute -bottom-4 -right-4 shadow-[0_0_15px_teal]"></div>
        </div>
      </div>
      
      {/* Message and Progress */}
      <div className="text-center relative">
        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-4 animate-pulse">
           {message}
        </h3>
        
        {/* Animated Loading Bar */}
        <div className="w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-auto relative">
           <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-teal-500 to-indigo-600 animate-loading-bar shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
        .animate-float {
          animation: float 3s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 4s infinite linear;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-24 w-full">
      {content}
    </div>
  );
};

export default Loading;
