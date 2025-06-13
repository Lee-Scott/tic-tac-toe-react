import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Define possible values for a square: X, O, or null (empty)
export type SquareValue = 'X' | 'O' | null;

// Interface for tracking move history with position information
export interface MoveHistory {
  squares: SquareValue[]; // The state of the board after this move
  position?: number;      // The position where the move was made (0-8)
}

// Define the state structure for the game slice
export interface GameState {
  history: MoveHistory[];
  currentMove: number;
  wins: { X: number, O: number };
  xStartsFirst: boolean;
}

// Initial state
const initialState: GameState = {
  history: [{ squares: Array(9).fill(null) }],
  currentMove: 0,
  wins: { X: 0, O: 0 },
  xStartsFirst: true,
};

// Create the game slice
export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Add a new move to the history
    makeMove: (state, action: PayloadAction<{ squares: SquareValue[], position: number }>) => {
      const { squares, position } = action.payload;
      // Create a new history array that includes all moves up to the current one
      // plus the new move (discards any "future" moves if we jumped back in time)
      state.history = [...state.history.slice(0, state.currentMove + 1), { 
        squares,
        position
      }];
      state.currentMove = state.history.length - 1;
    },
    
    // Jump to a specific move in history
    jumpToMove: (state, action: PayloadAction<number>) => {
      state.currentMove = action.payload;
    },
    
    // Reset the current game but keep the score
    resetGame: (state) => {
      state.history = [{ squares: Array(9).fill(null) }];
      state.currentMove = 0;
    },
    
    // Start a new game after someone has won
    playAgain: (state, action: PayloadAction<SquareValue>) => {
      const winner = action.payload;
      
      // If there was a winner, update the score and change who starts first
      if (winner) {
        // Update the win count
        if (winner === 'X') {
          state.wins.X += 1;
        } else if (winner === 'O') {
          state.wins.O += 1;
        }
        
        // The loser starts the next game
        state.xStartsFirst = winner === 'O';
      }
      
      // Reset the game state
      state.history = [{ squares: Array(9).fill(null) }];
      state.currentMove = 0;
    }
  },
});

// Export actions
export const { makeMove, jumpToMove, resetGame, playAgain } = gameSlice.actions;

// Selectors
export const selectHistory = (state: RootState) => state.game.history;
export const selectCurrentMove = (state: RootState) => state.game.currentMove;
export const selectCurrentSquares = (state: RootState) => 
  state.game.history[state.game.currentMove].squares;
export const selectWins = (state: RootState) => state.game.wins;
export const selectXStartsFirst = (state: RootState) => state.game.xStartsFirst;
export const selectXIsNext = (state: RootState) => {
  const { currentMove, xStartsFirst } = state.game;
  return xStartsFirst ? (currentMove % 2 === 0) : (currentMove % 2 === 1);
};

// Export reducer
export default gameSlice.reducer;

// Helper function to calculate winner
export function calculateWinner(squares: SquareValue[]): SquareValue {
  // All possible winning combinations (rows, columns, diagonals)
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal from top-left
    [2, 4, 6], // diagonal from top-right
  ];
  
  // Check each winning combination
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    // If all three squares have the same non-null value, we have a winner
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  
  // No winner found
  return null;
}