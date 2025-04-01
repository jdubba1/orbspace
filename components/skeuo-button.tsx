'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export function SkeuoButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-full bg-indigo-700 overflow-hidden',
        'shadow-[inset_-4px_-4px_6px_rgba(30,30,80,0.4),inset_2px_2px_4px_rgba(255,255,255,0.2),1px_1px_2px_rgba(0,0,40,0.15)] active:scale-[0.975] transition-transform duration-100 ease-in-out',
        className
      )}
    >
      {/* glow layer */}
      <div
        className="absolute inset-[-2px] z-0 rounded-full pointer-events-none opacity-20 blur-sm mix-blend-multiply"
        style={{
          background:
            'linear-gradient(-135deg, rgba(80,80,160,0.5), transparent 20%, transparent)',
        }}
      />

      {/* outer */}
      <div className="relative z-10 rounded-full p-[2px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(40,40,90,0.4)]">
        <div className="rounded-full px-6 py-3 bg-gradient-to-br from-indigo-300 to-indigo-500 shadow-[inset_-2px_-2px_4px_rgba(40,40,90,0.3),inset_2px_2px_4px_rgba(255,255,255,0.2)]">
          <span
            className="block text-white text-[1.25rem] font-medium tracking-tight"
            style={{
              textShadow: '0 1px 1px rgba(0,0,0,0.25)',
            }}
          >
            {children}
          </span>
        </div>
      </div>
    </button>
  );
}