import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[10.5px] font-mono font-medium text-zinc-200 bg-white/[0.08] border border-white/[0.14] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.18)] select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
