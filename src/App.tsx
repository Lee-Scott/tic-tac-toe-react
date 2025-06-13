import './App.css';
import { useAppSelector, useAppDispatch } from './hooks';
import { 
  makeMove, 
  jumpToMove, 

  playAgain,
  selectCurrentSquares,
  selectHistory,
  selectCurrentMove,
  selectWins,
  selectXStartsFirst,
  selectXIsNext,
  calculateWinner,
  type SquareValue
} from './gameSlice';

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
  // Use Redux selectors to get state
  const currentSquares = useAppSelector(selectCurrentSquares);
  const history = useAppSelector(selectHistory);
  const currentMove = useAppSelector(selectCurrentMove);
  const wins = useAppSelector(selectWins);
  const xStartsFirst = useAppSelector(selectXStartsFirst);
  const xIsNext = useAppSelector(selectXIsNext);
  const dispatch = useAppDispatch();
  
  // Check if there's a winner
  const winner = calculateWinner(currentSquares);

  /**
   * Handles a click on a square
   * @param i - The index of the clicked square (0-8)
   */
  function handleClick(i: number) {
    // Don't allow clicking on already filled squares or if there's a winner
    if (currentSquares[i] !== null || winner) return;
    
    // Create a copy of the current squares array
    const nextSquare = currentSquares.slice();
    // Set the value based on whose turn it is
    nextSquare[i] = xIsNext ? 'X' : 'O';
    // Update the game history
    dispatch(makeMove({ squares: nextSquare, position: i }));
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
            onClick={() => dispatch(jumpToMove(moveIndex))}
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
          onClick={() => dispatch(jumpToMove(moveIndex))}
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
          <Square value={currentSquares[0]} onSquareClick={() => handleClick(0)}/>
          <Square value={currentSquares[1]} onSquareClick={() => handleClick(1)} />
          <Square value={currentSquares[2]} onSquareClick={() => handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={currentSquares[3]} onSquareClick={() => handleClick(3)} />
          <Square value={currentSquares[4]} onSquareClick={() => handleClick(4)} />
          <Square value={currentSquares[5]} onSquareClick={() => handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={currentSquares[6]} onSquareClick={() => handleClick(6)} />
          <Square value={currentSquares[7]} onSquareClick={() => handleClick(7)} />
          <Square value={currentSquares[8]} onSquareClick={() => handleClick(8)} />
        </div>
        
        {/* Game status (winner, next player, etc.) */}
        {status}
        
        {/* Play Again button */}
        <button className="play-again" onClick={() => dispatch(playAgain(winner))}>
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