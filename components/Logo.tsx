import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'h-6 w-auto',
    medium: 'h-10 w-auto',
    large: 'h-16 w-auto',
  };

  const textSizes = {
    small: 'text-sm tracking-[0.2em]',
    medium: 'text-xl tracking-[0.1em]',
    large: 'text-3xl tracking-[0.15em]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Use the uploaded logo image */}
      <img 
        src="/logo/download.png" 
        alt="Skill-Setu Logo" 
        className={sizeClasses[size]}
      />

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
