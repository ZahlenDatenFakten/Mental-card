import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-mono font-medium text-zinc-300 bg-zinc-800/90 border border-zinc-700/80 rounded shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
