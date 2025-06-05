
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const EMPTY_CELL = 0;

// Key repeat timing constants
export const KEY_REPEAT_DELAY = 150;
export const KEY_REPEAT_INTERVAL = 50;
export const FAST_DROP_INTERVAL = 30;

export interface Position {
  x: number;
  y: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface TetrisPiece {
  shape: number[][];
  type: string;
  rotation: number;
}

export interface GameState {
  board: number[][];
  currentPiece: TetrisPiece | null;
  currentPosition: Position;
  nextPiece: { shape: number[][], type: string } | null;
  score: number;
  lines: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  particles: Particle[];
  isFastDrop: boolean;
}
