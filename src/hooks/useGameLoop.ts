
import { useEffect, useRef } from 'react';
import { FAST_DROP_INTERVAL } from '@/types/tetris';

export const useGameLoop = (
  gameStarted: boolean,
  gameOver: boolean,
  isPaused: boolean,
  level: number,
  isFastDrop: boolean,
  dropPiece: () => void,
  setParticles: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const gameLoopRef = useRef<number>();
  const lastDropTime = useRef(Date.now());
  
  const baseDropInterval = Math.max(50, 500 - (level - 1) * 50);
  const dropInterval = isFastDrop ? FAST_DROP_INTERVAL : baseDropInterval;

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      if (now - lastDropTime.current >= dropInterval) {
        dropPiece();
        lastDropTime.current = now;
      }

      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.15,
        life: particle.life - 0.015
      })).filter(particle => particle.life > 0));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, dropInterval, dropPiece, setParticles]);
};
