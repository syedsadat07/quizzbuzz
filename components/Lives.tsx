import React from 'react';
import { motion } from 'framer-motion';

interface LivesProps {
  lives: number;
  maxLives: number;
}

export const Lives: React.FC<LivesProps> = ({ lives, maxLives }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-slate-500 font-medium text-sm">Mistakes remaining:</span>
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i < lives ? 1 : 0.8,
              backgroundColor: i < lives ? '#ef4444' : '#e2e8f0',
            }}
            className="w-3 h-3 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};
