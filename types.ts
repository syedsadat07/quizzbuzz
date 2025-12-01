export interface WordItem {
  id: string;
  text: string;
  category: string;
  isSelected: boolean;
  isSolved: boolean;
}

export interface Category {
  name: string;
  words: string[];
  description: string;
  color: string;
}

export interface GameState {
  words: WordItem[];
  solvedCategories: Category[];
  lives: number;
  status: 'idle' | 'loading' | 'playing' | 'won' | 'lost';
  topic: string;
  error?: string;
}

export interface PuzzleResponse {
  categories: {
    name: string;
    description: string;
    items: string[];
  }[];
}
