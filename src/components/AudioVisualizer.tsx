'use client';

import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  color = 'bg-brand-500',
  barCount = 12,
}) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-6">
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary heights dynamically with CSS animation
        const delay = (i * 0.08).toFixed(2);
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isActive ? `${color} animate-pulse` : 'bg-slate-700 h-1.5 opacity-40'
            }`}
            style={{
              height: isActive ? `${Math.sin(i * 0.5) * 12 + 12}px` : '4px',
              animationDelay: `${delay}s`,
              animationDuration: '0.6s',
            }}
          />
        );
      })}
    </div>
  );
};
