
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCw, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// Tetris pieces with their rotations
const TETRIS_PIECES = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]]
  ],
  O: [
    [[2, 2], [2, 2]]
  ],
  T: [
    [[0, 3, 0], [3, 3, 3]],
    [[3, 0], [3, 3], [3, 0]],
    [[3, 3, 3], [0, 3, 0]],
    [[0, 3], [3, 3], [0, 3]]
  ],
  S: [
    [[0, 4, 4], [4, 4, 0]],
    [[4, 0], [4, 4], [0, 4]]
  ],
  Z: [
    [[5, 5, 0], [0, 5, 5]],
    [[0, 5], [5, 5], [5, 0]]
  ],
  J: [
    [[6, 0, 0], [6, 6, 6]],
    [[6, 6], [6, 0], [6, 0]],
    [[6, 6, 6], [0, 0, 6]],
    [[0, 6], [0, 6], [6, 6]]
  ],
  L: [
    [[0, 0, 7], [7, 7, 7]],
    [[7, 0], [7, 0], [7, 7]],
    [[7, 7, 7], [7, 0, 0]],
    [[7, 7], [0, 7], [0, 7]]
  ]
};

const PIECE_COLORS = [
  'transparent', // 0 - empty
  '#00f5ff', // 1 - I piece (cyan)
  '#ffff00', // 2 - O piece (yellow)
  '#800080', // 3 - T piece (purple)
  '#00ff00', // 4 - S piece (green)
  '#ff0000', // 5 - Z piece (red)
  '#0000ff', // 6 - J piece (blue)
  '#ffa500'  // 7 - L piece (orange)
];

interface Position {
  x: number;
  y: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][], type: string, rotation: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<{ shape: number[][], type: string } | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const gameLoopRef = useRef<number>();
  const lastDropTime = useRef(Date.now());
  const dropInterval = Math.max(100, 1000 - (level - 1) * 100);

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
        color: PIECE_COLORS[Math.floor(Math.random() * 7) + 1]
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
    } else if (dy > 0) {
      // Hit bottom, place piece
      placePiece();
    }
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

  const dropPiece = useCallback(() => {
    movePiece(0, 1);
  }, [movePiece]);

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
    lastDropTime.current = Date.now();
  }, [getRandomPiece]);

  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      if (now - lastDropTime.current >= dropInterval) {
        dropPiece();
        lastDropTime.current = now;
      }

      // Update particles
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1,
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, dropInterval, dropPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePiece();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, isPaused, movePiece, rotatePiece, togglePause]);

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
            className="w-7 h-7 border border-gray-700/30 transition-all duration-150"
            style={{
              backgroundColor: PIECE_COLORS[cell],
              boxShadow: cell !== EMPTY_CELL ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none'
            }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex justify-center">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="w-5 h-5 border border-gray-700/30"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="flex gap-6 max-w-6xl w-full">
        {/* Game Board */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardContent className="p-6">
            <div className="relative">
              <div className="border-2 border-purple-500/50 p-2 bg-black/20 rounded-lg">
                {renderBoard()}
              </div>
              
              {/* Particles */}
              <div className="absolute inset-0 pointer-events-none">
                {particles.map(particle => (
                  <div
                    key={particle.id}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: particle.x,
                      top: particle.y,
                      backgroundColor: particle.color,
                      opacity: particle.life
                    }}
                  />
                ))}
              </div>

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-4 text-red-400">Game Over</h2>
                    <p className="text-xl mb-4">Final Score: {score.toLocaleString()}</p>
                    <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                      Play Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Pause Overlay */}
              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-bold text-purple-400">Paused</h2>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Info */}
        <div className="flex flex-col gap-4 min-w-[250px]">
          {/* Controls */}
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">Controls</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {!gameStarted || gameOver ? (
                  <Button onClick={startGame} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                ) : (
                  <Button onClick={togglePause} className="w-full bg-purple-600 hover:bg-purple-700">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                
                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Move:</span>
                    <span>← → ↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotate:</span>
                    <span>↑ or Space</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pause:</span>
                    <span>P</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score */}
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">Score</h3>
              <div className="space-y-2 text-white">
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
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">Next</h3>
              <div className="flex justify-center">
                <div className="space-y-0">
                  {renderNextPiece()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Controls */}
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 md:hidden">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">Touch Controls</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => movePiece(-1, 0)}
                  disabled={!gameStarted || gameOver || isPaused}
                  className="border-purple-500/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rotatePiece}
                  disabled={!gameStarted || gameOver || isPaused}
                  className="border-purple-500/50"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => movePiece(1, 0)}
                  disabled={!gameStarted || gameOver || isPaused}
                  className="border-purple-500/50"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => movePiece(0, 1)}
                  disabled={!gameStarted || gameOver || isPaused}
                  className="border-purple-500/50"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <div></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
