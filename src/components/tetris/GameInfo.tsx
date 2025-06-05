
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { PIECE_COLORS } from '@/data/tetrisPieces';

interface GameInfoProps {
  score: number;
  lines: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  nextPiece: { shape: number[][], type: string } | null;
  onStartGame: () => void;
  onTogglePause: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  score,
  lines,
  level,
  gameStarted,
  gameOver,
  isPaused,
  nextPiece,
  onStartGame,
  onTogglePause
}) => {
  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex justify-center">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 border border-gray-700/30"
            style={{
              backgroundColor: PIECE_COLORS[cell],
              boxShadow: cell !== 0 ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Controls */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-2 sm:p-4">
          <h3 className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">Controls</h3>
          <div className="space-y-1 sm:space-y-2">
            {!gameStarted || gameOver ? (
              <Button onClick={onStartGame} className="w-full bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 text-xs sm:text-sm">
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Start Game
              </Button>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                <Button onClick={onTogglePause} className="w-full bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 text-xs sm:text-sm">
                  {isPaused ? <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={onStartGame} className="w-full bg-red-600 hover:bg-red-700 h-8 sm:h-10 text-xs sm:text-sm">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Restart
                </Button>
              </div>
            )}
            
            {/* Hide keyboard instructions on very small screens */}
            <div className="mt-2 sm:mt-4 space-y-0.5 sm:space-y-1 text-xs hidden sm:block">
              <div className="flex justify-between text-gray-300">
                <span>Move:</span>
                <span>← → ↓ (hold)</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rotate:</span>
                <span>↑ or Space</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Pause:</span>
                <span>P</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Fast Drop:</span>
                <span>Hold ↓</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-2 sm:p-4">
          <h3 className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">Score</h3>
          <div className="space-y-1 sm:space-y-2 text-white text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-mono">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Lines:</span>
              <span className="font-mono">{lines}</span>
            </div>
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="font-mono">{level}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Piece */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-2 sm:p-4">
          <h3 className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">Next</h3>
          <div className="flex justify-center">
            <div className="space-y-0">
              {renderNextPiece()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameInfo;
