
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTetrisGame } from '@/hooks/useTetrisGame';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useGameLoop } from '@/hooks/useGameLoop';
import GameBoard from './tetris/GameBoard';
import GameInfo from './tetris/GameInfo';
import MobileControls from './tetris/MobileControls';

const TetrisGame: React.FC = () => {
  const {
    board,
    currentPiece,
    currentPosition,
    nextPiece,
    score,
    lines,
    level,
    gameStarted,
    gameOver,
    isPaused,
    particles,
    isFastDrop,
    movePiece,
    rotatePiece,
    startGame,
    togglePause,
    setParticles,
    setIsFastDrop
  } = useTetrisGame();

  const { startKeyRepeat, stopKeyRepeat } = useKeyboardControls(
    gameStarted,
    gameOver,
    isPaused,
    movePiece,
    rotatePiece,
    togglePause,
    setIsFastDrop
  );

  const dropPiece = () => movePiece(0, 1);

  useGameLoop(
    gameStarted,
    gameOver,
    isPaused,
    level,
    isFastDrop,
    dropPiece,
    setParticles
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Mobile Layout - Stack vertically */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 justify-center items-center">
          {/* Game Board - Full width on mobile */}
          <div className="w-full max-w-sm lg:max-w-none">
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
              <CardContent className="p-3 sm:p-6">
                <GameBoard
                  board={board}
                  currentPiece={currentPiece}
                  currentPosition={currentPosition}
                  particles={particles}
                  gameOver={gameOver}
                  isPaused={isPaused}
                  score={score}
                  onStartGame={startGame}
                />
              </CardContent>
            </Card>
          </div>

          {/* Game Info and Controls - Side by side on mobile */}
          <div className="w-full lg:min-w-[250px] lg:max-w-[250px]">
            <div className="flex flex-row lg:flex-col gap-3 sm:gap-4">
              {/* Game Info - Smaller on mobile */}
              <div className="flex-1 lg:flex-none">
                <GameInfo
                  score={score}
                  lines={lines}
                  level={level}
                  gameStarted={gameStarted}
                  gameOver={gameOver}
                  isPaused={isPaused}
                  nextPiece={nextPiece}
                  onStartGame={startGame}
                  onTogglePause={togglePause}
                />
              </div>

              {/* Mobile Controls - Show on all screen sizes but optimized */}
              <div className="flex-1 lg:flex-none">
                <MobileControls
                  gameStarted={gameStarted}
                  gameOver={gameOver}
                  isPaused={isPaused}
                  onMove={movePiece}
                  onRotate={rotatePiece}
                  onStartKeyRepeat={startKeyRepeat}
                  onStopKeyRepeat={stopKeyRepeat}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
