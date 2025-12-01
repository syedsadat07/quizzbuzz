import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../types';
import { SOLVED_COLORS } from '../constants';
import clsx from 'clsx';

interface SolvedRowProps {
  category: Category;
  index: number;
}

export const SolvedRow: React.FC<SolvedRowProps> = ({ category, index }) => {
  const colorClass = SOLVED_COLORS[index % SOLVED_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={clsx(
        "w-full p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-md mb-3",
        colorClass
      )}
    >
      <h3 className="font-bold text-lg uppercase tracking-wider">{category.name}</h3>
      <p className="text-sm opacity-90 font-medium">{category.words.join(', ')}</p>
    </motion.div>
  );
};
