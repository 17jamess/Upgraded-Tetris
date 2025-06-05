
import { useEffect, useRef, useCallback } from 'react';
import { KEY_REPEAT_DELAY, KEY_REPEAT_INTERVAL } from '@/types/tetris';

export const useKeyboardControls = (
  gameStarted: boolean,
  gameOver: boolean,
  isPaused: boolean,
  movePiece: (dx: number, dy: number) => void,
  rotatePiece: () => void,
  togglePause: () => void,
  setIsFastDrop: (value: boolean) => void
) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const keyRepeatTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const keyRepeatIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startKeyRepeat = useCallback((key: string, action: () => void) => {
    if (keyRepeatTimers.current.has(key)) return;

    action();

    if (key === 'ArrowDown') {
      setIsFastDrop(true);
    }

    const timer = setTimeout(() => {
      const interval = setInterval(action, KEY_REPEAT_INTERVAL);
      keyRepeatIntervals.current.set(key, interval);
    }, KEY_REPEAT_DELAY);

    keyRepeatTimers.current.set(key, timer);
  }, [setIsFastDrop]);

  const stopKeyRepeat = useCallback((key: string) => {
    const timer = keyRepeatTimers.current.get(key);
    const interval = keyRepeatIntervals.current.get(key);

    if (timer) {
      clearTimeout(timer);
      keyRepeatTimers.current.delete(key);
    }

    if (interval) {
      clearInterval(interval);
      keyRepeatIntervals.current.delete(key);
    }

    if (key === 'ArrowDown') {
      setIsFastDrop(false);
    }
  }, [setIsFastDrop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || isPaused) return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
      }

      if (keysPressed.current.has(e.key)) return;
      keysPressed.current.add(e.key);

      switch (e.key) {
        case 'ArrowLeft':
          startKeyRepeat('ArrowLeft', () => movePiece(-1, 0));
          break;
        case 'ArrowRight':
          startKeyRepeat('ArrowRight', () => movePiece(1, 0));
          break;
        case 'ArrowDown':
          startKeyRepeat('ArrowDown', () => movePiece(0, 1));
          break;
        case 'ArrowUp':
        case ' ':
          rotatePiece();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      stopKeyRepeat(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keyRepeatTimers.current.forEach(timer => clearTimeout(timer));
      keyRepeatIntervals.current.forEach(interval => clearInterval(interval));
      keyRepeatTimers.current.clear();
      keyRepeatIntervals.current.clear();
    };
  }, [gameStarted, gameOver, isPaused, movePiece, rotatePiece, togglePause, startKeyRepeat, stopKeyRepeat]);

  return { startKeyRepeat, stopKeyRepeat };
};
