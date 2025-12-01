import React, { useState, useEffect, useCallback } from 'react';
import { generatePuzzle } from './services/geminiService';
import { WordItem, GameState, Category, PuzzleResponse } from './types';
import { WordCard } from './components/WordCard';
import { SolvedRow } from './components/SolvedRow';
import { Lives } from './components/Lives';
import { MAX_LIVES, TOPICS } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Shuffle, Play } from 'lucide-react';
import clsx from 'clsx';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    words: [],
    solvedCategories: [],
    lives: MAX_LIVES,
    status: 'idle',
    topic: TOPICS[0],
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  // Initialize game
  const startGame = async (topic: string) => {
    setGameState(prev => ({ ...prev, status: 'loading', lives: MAX_LIVES, solvedCategories: [], words: [], error: undefined, topic }));
    setSelectedIds([]);

    try {
      const data: PuzzleResponse = await generatePuzzle(topic);
      
      const allWords: WordItem[] = [];
      data.categories.forEach((cat, catIndex) => {
        cat.items.forEach((text, wordIndex) => {
          allWords.push({
            id: `word-${catIndex}-${wordIndex}`,
            text,
            category: cat.name,
            isSelected: false,
            isSolved: false
          });
        });
      });

      // Shuffle words
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);

      setGameState(prev => ({
        ...prev,
        status: 'playing',
        words: shuffled
      }));

    } catch (error) {
      setGameState(prev => ({
        ...prev,
        status: 'idle',
        error: "Failed to generate puzzle. Please try again."
      }));
    }
  };

  const handleWordClick = (id: string) => {
    if (gameState.status !== 'playing') return;
    
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });

    setGameState(prev => ({
      ...prev,
      words: prev.words.map(w => w.id === id ? { ...w, isSelected: !w.isSelected } : w)
    }));
  };

  const handleShuffle = () => {
    setGameState(prev => ({
      ...prev,
      words: [...prev.words].sort(() => Math.random() - 0.5)
    }));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
    setGameState(prev => ({
      ...prev,
      words: prev.words.map(w => ({ ...w, isSelected: false }))
    }));
  };

  const handleSubmit = () => {
    if (selectedIds.length !== 4) return;

    const selectedWords = gameState.words.filter(w => selectedIds.includes(w.id));
    const firstCategory = selectedWords[0].category;
    const allSameCategory = selectedWords.every(w => w.category === firstCategory);

    if (allSameCategory) {
      // Success
      const solvedCategoryName = firstCategory;
      const solvedWords = selectedWords.map(w => w.text);
      
      const newSolvedCategory: Category = {
        name: solvedCategoryName,
        words: solvedWords,
        description: "", 
        color: ""
      };

      setGameState(prev => {
        const remainingWords = prev.words.filter(w => !selectedIds.includes(w.id));
        const newSolved = [...prev.solvedCategories, newSolvedCategory];
        
        return {
          ...prev,
          words: remainingWords,
          solvedCategories: newSolved,
          status: remainingWords.length === 0 ? 'won' : 'playing'
        };
      });
      setSelectedIds([]);

    } else {
      // Failure
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Check "One away"
      const categoryCounts: Record<string, number> = {};
      selectedWords.forEach(w => {
        categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
      });
      const isOneAway = Object.values(categoryCounts).some(count => count === 3);
      
      if (isOneAway) {
        // Could show a toast here, simplified for now
        console.log("One away!");
      }

      setGameState(prev => {
        const newLives = prev.lives - 1;
        return {
          ...prev,
          lives: newLives,
          status: newLives <= 0 ? 'lost' : 'playing'
        };
      });
    }
  };

  useEffect(() => {
    // Sync selection state visual
    setGameState(prev => ({
      ...prev,
      words: prev.words.map(w => ({
        ...w,
        isSelected: selectedIds.includes(w.id)
      }))
    }));
  }, [selectedIds]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center py-8 px-4">
      <header className="w-full max-w-lg mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          MindMatch AI
        </h1>
        <p className="text-slate-500 text-center">
          Group words by their hidden connections.
          <br/>
          <span className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</span>
        </p>
      </header>

      <main className="w-full max-w-lg flex-1 flex flex-col relative min-h-[500px]">
        
        {/* Topic Selector / Game Over / Idle State */}
        {(gameState.status === 'idle' || gameState.status === 'won' || gameState.status === 'lost') && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-100"
           >
             {gameState.status === 'won' && (
               <div className="mb-6 text-center">
                 <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Victory!</h2>
                 <p className="text-slate-600">You solved the puzzle!</p>
               </div>
             )}
             {gameState.status === 'lost' && (
               <div className="mb-6 text-center">
                 <h2 className="text-3xl font-bold text-red-600 mb-2">Game Over</h2>
                 <p className="text-slate-600">Better luck next time.</p>
               </div>
             )}
             
             <div className="w-full max-w-xs space-y-4">
               <label className="block text-sm font-medium text-slate-700">Choose a Topic:</label>
               <select 
                 className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 value={gameState.topic}
                 onChange={(e) => setGameState(prev => ({ ...prev, topic: e.target.value }))}
               >
                 {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               
               <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Or type a custom topic..." 
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    onBlur={(e) => e.target.value && setGameState(prev => ({ ...prev, topic: e.target.value }))}
                 />
               </div>

               {gameState.error && (
                 <p className="text-red-500 text-sm text-center">{gameState.error}</p>
               )}

               <button 
                 onClick={() => startGame(gameState.topic)}
                 className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <Play size={20} />
                 {gameState.status === 'idle' ? 'Start Game' : 'Play Again'}
               </button>
             </div>
           </motion.div>
        )}

        {/* Loading State */}
        {gameState.status === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium animate-pulse">Gemini is crafting your puzzle...</p>
          </div>
        )}

        {/* Lives Counter */}
        <div className="flex justify-between items-center w-full px-2">
           <Lives lives={gameState.lives} maxLives={MAX_LIVES} />
           {gameState.status === 'playing' && (
              <button onClick={() => startGame(gameState.topic)} className="text-xs text-slate-400 hover:text-red-500 underline">Resign</button>
           )}
        </div>

        {/* Game Board */}
        <div className="w-full flex-1 flex flex-col gap-3">
          {/* Solved Rows */}
          <AnimatePresence>
            {gameState.solvedCategories.map((category, idx) => (
              <SolvedRow key={category.name} category={category} index={idx} />
            ))}
          </AnimatePresence>

          {/* Active Grid */}
          <motion.div 
            className="grid grid-cols-4 gap-2 sm:gap-3"
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <AnimatePresence mode="popLayout">
              {gameState.words.map((word) => (
                <WordCard 
                  key={word.id} 
                  word={word} 
                  onClick={handleWordClick}
                  disabled={gameState.status !== 'playing'} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-3 justify-center w-full">
          <button 
            onClick={handleShuffle}
            disabled={gameState.status !== 'playing'}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Shuffle size={18} /> Shuffle
          </button>
          
          <button 
            onClick={handleDeselectAll}
            disabled={gameState.status !== 'playing' || selectedIds.length === 0}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Deselect
          </button>

          <button 
            onClick={handleSubmit}
            disabled={gameState.status !== 'playing' || selectedIds.length !== 4}
            className={clsx(
              "px-8 py-3 rounded-full font-bold shadow-md transition-all transform",
              selectedIds.length === 4 
                ? "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Submit
          </button>
        </div>

      </main>

      <footer className="mt-8 text-slate-400 text-sm">
         Use your API Key for unlimited custom topics.
      </footer>
    </div>
  );
};

export default App;
