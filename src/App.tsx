import { useState } from 'react';
import './App.css';

// Define possible values for a square: X, O, or null (empty)
type SquareValue = 'X' | 'O' | null;

// Interface for tracking move history with position information
interface MoveHistory {
  squares: SquareValue[]; // The state of the board after this move
  position?: number;      // The position where the move was made (0-8)
}

/**
 * Square component represents an individual square on the game board
 * @param value - The value to display (X, O, or null)
 * @param onSquareClick - Function to call when the square is clicked
 */
function Square({ value, onSquareClick }: { value: SquareValue; onSquareClick: () => void }) {
  // Apply different CSS classes based on the value (X or O)
  const valueClass = value === 'X' ? 'x-value' : value === 'O' ? 'o-value' : '';
  
  return (
    <button
      className={`square ${valueClass}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

/**
 * Board component is the main game component
 * It manages the game state and renders the board and game info
 */
export default function Board() {
  // State for tracking the history of moves
  const [history, setHistory] = useState<MoveHistory[]>([{ squares: Array(9).fill(null) }]);
  // State for tracking which move we're currently viewing
  const [currentMove, setCurrentMove] = useState<number>(0);
  // State for tracking wins
  const [wins, setWins] = useState<{ X: number, O: number }>({ X: 0, O: 0 });
  // State for tracking who starts first (X starts by default)
  const [xStartsFirst, setXStartsFirst] = useState<boolean>(true);
  
  // Get the current board state from history
  const currentSquares = history[currentMove].squares;
  // Determine whose turn it is based on the current move and who started first
  const xIsNext = xStartsFirst ? (currentMove % 2 === 0) : (currentMove % 2 === 1);

  // Check if there's a winner
  const winner = calculateWinner(currentSquares);

  /**
   * Updates the game history with a new move
   * @param nextSquares - The new board state
   * @param position - The position where the move was made
   */
  function handlePlay(nextSquares: SquareValue[], position: number) {
    // Create a new history array that includes all moves up to the current one
    // plus the new move (discards any "future" moves if we jumped back in time)
    const nextHistory = [...history.slice(0, currentMove + 1), { 
      squares: nextSquares,
      position: position
    }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  /**
   * Jumps to a specific move in the history
   * @param move - The move number to jump to
   */
  function jumpTo(move: number) {
    setCurrentMove(move);
  }

  /**
   * Handles a click on a square
   * @param i - The index of the clicked square (0-8)
   */
  function handleCLick(i: number) {
    // Don't allow clicking on already filled squares or if there's a winner
    if (currentSquares[i] !== null || winner) return;
    
    // Create a copy of the current squares array
    const nextSquare = currentSquares.slice();
    // Set the value based on whose turn it is
    nextSquare[i] = xIsNext ? 'X' : 'O';
    // Update the game history
    handlePlay(nextSquare, i);
  }

  /**
   * Resets the current game but keeps the score
   */
  function resetGame() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setCurrentMove(0);
  }

  /**
   * Starts a new game after someone has won
   * Updates the score and changes who goes first
   */
  function playAgain() {
    // If there was a winner, update the score and change who starts first
    if (winner) {
      // Update the win count
      setWins(prevWins => ({
        ...prevWins,
        [winner]: prevWins[winner] + 1
      }));
      
      // The loser starts the next game
      setXStartsFirst(winner === 'O');
    }
    
    // Reset the game state
    resetGame();
  }

  /**
   * Converts a position index (0-8) to a human-readable format (row,col)
   * @param position - The position index
   * @returns A string in the format "(row,col)"
   */
  function getPositionDescription(position: number): string {
    const row = Math.floor(position / 3) + 1;
    const col = (position % 3) + 1;
    return `(${row},${col})`;
  }

  // Create the list of moves for the history display
  // Skip the initial state (empty board)
  const moves = history.map((historyItem, moveIndex) => {
    // For the first move (index 0), show "Reset Game"
    if (moveIndex === 0) {
      return (
        <li key={moveIndex}>
          <button 
            className={moveIndex === currentMove ? 'current-move' : ''}
            onClick={() => jumpTo(moveIndex)}
          >
            Reset Game
          </button>
        </li>
      );
    }
    
    // For other moves, show the player and position
    // Determine which player made this move
    const player = xStartsFirst ? 
      (moveIndex % 2 === 1 ? 'X' : 'O') : 
      (moveIndex % 2 === 1 ? 'O' : 'X');
    
    // Get the position in human-readable format
    const position = historyItem.position !== undefined 
      ? getPositionDescription(historyItem.position) 
      : '';
    
    // Highlight the current move in the list
    return (
      <li key={moveIndex}>
        <button 
          className={moveIndex === currentMove ? 'current-move' : ''}
          onClick={() => jumpTo(moveIndex)}
        >
          {player === 'X' ? 
            <><span className="x-value">X</span> placed at {position}</> : 
            <><span className="o-value">O</span> placed at {position}</>
          }
        </button>
      </li>
    );
  });

  // Determine the game status message
  let status;
  if (winner) {
    status = (
      <div className="status">
        Winner: <span className={winner === 'X' ? 'x-value' : 'o-value'}>{winner}</span>
      </div>
    );
  } else if (currentMove === 9) {
    // If all squares are filled and there's no winner, it's a draw
    status = <div className="status">Draw! No winner.</div>;
  } else {
    // Show whose turn it is next
    const nextPlayer = xIsNext ? 'X' : 'O';
    status = (
      <div className="status">
        Next player: <span className={xIsNext ? 'x-value' : 'o-value'}>{nextPlayer}</span>
      </div>
    );
  }

  return (
    <div className="game">
      {/* Game board section */}
      <div className="game-board">
        <div className="score-board">
          <div className="score x-score">
            <span className="x-value">X</span>: {wins.X}
          </div>
          <div className="score o-score">
            <span className="o-value">O</span>: {wins.O}
          </div>
        </div>
        
        <div className="board-row">
          <Square value={currentSquares[0]} onSquareClick={() => handleCLick(0)}/>
          <Square value={currentSquares[1]} onSquareClick={() => handleCLick(1)} />
          <Square value={currentSquares[2]} onSquareClick={() => handleCLick(2)} />
        </div>
        <div className="board-row">
          <Square value={currentSquares[3]} onSquareClick={() => handleCLick(3)} />
          <Square value={currentSquares[4]} onSquareClick={() => handleCLick(4)} />
          <Square value={currentSquares[5]} onSquareClick={() => handleCLick(5)} />
        </div>
        <div className="board-row">
          <Square value={currentSquares[6]} onSquareClick={() => handleCLick(6)} />
          <Square value={currentSquares[7]} onSquareClick={() => handleCLick(7)} />
          <Square value={currentSquares[8]} onSquareClick={() => handleCLick(8)} />
        </div>
        
        {/* Game status (winner, next player, etc.) */}
        {status}
        
        {/* Play Again button */}
        <button className="play-again" onClick={playAgain}>
          Play Again
        </button>
        
        {/* Starting player info */}
        <div className="starting-player">
          Starting player: <span className={xStartsFirst ? 'x-value' : 'o-value'}>
            {xStartsFirst ? 'X' : 'O'}
          </span>
        </div>
      </div>
      
      {/* Move history section */}
      <div className="game-info">
        <h3>Move History</h3>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

/**
 * Calculates if there is a winner in the current board state
 * @param squares - The current board state
 * @returns The winner (X or O) or null if there's no winner
 */
function calculateWinner(squares: SquareValue[]): SquareValue {
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