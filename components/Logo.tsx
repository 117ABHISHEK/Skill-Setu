import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const textSizes = {
    small: 'text-sm tracking-[0.2em]',
    medium: 'text-xl tracking-[0.1em]',
    large: 'text-3xl tracking-[0.15em]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Updated Logo Symbol - Two elegant S curves based on branding */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Curve */}
        <path
          d="M14 10C14 10 10 14 10 20C10 26 14 30 14 30"
          stroke="#8B1538"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18 10C18 10 14 14 14 20C14 26 18 30 18 30"
          stroke="#8B1538"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Right Curve Pair (Reflection/Offset) */}
        <path
          d="M22 10C22 10 26 14 26 20C26 26 22 30 22 30"
          stroke="#8B1538"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M26 10C26 10 30 14 30 20C30 26 26 30 26 30"
          stroke="#8B1538"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Modernized Logo Text */}
      {showText && (
        <span className={`font-black uppercase italic ${textSizes[size]} text-gray-900 dark:text-white flex items-center`}>
          SKILL
          <span className="mx-2 text-purple-600">SETU</span>
        </span>
      )}
    </div>
  );
}
