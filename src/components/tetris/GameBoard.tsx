
import React from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, EMPTY_CELL, Position, TetrisPiece, Particle } from '@/types/tetris';
import { PIECE_COLORS } from '@/data/tetrisPieces';

interface GameBoardProps {
  board: number[][];
  currentPiece: TetrisPiece | null;
  currentPosition: Position;
  particles: Particle[];
  gameOver: boolean;
  isPaused: boolean;
  score: number;
  onStartGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPiece,
  currentPosition,
  particles,
  gameOver,
  isPaused,
  score,
  onStartGame
}) => {
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Draw current piece on board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== EMPTY_CELL) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.shape[y][x];
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 border border-gray-700/30 transition-all duration-75"
            style={{
              backgroundColor: PIECE_COLORS[cell],
              boxShadow: cell !== EMPTY_CELL ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="relative">
      <div className="border-2 border-purple-500/50 p-1 sm:p-2 bg-black/20 rounded-lg">
        {renderBoard()}
      </div>
      
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 4px ${particle.color}`
            }}
          />
        ))}
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-red-400">Game Over</h2>
            <p className="text-lg sm:text-xl mb-2 sm:mb-4">Final Score: {score.toLocaleString()}</p>
            <button 
              onClick={onStartGame} 
              className="bg-purple-600 hover:bg-purple-700 px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400">Paused</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
