import React from 'react';
import { motion } from 'framer-motion';
import { WordItem } from '../types';
import clsx from 'clsx';

interface WordCardProps {
  word: WordItem;
  onClick: (id: string) => void;
  disabled: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onClick, disabled }) => {
  return (
    <motion.button
      layoutId={word.id}
      whileHover={!disabled && !word.isSelected ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => !disabled && onClick(word.id)}
      className={clsx(
        "aspect-[4/3] w-full rounded-xl font-bold text-sm sm:text-base p-2 flex items-center justify-center transition-colors shadow-sm select-none uppercase text-center leading-tight",
        word.isSelected 
          ? "bg-slate-800 text-white shadow-lg ring-2 ring-slate-600 ring-offset-2" 
          : "bg-white text-slate-800 hover:bg-slate-50 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1"
      )}
    >
      {word.text}
    </motion.button>
  );
};
