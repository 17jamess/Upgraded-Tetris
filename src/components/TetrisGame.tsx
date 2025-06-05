
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="flex gap-6 max-w-6xl w-full justify-center">
        {/* Game Board */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardContent className="p-6">
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

        {/* Game Info */}
        <div className="flex flex-col gap-4 min-w-[250px]">
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
  );
};

export default TetrisGame;
