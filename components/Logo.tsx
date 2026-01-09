import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Symbol - Three overlapping S shapes */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left S */}
        <path
          d="M8 5 C8 8, 8 12, 10 15 C12 18, 14 20, 12 22 C10 24, 8 26, 10 28 C12 30, 14 32, 18 32 C22 32, 24 30, 26 28"
          stroke="#8B1538"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        {/* Middle S */}
        <path
          d="M12 5 C12 8, 12 12, 14 15 C16 18, 18 20, 16 22 C14 24, 12 26, 14 28 C16 30, 18 32, 22 32 C26 32, 28 30, 30 28"
          stroke="#8B1538"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Right S */}
        <path
          d="M16 5 C16 8, 16 12, 18 15 C20 18, 22 20, 20 22 C18 24, 16 26, 18 28 C20 30, 22 32, 26 32 C30 32, 32 30, 34 28"
          stroke="#8B1538"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`font-semibold text-gray-900 ${textSizes[size]}`}>
          SKILL <span className="text-gray-600">SETU</span>
        </span>
      )}
    </div>
  );
}
