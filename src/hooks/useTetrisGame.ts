
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  BOARD_WIDTH, 
  BOARD_HEIGHT, 
  EMPTY_CELL, 
  Position, 
  TetrisPiece, 
  Particle,
  GameState
} from '@/types/tetris';
import { TETRIS_PIECES } from '@/data/tetrisPieces';

export const useTetrisGame = () => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<{ shape: number[][], type: string } | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isFastDrop, setIsFastDrop] = useState(false);

  const getRandomPiece = useCallback(() => {
    const pieces = Object.keys(TETRIS_PIECES);
    const randomType = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: TETRIS_PIECES[randomType as keyof typeof TETRIS_PIECES][0],
      type: randomType
    };
  }, []);

  const createParticles = useCallback((row: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Math.random().toString(),
        x: Math.random() * BOARD_WIDTH * 30,
        y: row * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -2 - 1,
        life: 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const isValidPosition = useCallback((piece: number[][], position: Position, testBoard?: number[][]) => {
    const boardToTest = testBoard || board;
    
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] !== EMPTY_CELL) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardToTest[newY][newX] !== EMPTY_CELL) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== EMPTY_CELL) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.shape[y][x];
          }
        }
      }
    }

    // Check for completed lines
    const completedLines: number[] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
        completedLines.push(y);
        createParticles(y);
      }
    }

    // Remove completed lines and add empty lines at top
    if (completedLines.length > 0) {
      completedLines.forEach(lineIndex => {
        newBoard.splice(lineIndex, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
      });

      const lineScore = [0, 100, 300, 500, 800][completedLines.length] * level;
      setScore(prev => prev + lineScore);
      setLines(prev => prev + completedLines.length);
      setLevel(prev => Math.floor((lines + completedLines.length) / 10) + 1);

      toast.success(`${completedLines.length} line${completedLines.length > 1 ? 's' : ''} cleared! +${lineScore} points`);
    }

    setBoard(newBoard);
    
    // Check game over
    if (currentPosition.y <= 0) {
      setGameOver(true);
      setGameStarted(false);
      toast.error('Game Over!');
      return;
    }

    // Spawn next piece
    if (nextPiece) {
      const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
      setCurrentPiece({ ...nextPiece, rotation: 0 });
      setCurrentPosition(startPosition);
      setNextPiece(getRandomPiece());
    }
  }, [currentPiece, currentPosition, board, nextPiece, level, lines, getRandomPiece, createParticles]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPosition = { x: currentPosition.x + dx, y: currentPosition.y + dy };
    
    if (isValidPosition(currentPiece.shape, newPosition)) {
      setCurrentPosition(newPosition);
      return true;
    } else if (dy > 0) {
      placePiece();
      return false;
    }
    return false;
  }, [currentPiece, currentPosition, gameOver, isPaused, isValidPosition, placePiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const pieces = TETRIS_PIECES[currentPiece.type as keyof typeof TETRIS_PIECES];
    const nextRotation = (currentPiece.rotation + 1) % pieces.length;
    const rotatedShape = pieces[nextRotation];

    if (isValidPosition(rotatedShape, currentPosition)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape, rotation: nextRotation } : null);
    }
  }, [currentPiece, currentPosition, gameOver, isPaused, isValidPosition]);

  const startGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
    const firstPiece = getRandomPiece();
    const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    setBoard(newBoard);
    setCurrentPiece({ ...firstPiece, rotation: 0 });
    setCurrentPosition(startPosition);
    setNextPiece(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    setParticles([]);
    setIsFastDrop(false);
  }, [getRandomPiece]);

  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  return {
    // State
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
    // Actions
    movePiece,
    rotatePiece,
    startGame,
    togglePause,
    setParticles,
    setIsFastDrop
  };
};
